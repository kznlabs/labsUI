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
import { clamp, cn, material, spring } from "@/lib/utils";

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

function snapPoints(element: HTMLElement) {
	const max = element.scrollWidth - element.clientWidth;
	const points: number[] = [];

	for (const item of element.querySelectorAll<HTMLElement>("[data-carousel-slide]")) {
		// Viewport is position: relative, so offsetLeft is already relative to it.
		const x = clamp(item.offsetLeft, 0, max);

		if (!points.some((point) => Math.abs(point - x) < 2)) points.push(x);
	}

	return points.length ? points : [0];
}

function halt(anim: RefObject<AnimationPlaybackControls | null>, element: HTMLElement | null) {
	anim.current?.stop();
	anim.current = null;
	if (element) element.style.scrollSnapType = "";
}

const nearest = (points: number[], x: number) =>
	points.reduce(
		(best, point, i) => (Math.abs(point - x) < Math.abs((points[best] ?? 0) - x) ? i : best),
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
}: ComponentProps<"section"> & {
	/** Accessible name of the carousel, e.g. "Projects". */ label: string;
}) {
	const viewport = useRef<HTMLDivElement>(null);
	const [state, setState] = useState({ page: 0, pages: 1, canPrev: false, canNext: true });
	const reduce = useReducedMotion();
	const anim = useRef<AnimationPlaybackControls | null>(null);

	const stop = () => halt(anim, viewport.current);

	// No snapping while the spring owns scrollLeft, or they fight every frame.
	const scrollTo = (x: number, velocity = 0) => {
		const element = viewport.current;

		if (!element) return;
		stop();

		if (reduce) {
			element.scrollLeft = x;

			return;
		}

		element.style.scrollSnapType = "none";
		anim.current = animate(element.scrollLeft, x, {
			...spring,
			velocity,
			onUpdate: (value) => {
				element.scrollLeft = value;
			},
			onComplete: stop,
		});
	};

	const goTo = (page: number) => {
		const element = viewport.current;

		if (!element) return;

		const points = snapPoints(element);
		const point = points[clamp(page, 0, points.length - 1)];

		if (point !== undefined) scrollTo(point);
	};

	useEffect(() => {
		const element = viewport.current;

		if (!element) return;

		let frame = 0;

		const measure = () => {
			frame = 0;

			const points = snapPoints(element);
			const max = element.scrollWidth - element.clientWidth;
			const next = {
				page: nearest(points, element.scrollLeft),
				pages: points.length,
				canPrev: element.scrollLeft > 1,
				canNext: element.scrollLeft < max - 1,
			};

			setState((current) =>
				current.page === next.page &&
				current.pages === next.pages &&
				current.canPrev === next.canPrev &&
				current.canNext === next.canNext
					? current
					: next,
			);
		};

		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(measure);
		};

		// User's own wheel or touch takes over from a running spring.
		const interrupt = () => anim.current && halt(anim, element);

		measure();

		const observer = new ResizeObserver(schedule);

		observer.observe(element);
		element.addEventListener("scroll", schedule, { passive: true });
		element.addEventListener("wheel", interrupt, { passive: true });
		element.addEventListener("touchstart", interrupt, { passive: true });

		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			element.removeEventListener("scroll", schedule);
			element.removeEventListener("wheel", interrupt);
			element.removeEventListener("touchstart", interrupt);
			anim.current?.stop();
		};
	}, []);

	// Mouse drag only (touch and trackpads scroll natively): follow the pointer, then spring to where
	// the throw was heading, keeping its speed.
	const drag = useRef<{ x: number; left: number; t: number; v: number; moved: boolean } | null>(
		null,
	);

	const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
		if (event.pointerType !== "mouse" || event.button !== 0) return;

		const element = viewport.current;

		if (!element) return;
		stop();
		element.style.scrollSnapType = "none";
		drag.current = {
			x: event.clientX,
			left: element.scrollLeft,
			t: event.timeStamp,
			v: 0,
			moved: false,
		};
	};

	const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
		const state = drag.current;
		const element = viewport.current;

		if (!state || !element) return;

		const dx = event.clientX - state.x;

		if (!state.moved && Math.abs(dx) < 4) return;
		if (!state.moved) element.setPointerCapture(event.pointerId);
		state.moved = true;

		const left = state.left - dx;
		const elapsed = event.timeStamp - state.t || 16;

		state.v = ((left - element.scrollLeft) / elapsed) * 1000;
		state.t = event.timeStamp;
		element.scrollLeft = left;
	};

	const onPointerUp = () => {
		const state = drag.current;
		const element = viewport.current;

		drag.current = null;
		if (!state || !element) return;

		if (!state.moved) {
			element.style.scrollSnapType = "";

			return;
		}

		// A drag isn't a click on the slide it started on.
		element.addEventListener("click", (event) => event.stopPropagation(), {
			capture: true,
			once: true,
		});

		const points = snapPoints(element);
		const target =
			points[nearest(points, element.scrollLeft + state.v * 0.2)] ?? element.scrollLeft;

		scrollTo(target, state.v);
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
	onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
	onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
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
			onKeyDown={(event) => {
				if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
				event.preventDefault();
				goTo(page + (event.key === "ArrowRight" ? 1 : -1));
			}}
			onDragStart={(event) => event.preventDefault()}
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
		<div className={cn("mt-1.5 flex justify-center", className)}>
			{Array.from({ length: pages }, (_, i) => (
				// 24px target (WCAG 2.5.8) around the 6px dot.
				<button
					// biome-ignore lint/suspicious/noArrayIndexKey: pages are positions
					key={i}
					type="button"
					aria-label={`Go to page ${i + 1} of ${pages}`}
					aria-current={i === page || undefined}
					onClick={() => goTo(i)}
					className="group/dot grid h-6 min-w-6 cursor-pointer place-items-center px-[9px] outline-none"
				>
					<motion.span
						initial={false}
						animate={{ width: i === page ? 20 : 6 }}
						transition={spring}
						className={cn(
							"block h-1.5 rounded-full transition-colors group-focus-visible/dot:ring-[3px] group-focus-visible/dot:ring-ring/50",
							i === page ? "bg-foreground/70" : "bg-foreground/20 group-hover/dot:bg-foreground/40",
						)}
					/>
				</button>
			))}
		</div>
	);
}
