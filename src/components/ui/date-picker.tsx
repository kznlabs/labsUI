"use client";

import { CalendarDays } from "lucide-react";
import { useRef, useState } from "react";
import { Calendar, type DateRange, key } from "@/components/ui/calendar";
import { useFieldControl } from "@/components/ui/field";
import { fieldClass } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormValue } from "@/lib/form-value";
import { useControllableState } from "@/lib/use-controllable-state";
import { cn } from "@/lib/utils";

export type DatePickerPreset<Value> = { label: string; value: Value };

type Base = {
	/** Button text when nothing is picked. */
	placeholder?: string;
	/** Earliest selectable day. */
	min?: Date;
	/** Latest selectable day. */
	max?: Date;
	/** Extra rule, e.g. weekends off. Client-only (a function). */
	isDisabled?: (date: Date) => boolean;
	/** 0 is Sunday, 6 is Saturday. Default 1 (Monday, ISO). */
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
	/** BCP 47 locale for the button text and the calendar. */
	locale?: string;
	/** Submits ISO: `2026-10-21`, or `2026-10-03/2026-10-09` for a range. */
	name?: string;
	/** Pair with <Label htmlFor>, or let <Field> fill it in. */
	id?: string;
	/** Blocks opening; the value isn't submitted. */
	disabled?: boolean;
	/** Form submit needs a date. */
	required?: boolean;
	/** Error styling; Field sets it from `error`. */
	"aria-invalid"?: boolean;
	/** Accessible name when there is no visible label. */
	"aria-label"?: string;
	/** Ids of hint or error text; Field fills it in. */
	"aria-describedby"?: string;
	className?: string;
};

type SingleProps = Base & {
	/** "single": pick one day. "range": pick a start, then an end. */
	mode?: "single";
	/** Controlled day, or `{ from, to }` in range mode; null = nothing picked. */
	value?: Date | null;
	/** Day or range at first render (uncontrolled). */
	defaultValue?: Date | null;
	/** Called with the picked day, or with the range once both ends are set. */
	onValueChange?: (date: Date) => void;
	/** Shortcuts beside the grid, e.g. Today, or Last 7 days for a range. Readers reach for these first. */
	presets?: DatePickerPreset<Date>[];
};

type RangeProps = Base & {
	mode: "range";
	value?: DateRange | null;
	defaultValue?: DateRange | null;
	onValueChange?: (range: DateRange) => void;
	presets?: DatePickerPreset<DateRange>[];
};

type DatePickerProps = SingleProps | RangeProps;

/**
 * Field-styled button that opens a Calendar in a Popover, focused on the picked day. A single
 * date closes on pick; a range closes once both ends are set. Optional presets, form-ready.
 */
export function DatePicker(allProps: DatePickerProps) {
	const {
		mode,
		value: valueProp,
		defaultValue,
		onValueChange,
		presets,
		placeholder = mode === "range" ? "Pick dates" : "Pick a date",
		min,
		max,
		isDisabled,
		weekStartsOn,
		locale = "en-US",
		name,
		required,
		className,
		...trigger
	} = useFieldControl(allProps);
	const anchor = useRef<HTMLButtonElement>(null);
	const [invalid, setInvalid] = useState(false);
	const range = mode === "range";
	const [open, setOpen] = useState(false);
	const [value, setValue] = useControllableState<Date | DateRange | null>(
		valueProp,
		defaultValue ?? null,
		onValueChange as ((value: Date | DateRange | null) => void) | undefined,
	);
	// Remount on a preset so the grid jumps to that month.
	const [shown, setShown] = useState(0);

	const fmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
	const span = range && value && !(value instanceof Date) ? value : null;
	const label =
		value instanceof Date
			? fmt.format(value)
			: span?.from && span.to
				? fmt.formatRange(span.from, span.to)
				: span?.from
					? `${fmt.format(span.from)} – …`
					: null;
	const iso =
		value instanceof Date
			? key(value)
			: span?.from && span.to
				? `${key(span.from)}/${key(span.to)}`
				: "";

	const commit = (value: Date | DateRange) => {
		setValue(value);
		if (value instanceof Date || (value.from && value.to)) setOpen(false);
	};

	const shared = { min, max, isDisabled, weekStartsOn, locale, autoFocus: true };

	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger
					ref={anchor}
					variant="outline"
					className={cn(
						fieldClass,
						"h-9 w-full justify-start gap-2 px-3 font-normal [&_svg]:text-muted-foreground",
						!label && "text-muted-foreground",
						className,
					)}
					{...trigger}
					aria-invalid={trigger["aria-invalid"] || (invalid && !iso) || undefined}
				>
					<CalendarDays />
					<span className="truncate">{label ?? placeholder}</span>
				</PopoverTrigger>
				<PopoverContent align="start" className="flex w-auto flex-col gap-3 p-3 sm:flex-row">
					{presets && presets.length > 0 && (
						// No room beside the calendar on phones.
						<ul
							className="flex flex-wrap gap-1.5 border-b pb-3 sm:min-w-32 sm:flex-col sm:flex-nowrap sm:gap-0.5 sm:border-r sm:border-b-0 sm:pr-3 sm:pb-0"
							aria-label="Presets"
						>
							{presets.map((preset) => (
								<li key={preset.label}>
									<button
										type="button"
										onClick={() => {
											setShown((count) => count + 1);
											commit(preset.value);
										}}
										className="min-h-6 w-full cursor-default rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 max-sm:rounded-full max-sm:border max-sm:px-2.5 max-sm:py-1 max-sm:text-xs"
									>
										{preset.label}
									</button>
								</li>
							))}
						</ul>
					)}
					{range ? (
						<Calendar key={shown} mode="range" {...shared} value={span} onValueChange={commit} />
					) : (
						<Calendar
							key={shown}
							{...shared}
							value={value instanceof Date ? value : null}
							onValueChange={commit}
						/>
					)}
				</PopoverContent>
			</Popover>
			<FormValue
				name={name}
				value={iso}
				required={required}
				disabled={trigger.disabled}
				anchor={anchor}
				onInvalid={() => setInvalid(true)}
			/>
		</>
	);
}
