"use client";

import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { AnimatePresence, animate, motion, type PanInfo, useMotionValue } from "motion/react";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import { useSpringConfig } from "@/lib/spring-config";
import { cn } from "@/lib/utils";

/* ---------- store (module-level, no provider needed) ---------- */

type Variant = "default" | "success" | "error" | "info";
type ToastData = {
	id: number;
	title: ReactNode;
	description?: ReactNode;
	variant: Variant;
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
	for (const l of listeners) l();
};
const subscribe = (l: () => void) => {
	listeners.add(l);
	return () => {
		listeners.delete(l);
	};
};

function create(title: ReactNode, opts: ToastOptions = {}) {
	const id = ++nextId;
	toasts = [{ id, title, variant: "default", duration: 4000, ...opts }, ...toasts];
	emit();
	return id;
}

function dismiss(id?: number) {
	toasts = id === undefined ? [] : toasts.filter((t) => t.id !== id);
	emit();
}

/** `toast("Saved")`, `toast.success(title, { description, action, duration })`, `toast.dismiss(id?)`. */
export const toast = Object.assign(create, {
	success: (title: ReactNode, o?: ToastOptions) => create(title, { ...o, variant: "success" }),
	error: (title: ReactNode, o?: ToastOptions) => create(title, { ...o, variant: "error" }),
	info: (title: ReactNode, o?: ToastOptions) => create(title, { ...o, variant: "info" }),
	dismiss,
});

/* ---------- view ---------- */

const GAP = 12;
const PEEK = 14;
const VISIBLE = 3;

const icons = {
	default: null,
	success: <CircleCheck className="size-4 text-success" aria-hidden="true" />,
	error: <CircleAlert className="size-4 text-destructive" aria-hidden="true" />,
	info: <Info className="size-4 text-foreground" aria-hidden="true" />,
};

/** Mount once (root layout). Sonner-style stack: hover/focus expands, swipe dismisses. */
export function Toaster({ className }: { className?: string }) {
	const items = useSyncExternalStore(
		subscribe,
		() => toasts,
		() => EMPTY,
	);
	const [expanded, setExpanded] = useState(false);
	const [heights, setHeights] = useState<Record<number, number>>({});
	const onHeight = useCallback(
		(id: number, h: number) => setHeights((p) => (p[id] === h ? p : { ...p, [id]: h })),
		[],
	);

	useEffect(() => {
		if (items.length === 0) setExpanded(false);
	}, [items.length]);

	const frontH = heights[items[0]?.id ?? -1] ?? 0;
	let offset = 0;

	return (
		<section
			aria-label="Notifications"
			className={cn("fixed right-4 bottom-4 z-[100] w-[min(360px,calc(100vw-2rem))]", className)}
			onPointerEnter={() => setExpanded(true)}
			onPointerLeave={() => setExpanded(false)}
			onFocus={() => setExpanded(true)}
			onBlur={(e) => {
				if (!e.currentTarget.contains(e.relatedTarget)) setExpanded(false);
			}}
		>
			<ol className="relative" style={{ height: frontH }}>
				<AnimatePresence initial={false}>
					{items.map((t, i) => {
						const y = expanded ? -offset : -i * PEEK;
						offset += (heights[t.id] ?? 0) + GAP;
						return (
							<ToastItem
								key={t.id}
								toast={t}
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
	onHeight: (id: number, h: number) => void;
};

function ToastItem({ toast: t, index, y, expanded, frontHeight, total, onHeight }: ItemProps) {
	const spring = useSpringConfig();
	const inner = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState(0);
	const x = useMotionValue(0);
	const front = index === 0;
	const hidden = index >= VISIBLE;
	const paused = expanded;
	const remaining = useRef(t.duration);

	useEffect(() => {
		const el = inner.current;
		if (!el) return;
		const ro = new ResizeObserver(() => {
			setHeight(el.offsetHeight);
			onHeight(t.id, el.offsetHeight);
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, [t.id, onHeight]);

	// Auto-dismiss; pauses while the stack is expanded (hover/focus).
	useEffect(() => {
		if (paused || !Number.isFinite(t.duration)) return;
		const start = Date.now();
		const timer = setTimeout(() => dismiss(t.id), remaining.current);
		return () => {
			clearTimeout(timer);
			remaining.current -= Date.now() - start;
		};
	}, [paused, t.id, t.duration]);

	const onDragEnd = (_: unknown, info: PanInfo) => {
		if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 500) {
			const dir = Math.sign(info.offset.x || info.velocity.x);
			animate(x, dir * 420, { ...spring, velocity: info.velocity.x }).then(() => dismiss(t.id));
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
			aria-hidden={hidden || undefined}
			className={cn(
				"group absolute inset-x-0 bottom-0 touch-pan-y rounded-xl border bg-popover text-popover-foreground shadow-lg",
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
				{icons[t.variant] && <span className="mt-0.5">{icons[t.variant]}</span>}
				<div
					className="flex min-w-0 flex-1 flex-col gap-0.5"
					role={t.variant === "error" ? "alert" : "status"}
				>
					<p className="font-medium text-sm">{t.title}</p>
					{t.description && <p className="text-muted-foreground text-sm">{t.description}</p>}
				</div>
				{t.action && (
					<button
						type="button"
						onClick={() => {
							t.action?.onClick();
							dismiss(t.id);
						}}
						className="h-7 shrink-0 cursor-pointer rounded-md bg-primary px-2.5 font-medium text-primary-foreground text-xs outline-none transition-opacity hover:opacity-90 focus-visible:ring-[3px] focus-visible:ring-ring/50"
					>
						{t.action.label}
					</button>
				)}
				<button
					type="button"
					onClick={() => dismiss(t.id)}
					className="-mt-1 -mr-1 shrink-0 cursor-pointer rounded-md p-1 text-muted-foreground opacity-0 outline-none transition-opacity hover:text-foreground focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 group-hover:opacity-100"
				>
					<X className="size-3.5" aria-hidden="true" />
					<span className="sr-only">Dismiss</span>
				</button>
			</motion.div>
		</motion.li>
	);
}
