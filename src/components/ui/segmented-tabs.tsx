"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import { useIndicator } from "@/lib/use-indicator";
import { cn, spring } from "@/lib/utils";

type SegmentedTabsProps = {
	/** Accessible name for the tab list. */
	label: string;
	items: readonly string[];
	value: string;
	onChange: (item: string) => void;
	className?: string;
};

/** Segmented tabs. One indicator slides under the active item on a spring, always behind the labels. */
export function SegmentedTabs({ label, items, value, onChange, className }: SegmentedTabsProps) {
	const buttons = useRef(new Map<string, HTMLButtonElement>());
	const indicator = useIndicator(buttons.current, value);

	return (
		<nav
			aria-label={label}
			className={cn("relative isolate flex min-w-0 items-center gap-1", className)}
		>
			<motion.span
				aria-hidden="true"
				initial={false}
				animate={{ x: indicator.x, width: indicator.width }}
				transition={spring}
				className="-z-10 absolute inset-y-0 left-0 rounded-md bg-card shadow-sm ring-[0.5px] ring-black/5 dark:bg-white/20 dark:ring-white/10"
			/>
			{items.map((item) => (
				<button
					key={item}
					ref={(el) => {
						if (el) buttons.current.set(item, el);
						else buttons.current.delete(item);
					}}
					type="button"
					aria-current={value === item ? "page" : undefined}
					onClick={() => onChange(item)}
					className={cn(
						"relative shrink-0 rounded-md px-2.5 py-1 font-medium text-xs outline-none transition-colors duration-400 ease-in-out focus-visible:ring-[3px] focus-visible:ring-ring/50",
						value === item ? "text-foreground" : "text-muted-foreground hover:text-foreground",
					)}
				>
					{item}
				</button>
			))}
		</nav>
	);
}
