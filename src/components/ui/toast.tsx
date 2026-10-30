"use client";

import { CircleAlert, CircleCheck, Info, Loader2, X } from "lucide-react";
import { AnimatePresence, animate, motion, type PanInfo, useMotionValue } from "motion/react";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import { useDismiss } from "@/lib/use-dismiss";
import { cn, material, spring } from "@/lib/utils";

/* ---------- store (module-level, no provider needed) ---------- */

export type ToastVariant = "default" | "success" | "error" | "info" | "loading";
export type ToastData = {
	id: number;
	title: ReactNode;
	description?: ReactNode;
	variant: ToastVariant;
	/** ms; Infinity = sticky. */
	duration: number;
	action?: { label: string; onClick: () => void };
};
type ToastOptions = Partial<Omit<ToastData, "id" | "title">>;

let toasts: ToastData[] = [];
let nextId = 0;
const EMPTY: ToastData[] = [];
const listeners = new Set<() => void>();

const emit = () => {
	for (const listener of listeners) listener();
};

const subscribe = (listener: () => void) => {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
};

/** Oldest past this get dropped, only the front few are visible anyway. */
const MAX = 6;

function create(title: ReactNode, opts: ToastOptions = {}) {
	const id = ++nextId;
	const next: ToastData = { id, title, variant: "default", duration: 4000, ...opts };

	toasts = [next, ...toasts].slice(0, MAX);
	emit();

	return id;
}

function update(id: number, patch: Partial<Omit<ToastData, "id">>) {
	toasts = toasts.map((toast) => (toast.id === id ? { ...toast, ...patch } : toast));
	emit();
}

type Resolve<T> = ReactNode | ((value: T) => ReactNode);

const resolve = <T,>(resolver: Resolve<T>, value: T) =>
	typeof resolver === "function" ? resolver(value) : resolver;

function promise<T>(
	pending: Promise<T>,
	msgs: { loading: ReactNode; success: Resolve<T>; error: Resolve<unknown> },
	opts?: Omit<ToastOptions, "variant" | "duration">,
) {
	const id = create(msgs.loading, {
		...opts,
		variant: "loading",
		duration: Number.POSITIVE_INFINITY,
	});

	pending.then(
		(value) =>
			update(id, { title: resolve(msgs.success, value), variant: "success", duration: 4000 }),
		(error) => update(id, { title: resolve(msgs.error, error), variant: "error", duration: 6000 }),
	);

	return pending;
}

function dismiss(id?: number) {
	toasts = id === undefined ? [] : toasts.filter((toast) => toast.id !== id);
	emit();
}

/** `toast("Saved")`, `toast.success(title, { description, action, duration })`, `toast.loading(title)`, `toast.promise(p, { loading, success, error })`, `toast.dismiss(id?)`. */
export const toast = Object.assign(create, {
	success: (title: ReactNode, options?: ToastOptions) =>
		create(title, { ...options, variant: "success" }),
	error: (title: ReactNode, options?: ToastOptions) =>
		create(title, { ...options, variant: "error" }),
	info: (title: ReactNode, options?: ToastOptions) =>
		create(title, { ...options, variant: "info" }),
	/** Sticky until dismissed or updated by `toast.promise`. */
	loading: (title: ReactNode, options?: ToastOptions) =>
		create(title, { duration: Number.POSITIVE_INFINITY, ...options, variant: "loading" }),
	promise,
	dismiss,
});

/* ---------- view ---------- */

const GAP = 12;
const PEEK = 14;

const onVisibility = (callback: () => void) => {
	document.addEventListener("visibilitychange", callback);

	return () => document.removeEventListener("visibilitychange", callback);
};

const isVisible = () => document.visibilityState === "visible";
const VISIBLE = 3;

const icons = {
	default: null,
	success: <CircleCheck className="size-4 text-success-ink" aria-hidden="true" />,
	error: <CircleAlert className="size-4 text-destructive-ink" aria-hidden="true" />,
	info: <Info className="size-4 text-foreground" aria-hidden="true" />,
	loading: <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />,
};

/** Mount once (root layout). Stacked toasts: hover, focus or a tap expands, swipe dismisses. */
export function Toaster({ className }: { className?: string }) {
	const items = useSyncExternalStore(
		subscribe,
		() => toasts,
		() => EMPTY,
	);
	const section = useRef<HTMLElement>(null);
	const [expanded, setExpanded] = useState(false);
	const [heights, setHeights] = useState<Record<number, number>>({});
	const onHeight = useCallback(
		(id: number, height: number) =>
			setHeights((heights) => (heights[id] === height ? heights : { ...heights, [id]: height })),
		[],
	);

	useEffect(() => {
		if (items.length === 0) setExpanded(false);
	}, [items.length]);

	// Touch fires enter and leave on every tap.
	useDismiss(expanded, [section], () => setExpanded(false));

	const frontH = heights[items[0]?.id ?? -1] ?? 0;
	let offset = 0;

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: keyboard focus already expands the stack
		<section
			aria-label="Notifications"
			className={cn("fixed right-4 bottom-4 z-[100] w-[min(360px,calc(100vw-2rem))]", className)}
			ref={section}
			onPointerEnter={(event) => event.pointerType !== "touch" && setExpanded(true)}
			onPointerLeave={(event) => event.pointerType !== "touch" && setExpanded(false)}
			onClick={() => setExpanded(true)}
			onFocus={() => setExpanded(true)}
			onBlur={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false);
			}}
		>
			{/* Persistent live region: content added to it is announced, unlike a freshly mounted one. */}
			<ol aria-live="polite" className="relative" style={{ height: frontH }}>
				<AnimatePresence initial={false}>
					{items.map((item, i) => {
						const y = expanded ? -offset : -i * PEEK;

						offset += (heights[item.id] ?? 0) + GAP;

						return (
							<ToastItem
								key={item.id}
								toast={item}
								index={i}
								y={y}
								expanded={expanded}
								frontHeight={frontH}
								total={items.length}
								onHeight={onHeight}
							/>
						);
					})}
				</AnimatePresence>
			</ol>
		</section>
	);
}

