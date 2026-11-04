"use client";

import { Pause, Play } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { useMounted } from "@/lib/platform";
import { cn, spring } from "@/lib/utils";

type TextSwapProps = {
	/** Array of items to cycle through, or pass a single changing child. */
	items?: readonly string[];
	/** Active index when controlling externally. */
	index?: number;
	/** Milliseconds between swaps when cycling automatically (default: 3000). With reduced motion it doesn't cycle. */
	interval?: number;
	/** Swap direction (default: "up"). */
	direction?: "up" | "down" | "fade";
	/** Pause the cycle on mouse hover (default: true). */
	pauseOnHover?: boolean;
	/** Make the text a pause button, so keyboard and touch users can stop it too (WCAG 2.2.2). It takes no room: a mouse sees it over the text on hover, a keyboard on focus, and a tap anywhere toggles it. Use it when it cycles next to other content. Hidden with reduced motion. */
	controls?: boolean;
	/** Accessible name of the pause button (default: "Pause animation"). */
	pauseLabel?: string;
	className?: string;
	/** A single string; changing it swaps to the new text. */
	children?: string;
};

export function TextSwap({
	items,
	index: controlledIndex,
	interval = 3000,
	direction = "up",
	pauseOnHover = true,
	controls = false,
	pauseLabel = "Pause animation",
	className,
	children,
}: TextSwapProps) {
	const list = items ?? (children ? [children] : []);
	const isControlled = controlledIndex !== undefined;

	const [uncontrolledIndex, setUncontrolledIndex] = useState(0);
	const [isHovered, setIsHovered] = useState(false);
	const [isStopped, setIsStopped] = useState(false);
	const isPaused = isHovered || isStopped;
	const reduce = useReducedMotion();
	const mounted = useMounted();

	const activeIndex = isControlled ? controlledIndex : uncontrolledIndex;
	const currentItem = list[activeIndex % (list.length || 1)] ?? "";

	useEffect(() => {
		// Reduced motion: no auto-cycling, the first item stays.
		if (isControlled || list.length <= 1 || isPaused || reduce || interval <= 0) return;

		const timer = setInterval(() => {
			setUncontrolledIndex((prev) => (prev + 1) % list.length);
		}, interval);

		return () => clearInterval(timer);
	}, [isControlled, list.length, isPaused, reduce, interval]);

	const yOffset = direction === "up" ? 14 : direction === "down" ? -14 : 0;
	const exitY = direction === "up" ? -14 : direction === "down" ? 14 : 0;

	const withButton = controls && mounted && !reduce && !isControlled && list.length > 1;
	const hover = pauseOnHover
		? { onMouseEnter: () => setIsHovered(true), onMouseLeave: () => setIsHovered(false) }
		: {};

	const swap = (
		<span
			{...(!withButton && hover)}
			// Every item sits invisibly in one grid cell, so the box is always the longest item and swaps
			// never reflow the layout (e.g. a two-line quote).
			className={cn("relative inline-grid overflow-hidden", className)}
			// Only announce swaps driven from outside, an auto-rotating ticker would talk every few
			// seconds.
			aria-live={isControlled ? "polite" : undefined}
		>
			<span className="sr-only">{currentItem}</span>

			{list.map((item) => (
				<span key={item} aria-hidden="true" className="invisible [grid-area:1/1]">
					{item}
				</span>
			))}

			<AnimatePresence mode="popLayout" initial={false}>
				<motion.span
					key={`${activeIndex}-${currentItem}`}
					initial={
						direction === "fade"
							? { opacity: 0, scale: 0.96 }
							: { opacity: 0, y: yOffset, filter: "blur(2px)" }
					}
					animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
					exit={
						direction === "fade"
							? { opacity: 0, scale: 0.96 }
							: { opacity: 0, y: exitY, filter: "blur(2px)" }
					}
					transition={spring}
					className="[grid-area:1/1]"
					aria-hidden="true"
				>
					{currentItem}
				</motion.span>
			</AnimatePresence>
		</span>
	);

	if (!withButton) return swap;

	return (
		<span {...hover} className="group/pause relative inline-flex items-baseline">
			{swap}

			<button
				type="button"
				aria-label={pauseLabel}
				aria-pressed={isStopped}
				onClick={() => setIsStopped(!isStopped)}
				// Lies over the text, so it takes no room; past its edges, so a small line is still a 24px
				// target, while the veil and the ring hug the text. Touch has no hover: paused is what shows
				// a tap landed.
				className="absolute -inset-1 grid cursor-pointer place-items-center text-foreground opacity-0 outline-none transition-opacity duration-400 ease-in-out before:absolute before:inset-x-0.5 before:inset-y-1 before:rounded-md before:bg-background/40 focus-visible:opacity-100 focus-visible:before:ring-[3px] focus-visible:before:ring-ring/50 group-hover/pause:opacity-100 pointer-coarse:aria-pressed:opacity-100"
			>
				<span className="relative grid size-6 place-items-center rounded-md border bg-popover shadow-xs [&_svg]:size-3.5">
					{isStopped ? <Play /> : <Pause />}
				</span>
			</button>
		</span>
	);
}
