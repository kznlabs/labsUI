import type { ReactNode } from "react";
import { clamp, cn } from "@/lib/utils";

/* Server-safe (no "use client"). */

export type MeterSegment = {
	/** Legend text for this part. */
	label: string;
	/** Amount this part uses. */
	value: number;
	/** bg-* class, e.g. "bg-primary". */
	className?: string;
};

type MeterProps = {
	/** Total used. With `segments`, defaults to their sum. */
	value?: number;
	/** Lower bound. */
	min?: number;
	/** Upper bound. */
	max?: number;
	/** <meter> thresholds: below `low` is low, above `high` is high. */
	low?: number;
	/** Above this the value is high. */
	high?: number;
	/** Where good is: below low, between, or above high. Decides the color, like <meter>. */
	optimum?: number;
	/** Stacked parts with a legend (like a storage bar). Overrides the threshold color. */
	segments?: MeterSegment[];
	/** Visible name above the bar; also the accessible name. */
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
	const value = valueProp ?? segments?.reduce((sum, x) => sum + x.value, 0) ?? min;
	const pct = (value: number) => `${(clamp(value - min, 0, max - min) / (max - min || 1)) * 100}%`;
	const region = (value: number) => (value < low ? 0 : value > high ? 2 : 1);
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
					segments.map((segment, i) => (
						<span
							key={segment.label}
							style={{ width: pct(min + segment.value) }}
							className={cn(
								"h-full first:rounded-l-full",
								segment.className ?? palette[i % palette.length],
							)}
						/>
					))
				) : (
					<span style={{ width: pct(value) }} className={cn("h-full rounded-full", tone)} />
				)}
			</div>
			{segments && (
				<ul className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-xs">
					{segments.map((segment, i) => (
						<li key={segment.label} className="flex items-center gap-1.5">
							<span
								aria-hidden="true"
								className={cn(
									"size-2 rounded-full",
									segment.className ?? palette[i % palette.length],
								)}
							/>
							{segment.label}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
