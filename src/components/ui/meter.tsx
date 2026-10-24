import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Server-safe (no "use client"). */

type Segment = {
	label: string;
	value: number;
	/** bg-* class, e.g. "bg-primary". */
	className?: string;
};

type MeterProps = {
	/** Total used. With `segments`, defaults to their sum. */
	value?: number;
	min?: number;
	max?: number;
	/** <meter> thresholds: below `low` is low, above `high` is high. */
	low?: number;
	high?: number;
	/** Where good is: below low, between, or above high. Decides the color, like <meter>. */
	optimum?: number;
	/** Stacked parts with a legend (macOS storage bar). Overrides the threshold color. */
	segments?: Segment[];
	label?: ReactNode;
	/** Text on the right and the accessible value, e.g. "48 GB of 100 GB". */
	valueText?: string;
	className?: string;
};

const palette = ["bg-primary", "bg-warning", "bg-success", "bg-destructive", "bg-muted-foreground"];

/**
 * A measurement within a known range (disk, quota, server load, password strength), not a
 * task's progress (use Progress). Colors follow <meter>: green in the optimum region, orange one
 * region away, red two away.
 */
export function Meter({
	value: valueProp,
	min = 0,
	max = 100,
	low = min,
	high = max,
	optimum = (min + max) / 2,
	segments,
	label,
	valueText,
	className,
}: MeterProps) {
	const value = valueProp ?? segments?.reduce((s, x) => s + x.value, 0) ?? min;
	const pct = (n: number) =>
		`${(Math.min(Math.max(n - min, 0), max - min) / (max - min || 1)) * 100}%`;
	const region = (n: number) => (n < low ? 0 : n > high ? 2 : 1);
	const distance = Math.abs(region(value) - region(optimum));
	const tone = ["bg-success", "bg-warning", "bg-destructive"][distance];

	return (
		<div className={cn("grid w-full gap-2", className)}>
			{(label || valueText) && (
				<div className="flex items-baseline justify-between gap-3 text-sm">
					{label && <span className="font-medium">{label}</span>}
					{valueText && (
						<span className="ml-auto text-muted-foreground text-xs tabular-nums">{valueText}</span>
					)}
				</div>
			)}
			{/* The real <meter> carries the semantics; the drawn bar below is decoration. */}
			<meter
				className="sr-only"
				aria-label={typeof label === "string" ? label : undefined}
				value={value}
				min={min}
				max={max}
				low={low}
				high={high}
				optimum={optimum}
			>
				{valueText ?? value}
			</meter>
			<div
				aria-hidden="true"
				className="flex h-2 w-full gap-px overflow-hidden rounded-full bg-foreground/10"
			>
				{segments ? (
					segments.map((s, i) => (
						<span
							key={s.label}
							style={{ width: pct(min + s.value) }}
							className={cn(
								"h-full first:rounded-l-full",
								s.className ?? palette[i % palette.length],
							)}
						/>
					))
				) : (
					<span style={{ width: pct(value) }} className={cn("h-full rounded-full", tone)} />
				)}
			</div>
			{segments && (
				<ul className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-xs">
					{segments.map((s, i) => (
						<li key={s.label} className="flex items-center gap-1.5">
							<span
								aria-hidden="true"
								className={cn("size-2 rounded-full", s.className ?? palette[i % palette.length])}
							/>
							{s.label}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
