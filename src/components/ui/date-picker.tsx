"use client";

import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { Calendar, type DateRange, key } from "@/components/ui/calendar";
import { useFieldControl } from "@/components/ui/field";
import { fieldClass } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useControllableState } from "@/lib/use-controllable-state";
import { cn } from "@/lib/utils";

type Preset<V> = { label: string; value: V };

type Base = {
	placeholder?: string;
	min?: Date;
	max?: Date;
	isDisabled?: (date: Date) => boolean;
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
	locale?: string;
	/** Submits ISO through a hidden input: `2026-10-21`, or `2026-10-03/2026-10-09` for a range. */
	name?: string;
	/** Pair with <Label htmlFor>, or let <Field> fill it in. */
	id?: string;
	disabled?: boolean;
	required?: boolean;
	"aria-invalid"?: boolean;
	"aria-label"?: string;
	"aria-describedby"?: string;
	className?: string;
};

type SingleProps = Base & {
	mode?: "single";
	value?: Date | null;
	defaultValue?: Date | null;
	onValueChange?: (date: Date) => void;
	/** Shortcuts beside the grid, e.g. Today, Tomorrow. */
	presets?: Preset<Date>[];
};

type RangeProps = Base & {
	mode: "range";
	value?: DateRange | null;
	defaultValue?: DateRange | null;
	onValueChange?: (range: DateRange) => void;
	/** Shortcuts beside the grid, e.g. Last 7 days. Readers reach for these before the grid. */
	presets?: Preset<DateRange>[];
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
		className,
		...trigger
	} = useFieldControl(allProps);
	const range = mode === "range";
	const [open, setOpen] = useState(false);
	const [value, setValue] = useControllableState<Date | DateRange | null>(
		valueProp,
		defaultValue ?? null,
		onValueChange as ((v: Date | DateRange | null) => void) | undefined,
	);
	// Remount the grid on a preset so it jumps to that month.
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

	const commit = (v: Date | DateRange) => {
		setValue(v);
		if (v instanceof Date || (v.from && v.to)) setOpen(false);
	};
	const shared = { min, max, isDisabled, weekStartsOn, locale, autoFocus: true };

	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger
					variant="outline"
					className={cn(
						fieldClass,
						"h-9 w-full justify-start gap-2 px-3 font-normal [&_svg]:text-muted-foreground",
						!label && "text-muted-foreground",
						className,
					)}
					{...trigger}
				>
					<CalendarDays />
					<span className="truncate">{label ?? placeholder}</span>
				</PopoverTrigger>
				<PopoverContent align="start" className="flex w-auto gap-3 p-3">
					{presets && presets.length > 0 && (
						<ul className="flex min-w-32 flex-col gap-0.5 border-r pr-3" aria-label="Presets">
							{presets.map((p) => (
								<li key={p.label}>
									<button
										type="button"
										onClick={() => {
											setShown((n) => n + 1);
											commit(p.value);
										}}
										className="w-full cursor-default rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
									>
										{p.label}
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
			{name && <input type="hidden" name={name} value={iso} />}
		</>
	);
}
