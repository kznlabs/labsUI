"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { useFieldControl } from "@/components/ui/field";
import { useControllableState } from "@/lib/use-controllable-state";
import { clamp, cn, spring } from "@/lib/utils";

type SliderProps = {
	/** One value, or two for a range (e.g. a price filter). */
	value?: number[];
	/** Values at first render (uncontrolled). */
	defaultValue?: number[];
	/** Called with every thumb's value while dragging. */
	onValueChange?: (value: number[]) => void;
	/** Lowest value. */
	min?: number;
	/** Highest value. */
	max?: number;
	/** Increment for drag and arrow keys. */
	step?: number;
	/** Submitted per thumb: `name` (one value) or `name` twice (range). */
	name?: string;
	/** Blocks dragging and keys. */
	disabled?: boolean;
	/** Accessible names per thumb; defaults to "Minimum" / "Maximum" for a range. */
	labels?: string[];
	/** Id of the first thumb; Field fills it in. */
	id?: string;
	/** Ids of hint or error text; Field fills it in. */
	"aria-describedby"?: string;
	/** Error styling; Field sets it from `error`. */
	"aria-invalid"?: boolean;
	className?: string;
};

/** Visual knob size, the native thumb matches it so pointer hits line up. */
const KNOB = 20;

/**
 * Slider over native range inputs: keyboard, forms, touch and screen readers work as the
 * browser does. Thin accent track, white knob that lifts while held. Two values = range.
 */
export function Slider(allProps: SliderProps) {
	const {
		value: valueProp,
		defaultValue = [0],
		onValueChange,
		min = 0,
		max = 100,
		step = 1,
		name,
		disabled,
		labels,
		id,
		className,
		...aria
	} = useFieldControl(allProps);
	const [values, setValues] = useControllableState(valueProp, defaultValue, onValueChange);
	const [held, setHeld] = useState<number | null>(null);
	// Keyboard focus only, a click also focuses and shouldn't draw a ring.
	const [focused, setFocused] = useState<number | null>(null);
	const range = values.length > 1;
	const ratio = (value: number) => (clamp(value, min, max) - min) / (max - min || 1);
	// Same geometry as the native thumb: center travels from KNOB/2 to width - KNOB/2.
	const at = (value: number) => `calc(${ratio(value)} * (100% - ${KNOB}px) + ${KNOB / 2}px)`;

	const set = (i: number, value: number) => {
		const next = [...values];

		// Range thumbs cannot cross.
		next[i] = range
			? i === 0
				? Math.min(value, values[1] ?? value)
				: Math.max(value, values[0] ?? value)
			: value;
		setValues(next);
	};

	const lo = range ? (values[0] ?? min) : min;
	const hi = range ? (values[1] ?? max) : (values[0] ?? min);
	// Touching range thumbs: the one that can still move goes on top, or the pair gets stuck. At the
	// bottom end only max can move.
	const onTop = range && lo === hi ? (lo <= min ? 1 : 0) : undefined;

	return (
		<div
			className={cn(
				"relative flex h-5 w-full touch-none items-center",
				disabled && "opacity-50",
				className,
			)}
		>
			<div aria-hidden="true" className="absolute inset-x-0 h-1 rounded-full bg-foreground/10">
				<div
					className="absolute inset-y-0 rounded-full bg-primary"
					style={{
						left: range ? at(lo) : 0,
						right: `calc(100% - ${at(hi)})`,
					}}
				/>
			</div>
			{values.map((value, i) => (
				<motion.span
					// biome-ignore lint/suspicious/noArrayIndexKey: thumbs are positional (min, max)
					key={i}
					aria-hidden="true"
					animate={{ scale: held === i ? 1.12 : 1 }}
					transition={spring}
					style={{ left: at(value) }}
					className={cn(
						"-translate-x-1/2 pointer-events-none absolute size-5 rounded-full bg-white shadow-md ring-[0.5px] ring-black/10",
						focused === i && "ring-[3px] ring-ring/50",
					)}
				/>
			))}
			{values.map((thumbValue, i) => (
				<input
					// biome-ignore lint/suspicious/noArrayIndexKey: thumbs are positional (min, max)
					key={i}
					type="range"
					id={i === 0 ? id : undefined}
					name={name}
					min={min}
					max={max}
					step={step}
					value={thumbValue}
					disabled={disabled}
					aria-label={labels?.[i] ?? (range ? (i === 0 ? "Minimum" : "Maximum") : undefined)}
					{...aria}
					onChange={(event) => set(i, Number(event.target.value))}
					style={onTop === i ? { zIndex: 1 } : undefined}
					onPointerDown={() => setHeld(i)}
					onPointerUp={() => setHeld(null)}
					onFocus={(event) => event.currentTarget.matches(":focus-visible") && setFocused(i)}
					onBlur={() => {
						setHeld(null);
						setFocused(null);
					}}
					className={cn(
						"absolute inset-0 m-0 w-full cursor-pointer appearance-none bg-transparent opacity-0 disabled:cursor-not-allowed",
						// Inputs overlap, so only the thumbs take the pointer.
						range && "pointer-events-none",
						"[&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none",
						"[&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:border-0",
						range &&
							"[&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:pointer-events-auto",
					)}
				/>
			))}
		</div>
	);
}
