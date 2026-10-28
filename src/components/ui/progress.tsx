"use client";

import { motion, useReducedMotion } from "motion/react";
import { clamp, cn, spring } from "@/lib/utils";

type ProgressProps = {
	/** Omit for an indeterminate bar (unknown duration). */
	value?: number;
	/** Value at 100%. */
	max?: number;
	/** Visible label above the bar; also its accessible name. */
	label?: string;
	/** Accessible name when there is no visible label. */
	"aria-label"?: string;
	/** Show the percentage next to the label. */
	showValue?: boolean;
	/** Bar thickness. */
	size?: "sm" | "default";
	className?: string;
};

/**
 * Accent-colored bar that springs to each new value (scaleX, so no layout work per frame).
 * Indeterminate: a segment sweeps across, the one allowed infinite tween; static under reduced motion.
 */
export function Progress({
	value,
	max = 100,
	label,
	"aria-label": ariaLabel,
	showValue = false,
	size = "default",
	className,
}: ProgressProps) {
	// Global reduced motion only stops transforms, the sweep animates `left`.
	const reduce = useReducedMotion();
	const determinate = value !== undefined;
	const ratio = determinate ? clamp(value / max, 0, 1) : 0;
	const pct = Math.round(ratio * 100);

	return (
		<div className={cn("grid w-full gap-1.5", className)}>
			{(label || showValue) && (
				<div className="flex items-center justify-between gap-3 text-xs">
					{label && <span className="font-medium">{label}</span>}
					{showValue && determinate && (
						<span className="ml-auto text-muted-foreground tabular-nums">{pct}%</span>
					)}
				</div>
			)}
			<div
				role="progressbar"
				aria-label={label ?? ariaLabel}
				aria-valuemin={0}
				aria-valuemax={max}
				aria-valuenow={determinate ? value : undefined}
				className={cn(
					"relative w-full overflow-hidden rounded-full bg-foreground/10",
					size === "sm" ? "h-1" : "h-1.5",
				)}
			>
				{determinate ? (
					<motion.div
						className="absolute inset-0 origin-left rounded-full bg-primary"
						initial={false}
						animate={{ scaleX: ratio }}
						transition={spring}
					/>
				) : reduce ? (
					<div className="absolute inset-0 rounded-full bg-primary/40" />
				) : (
					<motion.div
						className="absolute inset-y-0 w-2/5 rounded-full bg-primary"
						initial={{ left: "-40%" }}
						animate={{ left: "100%" }}
						transition={{ duration: 1.4, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
					/>
				)}
			</div>
		</div>
	);
}
