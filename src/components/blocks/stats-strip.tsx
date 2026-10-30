import { Card } from "@/components/ui/card";
import { CountTo } from "@/components/ui/count-to";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

// Server-safe: CountTo and Reveal are the client parts.

export type StatsStripItem = {
	/** What the number counts, e.g. "Active users". */
	label: string;
	/** Number to count up to. */
	value: number;
	/** Text before the number, e.g. "$". */
	prefix?: string;
	/** Text after the number, e.g. "%". */
	suffix?: string;
	/** Digits after the decimal point. */
	decimals?: number;
	/** Small print under the number, e.g. "last 30 days". */
	hint?: string;
};

/** A row of headline numbers: each card rises in turn, then its number springs up. Each card is a <dl>. */
export function StatsStrip({
	stats,
	className,
}: {
	/** Numbers in display order. */
	stats: StatsStripItem[];
	className?: string;
}) {
	return (
		<div
			className={cn(
				"grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]",
				className,
			)}
		>
			{stats.map((stat, i) => (
				<Reveal key={stat.label} delay={i * 0.08} y={16}>
					<Card className="h-full px-5 py-4">
						<dl className="flex flex-col gap-1">
							<dt className="text-muted-foreground text-sm">{stat.label}</dt>
							<dd className="font-semibold text-3xl tabular-nums tracking-tight">
								<CountTo
									to={stat.value}
									prefix={stat.prefix}
									suffix={stat.suffix}
									decimals={stat.decimals}
								/>
							</dd>
							{stat.hint && <dd className="text-muted-foreground text-xs">{stat.hint}</dd>}
						</dl>
					</Card>
				</Reveal>
			))}
		</div>
	);
}
