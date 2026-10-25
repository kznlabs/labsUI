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
	label: string;
	/** Palette slot 1–8. Defaults to the series' position, so hiding one never repaints the rest. */
	color?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
};

type ChartProps = Omit<ComponentProps<"figure">, "children"> & {
	type?: "line" | "area" | "bar";
	data: Record<string, string | number>[];
	/** Key of the x value (category label) in each row. */
	index: string;
	/** At most eight: past that, fold the tail into "Other" or split the chart. */
	series: ChartSeries[];
	/** Names the chart for assistive tech and captions the table view. */
	label: string;
	/** Bars only: stack the series instead of grouping them. */
	stacked?: boolean;
	height?: number;
	/** Value format, e.g. `{ style: "currency", currency: "USD" }`. Axis ticks add compact notation. */
	format?: Intl.NumberFormatOptions;
	locale?: string;
};

const GAP = 2; // surface gap between touching marks
const BAR = 24; // max bar thickness
const CHAR = 6.5; // approx. width of an 11px digit/letter, for margins

const color = (slot: number) => `var(--chart-${slot})`;
const num = (v: string | number | undefined) => (typeof v === "number" ? v : Number(v) || 0);

/** Round tick values covering [min, max] in about four steps. */
function niceTicks(min: number, max: number) {
	if (min === max) max = min + 1;
	const raw = (max - min) / 4;
	const mag = 10 ** Math.floor(Math.log10(raw));
	const step = ([1, 2, 2.5, 5, 10].find((m) => m * mag >= raw) ?? 10) * mag;
	const lo = Math.floor(min / step) * step;
	const ticks: number[] = [];
	for (let t = lo; t <= max + step * 1e-9; t += step) ticks.push(Number(t.toPrecision(12)));
	if (ticks[ticks.length - 1] < max)
		ticks.push(Number((ticks[ticks.length - 1] + step).toPrecision(12)));
	return ticks;
}

/**
 * A bar from `base` to `end`: round 4px data end, square at the baseline. Always the same
 * commands, so motion can spring between any two bars (including a flat one on mount).
 */
function barPath(x: number, w: number, base: number, end: number, round: boolean) {
	const s = end <= base ? 1 : -1; // +1 grows upward
	const r = round ? Math.min(4, w / 2, Math.abs(base - end)) : 0;
	return `M${x} ${base}V${end + s * r}Q${x} ${end} ${x + r} ${end}H${x + w - r}Q${x + w} ${end} ${x + w} ${end + s * r}V${base}Z`;
}

