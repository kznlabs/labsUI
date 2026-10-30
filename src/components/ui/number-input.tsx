"use client";

import { Minus, Plus } from "lucide-react";
import { type ComponentProps, useState } from "react";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { useControllableState } from "@/lib/use-controllable-state";
import { cn } from "@/lib/utils";

type NumberInputProps = Omit<
	ComponentProps<"input">,
	"type" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step"
> & {
	/** Controlled number; pair with `onValueChange`. */
	value?: number;
	/** Number at first render (uncontrolled). */
	defaultValue?: number;
	/** Called with the new number. */
	onValueChange?: (value: number) => void;
	/** Lowest value. */
	min?: number;
	/** Highest value. */
	max?: number;
	/** Amount the buttons and Up/Down change it by. */
	step?: number;
};

const decimals = (value: number) => (String(value).split(".")[1] ?? "").length;

/**
 * Native number field (ArrowUp/Down, form submit, min/max validation) with −/+ buttons, e.g. a
 * cart quantity. Buttons are pointer helpers (tabIndex -1); keyboard users use the arrows.
 */
export function NumberInput({
	value: valueProp,
	defaultValue = 0,
	onValueChange,
	min,
	max,
	step = 1,
	className,
	disabled,
	...props
}: NumberInputProps) {
	const [value, setValue] = useControllableState(valueProp, defaultValue, onValueChange);
	// Raw text while typing so the field can be cleared and retyped; null = show the value.
	const [draft, setDraft] = useState<string | null>(null);
	const clamp = (value: number) => Math.min(max ?? value, Math.max(min ?? value, value));
	// Round to the step's precision so 0.1 + 0.2 shows 0.3.
	const round = (value: number) => Number(value.toFixed(decimals(step)));

	const set = (value: number) => {
		setValue(clamp(round(value)));
	};

	const button =
		"grid size-7 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

	return (
		<InputGroup className={cn("w-32", className)}>
			<InputGroupAddon className="pl-1">
				<button
					type="button"
					tabIndex={-1}
					aria-label="Decrease"
					disabled={disabled || (min !== undefined && value <= min)}
					onClick={() => {
						setDraft(null);
						set(value - step);
					}}
					className={button}
				>
					<Minus aria-hidden="true" />
				</button>
			</InputGroupAddon>

			<Input
				type="number"
				inputMode={Number.isInteger(step) ? "numeric" : "decimal"}
				min={min}
				max={max}
				step={step}
				value={draft ?? value}
				disabled={disabled}
				onChange={(event) => {
					setDraft(event.target.value);

					// Commit as soon as it's a number, clamp on blur so typing "1" toward 12 works.
					if (event.target.value !== "" && !Number.isNaN(event.target.valueAsNumber)) {
						setValue(round(event.target.valueAsNumber));
					}
				}}
				onBlur={() => {
					setDraft(null);
					set(value);
				}}
				className="px-0 text-center tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
				{...props}
			/>

			<InputGroupAddon align="end" className="pr-1">
				<button
					type="button"
					tabIndex={-1}
					aria-label="Increase"
					disabled={disabled || (max !== undefined && value >= max)}
					onClick={() => {
						setDraft(null);
						set(value + step);
					}}
					className={button}
				>
					<Plus aria-hidden="true" />
				</button>
			</InputGroupAddon>
		</InputGroup>
	);
}
