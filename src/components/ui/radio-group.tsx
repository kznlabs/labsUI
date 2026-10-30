"use client";

import { motion } from "motion/react";
import { type ComponentProps, createContext, type ReactNode, use, useId, useRef } from "react";
import { useFieldControl } from "@/components/ui/field";
import { useFormReset } from "@/lib/form-value";
import { useControllableState } from "@/lib/use-controllable-state";
import { cn, spring } from "@/lib/utils";

type RadioCtx = {
	name: string;
	value: string;
	setValue: (value: string) => void;
	disabled?: boolean;
	required?: boolean;
	invalid?: boolean;
};

const RadioContext = createContext<RadioCtx | null>(null);

type RadioGroupProps = Omit<ComponentProps<"fieldset">, "defaultValue" | "onChange"> & {
	/** Visible group label, rendered as the fieldset's <legend>. */
	legend?: ReactNode;
	/** Controlled value; pair with `onValueChange`. */
	value?: string;
	/** Value at first render (uncontrolled). */
	defaultValue?: string;
	/** Called with the picked item's value. */
	onValueChange?: (value: string) => void;
	/** Form field name; generated when omitted. */
	name?: string;
	/** Stack items or lay them in a row. */
	orientation?: "vertical" | "horizontal";
	/** Submit needs a picked item. */
	required?: boolean;
	"aria-invalid"?: boolean;
};

/** Native radios in a fieldset: arrow keys, form submit and labels work as the browser does. */
export function RadioGroup({
	legend,
	value: valueProp,
	defaultValue = "",
	onValueChange,
	name,
	orientation = "vertical",
	className,
	children,
	...rest
}: RadioGroupProps) {
	// A fieldset takes no id from Field (labels can't target it); required goes on the radios.
	const { id: _id, required, ...props } = useFieldControl(rest);
	const auto = useId();
	const [value, setValue] = useControllableState(valueProp, defaultValue, onValueChange);
	const items = useRef<HTMLDivElement>(null);

	useFormReset(items, () => setValue(defaultValue));

	return (
		<RadioContext
			value={{
				name: name ?? auto,
				value,
				setValue,
				disabled: props.disabled,
				required,
				invalid: !!props["aria-invalid"],
			}}
		>
			<fieldset className={cn("min-w-0", className)} {...props}>
				{legend && <legend className="mb-3 font-medium text-sm leading-none">{legend}</legend>}

				<div
					ref={items}
					className={cn(
						"flex gap-3",
						orientation === "vertical" ? "flex-col" : "flex-wrap gap-x-5",
					)}
				>
					{children}
				</div>
			</fieldset>
		</RadioContext>
	);
}

/** One option. `children` is its label; `description` adds a muted line under it. */
export function RadioGroupItem({
	value,
	disabled,
	description,
	className,
	children,
}: {
	/** Submitted value. */
	value: string;
	/** Shown but not selectable. */
	disabled?: boolean;
	/** Muted line under the label. */
	description?: ReactNode;
	className?: string;
	/** Label. */
	children: ReactNode;
}) {
	const ctx = use(RadioContext);

	if (!ctx) throw new Error("<RadioGroupItem> must be used inside <RadioGroup>");

	const id = useId();
	const checked = ctx.value === value;
	const off = disabled || ctx.disabled;

	return (
		<div className={cn("flex items-start gap-2.5", off && "opacity-50", className)}>
			<span className="relative mt-px inline-flex size-4 shrink-0">
				<input
					type="radio"
					id={id}
					name={ctx.name}
					value={value}
					checked={checked}
					disabled={off}
					required={ctx.required}
					aria-invalid={ctx.invalid || undefined}
					aria-describedby={description ? `${id}-description` : undefined}
					onChange={() => ctx.setValue(value)}
					className="peer absolute inset-0 z-10 cursor-pointer appearance-none rounded-full outline-none disabled:cursor-not-allowed"
				/>

				<span
					aria-hidden="true"
					className={cn(
						"grid size-full place-items-center rounded-full border shadow-xs transition-colors peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 peer-aria-invalid:border-destructive",
						checked ? "border-primary bg-primary" : "border-input bg-field",
					)}
				>
					<motion.span
						initial={false}
						animate={{ scale: checked ? 1 : 0 }}
						transition={spring}
						className="size-1.5 rounded-full bg-primary-foreground"
					/>
				</span>
			</span>

			<span className="grid gap-1">
				<label
					htmlFor={id}
					className={cn(
						"font-medium text-sm leading-4",
						off ? "cursor-not-allowed" : "cursor-pointer",
					)}
				>
					{children}
				</label>

				{description && (
					<span id={`${id}-description`} className="text-muted-foreground text-xs">
						{description}
					</span>
				)}
			</span>
		</div>
	);
}
