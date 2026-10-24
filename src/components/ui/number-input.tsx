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
	value?: number;
	defaultValue?: number;
	onValueChange?: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
};

const decimals = (n: number) => (String(n).split(".")[1] ?? "").length;

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
	// Raw text while typing, so the field can be cleared and retyped; null = show the value.
	const [draft, setDraft] = useState<string | null>(null);
	const clamp = (n: number) => Math.min(max ?? n, Math.max(min ?? n, n));
	// Round to the step's precision so 0.1 + 0.2 shows 0.3.
	const round = (n: number) => Number(n.toFixed(decimals(step)));
	const set = (n: number) => {
		setValue(clamp(round(n)));
	};
	const button =
		"grid size-7 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

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
				onChange={(e) => {
					setDraft(e.target.value);
					// Commit as soon as it is a number; clamping waits for blur so typing "1" toward 12 works.
					if (e.target.value !== "" && !Number.isNaN(e.target.valueAsNumber)) {
						setValue(round(e.target.valueAsNumber));
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
