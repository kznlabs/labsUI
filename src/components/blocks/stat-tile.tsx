import { TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

// Server-safe: Chart is the client part and its props are plain data.

type StatTileProps = {
	/** Metric name, e.g. "Revenue". */
	label: string;
	/** Formatted headline, e.g. "$48,290". */
	value: ReactNode;
	/** Change in %, e.g. 12.5 or -3. Positive is good unless `invert`. */
	delta?: number;
	/** For metrics where down is good (errors, latency). */
	invert?: boolean;
	/** "vs last month". */
	period?: string;
	/** Trend rows for the chart below. */
	data?: Record<string, string | number>[];
	/** Key of the x label in each row. */
	index?: string;
	/** Key of the value in each row. */
	dataKey?: string;
	/** Intl number format for the chart axis and tooltip. */
	format?: Intl.NumberFormatOptions;
	className?: string;
};

/** Admin dashboard tile: metric, delta Badge (green when it is good news) and an area Chart of the trend. */
export function StatTile({
	label,
	value,
	delta,
	invert,
	period,
	data,
	index = "x",
	dataKey = "value",
	format,
	className,
}: StatTileProps) {
	const good = delta !== undefined && (invert ? delta < 0 : delta > 0);
	const Icon = delta !== undefined && delta < 0 ? TrendingDown : TrendingUp;

	return (
		<Card className={cn("gap-4 pb-4", className)}>
			<CardHeader>
				<CardDescription>{label}</CardDescription>

				<div className="flex flex-wrap items-center gap-2">
					<CardTitle as="p" className="font-semibold text-3xl tabular-nums">
						{value}
					</CardTitle>

					{delta !== undefined && delta !== 0 && (
						<Badge variant={good ? "success" : "destructive"} shape="pill">
							<Icon aria-hidden="true" />
							{delta > 0 ? "+" : "−"}
							{Math.abs(delta)}%<span className="sr-only">{period ? ` ${period}` : ""}</span>
						</Badge>
					)}
				</div>

				{period && (
					<p aria-hidden="true" className="text-muted-foreground text-xs">
						{period}
					</p>
				)}
			</CardHeader>

			{data && data.length > 1 && (
				<Chart
					type="area"
					label={`${label} trend`}
					data={data}
					index={index}
					series={[{ key: dataKey, label }]}
					format={format}
					height={120}
					className="px-3"
				/>
			)}
		</Card>
	);
}
