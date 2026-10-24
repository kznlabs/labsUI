"use client";

import { Star } from "lucide-react";
import { motion } from "motion/react";
import { useId, useState } from "react";
import { useControllableState } from "@/lib/use-controllable-state";
import { cn, spring } from "@/lib/utils";

type RatingProps = {
	value?: number;
	defaultValue?: number;
	onValueChange?: (value: number) => void;
	max?: number;
	/** Display only: renders fractions (4.6) as a partially filled star, no inputs. */
	readOnly?: boolean;
	/** Form field name for the chosen value. */
	name?: string;
	/** Group label (visually hidden). */
	label?: string;
	size?: "sm" | "default";
	className?: string;
};

const sizes = { sm: "size-4", default: "size-5" } as const;

/**
 * Star rating. Interactive: native radios (arrow keys, forms, screen readers) with a hover
 * preview and a spring lift/press on the stars. `readOnly`: an image of the score, fractions included.
 */
export function Rating({
	value: valueProp,
	defaultValue = 0,
	onValueChange,
	max = 5,
	readOnly = false,
	name,
	label = "Rating",
	size = "default",
	className,
}: RatingProps) {
	const auto = useId();
	const [value, setValue] = useControllableState(valueProp, defaultValue, onValueChange);
	const [hover, setHover] = useState<number | null>(null);
	const stars = Array.from({ length: max }, (_, i) => i + 1);

	if (readOnly) {
		return (
			<span
				role="img"
				aria-label={`${value} out of ${max}`}
				className={cn("inline-flex items-center gap-0.5", className)}
			>
				{stars.map((n) => {
					const fill = Math.min(Math.max(value - (n - 1), 0), 1);
					return (
						<span key={n} className={cn("relative", sizes[size])}>
							<Star
								aria-hidden="true"
								className={cn("absolute inset-0 text-foreground/15", sizes[size])}
								fill="currentColor"
								strokeWidth={0}
							/>
							<span
								className="absolute inset-0 overflow-hidden"
								style={{ width: `${fill * 100}%` }}
							>
								<Star
									aria-hidden="true"
									className={cn("text-warning", sizes[size])}
									fill="currentColor"
									strokeWidth={0}
								/>
							</span>
						</span>
					);
				})}
			</span>
		);
	}

	const shown = hover ?? value;
	return (
		<fieldset
			onPointerLeave={() => setHover(null)}
			className={cn("m-0 inline-flex items-center gap-0.5 border-0 p-0", className)}
		>
			<legend className="sr-only">{label}</legend>
			{stars.map((n) => (
				<label key={n} className="relative cursor-pointer" onPointerEnter={() => setHover(n)}>
					<input
						type="radio"
						name={name ?? auto}
						value={n}
						checked={value === n}
						onChange={() => setValue(n)}
						className="peer sr-only"
					/>
					<span className="sr-only">
						{n} {n === 1 ? "star" : "stars"}
					</span>
					<motion.span
						aria-hidden="true"
						// whileTap would make the star focusable; the radio underneath is the tab stop.
						tabIndex={-1}
						// Springs only take two keyframes: lift on hover, press in on tap.
						animate={{ scale: hover === n ? 1.15 : 1 }}
						whileTap={{ scale: 0.85 }}
						transition={spring}
						className="block rounded-sm peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50"
					>
						<Star
							className={cn(
								"transition-colors duration-150",
								sizes[size],
								n <= shown ? "text-warning" : "text-foreground/15",
							)}
							fill="currentColor"
							strokeWidth={0}
						/>
					</motion.span>
				</label>
			))}
		</fieldset>
	);
}
