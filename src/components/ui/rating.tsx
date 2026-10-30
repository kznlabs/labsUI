"use client";

import { Star } from "lucide-react";
import { motion } from "motion/react";
import { useId, useState } from "react";
import { useFieldControl } from "@/components/ui/field";
import { useControllableState } from "@/lib/use-controllable-state";
import { clamp, cn, spring } from "@/lib/utils";

type RatingProps = {
	/** Controlled rating; pair with `onValueChange`. */
	value?: number;
	/** Rating at first render (uncontrolled). */
	defaultValue?: number;
	/** Called with the picked rating. */
	onValueChange?: (value: number) => void;
	/** Number of stars. */
	max?: number;
	/** Display only: renders fractions (4.6) as a partially filled star, no inputs. */
	readOnly?: boolean;
	/** Form field name for the chosen value. */
	name?: string;
	/** Submit needs a rating. */
	required?: boolean;
	/** Stars can't be picked and the value isn't submitted. */
	disabled?: boolean;
	/** Group label (visually hidden). */
	label?: string;
	/** Star size. */
	size?: "sm" | "default";
	/** Ids of hint or error text; Field fills it in. */
	"aria-describedby"?: string;
	/** Error styling; Field sets it from `error`. */
	"aria-invalid"?: boolean;
	className?: string;
};

const sizes = { sm: "size-4", default: "size-5" } as const;

/**
 * Star rating. Interactive: native radios (arrow keys, forms, screen readers) with a hover
 * preview and a spring lift/press on the stars. `readOnly`: an image of the score, fractions included.
 */
export function Rating(allProps: RatingProps) {
	const {
		value: valueProp,
		defaultValue = 0,
		onValueChange,
		max = 5,
		readOnly = false,
		name,
		required,
		disabled,
		label = "Rating",
		size = "default",
		className,
		"aria-describedby": describedBy,
		"aria-invalid": invalid,
	} = useFieldControl(allProps);
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
				{stars.map((star) => {
					const fill = clamp(value - (star - 1), 0, 1);

					return (
						<span key={star} className={cn("relative", sizes[size])}>
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
			disabled={disabled}
			aria-describedby={describedBy}
			onPointerLeave={() => setHover(null)}
			className={cn("inline-flex items-center gap-0.5", disabled && "opacity-50", className)}
		>
			<legend className="sr-only">{label}</legend>
			{stars.map((star) => (
				<label
					key={star}
					className={cn("relative", disabled ? "cursor-not-allowed" : "cursor-pointer")}
					onPointerEnter={() => !disabled && setHover(star)}
				>
					<input
						type="radio"
						name={name ?? auto}
						value={star}
						checked={value === star}
						required={required}
						aria-invalid={invalid || undefined}
						onChange={() => setValue(star)}
						className="peer sr-only"
					/>
					<span className="sr-only">
						{star} {star === 1 ? "star" : "stars"}
					</span>
					<motion.span
						aria-hidden="true"
						// whileTap would make the star focusable, the radio underneath is the tab stop.
						tabIndex={-1}
						// Springs take two keyframes: lift on hover, press on tap.
						animate={{ scale: hover === star ? 1.15 : 1 }}
						whileTap={{ scale: 0.85 }}
						transition={spring}
						className="block rounded-sm peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50"
					>
						<Star
							className={cn(
								"transition-colors",
								sizes[size],
								star <= shown ? "text-warning" : "text-foreground/15",
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
