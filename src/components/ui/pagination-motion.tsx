"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { type ReactNode, useId, useState } from "react";
import { spring } from "@/lib/utils";

/* Client half of `pagination.tsx`, which stays server-safe so `pageRange()` runs on the server. */

/** Scopes the active pill's `layoutId` so several paginations on a page don't share it. */
export function PaginationMotion({ children }: { children: ReactNode }) {
	return <LayoutGroup id={useId()}>{children}</LayoutGroup>;
}

/** Outline pill behind the active page; springs to the next active link. */
export function PaginationActivePill() {
	return (
		<motion.span
			aria-hidden="true"
			layoutId="pagination-active"
			transition={spring}
			className="-z-10 absolute inset-0 rounded-lg border border-border bg-background shadow-xs dark:border-input dark:bg-input/30"
		/>
	);
}

const swipe = {
	enter: (dir: number) => ({ x: dir * 14, opacity: 0 }),
	center: { x: 0, opacity: 1 },
	exit: (dir: number) => ({ x: dir * -14, opacity: 0 }),
};

/** Page number that swipes in from the direction of travel when its slot changes value. */
export function PaginationNumber({ value }: { value: number }) {
	const [last, setLast] = useState({ value, dir: 0 });
	if (last.value !== value) setLast({ value, dir: value > last.value ? 1 : -1 });
	return (
		<span className="relative inline-grid overflow-hidden">
			<AnimatePresence mode="popLayout" initial={false} custom={last.dir}>
				<motion.span
					key={value}
					custom={last.dir}
					variants={swipe}
					initial="enter"
					animate="center"
					exit="exit"
					transition={spring}
				>
					{value}
				</motion.span>
			</AnimatePresence>
		</span>
	);
}
