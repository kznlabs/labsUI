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
	maxSize?: number;
	/** Dragging past half the minimum snaps it shut; Enter or double-click on the handle toggles. */
	collapsible?: boolean;
	/** Share in % when collapsed (default 0), e.g. an icon rail. */
	collapsedSize?: number;
};

/** Measured structure: panel keys in DOM order, their sizes and limits, each handle's index. */
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
	startDrag: (k: number, e: PointerEvent<HTMLDivElement>) => void;
	onKey: (k: number, e: KeyboardEvent<HTMLDivElement>) => void;
	toggle: (k: number) => void;
};

const GroupContext = createContext<GroupCtx | null>(null);

function useGroup() {
	const ctx = use(GroupContext);
	if (!ctx) throw new Error("Resizable parts must be inside <ResizablePanelGroup>");
	return ctx;
}

/** Sizes are float %: compare with slack, or 35 vs 34.9999… blocks a collapse. */
const EPS = 0.01;
const fallback: Limits = { min: 10, max: 100, collapsible: false, collapsed: 0 };

/**
 * Moves the handle before panel `k` by `delta` %: the panel on the growing side takes what the
 * other side gives, cascading past panels already at their minimum. Writes into `out` (no
 * allocation, it runs per pointer move).
 */
function resize(base: number[], k: number, delta: number, lim: Limits[], out: number[]) {
	for (let i = 0; i < base.length; i++) out[i] = base[i];
	if (!delta) return out;
	const grow = delta > 0 ? k - 1 : k;
	const g = lim[grow];
	if (!g) return out;
	let want = Math.abs(delta);
	const wasCollapsed = g.collapsible && base[grow] <= g.collapsed + EPS;
	// A collapsed panel opens only once the pull passes half its minimum, then jumps to it.
	if (wasCollapsed) {
		const gap = g.min - g.collapsed;
		if (want < gap / 2) return out;
		want = Math.max(want, gap);
	}
	const cap = g.max - base[grow];
	want = Math.min(want, cap);
	let taken = 0;
	const step = delta > 0 ? 1 : -1;
	for (let i = delta > 0 ? k : k - 1; i >= 0 && i < base.length && taken < want; i += step) {
		const l = lim[i];
		const room = Math.max(0, base[i] - l.min);
		let take = Math.min(want - taken, room);
		const shut = base[i] - l.collapsed;
		if (
			l.collapsible &&
			base[i] > l.collapsed &&
			want - taken > room + (l.min - l.collapsed) / 2 &&
			taken + shut <= cap + EPS
		)
			take = shut;
		out[i] = base[i] - take;
		taken += take;
	}
	if (wasCollapsed && taken < g.min - g.collapsed - EPS) {
		for (let i = 0; i < base.length; i++) out[i] = base[i];
		return out;
	}
	out[grow] = base[grow] + taken;
	return out;
}

