"use client";

import { type RefObject, useLayoutEffect, useState } from "react";

type Side = "bottom" | "top";

type Placement = {
	top: number;
	left: number;
	/** Anchor width, for `min-width` matching (Select). */
	width: number;
	/** Side actually used: the preferred one, or the other for lack of room. */
	side: Side;
};

const MARGIN = 8;

/**
 * Fixed-position coordinates for a floating panel next to its anchor: on the preferred side,
 * flipped when it doesn't fit, clamped to the viewport, kept in place on scroll and resize.
 * Measures before paint, so nothing jumps.
 */
export function useAnchor(
	open: boolean,
	anchor: RefObject<HTMLElement | null>,
	floating: RefObject<HTMLElement | null>,
	{
		align = "start",
		side: preferred = "bottom",
		offset = 6,
	}: { align?: "start" | "center" | "end"; side?: Side; offset?: number } = {},
) {
	const [pos, setPos] = useState<Placement>({
		top: -9999,
		left: -9999,
		width: 0,
		side: preferred,
	});

	useLayoutEffect(() => {
		if (!open) return;
		const place = () => {
			const a = anchor.current?.getBoundingClientRect();
			const f = floating.current;
			if (!a || !f) return;
			// offsetWidth/Height ignore the scale-in transform, so the panel's real size is used.
			const w = f.offsetWidth;
			const h = f.offsetHeight;
			const below = a.bottom + offset;
			const above = a.top - offset - h;
			const fitsBelow = below + h <= innerHeight - MARGIN;
			const fitsAbove = above >= MARGIN;
			const side: Side =
				preferred === "bottom"
					? fitsBelow || !fitsAbove
						? "bottom"
						: "top"
					: fitsAbove || !fitsBelow
						? "top"
						: "bottom";
			const ideal =
				align === "end" ? a.right - w : align === "center" ? a.left + a.width / 2 - w / 2 : a.left;
			const left = Math.min(Math.max(ideal, MARGIN), innerWidth - w - MARGIN);
			setPos({ top: side === "bottom" ? below : above, left, width: a.width, side });
		};
		place();
		addEventListener("resize", place);
		addEventListener("scroll", place, true);
		return () => {
			removeEventListener("resize", place);
			removeEventListener("scroll", place, true);
		};
	}, [open, anchor, floating, align, preferred, offset]);

	return pos;
}
