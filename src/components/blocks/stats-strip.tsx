import { Card } from "@/components/ui/card";
import { CountTo } from "@/components/ui/count-to";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

/* Server-safe (no "use client"): CountTo and Reveal are the client parts. */

type Stat = {
	label: string;
	value: number;
	prefix?: string;
	suffix?: string;
	decimals?: number;
	/** Small print under the number, e.g. "last 30 days". */
	hint?: string;
};

/** A row of headline numbers: each card rises in turn, then its number springs up. Each card is a <dl>. */
export function StatsStrip({ stats, className }: { stats: Stat[]; className?: string }) {
	return (
		<div
			className={cn(
				"grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]",
				className,
			)}
		>
			{stats.map((s, i) => (
				<Reveal key={s.label} delay={i * 0.08} y={16}>
					<Card className="h-full px-5 py-4">
						<dl className="flex flex-col gap-1">
							<dt className="text-muted-foreground text-sm">{s.label}</dt>
							<dd className="font-semibold text-3xl tabular-nums tracking-tight">
								<CountTo to={s.value} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} />
							</dd>
							{s.hint && <dd className="text-muted-foreground text-xs">{s.hint}</dd>}
						</dl>
					</Card>
				</Reveal>
			))}
		</div>
	);
}
