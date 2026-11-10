import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
	discountPercent,
	euro,
	lowest30,
	lowestBefore,
	monthly,
	type Product,
	price,
} from "./catalog";

/** 30-day price line. The lowest point is ringed, today is filled. */
export function Sparkline({
	data,
	width = 88,
	height = 26,
	className,
}: {
	data: number[];
	width?: number;
	height?: number;
	className?: string;
}) {
	const lo = Math.min(...data);
	const hi = Math.max(...data);
	const span = hi - lo || 1;
	const pad = 3;
	const pts = data.map((value, i): [number, number] => [
		pad + (i / (data.length - 1)) * (width - pad * 2),
		pad + (1 - (value - lo) / span) * (height - pad * 2),
	]);
	const minI = data.indexOf(lo);

	return (
		<svg
			role="img"
			aria-label={`Price over the last 30 days: from ${euro(lo)} to ${euro(hi)}, now ${euro(data[data.length - 1])}`}
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			className={cn("shrink-0 overflow-visible", className)}
		>
			<polyline
				points={pts.map((point) => point.join(",")).join(" ")}
				fill="none"
				className="stroke-muted-foreground/70"
				strokeWidth={1.5}
				strokeLinejoin="round"
			/>

			<circle
				cx={pts[minI][0]}
				cy={pts[minI][1]}
				r={3}
				className="fill-background stroke-foreground"
				strokeWidth={1.25}
			/>

			<circle
				cx={pts[pts.length - 1][0]}
				cy={pts[pts.length - 1][1]}
				r={2.5}
				className="fill-primary"
			/>
		</svg>
	);
}

/** Price, a reduction only against the prior 30-day low, the 30-day low itself and a small chart. */
export function PriceBlock({
	product,
	amount,
	size = "md",
	chart = true,
}: {
	product: Product;
	amount?: number;
	size?: "md" | "lg";
	chart?: boolean;
}) {
	const now = amount ?? price(product);
	const pct = discountPercent(product);
	const ref = lowestBefore(product);
	const low = lowest30(product);

	return (
		<div className="min-w-0">
			<div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
				<span
					className={cn(
						"font-semibold tabular-nums tracking-tight",
						size === "lg" ? "text-3xl" : "text-xl",
					)}
				>
					{euro(now)}
				</span>

				{pct > 0 && amount === undefined && (
					<>
						<Badge variant="secondary" className="text-success-ink">
							−{pct}%
						</Badge>

						<span className="sr-only">compared with</span>

						<s className="text-sm text-muted-foreground tabular-nums">{euro(ref)}</s>
					</>
				)}
			</div>

			<div className="mt-1 flex items-center gap-2">
				{chart && <Sparkline data={product.history} />}

				<p className="text-xs leading-snug text-muted-foreground">
					Lowest in the last 30 days
					<br />
					<span className="font-medium text-foreground tabular-nums">{euro(low)}</span>
					{pct > 0 && amount === undefined && (
						<span> · reduction is against the previous 30-day low</span>
					)}
				</p>
			</div>
		</div>
	);
}

export function Instalments({ amount, className }: { amount: number; className?: string }) {
	return (
		<p className={cn("text-xs text-muted-foreground", className)}>
			or{" "}
			<span className="font-medium text-foreground tabular-nums">{euro(monthly(amount), 2)}</span>
			/mo × 12, 0 % (sample)
		</p>
	);
}
