"use client";

import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useMounted } from "@/lib/platform";
import { useAnchor } from "@/lib/use-anchor";
import { useHoverOpen } from "@/lib/use-hover-open";
import { cn, material, spring } from "@/lib/utils";

/** When the last tooltip closed; the next one within WARM ms opens instantly (toolbar scanning). */
let lastClosed = 0;
const WARM = 400;

type TooltipProps = {
	/** Short text. Also becomes the trigger's accessible description. */
	content: ReactNode;
	side?: "top" | "bottom";
	align?: "start" | "center" | "end";
	/** Hover delay in ms before the first tooltip opens (default 500). */
	delay?: number;
	className?: string;
	/** One focusable element, e.g. an icon Button with an aria-label. */
	children: ReactNode;
};

/**
 * Hover/keyboard-focus label for one element. Stays open while the pointer is on it (WCAG
 * 1.4.13), Esc dismisses, mouse only: touch taps go straight to the trigger.
 */
export function Tooltip({
	content,
	side = "top",
	align = "center",
	delay = 500,
	className,
	children,
}: TooltipProps) {
	const id = useId();
	const wrap = useRef<HTMLSpanElement>(null);
	const panel = useRef<HTMLDivElement>(null);
	const { open, close, trigger, floating } = useHoverOpen({
		openDelay: delay,
		closeDelay: 100,
		instant: () => Date.now() - lastClosed < WARM,
		onClose: () => {
			lastClosed = Date.now();
		},
	});
	const pos = useAnchor(open, wrap, panel, { side, align, offset: 8 });
	const mounted = useMounted();

	// Describe the real control (not the wrapper) by an always-present hidden copy of the text.
	useEffect(() => {
		const el = wrap.current?.firstElementChild;
		if (!el) return;
		const prev = el.getAttribute("aria-describedby");
		el.setAttribute("aria-describedby", [prev, id].filter(Boolean).join(" "));
		return () => {
			if (prev) el.setAttribute("aria-describedby", prev);
			else el.removeAttribute("aria-describedby");
		};
	}, [id]);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, close]);

	return (
		<span ref={wrap} className="inline-flex" {...trigger}>
			{children}
			<span id={id} hidden>
				{content}
			</span>
			{mounted &&
				createPortal(
					<AnimatePresence>
						{open && (
							<motion.div
								key="tip"
								ref={panel}
								role="tooltip"
								aria-hidden="true"
								{...floating}
								initial={{ opacity: 0, scale: 0.94, y: pos.side === "top" ? 4 : -4 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.96, transition: { ...spring, stiffness: 700 } }}
								transition={spring}
								style={{
									top: pos.top,
									left: pos.left,
									transformOrigin: pos.side === "top" ? "bottom center" : "top center",
								}}
								className={cn(
									"fixed z-[60] max-w-64 rounded-md border px-2 py-1 text-popover-foreground text-xs leading-snug shadow-md",
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
