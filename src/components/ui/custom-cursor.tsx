"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/lib/platform";
import { spring } from "@/lib/utils";

const INTERACTIVE =
	"a, button, input, select, textarea, label, summary, [role='button'], [data-cursor='hover']";
const QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/**
 * Opt-in spring cursor (dot + trailing ring; ring expands over interactive elements).
 * Mount once. Renders nothing on touch/coarse pointers or with reduced motion.
 */
export function CustomCursor() {
	const enabled = useMediaQuery(QUERY);
	const [visible, setVisible] = useState(false);
	const [hovering, setHovering] = useState(false);
	const [pressed, setPressed] = useState(false);

	const x = useMotionValue(-100);
	const y = useMotionValue(-100);
	const rx = useSpring(x, { stiffness: 400, damping: 30, mass: 0.5 });
	const ry = useSpring(y, { stiffness: 400, damping: 30, mass: 0.5 });

	useEffect(() => {
		if (!enabled) return;
		const root = document.documentElement;
		root.classList.add("has-custom-cursor");
		let shown = false;
		const move = (e: PointerEvent) => {
			if (e.pointerType !== "mouse") return;
			x.set(e.clientX);
			y.set(e.clientY);
			// Once, not per move: pointermove fires at display rate.
			if (shown) return;
			shown = true;
			setVisible(true);
		};
		const over = (e: PointerEvent) =>
			setHovering(!!(e.target as Element | null)?.closest?.(INTERACTIVE));
		const leave = () => {
			shown = false;
			setVisible(false);
		};
		const down = () => setPressed(true);
		const up = () => setPressed(false);
		window.addEventListener("pointermove", move, { passive: true });
		window.addEventListener("pointerover", over, { passive: true });
		window.addEventListener("pointerdown", down);
		window.addEventListener("pointerup", up);
		root.addEventListener("pointerleave", leave);
		return () => {
			root.classList.remove("has-custom-cursor");
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerover", over);
			window.removeEventListener("pointerdown", down);
			window.removeEventListener("pointerup", up);
			root.removeEventListener("pointerleave", leave);
		};
	}, [enabled, x, y]);

	if (!enabled) return null;

	return (
		<AnimatePresence>
			{visible && (
				<motion.div
					key="cursor"
					aria-hidden="true"
					className="pointer-events-none fixed inset-0 z-[200]"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={spring}
				>
					<motion.div
						// Fixed 40px, scaled: transforms stay on the compositor, width/height would relayout.
						className="absolute top-0 left-0 size-10 rounded-full border border-foreground/25"
						style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
						animate={{
							scale: (hovering ? 1 : 0.7) * (pressed ? 0.85 : 1),
							backgroundColor: hovering
								? "color-mix(in oklch, var(--foreground) 6%, transparent)"
								: "color-mix(in oklch, var(--foreground) 0%, transparent)",
						}}
						transition={spring}
					/>
					<motion.div
						className="absolute top-0 left-0 size-1.5 rounded-full bg-foreground"
						style={{ x, y, translateX: "-50%", translateY: "-50%" }}
						animate={{ scale: hovering ? 0 : 1 }}
						transition={spring}
					/>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
