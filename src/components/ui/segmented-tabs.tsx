"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import { useIndicator } from "@/lib/use-indicator";
import { cn, spring } from "@/lib/utils";

type SegmentedTabsProps = {
	/** Accessible name for the tab list. */
	label: string;
	/** Labels, also used as values. */
	items: readonly string[];
	/** Active item; marked `aria-current`. */
	value: string;
	/** Called with the pressed item. */
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
				className="-z-10 absolute inset-y-0 left-0 rounded-md bg-raised shadow-sm ring-[0.5px] ring-raised-ring"
			/>
			{items.map((item) => (
				<button
					key={item}
					ref={(element) => {
						if (element) buttons.current.set(item, element);
						else buttons.current.delete(item);
					}}
					type="button"
					aria-current={value === item ? "page" : undefined}
					onClick={() => onChange(item)}
					className={cn(
						"relative shrink-0 rounded-md px-2.5 py-1 font-medium text-xs outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
						value === item ? "text-foreground" : "text-muted-foreground hover:text-foreground",
					)}
				>
					{item}
				</button>
			))}
		</nav>
	);
}
