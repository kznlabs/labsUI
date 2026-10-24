"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { type AnimationPlaybackControls, animate, motion, useReducedMotion } from "motion/react";
import {
	Children,
	type ComponentProps,
	createContext,
	isValidElement,
	type PointerEvent,
	type RefObject,
	use,
	useEffect,
	useRef,
	useState,
} from "react";
import { Button } from "@/components/ui/button";
import { cn, material, spring } from "@/lib/utils";

type CarouselCtx = {
	viewport: RefObject<HTMLDivElement | null>;
	/** Current page (snap position), its count, and whether either end is reached. */
	page: number;
	pages: number;
	canPrev: boolean;
	canNext: boolean;
	goTo: (page: number) => void;
};

const CarouselContext = createContext<CarouselCtx | null>(null);
const SlideContext = createContext<{ index: number; total: number } | null>(null);

function useCarousel() {
	const ctx = use(CarouselContext);
	if (!ctx) throw new Error("Carousel parts must be used inside <Carousel>");
	return ctx;
}

/** Where each slide snaps, clamped to the scroll range and deduped: these are the pages. */
function snapPoints(el: HTMLElement) {
	const max = el.scrollWidth - el.clientWidth;
	const points: number[] = [];
	for (const item of el.querySelectorAll<HTMLElement>("[data-carousel-slide]")) {
		// The viewport is position: relative, so offsetLeft is already measured from it.
		const x = Math.min(Math.max(item.offsetLeft, 0), max);
		if (!points.some((p) => Math.abs(p - x) < 2)) points.push(x);
	}
	return points.length ? points : [0];
}

/** Ends a running spring scroll and gives the row its snapping back. */
function halt(anim: RefObject<AnimationPlaybackControls | null>, el: HTMLElement | null) {
	anim.current?.stop();
	anim.current = null;
	if (el) el.style.scrollSnapType = "";
}

const nearest = (points: number[], x: number) =>
	points.reduce(
		(best, p, i) => (Math.abs(p - x) < Math.abs((points[best] ?? 0) - x) ? i : best),
		0,
	);

/**
 * Native scroll-snap row (touch, trackpad, no-JS all work) with spring-driven buttons, dots,
 * arrow keys and mouse drag. APG carousel semantics: a labeled region of "n of total" slides.
 */
export function Carousel({
	label,
	className,
	children,
	...props
}: ComponentProps<"section"> & { label: string }) {
	const viewport = useRef<HTMLDivElement>(null);
	const [state, setState] = useState({ page: 0, pages: 1, canPrev: false, canNext: true });
	const reduce = useReducedMotion();
	const anim = useRef<AnimationPlaybackControls | null>(null);

	const stop = () => halt(anim, viewport.current);

	// Snapping is paused while the spring owns scrollLeft, or the two fight every frame.
	const scrollTo = (x: number, velocity = 0) => {
		const el = viewport.current;
		if (!el) return;
		stop();
		if (reduce) {
			el.scrollLeft = x;
			return;
		}
		el.style.scrollSnapType = "none";
		anim.current = animate(el.scrollLeft, x, {
			...spring,
			velocity,
			onUpdate: (v) => {
				el.scrollLeft = v;
			},
			onComplete: stop,
		});
	};

	const goTo = (page: number) => {
		const el = viewport.current;
		if (!el) return;
		const points = snapPoints(el);
		const p = points[Math.min(Math.max(page, 0), points.length - 1)];
		if (p !== undefined) scrollTo(p);
	};

	useEffect(() => {
		const el = viewport.current;
		if (!el) return;
		let frame = 0;
		const measure = () => {
			frame = 0;
			const points = snapPoints(el);
			const max = el.scrollWidth - el.clientWidth;
			const next = {
				page: nearest(points, el.scrollLeft),
				pages: points.length,
				canPrev: el.scrollLeft > 1,
				canNext: el.scrollLeft < max - 1,
			};
			setState((s) =>
				s.page === next.page &&
				s.pages === next.pages &&
				s.canPrev === next.canPrev &&
				s.canNext === next.canNext
					? s
					: next,
			);
		};
		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(measure);
		};
		// The user's own wheel or touch takes over from a running spring.
		const interrupt = () => anim.current && halt(anim, el);
		measure();
		const ro = new ResizeObserver(schedule);
		ro.observe(el);
		el.addEventListener("scroll", schedule, { passive: true });
		el.addEventListener("wheel", interrupt, { passive: true });
		el.addEventListener("touchstart", interrupt, { passive: true });
		return () => {
			cancelAnimationFrame(frame);
			ro.disconnect();
			el.removeEventListener("scroll", schedule);
			el.removeEventListener("wheel", interrupt);
			el.removeEventListener("touchstart", interrupt);
			anim.current?.stop();
		};
	}, []);

	// Mouse drag (touch and trackpads already scroll natively): follow the pointer, then spring
	// to the snap point the throw was heading for, keeping its speed.
	const drag = useRef<{ x: number; left: number; t: number; v: number; moved: boolean } | null>(
		null,
	);
	const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
		if (e.pointerType !== "mouse" || e.button !== 0) return;
		const el = viewport.current;
		if (!el) return;
		stop();
		el.style.scrollSnapType = "none";
		drag.current = { x: e.clientX, left: el.scrollLeft, t: e.timeStamp, v: 0, moved: false };
	};
	const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
		const d = drag.current;
		const el = viewport.current;
		if (!d || !el) return;
		const dx = e.clientX - d.x;
		if (!d.moved && Math.abs(dx) < 4) return;
		if (!d.moved) el.setPointerCapture(e.pointerId);
		d.moved = true;
		const left = d.left - dx;
		const dt = e.timeStamp - d.t || 16;
		d.v = ((left - el.scrollLeft) / dt) * 1000;
		d.t = e.timeStamp;
		el.scrollLeft = left;
	};
	const onPointerUp = () => {
		const d = drag.current;
		const el = viewport.current;
		drag.current = null;
		if (!d || !el) return;
		if (!d.moved) {
			el.style.scrollSnapType = "";
			return;
		}
		// A drag is not a click on whatever slide it started on.
		el.addEventListener("click", (ev) => ev.stopPropagation(), { capture: true, once: true });
		const points = snapPoints(el);
		const target = points[nearest(points, el.scrollLeft + d.v * 0.2)] ?? el.scrollLeft;
		scrollTo(target, d.v);
	};

	const ctx: CarouselCtx = { viewport, ...state, goTo };
	return (
		<CarouselContext value={ctx}>
			<section
				aria-roledescription="carousel"
				aria-label={label}
				className={cn("relative", className)}
				{...props}
			>
				<DragContext value={{ onPointerDown, onPointerMove, onPointerUp }}>{children}</DragContext>
			</section>
		</CarouselContext>
	);
}

