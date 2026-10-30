"use client";

import { type RefObject, useLayoutEffect, useState } from "react";
import { clamp } from "@/lib/utils";

export type AnchorSide = "bottom" | "top";

export type AnchorPlacement = {
	top: number;
	left: number;
	/** Anchor width, for `min-width` matching (Select). */
	width: number;
	/** Side actually used: the preferred one, or the other for lack of room. */
	side: AnchorSide;
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
	}: { align?: "start" | "center" | "end"; side?: AnchorSide; offset?: number } = {},
) {
	const [pos, setPos] = useState<AnchorPlacement>({
		top: -9999,
		left: -9999,
		width: 0,
		side: preferred,
	});

	useLayoutEffect(() => {
		if (!open) return;

		const place = () => {
			const anchorRect = anchor.current?.getBoundingClientRect();
			const element = floating.current;

			if (!anchorRect || !element) return;

			// offsetWidth/Height ignore the scale-in transform, so this is the real size.
			const width = element.offsetWidth;
			const height = element.offsetHeight;
			const below = anchorRect.bottom + offset;
			const above = anchorRect.top - offset - height;
			const fitsBelow = below + height <= innerHeight - MARGIN;
			const fitsAbove = above >= MARGIN;
			const side: AnchorSide =
				preferred === "bottom"
					? fitsBelow || !fitsAbove
						? "bottom"
						: "top"
					: fitsAbove || !fitsBelow
						? "top"
						: "bottom";
			const ideal =
				align === "end"
					? anchorRect.right - width
					: align === "center"
						? anchorRect.left + anchorRect.width / 2 - width / 2
						: anchorRect.left;
			const left = clamp(ideal, MARGIN, innerWidth - width - MARGIN);

			setPos({ top: side === "bottom" ? below : above, left, width: anchorRect.width, side });
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
