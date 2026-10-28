"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
	type KeyboardEvent,
	useEffect,
	useId,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import { Button } from "@/components/ui/button";
import { useControllableState } from "@/lib/use-controllable-state";
import { cn, spring } from "@/lib/utils";

export type DateRange = { from?: Date; to?: Date };

type Base = {
	/** Displayed month (any day in it). Controlled with `onMonthChange`, or start at `defaultMonth`. */
	month?: Date;
	/** Month shown at first render (uncontrolled). */
	defaultMonth?: Date;
	/** Called when the user pages or arrows into another month. */
	onMonthChange?: (month: Date) => void;
	/** Earliest selectable day. */
	min?: Date;
	/** Latest selectable day. */
	max?: Date;
	/** Extra rule, e.g. weekends off. Client-only (a function). */
	isDisabled?: (date: Date) => boolean;
	/** 0 is Sunday, 6 is Saturday. Default 1 (Monday, ISO). */
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
	/** BCP 47 locale for month and weekday names. */
	locale?: string;
	/** Focus the current day on mount (DatePicker sets this). */
	autoFocus?: boolean;
	className?: string;
};

type SingleProps = Base & {
	/** "single": pick one day. "range": pick a start, then an end. */
	mode?: "single";
	/** Controlled day, or `{ from, to }` in range mode; null = nothing picked. */
	value?: Date | null;
	/** Day or range picked at first render (uncontrolled). */
	defaultValue?: Date | null;
	/** Called with the picked day, or with the range as it is picked. */
	onValueChange?: (date: Date) => void;
};

type RangeProps = Base & {
	mode: "range";
	value?: DateRange | null;
	defaultValue?: DateRange | null;
	onValueChange?: (range: DateRange) => void;
};

type CalendarProps = SingleProps | RangeProps;

// ---------- local-date helpers (no time, no time zones) ----------

const day = (y: number, month: number, dayOfMonth: number) => new Date(y, month, dayOfMonth);
const strip = (date: Date) => day(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) =>
	day(date.getFullYear(), date.getMonth(), date.getDate() + days);
const monthOf = (date: Date) => day(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date: Date, months: number) => {
	const first = day(date.getFullYear(), date.getMonth() + months, 1);
	const last = day(first.getFullYear(), first.getMonth() + 1, 0).getDate();

	return day(first.getFullYear(), first.getMonth(), Math.min(date.getDate(), last));
};

const same = (a?: Date | null, b?: Date | null) => !!a && !!b && key(a) === key(b);
const before = (a: Date, b: Date) => key(a) < key(b);
const pad = (value: number) => String(value).padStart(2, "0");

