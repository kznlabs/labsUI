"use client";

import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useRef } from "react";
import { createPortal } from "react-dom";
import { useMounted } from "@/lib/platform";
import { useAnchor } from "@/lib/use-anchor";
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

/** Preview card on hover or keyboard focus, for sighted mouse users. Pointer can move into it. */
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
	const { open, trigger, floating } = useHoverOpen({ openDelay, closeDelay });
	const pos = useAnchor(open, wrap, panel, { side, align, offset: 8 });
	const mounted = useMounted();

	return (
		<span ref={wrap} className="inline-flex" {...trigger}>
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
