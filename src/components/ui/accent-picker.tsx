"use client";

import { motion } from "motion/react";
import { useId, useSyncExternalStore } from "react";
import { type Accent, accents, getAccent, setAccent, subscribeTheme } from "@/lib/theme";
import { cn, spring } from "@/lib/utils";

/** Fixed swatch colors, not the current accent. */
const swatch: Record<Accent, string> = {
	red: "oklch(0.6 0.21 24)",
	orange: "oklch(0.7 0.17 50)",
	yellow: "oklch(0.84 0.17 96)",
	green: "oklch(0.64 0.17 156)",
	blue: "oklch(0.6 0.21 250)",
	purple: "oklch(0.6 0.2 300)",
	pink: "oklch(0.63 0.21 350)",
	slate: "oklch(0.5 0.025 250)",
};

/** Accent color row: radio swatches that retint the whole app via `setAccent()`. */
export function AccentPicker({ className }: { className?: string }) {
	// Per instance, two pickers on a page can't share a radio group or a dot.
	const id = useId();
	const current = useSyncExternalStore(subscribeTheme, getAccent, () => "blue" as Accent);

	return (
		<fieldset className={cn("flex items-center gap-1.5", className)}>
			<legend className="sr-only">Accent color</legend>
			{accents.map((accent) => (
				<label
					key={accent}
					title={accent[0]?.toUpperCase() + accent.slice(1)}
					className="relative grid size-5 cursor-pointer place-items-center rounded-full"
				>
					<input
						type="radio"
						name={`${id}-accent`}
						value={accent}
						checked={current === accent}
						onChange={() => setAccent(accent)}
						className="peer sr-only"
					/>
					<span className="sr-only">{accent}</span>
					<span
						aria-hidden="true"
						style={{ backgroundColor: swatch[accent] }}
						className="size-4 rounded-full ring-1 ring-foreground/10 ring-inset transition-transform duration-200 peer-hover:scale-110 peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50"
					/>
					{current === accent && (
						<motion.span
							aria-hidden="true"
							layoutId={`${id}-dot`}
							transition={spring}
							className="absolute size-1.5 rounded-full bg-white"
						/>
					)}
				</label>
			))}
		</fieldset>
	);
}
