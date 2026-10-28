"use client";

import { type ComponentProps, type RefObject, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Axis = "y" | "x";

const MIN_THUMB = 24;

const axes = {
	y: { size: "clientHeight", total: "scrollHeight", pos: "scrollTop", client: "clientY" },
	x: { size: "clientWidth", total: "scrollWidth", pos: "scrollLeft", client: "clientX" },
} as const;

/** Overlay thumb for one axis. Writes size and offset straight to style, no render per frame. */
function Thumb({ axis, viewport }: { axis: Axis; viewport: RefObject<HTMLDivElement | null> }) {
	const track = useRef<HTMLDivElement>(null);
	const thumb = useRef<HTMLDivElement>(null);
	const dims = axes[axis];

	useEffect(() => {
		const viewportElement = viewport.current;
		const trackElement = track.current;
		const thumbElement = thumb.current;

		if (!viewportElement || !trackElement || !thumbElement) return;

		const update = () => {
			const ratio = viewportElement[dims.size] / viewportElement[dims.total];

			trackElement.hidden = ratio >= 1;
			if (ratio >= 1) return;

			const room = trackElement[dims.size];
			const len = Math.max(ratio * room, MIN_THUMB);
			const offset =
				(viewportElement[dims.pos] / (viewportElement[dims.total] - viewportElement[dims.size])) *
				(room - len);

			if (axis === "y") {
				thumbElement.style.height = `${len}px`;
				thumbElement.style.transform = `translateY(${offset}px)`;
			} else {
				thumbElement.style.width = `${len}px`;
				thumbElement.style.transform = `translateX(${offset}px)`;
			}
		};

		update();
		viewportElement.addEventListener("scroll", update, { passive: true });

		const observer = new ResizeObserver(update);

		observer.observe(viewportElement);
		for (const element of viewportElement.children) observer.observe(element);

		return () => {
			viewportElement.removeEventListener("scroll", update);
			observer.disconnect();
		};
	}, [viewport, axis, dims]);

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
				onPointerDown={(pointer) => {
					const viewportElement = viewport.current;
					const element = track.current;

					if (!viewportElement || !element) return;
					pointer.preventDefault();
					pointer.currentTarget.setPointerCapture(pointer.pointerId);

					const start = pointer[dims.client];
					const from = viewportElement[dims.pos];
					const len =
						axis === "y" ? pointer.currentTarget.offsetHeight : pointer.currentTarget.offsetWidth;
					const scale =
						(viewportElement[dims.total] - viewportElement[dims.size]) / (element[dims.size] - len);

					const move = (event: PointerEvent) => {
						viewportElement[dims.pos] = from + (event[dims.client] - start) * scale;
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
	/** Axes that scroll and get a thumb. */
	orientation?: "vertical" | "horizontal" | "both";
	/** Classes for the scrolling viewport (padding goes here). */
	viewportClassName?: string;
};

/**
 * Overlay scrollbars: thin thumbs that fade in while scrolling or on hover, widen on
 * hover and drag. Scrolling itself stays native (wheel, touch, keyboard); a horizontal one also
 * takes the mouse wheel. Give it a height.
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

	// data-scrolling shows the thumbs while scrolling and a moment after.
	useEffect(() => {
		const viewportElement = viewport.current;
		const element = root.current;

		if (!viewportElement || !element) return;

		let timer = 0;

		const onScroll = () => {
			element.dataset.scrolling = "";
			clearTimeout(timer);
			timer = window.setTimeout(() => delete element.dataset.scrolling, 800);
		};

		viewportElement.addEventListener("scroll", onScroll, { passive: true });

		return () => {
			clearTimeout(timer);
			viewportElement.removeEventListener("scroll", onScroll);
		};
	}, []);

	// Horizontal only: the mouse wheel (vertical delta) scrolls sideways. At either end it goes back
	// to the page so it never traps scrolling. Trackpads already send deltaX.
	useEffect(() => {
		const element = viewport.current;

		if (!element || orientation !== "horizontal") return;

		const onWheel = (event: WheelEvent) => {
			if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

			const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
			const max = element.scrollWidth - element.clientWidth;

			if ((delta < 0 && element.scrollLeft <= 0) || (delta > 0 && element.scrollLeft >= max - 1))
				return;
			event.preventDefault();
			element.scrollLeft += delta;
		};

		element.addEventListener("wheel", onWheel, { passive: false });

		return () => element.removeEventListener("wheel", onWheel);
	}, [orientation]);

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