const same = (a: number[], b: number[]) =>
	a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) < EPS);

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
		const q = (s: string) =>
			group.current
				? [...group.current.querySelectorAll<HTMLElement>(`[data-group="${id}"]${s}`)]
				: [];
		return { panels: q("[data-panel]"), handles: q("[data-resize-handle]") };
	};

	// Children's layout effects run first, so every panel has reported its limits by now. Runs
	// after every render; state only changes when the structure did.
	useLayoutEffect(() => {
		const el = group.current;
		if (!el) return;
		const order: string[] = [];
		const handles: Record<string, number> = {};
		for (const n of el.querySelectorAll<HTMLElement>(`[data-group="${id}"]`)) {
			const key = n.dataset.key ?? "";
			if (n.hasAttribute("data-panel")) order.push(key);
			else handles[key] = order.length;
		}
		const limits = order.map((k) => registry.get(k) ?? fallback);
		setLayout((prev) => {
			const sameOrder = prev !== null && prev.order.join() === order.join();
			if (
				sameOrder &&
				JSON.stringify(prev.handles) === JSON.stringify(handles) &&
				JSON.stringify(prev.limits) === JSON.stringify(limits)
			)
				return prev;
			if (sameOrder) return { ...prev, handles, limits };
			// New or changed set of panels: adopt the sizes CSS gave them, so nothing jumps.
			const px = [...el.querySelectorAll<HTMLElement>(`[data-group="${id}"][data-panel]`)].map(
				(p) => (horizontal ? p.offsetWidth : p.offsetHeight),
			);
			const total = px.reduce((s, v) => s + v, 0) || 1;
			return { order, handles, limits, sizes: px.map((v) => (v / total) * 100) };
		});
	});

	const sizes = layout?.sizes ?? [];
	const limits = layout?.limits ?? [];

	// `live`: what the DOM shows right now (mid-drag or mid-spring). `restore`: sizes to reopen at.
	const live = useRef<number[]>([]);
	const restore = useRef(new Map<number, number>());
	const anim = useRef<AnimationPlaybackControls | null>(null);
	/** Where the next key press starts: a running spring's target, else the committed sizes. */
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
			const k = Number(els.handles[i].dataset.index);
			els.handles[i].setAttribute("aria-valuenow", String(Math.round(next[k - 1] ?? 0)));
		}
	};

	const commit = (next: number[]) => {
		live.current = next;
		if (same(next, sizes)) return;
		setLayout((l) => (l ? { ...l, sizes: next } : l));
		onLayout?.(next);
	};

	/** Springs from what is on screen to `next` (instant under reduced motion). */
	const glide = (next: number[]) => {
		anim.current?.stop();
		const from = live.current.length === sizes.length ? [...live.current] : [...sizes];
		// Done: state owns the sizes again and the next key starts from there.
		const settle = () => {
			target.current = null;
			commit(next);
		};
		if (reduce) return settle();
		const els = parts();
		const now = [...from];
		anim.current = animate(0, 1, {
			...spring,
			onUpdate: (t) => {
				for (let i = 0; i < now.length; i++) now[i] = from[i] + (next[i] - from[i]) * t;
				live.current = now;
				paint(now, els);
			},
			onComplete: settle,
		});
		live.current = now;
	};

	const moveBy = (k: number, delta: number) => {
		const base = target.current ?? sizes;
		const next = resize(base, k, delta, limits, new Array(base.length));
		if (same(next, base)) return;
		target.current = next;
		glide(next);
	};

	const toggle = (k: number) => {
		if (!layout) return;
		const base = target.current ?? sizes;
		// The panel before the handle is the primary pane (APG); fall back to the one after.
		const p = limits[k - 1]?.collapsible ? k - 1 : limits[k]?.collapsible ? k : -1;
		if (p < 0) return;
		const l = limits[p];
		const collapsed = base[p] <= l.collapsed + EPS;
		if (!collapsed) restore.current.set(p, base[p]);
		const to = collapsed ? Math.max(restore.current.get(p) ?? l.min, l.min) : l.collapsed;
		const change = to - base[p];
		moveBy(k, p === k - 1 ? change : -change);
	};

	const ctx: GroupCtx = {
		direction,
		id,
		layout,
		registry,
		startDrag: (k, e) => {
			if (!layout || e.button !== 0) return;
			e.preventDefault();
			anim.current?.stop();
			const els = parts();
			const total = els.panels.reduce(
				(s, p) => s + (horizontal ? p.offsetWidth : p.offsetHeight),
				0,
			);
			if (!total) return;
			const base = live.current.length === sizes.length ? [...live.current] : [...sizes];
			e.currentTarget.setPointerCapture(e.pointerId);
			e.currentTarget.focus({ preventScroll: true });
			group.current?.setAttribute("data-dragging", "");
			e.currentTarget.setAttribute("data-dragging", "");
			drag.current = { k, start: horizontal ? e.clientX : e.clientY, total, base, ...els };
			live.current = [...base];
			const onMove = (ev: globalThis.PointerEvent) => {
				const d = drag.current;
				if (!d) return;
				const at = horizontal ? ev.clientX : ev.clientY;
				resize(d.base, d.k, ((at - d.start) / d.total) * 100, limits, live.current);
				paint(live.current, d);
			};
			const handle = e.currentTarget;
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
		onKey: (k, e) => {
			const prev = limits[k - 1];
			if (!prev) return;
			const back = horizontal ? "ArrowLeft" : "ArrowUp";
			const fwd = horizontal ? "ArrowRight" : "ArrowDown";
			const base = target.current ?? sizes;
			let delta: number | null = null;
			if (e.key === back) delta = -keyboardStep;
			else if (e.key === fwd) delta = keyboardStep;
			else if (e.key === "Home") delta = prev.min - base[k - 1];
			else if (e.key === "End") delta = prev.max - base[k - 1];
			else if (e.key === "Enter") {
				e.preventDefault();
				return toggle(k);
			}
			if (delta === null) return;
			e.preventDefault();
			moveBy(k, delta);
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
}: ComponentProps<"div"> & { withHandle?: boolean }) {
	const { direction, id, layout, startDrag, onKey, toggle } = useGroup();
	const key = useId();
	const k = layout?.handles[key] ?? 0;
	const prev = layout?.limits[k - 1];
	const prevKey = layout?.order[k - 1];
	const horizontal = direction === "horizontal";
	return (
		// biome-ignore lint/a11y/useSemanticElements: a focusable window splitter (APG), not an <hr>
		<div
			role="separator"
			tabIndex={0}
			aria-label={label}
			aria-orientation={horizontal ? "vertical" : "horizontal"}
			aria-controls={prevKey ? `${id}-panel-${prevKey}` : undefined}
			aria-valuenow={prev && layout ? Math.round(layout.sizes[k - 1]) : undefined}
			aria-valuemin={prev ? (prev.collapsible ? prev.collapsed : prev.min) : undefined}
			aria-valuemax={prev?.max}
			data-group={id}
			data-key={key}
			data-resize-handle=""
			data-index={k}
			onPointerDown={(e) => startDrag(k, e)}
			onKeyDown={(e) => onKey(k, e)}
			onDoubleClick={() => toggle(k)}
			className={cn(
				"group/handle relative z-10 flex shrink-0 touch-none items-center justify-center bg-border outline-none transition-colors duration-150",
				"hover:bg-primary/50 focus-visible:bg-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 data-dragging:bg-primary",
				// Hairline on screen, a comfortable 9px to grab.
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