/** Local YYYY-MM-DD; sorts like the dates it names. */
export const key = (date: Date) =>
	`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const fromKey = (key: string) => {
	const [y, month, dayOfMonth] = key.split("-").map(Number);

	return day(y ?? 1970, (month ?? 1) - 1, dayOfMonth ?? 1);
};

// "Today" only exists in the browser, a prerendered page can't bake in the build date.
const noop = () => () => {};

const useToday = () => {
	const todayKey = useSyncExternalStore(
		noop,
		() => key(new Date()),
		() => null,
	);

	return todayKey ? fromKey(todayKey) : null;
};

const slide = {
	enter: (dir: number) => ({ x: dir * 24, opacity: 0 }),
	center: { x: 0, opacity: 1 },
	exit: (dir: number) => ({ x: dir * -24, opacity: 0 }),
};

/**
 * Month grid on the WAI-ARIA date-grid pattern. Single date or range (with a hover preview),
 * min/max and custom disabled days, months slide in from the direction of travel. Keyboard:
 * arrows by day and week, Home/End to the week's ends, PageUp/PageDown by month (+Shift: year).
 */
export function Calendar(props: CalendarProps) {
	const {
		min,
		max,
		isDisabled,
		weekStartsOn = 1,
		locale = "en-US",
		autoFocus = false,
		className,
	} = props;
	const range = props.mode === "range";
	const id = useId();
	const grid = useRef<HTMLTableElement>(null);
	const today = useToday();

	const [value, setValue] = useControllableState<Date | DateRange | null>(
		props.value,
		props.defaultValue ?? null,
		props.onValueChange as ((value: Date | DateRange | null) => void) | undefined,
	);
	const single = !range && value instanceof Date ? value : null;
	const span = range && value && !(value instanceof Date) ? value : null;
	const anchor = single ?? span?.from ?? null;

	const [monthState, setMonth] = useControllableState<Date | null>(
		props.month,
		props.defaultMonth ?? anchor,
		props.onMonthChange as ((month: Date | null) => void) | undefined,
	);
	// Until we know today, a calendar with nothing to show renders an empty frame.
	const month = monthState ? monthOf(monthState) : today ? monthOf(today) : null;

	const [focused, setFocused] = useState<Date | null>(null);
	const [hover, setHover] = useState<Date | null>(null);
	const navigated = useRef(false);

	const [last, setLast] = useState({ month: month ? key(month) : "", dir: 0 });

	if (month && last.month !== key(month))
		setLast({
			month: key(month),
			// From the empty frame: no direction, just fade in.
			dir: !last.month ? 0 : before(fromKey(last.month), month) ? 1 : -1,
		});

	const blocked = (date: Date) =>
		(!!min && before(date, strip(min))) ||
		(!!max && before(strip(max), date)) ||
		!!isDisabled?.(date);

	// Roving focus: focused day, else selection or today if shown, else the 1st.
	const inMonth = (date: Date | null): date is Date =>
		!!date &&
		!!month &&
		date.getMonth() === month.getMonth() &&
		date.getFullYear() === month.getFullYear();
	const tabStop = month ? ([focused, anchor, today].find(inMonth) ?? month) : null;

	useEffect(() => {
		if (!tabStop || !navigated.current) return;
		navigated.current = false;
		grid.current?.querySelector<HTMLElement>(`[data-day="${key(tabStop)}"]`)?.focus();
	});

	const go = (date: Date) => {
		const target =
			min && before(date, strip(min))
				? strip(min)
				: max && before(strip(max), date)
					? strip(max)
					: date;

		navigated.current = true;
		setFocused(target);
		if (range && span?.from && !span.to) setHover(target);
		if (!inMonth(target)) setMonth(monthOf(target));
	};

	const pick = (date: Date) => {
		if (blocked(date)) return;
		setFocused(date);
		if (!inMonth(date)) setMonth(monthOf(date));
		if (!range) return setValue(date);
		// Range: 1st pick starts, 2nd ends (an earlier day restarts), 3rd starts over.
		if (!span?.from || span.to || before(date, span.from)) setValue({ from: date });
		else setValue({ from: span.from, to: date });
		setHover(null);
	};

	const onKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
		if (!tabStop) return;

		const dow = (tabStop.getDay() - weekStartsOn + 7) % 7;
		const next: Record<string, Date> = {
			ArrowLeft: addDays(tabStop, -1),
			ArrowRight: addDays(tabStop, 1),
			ArrowUp: addDays(tabStop, -7),
			ArrowDown: addDays(tabStop, 7),
			Home: addDays(tabStop, -dow),
			End: addDays(tabStop, 6 - dow),
			PageUp: addMonths(tabStop, event.shiftKey ? -12 : -1),
			PageDown: addMonths(tabStop, event.shiftKey ? 12 : 1),
		};
		const target = next[event.key];

		if (!target) return;
		event.preventDefault();
		go(target);
	};

	const fmtMonth = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
	const fmtDay = new Intl.DateTimeFormat(locale, { dateStyle: "full" });
	const weekdays = Array.from({ length: 7 }, (_, i) => day(2026, 0, 4 + ((i + weekStartsOn) % 7)));
	const short = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
	const long = new Intl.DateTimeFormat(locale, { weekday: "long" });

	// Always six weeks so the height never jumps.
	const first = month ? addDays(month, -((month.getDay() - weekStartsOn + 7) % 7)) : null;
	const weeks = Array.from({ length: 6 }, (_, weekIndex) =>
		Array.from({ length: 7 }, (_, i) => (first ? addDays(first, weekIndex * 7 + i) : null)),
	);

	const to = span?.to ?? (span?.from && hover && !before(hover, span.from) ? hover : undefined);
	const inBand = (date: Date) =>
		!!span?.from && !!to && before(span.from, date) && before(date, to);

	const prevOff = !month || (!!min && !before(monthOf(min), month));
	const nextOff = !month || (!!max && !before(month, monthOf(max)));

	return (
		<div className={cn("grid w-fit gap-3", className)}>
			<div className="flex items-center justify-between gap-2 pl-2">
				<p id={`${id}-caption`} aria-live="polite" className="font-semibold text-sm">
					{month ? fmtMonth.format(month) : " "}
				</p>
				<div className="flex gap-0.5">
					<Button
						variant="ghost"
						size="icon"
						className="size-7"
						aria-label="Previous month"
						disabled={prevOff}
						onClick={() => month && setMonth(addMonths(month, -1))}
					>
						<ChevronLeft />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="size-7"
						aria-label="Next month"
						disabled={nextOff}
						onClick={() => month && setMonth(addMonths(month, 1))}
					>
						<ChevronRight />
					</Button>
				</div>
			</div>

			<div className="relative overflow-hidden">
				<AnimatePresence mode="popLayout" initial={false} custom={last.dir}>
					<motion.table
						key={month ? key(month) : "pending"}
						ref={grid}
						role="grid"
						aria-labelledby={`${id}-caption`}
						aria-multiselectable={range || undefined}
						custom={last.dir}
						variants={slide}
						initial="enter"
						animate="center"
						exit="exit"
						transition={spring}
						onKeyDown={onKeyDown}
						onPointerLeave={() => setHover(null)}
						className="border-collapse"
					>
						<thead>
							<tr>
								{weekdays.map((weekday) => (
									<th
										key={key(weekday)}
										scope="col"
										abbr={long.format(weekday)}
										className="size-9 pb-1 font-normal text-muted-foreground text-xs"
									>
										{short.format(weekday)}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{weeks.map((week, weekIndex) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: six fixed rows
								<tr key={weekIndex}>
									{week.map((date, i) => {
										if (!date)
											// biome-ignore lint/suspicious/noArrayIndexKey: placeholder cells before today is known
											return <td key={i} className="size-9" />;

										const dayKey = key(date);
										const outside = !inMonth(date);
										const off = blocked(date);
										const start = same(date, single) || same(date, span?.from);
										const end = same(date, to);
										const selected = start || end;
										const band = inBand(date);
										const isToday = same(date, today);

										return (
											// biome-ignore lint/a11y/useAriaPropsSupportedByRole: a td in role="grid" is a gridcell, which takes aria-selected (APG date grid)
											<td
												key={dayKey}
												aria-selected={selected || band || undefined}
												className={cn(
													"relative isolate p-0",
													// Band runs behind the days, each end gets a half so it meets the pill.
													band && "bg-primary/12",
													"before:-z-10 before:absolute before:inset-y-0 before:bg-primary/12",
													start && to && !end ? "before:right-0 before:left-1/2" : "",
													end && span?.from && !start ? "before:right-1/2 before:left-0" : "",
													!(start && to && !end) &&
														!(end && span?.from && !start) &&
														"before:hidden",
												)}
											>
												<button
													type="button"
													data-day={dayKey}
													data-autofocus={autoFocus && same(date, tabStop) ? "" : undefined}
													tabIndex={same(date, tabStop) ? 0 : -1}
													aria-label={fmtDay.format(date)}
													aria-current={isToday ? "date" : undefined}
													aria-disabled={off || undefined}
													onClick={() => pick(date)}
													onFocus={() => setFocused(date)}
													onPointerEnter={() => range && setHover(date)}
													className={cn(
														"relative flex size-9 cursor-default items-center justify-center rounded-lg text-sm tabular-nums outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
														!selected && "hover:bg-accent",
														outside && !selected && "text-muted-foreground/50",
														isToday && !selected && "font-semibold text-primary-ink",
														selected && "bg-primary font-medium text-primary-foreground",
														off && "pointer-events-none line-through opacity-35",
													)}
												>
													{date.getDate()}
												</button>
											</td>
										);
									})}
								</tr>
							))}
						</tbody>
					</motion.table>
				</AnimatePresence>
			</div>
		</div>
	);
}
