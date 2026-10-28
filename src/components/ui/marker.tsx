"use client";

import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";
import { cn, spring } from "@/lib/utils";

const colors = {
	primary: "[--marker:color-mix(in_oklch,var(--primary)_24%,transparent)]",
	yellow: "[--marker:color-mix(in_oklch,var(--warning)_38%,transparent)]",
	green: "[--marker:color-mix(in_oklch,var(--success)_30%,transparent)]",
	red: "[--marker:color-mix(in_oklch,var(--destructive)_24%,transparent)]",
};

type MarkerProps = Omit<HTMLMotionProps<"mark">, "color"> & {
	/** Highlighter color. */
	color?: keyof typeof colors;
	/** Draws the highlight on, left to right, the first time it scrolls into view. */
	draw?: boolean;
	/** Seconds before drawing; stagger several markers in one paragraph. */
	delay?: number;
};

/**
 * Highlighter-pen <mark>. Wraps across lines cleanly; `draw` sweeps it on in view (instant
 * with reduced motion, fully shown without JS).
 */
export function Marker({
	color = "yellow",
	draw = false,
	delay = 0,
	className,
	...props
}: MarkerProps) {
	const reduce = useReducedMotion();
	const sweep = draw && !reduce;

	return (
		<motion.mark
			data-marker={sweep ? "" : undefined}
			initial={sweep ? { backgroundSize: "0% 100%" } : false}
			whileInView={sweep ? { backgroundSize: "100% 100%" } : undefined}
			viewport={{ once: true, margin: "0px 0px -10% 0px" }}
			transition={{ ...spring, delay }}
			className={cn(
				// Solid fill as a one-color linear-gradient, background-size is what animates.
				"rounded-[0.25em] bg-[linear-gradient(var(--marker),var(--marker))] bg-transparent bg-no-repeat px-[0.15em] [background-size:100%_100%] text-inherit [box-decoration-break:clone]",
				colors[color],
				className,
			)}
			{...props}
		/>
	);
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Marks every case-insensitive match of `query` (one term or several) inside `text`. */
export function Highlight({
	text,
	query,
	color,
}: {
	/** Full text to search in. */
	text: string;
	/** Term or terms to mark. */
	query: string | string[];
	/** Highlighter color. */
	color?: MarkerProps["color"];
}) {
	const terms = [query]
		.flat()
		.map((term) => term.trim())
		.filter(Boolean);

	if (terms.length === 0) return text;

	// Capturing split keeps the matches at odd indexes.
	const parts = text.split(new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi"));

	return parts.map((part, i) =>
		i % 2 ? (
			// biome-ignore lint/suspicious/noArrayIndexKey: parts of one fixed string
			<Marker key={i} color={color}>
				{part}
			</Marker>
		) : (
			part
		),
	);
}
