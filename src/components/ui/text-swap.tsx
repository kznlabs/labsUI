"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn, spring } from "@/lib/utils";

type TextSwapProps = {
	/** Array of items to cycle through, or pass a single changing child. */
	items?: readonly string[];
	/** Active index when controlling externally. */
	index?: number;
	/** Milliseconds between swaps when cycling automatically (default: 3000). */
	interval?: number;
	/** Swap direction (default: "up"). */
	direction?: "up" | "down" | "fade";
	/** Pause the cycle on mouse hover (default: true). */
	pauseOnHover?: boolean;
	className?: string;
	children?: string;
};

export function TextSwap({
	items,
	index: controlledIndex,
	interval = 3000,
	direction = "up",
	pauseOnHover = true,
	className,
	children,
}: TextSwapProps) {
	const list = items ?? (children ? [children] : []);
	const isControlled = controlledIndex !== undefined;

	const [uncontrolledIndex, setUncontrolledIndex] = useState(0);
	const [isPaused, setIsPaused] = useState(false);

	const activeIndex = isControlled ? controlledIndex : uncontrolledIndex;
	const currentItem = list[activeIndex % (list.length || 1)] ?? "";

	useEffect(() => {
		if (isControlled || list.length <= 1 || isPaused || interval <= 0) return;
		const timer = setInterval(() => {
			setUncontrolledIndex((prev) => (prev + 1) % list.length);
		}, interval);
		return () => clearInterval(timer);
	}, [isControlled, list.length, isPaused, interval]);

	const yOffset = direction === "up" ? 14 : direction === "down" ? -14 : 0;
	const exitY = direction === "up" ? -14 : direction === "down" ? 14 : 0;

	return (
		/* biome-ignore lint/a11y/noStaticElementInteractions: pause text cycling on hover */
		<span
			onMouseEnter={pauseOnHover ? () => setIsPaused(true) : undefined}
			onMouseLeave={pauseOnHover ? () => setIsPaused(false) : undefined}
			// Grid: every item sits invisibly in one cell, so the box is always the longest item's size
			// and swapping never reflows the surrounding layout (e.g. a two-line quote).
			className={cn("relative inline-grid overflow-hidden", className)}
			// Announce only externally driven swaps; an auto-rotating ticker would talk every few seconds.
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
}
