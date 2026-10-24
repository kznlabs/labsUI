"use client";

import { motion } from "motion/react";
import { useId, useSyncExternalStore } from "react";
import { type Accent, accents, getAccent, setAccent, subscribeTheme } from "@/lib/theme";
import { cn, spring } from "@/lib/utils";

/** Swatch colors, independent of the current accent (each shows its own). */
const swatch: Record<Accent, string> = {
	blue: "oklch(0.6 0.21 255)",
	purple: "oklch(0.6 0.2 310)",
	pink: "oklch(0.63 0.21 0)",
	red: "oklch(0.6 0.21 27)",
	orange: "oklch(0.7 0.17 55)",
	yellow: "oklch(0.84 0.17 92)",
	green: "oklch(0.64 0.17 148)",
	graphite: "oklch(0.5 0 0)",
};

/** macOS "Accent color" row: radio swatches that retint the whole app via `setAccent()`. */
export function AccentPicker({ className }: { className?: string }) {
	// Per instance: two pickers on a page must not share one radio group or one moving dot.
	const id = useId();
	const current = useSyncExternalStore(subscribeTheme, getAccent, () => "blue" as Accent);
	return (
		<fieldset className={cn("m-0 flex items-center gap-1.5 border-0 p-0", className)}>
			<legend className="sr-only">Accent color</legend>
			{accents.map((a) => (
				<label
					key={a}
					title={a[0]?.toUpperCase() + a.slice(1)}
					className="relative grid size-5 cursor-pointer place-items-center rounded-full"
				>
					<input
						type="radio"
						name={`${id}-accent`}
						value={a}
						checked={current === a}
						onChange={() => setAccent(a)}
						className="peer sr-only"
					/>
					<span className="sr-only">{a}</span>
					<span
						aria-hidden="true"
						style={{ backgroundColor: swatch[a] }}
						className="size-4 rounded-full ring-1 ring-black/10 ring-inset transition-transform duration-200 peer-hover:scale-110 peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 dark:ring-white/15"
					/>
					{current === a && (
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
