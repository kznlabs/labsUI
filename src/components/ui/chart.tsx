"use client";

import { Table2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
	type ComponentProps,
	type KeyboardEvent,
	type PointerEvent,
	useCallback,
	useState,
} from "react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn, material, spring } from "@/lib/utils";

type ChartSeries = {
	key: string;
	/** Legend and tooltip name of the series. */
	label: string;
	/** Palette slot, 1 to 8. Defaults to the series' position, so hiding one never repaints the rest. */
	color?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
};

type ChartProps = Omit<ComponentProps<"figure">, "children"> & {
	/** Mark: lines, filled areas or bars. */
	type?: "line" | "area" | "bar";
	/** One object per x value: the `index` key plus one key per series. */
	data: Record<string, string | number>[];
	/** Key of the x value (category label) in each row. */
	index: string;
	/** At most eight: past that, fold the tail into "Other" or split the chart. */
	series: ChartSeries[];
	/** Names the chart for assistive tech and captions the table view. */
	label: string;
	/** Bars only: stack the series instead of grouping them. */
	stacked?: boolean;
	/** Plot height in px. */
	height?: number;
	/** Value format, e.g. `{ style: "currency", currency: "USD" }`. Axis ticks add compact notation. */
	format?: Intl.NumberFormatOptions;
	/** BCP 47 locale for axis and tooltip numbers. */
	locale?: string;
};

const GAP = 2; // surface gap between touching marks
const BAR = 24; // max bar thickness
const CHAR = 6.5; // approx. width of an 11px digit/letter, for margins

const color = (slot: number) => `var(--chart-${slot})`;
const num = (value: string | number | undefined) =>
	typeof value === "number" ? value : Number(value) || 0;

function niceTicks(min: number, max: number) {
	if (min === max) max = min + 1;

	const raw = (max - min) / 4;
	const mag = 10 ** Math.floor(Math.log10(raw));
	const step = ([1, 2, 2.5, 5, 10].find((step) => step * mag >= raw) ?? 10) * mag;
	const lo = Math.floor(min / step) * step;
	const ticks: number[] = [];

	for (let tick = lo; tick <= max + step * 1e-9; tick += step)
		ticks.push(Number(tick.toPrecision(12)));
	if (ticks[ticks.length - 1] < max)
		ticks.push(Number((ticks[ticks.length - 1] + step).toPrecision(12)));

	return ticks;
}

/**
 * 4px rounded data end, square at the baseline. Same path commands every time so motion can morph
 * between any two bars (a flat one on mount too).
 */
function barPath(x: number, width: number, base: number, end: number, round: boolean) {
	const sign = end <= base ? 1 : -1; // +1 grows upward
	const radius = round ? Math.min(4, width / 2, Math.abs(base - end)) : 0;

	return `M${x} ${base}V${end + sign * radius}Q${x} ${end} ${x + radius} ${end}H${x + width - radius}Q${x + width} ${end} ${x + width} ${end + sign * radius}V${base}Z`;
}

/**
 * Line, area and bar charts in SVG with the categorical `--chart-1` to `--chart-8` palette: crosshair
 * tooltip listing every series (arrow keys too), legend that hides series, direct end labels,
 * and a table view. Props are serializable, so server pages can render it.
 */
