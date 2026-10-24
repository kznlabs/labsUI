"use client";

import { type ComponentProps, type RefObject, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Axis = "y" | "x";

const MIN_THUMB = 24;

const axes = {
	y: { size: "clientHeight", total: "scrollHeight", pos: "scrollTop", client: "clientY" },
	x: { size: "clientWidth", total: "scrollWidth", pos: "scrollLeft", client: "clientX" },
} as const;

/** Overlay thumb for one axis. Writes its size and offset straight to style: no render per frame. */
function Thumb({ axis, viewport }: { axis: Axis; viewport: RefObject<HTMLDivElement | null> }) {
	const track = useRef<HTMLDivElement>(null);
	const thumb = useRef<HTMLDivElement>(null);
	const a = axes[axis];

	useEffect(() => {
		const v = viewport.current;
		const t = track.current;
		const th = thumb.current;
		if (!v || !t || !th) return;
		const update = () => {
			const ratio = v[a.size] / v[a.total];
			t.hidden = ratio >= 1;
			if (ratio >= 1) return;
			const room = t[a.size];
			const len = Math.max(ratio * room, MIN_THUMB);
			const offset = (v[a.pos] / (v[a.total] - v[a.size])) * (room - len);
			if (axis === "y") {
				th.style.height = `${len}px`;
				th.style.transform = `translateY(${offset}px)`;
			} else {
				th.style.width = `${len}px`;
				th.style.transform = `translateX(${offset}px)`;
			}
		};
		update();
		v.addEventListener("scroll", update, { passive: true });
		const ro = new ResizeObserver(update);
		ro.observe(v);
		for (const c of v.children) ro.observe(c);
		return () => {
			v.removeEventListener("scroll", update);
			ro.disconnect();
		};
	}, [viewport, axis, a]);

	return (
		<div
			ref={track}
			aria-hidden="true"
			className={cn(
				"group/track absolute z-10 flex p-0.5 opacity-0 transition-opacity duration-300 hover:opacity-100 group-hover/scroll:opacity-100 group-data-scrolling/scroll:opacity-100 group-data-scrolling/scroll:duration-0",
				axis === "y"
					? "top-0 right-0 bottom-0 w-2.5 justify-end"
					: "right-0 bottom-0 left-0 h-2.5 items-end",
			)}
		>
			<div
				ref={thumb}
				// Dragging maps pointer travel on the track to scroll distance in the content.
				onPointerDown={(e) => {
					const v = viewport.current;
					const t = track.current;
					if (!v || !t) return;
					e.preventDefault();
					e.currentTarget.setPointerCapture(e.pointerId);
					const start = e[a.client];
					const from = v[a.pos];
					const len = axis === "y" ? e.currentTarget.offsetHeight : e.currentTarget.offsetWidth;
					const scale = (v[a.total] - v[a.size]) / (t[a.size] - len);
					const move = (ev: PointerEvent) => {
						v[a.pos] = from + (ev[a.client] - start) * scale;
					};
					const up = () => {
						removeEventListener("pointermove", move);
						removeEventListener("pointerup", up);
					};
					addEventListener("pointermove", move);
					addEventListener("pointerup", up);
				}}
				className={cn(
					"rounded-full bg-foreground/35 transition-[width,height,background-color] duration-200 hover:bg-foreground/50",
					axis === "y" ? "w-1.5 group-hover/track:w-2" : "h-1.5 group-hover/track:h-2",
				)}
			/>
		</div>
	);
}

type ScrollAreaProps = ComponentProps<"div"> & {
	orientation?: "vertical" | "horizontal" | "both";
	/** Classes for the scrolling viewport (padding goes here). */
	viewportClassName?: string;
};

/**
 * macOS overlay scrollbars: thin thumbs that fade in while scrolling or on hover, widen on
 * hover and drag. Scrolling itself stays native (wheel, touch, keyboard). Give it a height.
 * `aria-label` names the scrollable region so keyboard users can focus and scroll it.
 */
export function ScrollArea({
	orientation = "vertical",
	className,
	viewportClassName,
	children,
	"aria-label": label,
	...props
}: ScrollAreaProps) {
	const root = useRef<HTMLDivElement>(null);
	const viewport = useRef<HTMLDivElement>(null);

	// data-scrolling shows the thumbs while scrolling and for a moment after.
	useEffect(() => {
		const v = viewport.current;
		const r = root.current;
		if (!v || !r) return;
		let timer = 0;
		const onScroll = () => {
			r.dataset.scrolling = "";
			clearTimeout(timer);
			timer = window.setTimeout(() => delete r.dataset.scrolling, 800);
		};
		v.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			clearTimeout(timer);
			v.removeEventListener("scroll", onScroll);
		};
	}, []);

	return (
		<div ref={root} className={cn("group/scroll relative overflow-hidden", className)} {...props}>
			{/* biome-ignore lint/a11y/useSemanticElements: a <section> would add a landmark per scroll box */}
			<div
				ref={viewport}
				role="region"
				aria-label={label}
				// Focusable so keyboard users can scroll it (axe: scrollable-region-focusable).
				// biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable regions must be keyboard-reachable
				tabIndex={0}
				className={cn(
					"size-full overscroll-contain rounded-[inherit] outline-none [scrollbar-width:none] focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset [&::-webkit-scrollbar]:hidden",
					orientation === "vertical" && "overflow-y-auto overflow-x-hidden",
					orientation === "horizontal" && "overflow-x-auto overflow-y-hidden",
					orientation === "both" && "overflow-auto",
					viewportClassName,
				)}
			>
				{children}
			</div>
			{orientation !== "horizontal" && <Thumb axis="y" viewport={viewport} />}
			{orientation !== "vertical" && <Thumb axis="x" viewport={viewport} />}
		</div>
	);
}