type ItemProps = {
	toast: ToastData;
	index: number;
	y: number;
	expanded: boolean;
	frontHeight: number;
	total: number;
	onHeight: (id: number, height: number) => void;
};

function ToastItem({ toast: data, index, y, expanded, frontHeight, total, onHeight }: ItemProps) {
	const inner = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState(0);
	const x = useMotionValue(0);
	const front = index === 0;
	const hidden = index >= VISIBLE;
	// Paused while you read the stack and while the tab is in the background.
	const visible = useSyncExternalStore(onVisibility, isVisible, () => true);
	const paused = expanded || !visible;
	const remaining = useRef({ duration: data.duration, left: data.duration });

	useEffect(() => {
		const element = inner.current;

		if (!element) return;

		const observer = new ResizeObserver(() => {
			setHeight(element.offsetHeight);
			onHeight(data.id, element.offsetHeight);
		});

		observer.observe(element);

		return () => observer.disconnect();
	}, [data.id, onHeight]);

	useEffect(() => {
		// Time left restarts when the duration changes (a promise toast settling).
		if (remaining.current.duration !== data.duration)
			remaining.current = { duration: data.duration, left: data.duration };
		if (paused || !Number.isFinite(data.duration)) return;

		const start = Date.now();
		const timer = setTimeout(() => dismiss(data.id), remaining.current.left);

		return () => {
			clearTimeout(timer);
			remaining.current.left -= Date.now() - start;
		};
	}, [paused, data.id, data.duration]);

	const onDragEnd = (_: unknown, info: PanInfo) => {
		if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 500) {
			const dir = Math.sign(info.offset.x || info.velocity.x);

			animate(x, dir * 420, { ...spring, velocity: info.velocity.x }).then(() => dismiss(data.id));
		} else {
			animate(x, 0, spring);
		}
	};

	const collapsedBehind = !expanded && !front;

	return (
		<motion.li
			initial={{ opacity: 0, y: 48, scale: 0.96 }}
			animate={{
				opacity: hidden ? 0 : 1,
				y,
				scale: expanded ? 1 : 1 - index * 0.05,
				height: collapsedBehind && frontHeight ? frontHeight : height || "auto",
			}}
			exit={{ opacity: 0, scale: 0.94, y: y + 12 }}
			transition={spring}
			style={{ x, zIndex: total - index, transformOrigin: "top center" }}
			drag={front || expanded ? "x" : false}
			dragMomentum={false}
			onDragEnd={onDragEnd}
			inert={hidden}
			className={cn(
				"group absolute inset-x-0 bottom-0 touch-pan-y rounded-2xl border text-popover-foreground shadow-lg",
				material,
				// Fill the gap between expanded toasts so hover doesn't flicker.
				"after:absolute after:inset-x-0 after:top-full after:h-3",
				hidden && "pointer-events-none",
			)}
		>
			<motion.div
				ref={inner}
				animate={{ opacity: collapsedBehind ? 0 : 1 }}
				transition={spring}
				className="flex items-start gap-3 p-4"
			>
				{icons[data.variant] && <span className="mt-0.5">{icons[data.variant]}</span>}
				<div
					className="flex min-w-0 flex-1 flex-col gap-0.5"
					role={data.variant === "error" ? "alert" : undefined}
				>
					<p className="font-medium text-sm">{data.title}</p>
					{data.description && <p className="text-muted-foreground text-sm">{data.description}</p>}
				</div>
				{data.action && (
					<button
						type="button"
						onClick={() => {
							data.action?.onClick();
							dismiss(data.id);
						}}
						className="h-7 shrink-0 cursor-pointer rounded-md bg-primary px-2.5 font-medium text-primary-foreground text-xs outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px] focus-visible:ring-ring/50"
					>
						{data.action.label}
					</button>
				)}
				<button
					type="button"
					onClick={() => dismiss(data.id)}
					className="-mt-1 -mr-1 shrink-0 cursor-pointer rounded-md p-1 text-muted-foreground opacity-0 outline-none transition-opacity hover:text-foreground focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 group-hover:opacity-100"
				>
					<X className="size-3.5" aria-hidden="true" />
					<span className="sr-only">Dismiss</span>
				</button>
			</motion.div>
		</motion.li>
	);
}
