"use client";

import { type AnimationPlaybackControls, animate, useReducedMotion } from "motion/react";
import {
	type ComponentProps,
	createContext,
	type KeyboardEvent,
	type PointerEvent,
	use,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { cn, spring } from "@/lib/utils";

type Direction = "horizontal" | "vertical";
type Limits = { min: number; max: number; collapsible: boolean; collapsed: number };

type ResizablePanelProps = ComponentProps<"div"> & {
	/** Starting share of the group in %. Panels without one split what is left evenly. */
	defaultSize?: number;
	/** Smallest share in % (default 10). */
	minSize?: number;
	/** Largest size in % of the group. */
	maxSize?: number;
	/** Dragging past half the minimum snaps it shut; Enter or double-click on the handle toggles. */
	collapsible?: boolean;
	/** Share in % when collapsed (default 0), e.g. an icon rail. */
	collapsedSize?: number;
};

type Layout = {
	order: string[];
	sizes: number[];
	limits: Limits[];
	handles: Record<string, number>;
};

type GroupCtx = {
	direction: Direction;
	id: string;
	layout: Layout | null;
	/** Panels report their limits here from a layout effect; the group's own effect reads them. */
	registry: Map<string, Limits>;
	startDrag: (key: number, event: PointerEvent<HTMLDivElement>) => void;
	onKey: (key: number, event: KeyboardEvent<HTMLDivElement>) => void;
	toggle: (key: number) => void;
};

const GroupContext = createContext<GroupCtx | null>(null);

function useGroup() {
	const ctx = use(GroupContext);

	if (!ctx) throw new Error("Resizable parts must be inside <ResizablePanelGroup>");

	return ctx;
}

/** Float %, compare with slack or 35 vs 34.9999 blocks a collapse. */
const EPS = 0.01;
const fallback: Limits = { min: 10, max: 100, collapsible: false, collapsed: 0 };

/**
 * Moves the handle before panel `k` by `delta` %. The growing side takes what the other gives,
 * cascading past panels at their min. Writes into `out`, it runs per pointer move.
 */
function resize(base: number[], key: number, delta: number, lim: Limits[], out: number[]) {
	for (let i = 0; i < base.length; i++) out[i] = base[i];
	if (!delta) return out;

	const grow = delta > 0 ? key - 1 : key;
	const growing = lim[grow];

	if (!growing) return out;

	let want = Math.abs(delta);
	const wasCollapsed = growing.collapsible && base[grow] <= growing.collapsed + EPS;

	// A collapsed panel opens once the pull passes half its min, then jumps to it.
	if (wasCollapsed) {
		const gap = growing.min - growing.collapsed;

		if (want < gap / 2) return out;
		want = Math.max(want, gap);
	}

	const cap = growing.max - base[grow];

	want = Math.min(want, cap);

	let taken = 0;
	const step = delta > 0 ? 1 : -1;

	for (let i = delta > 0 ? key : key - 1; i >= 0 && i < base.length && taken < want; i += step) {
		const limit = lim[i];
		const room = Math.max(0, base[i] - limit.min);
		let take = Math.min(want - taken, room);
		const shut = base[i] - limit.collapsed;

		if (
			limit.collapsible &&
			base[i] > limit.collapsed &&
			want - taken > room + (limit.min - limit.collapsed) / 2 &&
			taken + shut <= cap + EPS
		)
			take = shut;
		out[i] = base[i] - take;
		taken += take;
	}

	if (wasCollapsed && taken < growing.min - growing.collapsed - EPS) {
		for (let i = 0; i < base.length; i++) out[i] = base[i];

		return out;
	}

	out[grow] = base[grow] + taken;

	return out;
}

const same = (a: number[], b: number[]) =>
	a.length === b.length && a.every((value, i) => Math.abs(value - b[i]) < EPS);

/**
 * Split panes (admin layouts, docs, editors). Sizes are % of the group. Handles are APG window
 * splitters: arrows step, Home/End jump to the limits, Enter collapses a collapsible neighbor.
 * Drag follows the pointer; keys and toggles spring. Panels and handles find their order in the
 * DOM, so wrappers and Server Component parents work. Until hydration the layout is plain CSS
 * (`defaultSize` as a flex basis, the others share the rest), so SSR already shows it.
 */
export function ResizablePanelGroup({
	direction = "horizontal",
	onLayout,
	keyboardStep = 5,
	className,
	children,
	...props
}: ComponentProps<"div"> & {
	/** "horizontal": panels side by side. "vertical": stacked. */
	direction?: Direction;
	/** Final sizes after each drag, key or toggle, e.g. to save them in a cookie for SSR. */
	onLayout?: (sizes: number[]) => void;
	/** % per arrow key press. */
	keyboardStep?: number;
}) {
	const id = useId();
	const group = useRef<HTMLDivElement>(null);
	const reduce = useReducedMotion();
	const registry = useRef(new Map<string, Limits>()).current;
	const [layout, setLayout] = useState<Layout | null>(null);
	const horizontal = direction === "horizontal";

	const parts = () => {
		const find = (selector: string) =>
			group.current
				? [...group.current.querySelectorAll<HTMLElement>(`[data-group="${id}"]${selector}`)]
				: [];

		return { panels: find("[data-panel]"), handles: find("[data-resize-handle]") };
	};

	// Children's layout effects run first, so every panel has reported its limits. Runs every render,
	// state only changes when the structure did.
	useLayoutEffect(() => {
		const root = group.current;

		if (!root) return;

		const order: string[] = [];
		const handles: Record<string, number> = {};

		for (const node of root.querySelectorAll<HTMLElement>(`[data-group="${id}"]`)) {
			const key = node.dataset.key ?? "";

			if (node.hasAttribute("data-panel")) order.push(key);
			else handles[key] = order.length;
		}

		const limits = order.map((key) => registry.get(key) ?? fallback);

		setLayout((prev) => {
			const sameOrder = prev !== null && prev.order.join() === order.join();

			if (
				sameOrder &&
				JSON.stringify(prev.handles) === JSON.stringify(handles) &&
				JSON.stringify(prev.limits) === JSON.stringify(limits)
			)
				return prev;
			if (sameOrder) return { ...prev, handles, limits };

			// New or changed panels: adopt the sizes CSS gave them so nothing jumps.
			const px = [...root.querySelectorAll<HTMLElement>(`[data-group="${id}"][data-panel]`)].map(
				(element) => (horizontal ? element.offsetWidth : element.offsetHeight),
			);
			const total = px.reduce((sum, value) => sum + value, 0) || 1;

			return { order, handles, limits, sizes: px.map((value) => (value / total) * 100) };
		});
	});

	const sizes = layout?.sizes ?? [];
	const limits = layout?.limits ?? [];

	// `live`: what's on screen now (mid-drag or mid-spring). `restore`: sizes to reopen at.
	const live = useRef<number[]>([]);
	const restore = useRef(new Map<number, number>());
	const anim = useRef<AnimationPlaybackControls | null>(null);
	/** Next key press starts from a running spring's target, else the committed sizes. */
	const target = useRef<number[] | null>(null);
	const drag = useRef<{
		k: number;
		start: number;
		total: number;
		base: number[];
		panels: HTMLElement[];
		handles: HTMLElement[];
	} | null>(null);

	const paint = (next: number[], els: { panels: HTMLElement[]; handles: HTMLElement[] }) => {
		for (let i = 0; i < els.panels.length; i++) {
			els.panels[i].style.flexGrow = String(Math.max(0, next[i] ?? 0));
		}

		for (let i = 0; i < els.handles.length; i++) {
			const key = Number(els.handles[i].dataset.index);

			els.handles[i].setAttribute("aria-valuenow", String(Math.round(next[key - 1] ?? 0)));
		}
	};

	const commit = (next: number[]) => {
		live.current = next;
		if (same(next, sizes)) return;
		setLayout((layout) => (layout ? { ...layout, sizes: next } : layout));
		onLayout?.(next);
	};

	const glide = (next: number[]) => {
		anim.current?.stop();

		const from = live.current.length === sizes.length ? [...live.current] : [...sizes];

		// Done, state owns the sizes again.
		const settle = () => {
			target.current = null;
			commit(next);
		};

		if (reduce) return settle();

		const els = parts();
		const now = [...from];

		anim.current = animate(0, 1, {
			...spring,
			onUpdate: (progress) => {
				for (let i = 0; i < now.length; i++) now[i] = from[i] + (next[i] - from[i]) * progress;
				live.current = now;
				paint(now, els);
			},
			onComplete: settle,
		});
		live.current = now;
	};

	const moveBy = (key: number, delta: number) => {
		const base = target.current ?? sizes;
		const next = resize(base, key, delta, limits, new Array(base.length));

		if (same(next, base)) return;
		target.current = next;
		glide(next);
	};

	const toggle = (key: number) => {
		if (!layout) return;

		const base = target.current ?? sizes;
		// Panel before the handle is the primary pane (APG), fall back to the one after.
		const panel = limits[key - 1]?.collapsible ? key - 1 : limits[key]?.collapsible ? key : -1;

		if (panel < 0) return;

		const limit = limits[panel];
		const collapsed = base[panel] <= limit.collapsed + EPS;

		if (!collapsed) restore.current.set(panel, base[panel]);

		const to = collapsed
			? Math.max(restore.current.get(panel) ?? limit.min, limit.min)
			: limit.collapsed;
		const change = to - base[panel];

		moveBy(key, panel === key - 1 ? change : -change);
	};

	const ctx: GroupCtx = {
		direction,
		id,
		layout,
		registry,
		startDrag: (key, pointer) => {
			if (!layout || pointer.button !== 0) return;
			pointer.preventDefault();
			anim.current?.stop();

			const els = parts();
			const total = els.panels.reduce(
				(sum, element) => sum + (horizontal ? element.offsetWidth : element.offsetHeight),
				0,
			);

			if (!total) return;

			const base = live.current.length === sizes.length ? [...live.current] : [...sizes];

			pointer.currentTarget.setPointerCapture(pointer.pointerId);
			pointer.currentTarget.focus({ preventScroll: true });
			group.current?.setAttribute("data-dragging", "");
			pointer.currentTarget.setAttribute("data-dragging", "");
			drag.current = {
				k: key,
				start: horizontal ? pointer.clientX : pointer.clientY,
				total,
				base,
				...els,
			};
			live.current = [...base];

			const onMove = (event: globalThis.PointerEvent) => {
				const state = drag.current;

				if (!state) return;

				const at = horizontal ? event.clientX : event.clientY;

				resize(state.base, state.k, ((at - state.start) / state.total) * 100, limits, live.current);
				paint(live.current, state);
			};

			const handle = pointer.currentTarget;

			const onEnd = () => {
				handle.removeEventListener("pointermove", onMove);
				handle.removeEventListener("lostpointercapture", onEnd);
				group.current?.removeAttribute("data-dragging");
				handle.removeAttribute("data-dragging");
				drag.current = null;
				target.current = null;
				commit([...live.current]);
			};

			handle.addEventListener("pointermove", onMove);
			handle.addEventListener("lostpointercapture", onEnd);
		},
		onKey: (index, event) => {
			const prev = limits[index - 1];

			if (!prev) return;

			const back = horizontal ? "ArrowLeft" : "ArrowUp";
			const fwd = horizontal ? "ArrowRight" : "ArrowDown";
			const base = target.current ?? sizes;
			let delta: number | null = null;

			if (event.key === back) delta = -keyboardStep;
			else if (event.key === fwd) delta = keyboardStep;
			else if (event.key === "Home") delta = prev.min - base[index - 1];
			else if (event.key === "End") delta = prev.max - base[index - 1];
			else if (event.key === "Enter") {
				event.preventDefault();

				return toggle(index);
			}

			if (delta === null) return;
			event.preventDefault();
			moveBy(index, delta);
		},
		toggle,
	};

	return (
		<GroupContext value={ctx}>
			<div
				ref={group}
				data-direction={direction}
				className={cn(
					"flex size-full overflow-hidden data-dragging:select-none",
					!horizontal && "flex-col",
					className,
				)}
				{...props}
			>
				{children}
			</div>
		</GroupContext>
	);
}

export function ResizablePanel({
	defaultSize,
	minSize = 10,
	maxSize = 100,
	collapsible = false,
	collapsedSize = 0,
	className,
	style,
	...props
}: ResizablePanelProps) {
	const { id, layout, registry } = useGroup();
	const key = useId();

	useLayoutEffect(() => {
		registry.set(key, { min: minSize, max: maxSize, collapsible, collapsed: collapsedSize });

		return () => {
			registry.delete(key);
		};
	});

	const i = layout ? layout.order.indexOf(key) : -1;
	const size = i >= 0 ? layout?.sizes[i] : undefined;
	const collapsed = collapsible && size !== undefined && size <= collapsedSize + EPS;

	return (
		<div
			id={`${id}-panel-${key}`}
			data-group={id}
			data-key={key}
			data-panel=""
			data-collapsed={collapsed || undefined}
			className={cn("min-h-0 min-w-0 overflow-hidden", className)}
			style={{
				flex:
					size !== undefined
						? `${size} 1 0px`
						: defaultSize !== undefined
							? `0 1 ${defaultSize}%`
							: "1 1 0px",
				...style,
			}}
			{...props}
		/>
	);
}

/** The divider between two panels. `withHandle` adds a visible grip. */
export function ResizableHandle({
	withHandle,
	className,
	"aria-label": label = "Resize",
	...props
}: ComponentProps<"div"> & {
	/** Visible grip in the middle of the divider. */ withHandle?: boolean;
}) {
	const { direction, id, layout, startDrag, onKey, toggle } = useGroup();
	const key = useId();
	const index = layout?.handles[key] ?? 0;
	const prev = layout?.limits[index - 1];
	const prevKey = layout?.order[index - 1];
	const horizontal = direction === "horizontal";

	return (
		// biome-ignore lint/a11y/useSemanticElements: a focusable window splitter (APG), not an <hr>
		<div
			role="separator"
			// Focusable once measured, a focusable splitter needs aria-valuenow.
			tabIndex={layout ? 0 : undefined}
			aria-label={label}
			aria-orientation={horizontal ? "vertical" : "horizontal"}
			aria-controls={prevKey ? `${id}-panel-${prevKey}` : undefined}
			aria-valuenow={prev && layout ? Math.round(layout.sizes[index - 1]) : undefined}
			aria-valuemin={prev ? (prev.collapsible ? prev.collapsed : prev.min) : undefined}
			aria-valuemax={prev?.max}
			data-group={id}
			data-key={key}
			data-resize-handle=""
			data-index={index}
			onPointerDown={(event) => startDrag(index, event)}
			onKeyDown={(event) => onKey(index, event)}
			onDoubleClick={() => toggle(index)}
			className={cn(
				"group/handle relative z-10 flex shrink-0 touch-none items-center justify-center bg-border outline-none transition-colors",
				"hover:bg-primary/50 focus-visible:bg-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 data-dragging:bg-primary",
				// Hairline on screen, 9px to grab.
				"after:absolute",
				horizontal
					? "w-px cursor-col-resize after:inset-y-0 after:-inset-x-1"
					: "h-px cursor-row-resize after:inset-x-0 after:-inset-y-1",
				className,
			)}
			{...props}
		>
			{withHandle && (
				<span
					aria-hidden="true"
					className={cn(
						"z-10 rounded-full border bg-card shadow-xs transition-colors group-hover/handle:border-primary/50 group-data-dragging/handle:border-primary",
						horizontal ? "h-7 w-2" : "h-2 w-7",
					)}
				/>
			)}
		</div>
	);
}