/**
 * Line, area and bar charts in SVG with the categorical `--chart-1…8` palette: crosshair
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

	// Callback ref: the plot remounts when you come back from the table view.
	const box = useCallback((el: HTMLDivElement | null) => {
		if (!el) return;
		const ro = new ResizeObserver(() => setWidth(el.clientWidth));
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	const fmt = new Intl.NumberFormat(locale, format);
	const slots = new Map(series.map((s, i) => [s.key, s.color ?? i + 1]));
	const shown = series.filter((s) => !hidden.includes(s.key));
	const stack = type === "bar" && stacked;
	const n = data.length;

	// y domain always includes 0: bars grow from it, and lines read against it.
	const extents = data.flatMap((row) => {
		const vs = shown.map((s) => num(row[s.key]));
		if (!stack) return vs;
		return [
			vs.filter((v) => v > 0).reduce((a, b) => a + b, 0),
			vs.filter((v) => v < 0).reduce((a, b) => a + b, 0),
		];
	});
	const ticks = niceTicks(Math.min(0, ...extents), Math.max(0, ...extents));
	const lo = ticks[0];
	const hi = ticks[ticks.length - 1];
	// Fewest decimals that round no tick: 0.25% must not read "0.3%", $20K stays "$20K".
	const tickFmt = (() => {
		const make = (digits: number) =>
			new Intl.NumberFormat(locale, {
				...format,
				notation: "compact",
				minimumFractionDigits: 0,
				maximumFractionDigits: digits,
			});
		for (let d = 1; d < 4; d++) {
			const a = make(d);
			const b = make(d + 2);
			if (ticks.every((t) => a.format(t) === b.format(t))) return a;
		}
		return make(4);
	})();

	const endLabels =
		type !== "bar" && shown.length >= 2 && shown.length <= 4 && width >= 360 && n > 0;
	const m = {
		top: 12,
		bottom: 28,
		left: Math.max(...ticks.map((t) => tickFmt.format(t).length)) * CHAR + 12,
		right: endLabels ? Math.max(...shown.map((s) => s.label.length)) * CHAR + 16 : 8,
	};
	const plotW = Math.max(0, width - m.left - m.right);
	const plotH = height - m.top - m.bottom;
	const band = plotW / Math.max(1, n);
	const cx = (i: number) => m.left + band * (i + 0.5);
	const y = (v: number) => m.top + plotH - ((v - lo) / (hi - lo)) * plotH;
	const zero = y(0);

	// Thin out x labels so they never touch.
	const xLabelW = Math.max(...data.map((r) => String(r[index]).length), 1) * CHAR + 12;
	const every = Math.max(1, Math.ceil(xLabelW / Math.max(band, 1)));

	const points = (key: string) => data.map((row, i) => [cx(i), y(num(row[key]))] as const);
	const linePath = (pts: readonly (readonly [number, number])[]) =>
		pts.map(([px, py], i) => `${i ? "L" : "M"}${px} ${py}`).join("");
	const areaPath = (pts: readonly (readonly [number, number])[]) =>
		n ? `${linePath(pts)}L${pts[n - 1][0]} ${zero}L${pts[0][0]} ${zero}Z` : "";
	const flat = (pts: readonly (readonly [number, number])[]) =>
		pts.map(([px]) => [px, zero] as const);

	const bars = () => {
		const out: { key: string; d: string; flat: string; fill: string }[] = [];
		if (stack) {
			const w = Math.min(BAR, band * 0.6);
			data.forEach((row, i) => {
				const x = cx(i) - w / 2;
				let pos = 0;
				let neg = 0;
				const vs = shown.map((s) => num(row[s.key]));
				const lastPos = vs.findLastIndex((v) => v > 0);
				const lastNeg = vs.findLastIndex((v) => v < 0);
				shown.forEach((s, j) => {
					const v = vs[j];
					if (!v) return;
					const from = v > 0 ? pos : neg;
					const to = from + v;
					if (v > 0) pos = to;
					else neg = to;
					const outer = j === (v > 0 ? lastPos : lastNeg);
					const base = y(from);
					// Inner segments give up 2px at their outer end: the surface gap.
					const end = outer ? y(to) : y(to) + (v > 0 ? GAP : -GAP);
					if (Math.abs(end - base) < 0.5) return;
					out.push({
						key: `${i}-${s.key}`,
						d: barPath(x, w, base, end, outer),
						flat: barPath(x, w, base, base, outer),
						fill: color(slots.get(s.key) ?? 1),
					});
				});
			});
		} else {
			const k = shown.length;
			const groupW = Math.min(band * 0.7, k * BAR + (k - 1) * GAP);
			const w = Math.max(1, (groupW - (k - 1) * GAP) / k);
			data.forEach((row, i) => {
				shown.forEach((s, j) => {
					const x = cx(i) - groupW / 2 + j * (w + GAP);
					out.push({
						key: `${i}-${s.key}`,
						d: barPath(x, w, zero, y(num(row[s.key])), true),
						flat: barPath(x, w, zero, zero, true),
						fill: color(slots.get(s.key) ?? 1),
					});
				});
			});
		}
		return out;
	};

	// End labels only when they clear each other; otherwise the legend carries identity.
	const ends = endLabels
		? shown.map((s) => ({ s, y: y(num(data[n - 1][s.key])) })).sort((a, b) => a.y - b.y)
		: [];
	const endsFit = ends.every((e, i) => i === 0 || e.y - ends[i - 1].y >= 14);

	const pick = (e: PointerEvent<SVGRectElement>) => {
		const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
		if (!rect || !n) return;
		const i = Math.floor((e.clientX - rect.left - m.left) / band);
		setActive(Math.min(n - 1, Math.max(0, i)));
	};
	const onKey = (e: KeyboardEvent) => {
		if (!n) return;
		const next =
			e.key === "ArrowRight"
				? Math.min(n - 1, (active ?? -1) + 1)
				: e.key === "ArrowLeft"
					? Math.max(0, (active ?? n) - 1)
					: e.key === "Home"
						? 0
						: e.key === "End"
							? n - 1
							: undefined;
		if (e.key === "Escape") setActive(null);
		if (next === undefined) return;
		e.preventDefault();
		setActive(next);
	};

	const row = active === null ? undefined : data[active];
	const readout = row
		? `${row[index]}: ${shown.map((s) => `${s.label} ${fmt.format(num(row[s.key]))}`).join(", ")}`
		: "";
	const flip = active !== null && cx(active) > width * 0.6;

	const table = (
		// Off-screen copy for the chart view: not a scroller, or it becomes an unreachable tab-less region.
		<Table containerClassName={view === "table" ? "max-h-[32rem]" : "overflow-x-visible"}>
			<TableCaption className={view === "chart" ? "sr-only" : undefined}>{label}</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead className="capitalize">{index}</TableHead>
					{series.map((s) => (
						<TableHead key={s.key} className="text-right">
							{s.label}
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{data.map((r) => (
					<TableRow key={String(r[index])}>
						<TableCell className="font-medium">{r[index]}</TableCell>
						{series.map((s) => (
							<TableCell key={s.key} className="text-right tabular-nums">
								{fmt.format(num(r[s.key]))}
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
						{series.map((s) => {
							const off = hidden.includes(s.key);
							return (
								<li key={s.key}>
									<button
										type="button"
										aria-pressed={!off}
										disabled={view === "table" || (!off && shown.length === 1)}
										onClick={() =>
											setHidden((h) => (off ? h.filter((k) => k !== s.key) : [...h, s.key]))
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
											style={{ background: color(slots.get(s.key) ?? 1) }}
										/>
										<span className={cn(off && "line-through")}>{s.label}</span>
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
					onClick={() => setView((v) => (v === "chart" ? "table" : "chart"))}
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
						onFocus={(e) => {
							if (e.currentTarget.matches(":focus-visible") && active === null) setActive(n - 1);
						}}
						onBlur={() => setActive(null)}
						className="relative rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
						style={{ height }}
					>
						{width > 0 && (
							// Out of flow: a fixed-width svg would hold the box at its old width, so the
							// chart could grow with its container but never shrink back.
							<svg
								width={width}
								height={height}
								aria-hidden="true"
								className="absolute inset-0 block overflow-visible"
							>
								{ticks.map((t) => (
									<g key={t}>
										<line
											x1={m.left}
											x2={width - m.right}
											y1={Math.round(y(t)) + 0.5}
											y2={Math.round(y(t)) + 0.5}
											className={t === 0 ? "stroke-foreground/25" : "stroke-border"}
											shapeRendering="crispEdges"
										/>
										<text
											x={m.left - 8}
											y={y(t)}
											textAnchor="end"
											dominantBaseline="middle"
											className="fill-muted-foreground text-[11px] tabular-nums"
										>
											{tickFmt.format(t)}
										</text>
									</g>
								))}
								{data.map((r, i) =>
									i % every === 0 ? (
										<text
											key={String(r[index])}
											x={cx(i)}
											y={height - 8}
											textAnchor="middle"
											className="fill-muted-foreground text-[11px]"
										>
											{r[index]}
										</text>
									) : null,
								)}

								{active !== null &&
									(type === "bar" ? (
										<rect
											x={cx(active) - band / 2}
											y={m.top}
											width={band}
											height={plotH}
											rx={6}
											className="fill-foreground/[0.04]"
										/>
									) : (
										<line
											x1={Math.round(cx(active)) + 0.5}
											x2={Math.round(cx(active)) + 0.5}
											y1={m.top}
											y2={m.top + plotH}
											className="stroke-foreground/25"
											shapeRendering="crispEdges"
										/>
									))}

								{type === "bar"
									? bars().map((b) => (
											<motion.path
												key={b.key}
												initial={{ d: b.flat }}
												animate={{ d: b.d }}
												transition={spring}
												fill={b.fill}
											/>
										))
									: shown.map((s) => {
											const pts = points(s.key);
											const c = color(slots.get(s.key) ?? 1);
											return (
												<g key={s.key}>
													{type === "area" && (
														<motion.path
															initial={{ d: areaPath(flat(pts)) }}
															animate={{ d: areaPath(pts) }}
															transition={spring}
															fill={c}
															fillOpacity={0.1}
														/>
													)}
													<motion.path
														initial={{ d: linePath(flat(pts)) }}
														animate={{ d: linePath(pts) }}
														transition={spring}
														fill="none"
														stroke={c}
														strokeWidth={2}
														strokeLinejoin="round"
														strokeLinecap="round"
													/>
													{(active === null ? [n - 1] : [active]).map((i) =>
														pts[i] ? (
															<motion.circle
																key="dot"
																initial={false}
																animate={{ cx: pts[i][0], cy: pts[i][1] }}
																transition={spring}
																r={4}
																fill={c}
																strokeWidth={2}
																className="stroke-card"
															/>
														) : null,
													)}
												</g>
											);
										})}

								{endsFit &&
									ends.map((e) => (
										<text
											key={e.s.key}
											x={cx(n - 1) + 10}
											y={e.y}
											dominantBaseline="middle"
											className="fill-muted-foreground text-[11px]"
										>
											{e.s.label}
										</text>
									))}

								{/* Hit layer: the whole band answers, not just the painted mark. */}
								<rect
									x={m.left}
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
									initial={{ opacity: 0, x: cx(active), y: m.top }}
									animate={{ opacity: 1, x: cx(active), y: m.top }}
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
											{shown.map((s) => (
												<li key={s.key} className="flex items-center gap-2">
													<span
														className="h-0.5 w-2.5 shrink-0 rounded-full"
														style={{ background: color(slots.get(s.key) ?? 1) }}
													/>
													<span className="text-muted-foreground">{s.label}</span>
													<span className="ml-auto pl-3 font-medium tabular-nums">
														{fmt.format(num(row[s.key]))}
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