export function Chart({
	type = "line",
	data,
	index,
	series,
	label,
	stacked = false,
	height = 240,
	format,
	locale = "en-US",
	className,
	...props
}: ChartProps) {
	const [width, setWidth] = useState(0);
	const [hidden, setHidden] = useState<string[]>([]);
	const [active, setActive] = useState<number | null>(null);
	const [view, setView] = useState<"chart" | "table">("chart");

	// Callback ref, the plot remounts after the table view.
	const box = useCallback((element: HTMLDivElement | null) => {
		if (!element) return;

		const observer = new ResizeObserver(() => setWidth(element.clientWidth));

		observer.observe(element);

		return () => observer.disconnect();
	}, []);

	const fmt = new Intl.NumberFormat(locale, format);
	const slots = new Map(series.map((item, i) => [item.key, item.color ?? i + 1]));
	const shown = series.filter((item) => !hidden.includes(item.key));
	const stack = type === "bar" && stacked;
	const rowCount = data.length;

	// y domain always includes 0: bars grow from it and lines read against it.
	const extents = data.flatMap((row) => {
		const values = shown.map((item) => num(row[item.key]));

		if (!stack) return values;

		return [
			values.filter((value) => value > 0).reduce((a, b) => a + b, 0),
			values.filter((value) => value < 0).reduce((a, b) => a + b, 0),
		];
	});
	const ticks = niceTicks(Math.min(0, ...extents), Math.max(0, ...extents));
	const lo = ticks[0];
	const hi = ticks[ticks.length - 1];
	// Fewest decimals that don't round a tick: 0.25% can't read "0.3%", $20K stays "$20K".
	const tickFmt = (() => {
		const make = (digits: number) =>
			new Intl.NumberFormat(locale, {
				...format,
				notation: "compact",
				minimumFractionDigits: 0,
				maximumFractionDigits: digits,
			});

		for (let decimals = 1; decimals < 4; decimals++) {
			const a = make(decimals);
			const b = make(decimals + 2);

			if (ticks.every((tick) => a.format(tick) === b.format(tick))) return a;
		}

		return make(4);
	})();

	const endLabels =
		type !== "bar" && shown.length >= 2 && shown.length <= 4 && width >= 360 && rowCount > 0;
	const margin = {
		top: 12,
		bottom: 28,
		left: Math.max(...ticks.map((tick) => tickFmt.format(tick).length)) * CHAR + 12,
		right: endLabels ? Math.max(...shown.map((item) => item.label.length)) * CHAR + 16 : 8,
	};
	const plotW = Math.max(0, width - margin.left - margin.right);
	const plotH = height - margin.top - margin.bottom;
	const band = plotW / Math.max(1, rowCount);
	const cx = (i: number) => margin.left + band * (i + 0.5);
	const y = (value: number) => margin.top + plotH - ((value - lo) / (hi - lo)) * plotH;
	const zero = y(0);

	const xLabelW = Math.max(...data.map((row) => String(row[index]).length), 1) * CHAR + 12;
	const every = Math.max(1, Math.ceil(xLabelW / Math.max(band, 1)));

	const points = (key: string) => data.map((row, i) => [cx(i), y(num(row[key]))] as const);
	const linePath = (pts: readonly (readonly [number, number])[]) =>
		pts.map(([px, py], i) => `${i ? "L" : "M"}${px} ${py}`).join("");
	const areaPath = (pts: readonly (readonly [number, number])[]) =>
		rowCount ? `${linePath(pts)}L${pts[rowCount - 1][0]} ${zero}L${pts[0][0]} ${zero}Z` : "";
	const flat = (pts: readonly (readonly [number, number])[]) =>
		pts.map(([px]) => [px, zero] as const);

	const bars = () => {
		const out: { key: string; d: string; flat: string; fill: string }[] = [];

		if (stack) {
			const barWidth = Math.min(BAR, band * 0.6);

			data.forEach((row, i) => {
				const x = cx(i) - barWidth / 2;
				let pos = 0;
				let neg = 0;
				const values = shown.map((item) => num(row[item.key]));
				const lastPos = values.findLastIndex((value) => value > 0);
				const lastNeg = values.findLastIndex((value) => value < 0);

				shown.forEach((item, j) => {
					const value = values[j];

					if (!value) return;

					const from = value > 0 ? pos : neg;
					const to = from + value;

					if (value > 0) pos = to;
					else neg = to;

					const outer = j === (value > 0 ? lastPos : lastNeg);
					const base = y(from);
					// Inner segments give up 2px at the outer end (surface gap).
					const end = outer ? y(to) : y(to) + (value > 0 ? GAP : -GAP);

					if (Math.abs(end - base) < 0.5) return;
					out.push({
						key: `${i}-${item.key}`,
						d: barPath(x, barWidth, base, end, outer),
						flat: barPath(x, barWidth, base, base, outer),
						fill: color(slots.get(item.key) ?? 1),
					});
				});
			});
		} else {
			const count = shown.length;
			const groupW = Math.min(band * 0.7, count * BAR + (count - 1) * GAP);
			const width = Math.max(1, (groupW - (count - 1) * GAP) / count);

			data.forEach((row, i) => {
				shown.forEach((item, j) => {
					const x = cx(i) - groupW / 2 + j * (width + GAP);

					out.push({
						key: `${i}-${item.key}`,
						d: barPath(x, width, zero, y(num(row[item.key])), true),
						flat: barPath(x, width, zero, zero, true),
						fill: color(slots.get(item.key) ?? 1),
					});
				});
			});
		}

		return out;
	};

	// End labels only when they don't collide, otherwise the legend does the job.
	const ends = endLabels
		? shown
				.map((item) => ({ s: item, y: y(num(data[rowCount - 1][item.key])) }))
				.sort((a, b) => a.y - b.y)
		: [];
	const endsFit = ends.every((end, i) => i === 0 || end.y - ends[i - 1].y >= 14);

	const pick = (event: PointerEvent<SVGRectElement>) => {
		const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();

		if (!rect || !rowCount) return;

		const i = Math.floor((event.clientX - rect.left - margin.left) / band);

		setActive(Math.min(rowCount - 1, Math.max(0, i)));
	};

	const onKey = (event: KeyboardEvent) => {
		if (!rowCount) return;

		const next =
			event.key === "ArrowRight"
				? Math.min(rowCount - 1, (active ?? -1) + 1)
				: event.key === "ArrowLeft"
					? Math.max(0, (active ?? rowCount) - 1)
					: event.key === "Home"
						? 0
						: event.key === "End"
							? rowCount - 1
							: undefined;

		if (event.key === "Escape") setActive(null);
		if (next === undefined) return;
		event.preventDefault();
		setActive(next);
	};

	const row = active === null ? undefined : data[active];
	const readout = row
		? `${row[index]}: ${shown.map((item) => `${item.label} ${fmt.format(num(row[item.key]))}`).join(", ")}`
		: "";
	const flip = active !== null && cx(active) > width * 0.6;

	const table = (
		// Off-screen copy for the chart view. Not a scroller, or it's an unreachable region with no tab
		// stop.
		<Table containerClassName={view === "table" ? "max-h-[32rem]" : "overflow-x-visible"}>
			<TableCaption className={view === "chart" ? "sr-only" : undefined}>{label}</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead className="capitalize">{index}</TableHead>
					{series.map((item) => (
						<TableHead key={item.key} className="text-right">
							{item.label}
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{data.map((row) => (
					<TableRow key={String(row[index])}>
						<TableCell className="font-medium">{row[index]}</TableCell>
						{series.map((item) => (
							<TableCell key={item.key} className="text-right tabular-nums">
								{fmt.format(num(row[item.key]))}
							</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);

	return (
		<figure className={cn("grid w-full gap-3", className)} {...props}>
			<div className="flex flex-wrap items-center justify-between gap-2">
				{series.length > 1 ? (
					<ul
						className="flex flex-wrap items-center gap-x-1 gap-y-1"
						aria-label={`${label} series`}
					>
						{series.map((item) => {
							const off = hidden.includes(item.key);

							return (
								<li key={item.key}>
									<button
										type="button"
										aria-pressed={!off}
										disabled={view === "table" || (!off && shown.length === 1)}
										onClick={() =>
											setHidden((hidden) =>
												off
													? hidden.filter((hiddenKey) => hiddenKey !== item.key)
													: [...hidden, item.key],
											)
										}
										className={cn(
											"flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-muted-foreground text-xs outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none",
											off && "opacity-50",
										)}
									>
										<span
											aria-hidden="true"
											className={
												type === "line" ? "h-0.5 w-3 rounded-full" : "size-2.5 rounded-[3px]"
											}
											style={{ background: color(slots.get(item.key) ?? 1) }}
										/>
										<span className={cn(off && "line-through")}>{item.label}</span>
									</button>
								</li>
							);
						})}
					</ul>
				) : (
					<span />
				)}
				<Button
					size="sm"
					variant="ghost"
					aria-pressed={view === "table"}
					onClick={() => setView((value) => (value === "chart" ? "table" : "chart"))}
					className="h-7 px-2 text-muted-foreground text-xs"
				>
					<Table2 />
					Table
				</Button>
			</div>

			{view === "table" ? (
				table
			) : (
				<>
					<div
						ref={box}
						role="img"
						aria-roledescription="chart"
						aria-label={`${label}. Arrow keys read values.`}
						// biome-ignore lint/a11y/noNoninteractiveTabindex: focus lets arrow keys walk the data
						tabIndex={0}
						onKeyDown={onKey}
						onFocus={(event) => {
							if (event.currentTarget.matches(":focus-visible") && active === null)
								setActive(rowCount - 1);
						}}
						onBlur={() => setActive(null)}
						className="relative rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
						style={{ height }}
					>
						{width > 0 && (
							// Out of flow, otherwise the fixed-width svg holds the box and the chart can grow but
							// never shrink.
							<svg
								width={width}
								height={height}
								aria-hidden="true"
								className="absolute inset-0 block overflow-visible"
							>
								{ticks.map((tick) => (
									<g key={tick}>
										<line
											x1={margin.left}
											x2={width - margin.right}
											y1={Math.round(y(tick)) + 0.5}
											y2={Math.round(y(tick)) + 0.5}
											className={tick === 0 ? "stroke-foreground/25" : "stroke-border"}
											shapeRendering="crispEdges"
										/>
										<text
											x={margin.left - 8}
											y={y(tick)}
											textAnchor="end"
											dominantBaseline="middle"
											className="fill-muted-foreground text-[11px] tabular-nums"
										>
											{tickFmt.format(tick)}
										</text>
									</g>
								))}
								{data.map((row, i) =>
									i % every === 0 ? (
										<text
											key={String(row[index])}
											x={cx(i)}
											y={height - 8}
											textAnchor="middle"
											className="fill-muted-foreground text-[11px]"
										>
											{row[index]}
										</text>
									) : null,
								)}

								{active !== null &&
									(type === "bar" ? (
										<rect
											x={cx(active) - band / 2}
											y={margin.top}
											width={band}
											height={plotH}
											rx={6}
											className="fill-foreground/[0.04]"
										/>
									) : (
										<line
											x1={Math.round(cx(active)) + 0.5}
											x2={Math.round(cx(active)) + 0.5}
											y1={margin.top}
											y2={margin.top + plotH}
											className="stroke-foreground/25"
											shapeRendering="crispEdges"
										/>
									))}

								{type === "bar"
									? bars().map((bar) => (
											<motion.path
												key={bar.key}
												initial={{ d: bar.flat }}
												animate={{ d: bar.d }}
												transition={spring}
												fill={bar.fill}
											/>
										))
									: shown.map((item) => {
											const pts = points(item.key);
											const fill = color(slots.get(item.key) ?? 1);

											return (
												<g key={item.key}>
													{type === "area" && (
														<motion.path
															initial={{ d: areaPath(flat(pts)) }}
															animate={{ d: areaPath(pts) }}
															transition={spring}
															fill={fill}
															fillOpacity={0.1}
														/>
													)}
													<motion.path
														initial={{ d: linePath(flat(pts)) }}
														animate={{ d: linePath(pts) }}
														transition={spring}
														fill="none"
														stroke={fill}
														strokeWidth={2}
														strokeLinejoin="round"
														strokeLinecap="round"
													/>
													{(active === null ? [rowCount - 1] : [active]).map((i) =>
														pts[i] ? (
															<motion.circle
																key="dot"
																initial={false}
																animate={{ cx: pts[i][0], cy: pts[i][1] }}
																transition={spring}
																r={4}
																fill={fill}
																strokeWidth={2}
																className="stroke-card"
															/>
														) : null,
													)}
												</g>
											);
										})}

								{endsFit &&
									ends.map((end) => (
										<text
											key={end.s.key}
											x={cx(rowCount - 1) + 10}
											y={end.y}
											dominantBaseline="middle"
											className="fill-muted-foreground text-[11px]"
										>
											{end.s.label}
										</text>
									))}

								{/* Hit layer: the whole band answers, not just the painted mark. */}
								<rect
									x={margin.left}
									y={0}
									width={plotW}
									height={height}
									fill="transparent"
									onPointerMove={pick}
									onPointerLeave={() => setActive(null)}
								/>
							</svg>
						)}

						<AnimatePresence>
							{row && active !== null && (
								<motion.div
									key="tip"
									aria-hidden="true"
									initial={{ opacity: 0, x: cx(active), y: margin.top }}
									animate={{ opacity: 1, x: cx(active), y: margin.top }}
									exit={{ opacity: 0 }}
									transition={spring}
									className="pointer-events-none absolute top-0 left-0 z-10"
								>
									<div
										className={cn(
											"min-w-36 rounded-lg border px-2.5 py-2 text-popover-foreground text-xs shadow-md",
											material,
											flip ? "-translate-x-full -ml-3" : "ml-3",
										)}
									>
										<p className="mb-1.5 text-muted-foreground">{row[index]}</p>
										<ul className="grid gap-1">
											{shown.map((item) => (
												<li key={item.key} className="flex items-center gap-2">
													<span
														className="h-0.5 w-2.5 shrink-0 rounded-full"
														style={{ background: color(slots.get(item.key) ?? 1) }}
													/>
													<span className="text-muted-foreground">{item.label}</span>
													<span className="ml-auto pl-3 font-medium tabular-nums">
														{fmt.format(num(row[item.key]))}
													</span>
												</li>
											))}
										</ul>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
					<p className="sr-only" aria-live="polite">
						{readout}
					</p>
					{/* The same numbers for screen readers, search engines and no-JS. */}
					<div className="sr-only">{table}</div>
				</>
			)}
		</figure>
	);
}