type DragHandlers = {
	onPointerDown: (e: PointerEvent<HTMLDivElement>) => void;
	onPointerMove: (e: PointerEvent<HTMLDivElement>) => void;
	onPointerUp: () => void;
};
const DragContext = createContext<DragHandlers | null>(null);

/** The scrolling row. Slides per view and the gap are CSS variables: `sm:[--per-view:2] [--gap:0.5rem]`. */
export function CarouselContent({ className, children, ...props }: ComponentProps<"div">) {
	const { viewport, page, pages, goTo } = useCarousel();
	const dragHandlers = use(DragContext);
	const items = Children.toArray(children);
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: a focusable scroll region; keys and drag scroll it
		<div
			ref={viewport}
			// Focusable so arrow keys work (and axe's scrollable-region rule passes).
			// biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region must be keyboard-reachable
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
				e.preventDefault();
				goTo(page + (e.key === "ArrowRight" ? 1 : -1));
			}}
			onDragStart={(e) => e.preventDefault()}
			{...dragHandlers}
			onPointerCancel={dragHandlers?.onPointerUp}
			className={cn(
				"relative flex snap-x snap-mandatory gap-(--gap) overflow-x-auto [--gap:1rem] overscroll-x-contain rounded-xl outline-none [scrollbar-width:none] focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-scrollbar]:hidden",
				pages > 1 && "cursor-grab active:cursor-grabbing",
				className,
			)}
			{...props}
		>
			{items.map((child, index) => (
				<SlideContext
					key={isValidElement(child) ? child.key : index}
					value={{ index, total: items.length }}
				>
					{child}
				</SlideContext>
			))}
		</div>
	);
}

/** One slide, sized from the row's `--per-view` and `--gap` (or any `basis-*`). Announced as "3 of 8". */
export function CarouselItem({ className, ...props }: ComponentProps<"div">) {
	const slide = use(SlideContext);
	return (
		// biome-ignore lint/a11y/useSemanticElements: APG carousel: a slide is role="group" + aria-roledescription, not a fieldset
		<div
			role="group"
			aria-roledescription="slide"
			aria-label={slide ? `${slide.index + 1} of ${slide.total}` : undefined}
			data-carousel-slide=""
			className={cn("min-w-0 shrink-0 grow-0 snap-start select-none", className)}
			{...props}
		/>
	);
}

function Arrow({ dir, className }: { dir: -1 | 1; className?: string }) {
	const { page, canPrev, canNext, goTo } = useCarousel();
	const prev = dir === -1;
	return (
		<Button
			variant="outline"
			size="icon"
			aria-label={prev ? "Previous slide" : "Next slide"}
			disabled={prev ? !canPrev : !canNext}
			onClick={() => goTo(page + dir)}
			className={cn(
				"-translate-y-1/2 absolute top-1/2 size-8 rounded-full shadow-sm disabled:opacity-0",
				material,
				prev ? "left-2" : "right-2",
				className,
			)}
		>
			{prev ? <ChevronLeft /> : <ChevronRight />}
		</Button>
	);
}

/** Overlaid at the left edge by default; hides at the start. */
export function CarouselPrevious({ className }: { className?: string }) {
	return <Arrow dir={-1} className={className} />;
}

/** Overlaid at the right edge by default; hides at the end. */
export function CarouselNext({ className }: { className?: string }) {
	return <Arrow dir={1} className={className} />;
}

/** One dot per page (not per slide: with two slides in view there are fewer pages). */
export function CarouselDots({ className }: { className?: string }) {
	const { page, pages, goTo } = useCarousel();
	if (pages < 2) return null;
	return (
		<div className={cn("mt-3 flex justify-center gap-1.5", className)}>
			{Array.from({ length: pages }, (_, i) => (
				<motion.button
					// biome-ignore lint/suspicious/noArrayIndexKey: pages are positions
					key={i}
					type="button"
					aria-label={`Go to page ${i + 1} of ${pages}`}
					aria-current={i === page || undefined}
					onClick={() => goTo(i)}
					initial={false}
					animate={{ width: i === page ? 20 : 6 }}
					transition={spring}
					className={cn(
						"h-1.5 cursor-pointer rounded-full outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
						i === page ? "bg-foreground/70" : "bg-foreground/20 hover:bg-foreground/40",
					)}
				/>
			))}
		</div>
	);
}
