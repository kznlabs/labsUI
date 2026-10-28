"use client";

import { AnimatePresence, motion } from "motion/react";
import { type FocusEvent, type MouseEvent, type PointerEvent, type ReactNode, useRef } from "react";
import { createPortal } from "react-dom";
import { useMounted } from "@/lib/platform";
import { useAnchor } from "@/lib/use-anchor";
import { useDismiss } from "@/lib/use-dismiss";
import { useHoverOpen } from "@/lib/use-hover-open";
import { cn, material, spring } from "@/lib/utils";

type HoverCardProps = {
	/** Rich preview: avatar, bio, stats. Supplementary only; the trigger must work without it. */
	content: ReactNode;
	/** Preferred side; flips when there is no room. */
	side?: "top" | "bottom";
	/** Alignment with the trigger. */
	align?: "start" | "center" | "end";
	/** Hover or focus time in ms before it opens. */
	openDelay?: number;
	/** Time in ms before it closes once the pointer leaves. */
	closeDelay?: number;
	className?: string;
	/** Usually a link (profile, product, clip). */
	children: ReactNode;
};

/**
 * Preview card on hover or keyboard focus; the pointer can move into it. On touch the first tap
 * opens it, the second acts.
 */
export function HoverCard({
	content,
	side = "bottom",
	align = "center",
	openDelay = 600,
	closeDelay = 200,
	className,
	children,
}: HoverCardProps) {
	const wrap = useRef<HTMLSpanElement>(null);
	const panel = useRef<HTMLDivElement>(null);
	const { open, close, schedule, trigger, floating } = useHoverOpen({ openDelay, closeDelay });
	const pos = useAnchor(open, wrap, panel, { side, align, offset: 8 });
	const mounted = useMounted();
	const touched = useRef(false);

	useDismiss(open, [panel, wrap], close);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: events bubble from the trigger inside
		<span
			ref={wrap}
			className="inline-flex"
			{...trigger}
			// Null on a tap inside the card; useDismiss handles outside taps.
			onBlur={(event: FocusEvent) => {
				if (event.relatedTarget && !panel.current?.contains(event.relatedTarget)) close();
			}}
			onPointerDown={(event: PointerEvent) => {
				touched.current = event.pointerType === "touch";
			}}
			onClickCapture={(event: MouseEvent) => {
				// Portal clicks bubble here too.
				if (!touched.current || open || !wrap.current?.contains(event.target as Node)) return;

				event.preventDefault();
				event.stopPropagation();
				schedule(true, 0);
			}}
		>
			{children}
			{mounted &&
				createPortal(
					<AnimatePresence>
						{open && (
							<motion.div
								key="card"
								ref={panel}
								{...floating}
								initial={{ opacity: 0, scale: 0.96, y: pos.side === "top" ? 6 : -6 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.97, transition: { ...spring, stiffness: 600 } }}
								transition={spring}
								style={{
									top: pos.top,
									left: pos.left,
									transformOrigin: pos.side === "top" ? "bottom center" : "top center",
								}}
								className={cn(
									"fixed z-50 w-72 max-w-[calc(100vw-1rem)] rounded-xl border p-4 text-popover-foreground shadow-lg",
									material,
									className,
								)}
							>
								{content}
							</motion.div>
						)}
					</AnimatePresence>,
					document.body,
				)}
		</span>
	);
}
