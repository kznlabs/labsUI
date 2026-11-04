import { Check } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn, formatMoney } from "@/lib/utils";

type PlanCardProps = Omit<ComponentProps<"div">, "children"> & {
	/** Plan name, the card's heading. */
	name: string;
	/** One line under the name. */
	description?: ReactNode;
	/** Current price in major units, or your own node (Pricing passes its animated price). */
	price: number | ReactNode;
	/** Struck-through earlier price. Hidden when a numeric `price` isn't lower. */
	compareAt?: number;
	/** Beside the price, e.g. "/ month" or "forever". */
	note?: ReactNode;
	/** Lowest price from the 30 days before a reduction, shown as text under the price. Pass it only during a promotion. */
	lowestPrice?: number;
	/** Text before `lowestPrice`. Polish: "Najniższa cena z 30 dni przed obniżką". */
	lowestPriceLabel?: ReactNode;
	/** Read by screen readers between `compareAt` and the price. */
	nowLabel?: string;
	/** What the plan includes, one check mark each. */
	features?: string[];
	/** Call to action, e.g. `<Button className="w-full">Buy</Button>`. */
	cta?: ReactNode;
	/** Outlined in the accent. */
	featured?: boolean;
	/** Small label on the card, e.g. "Popular". */
	badge?: string;
	/** ISO 4217 code for the price. */
	currency?: string;
	/** BCP 47 locale for number formatting. */
	locale?: string;
};

/** One plan or rank at one price, no state, so it renders on the server. Several go in a PlanGrid. */
export function PlanCard({
	name,
	description,
	price,
	compareAt,
	note,
	lowestPrice,
	lowestPriceLabel = "Lowest price in the 30 days before the reduction",
	nowLabel = "now",
	features = [],
	cta,
	featured,
	badge,
	currency,
	locale,
	className,
	...props
}: PlanCardProps) {
	const reduced = compareAt !== undefined && (typeof price !== "number" || compareAt > price);

	return (
		<Card
			className={cn("gap-5", featured && "border-primary ring-1 ring-primary", className)}
			{...props}
		>
			<CardHeader>
				<div className="flex min-h-6 items-center justify-between gap-2">
					<CardTitle>{name}</CardTitle>

					{badge && (
						<Badge variant={featured ? "default" : "secondary"} shape="pill">
							{badge}
						</Badge>
					)}
				</div>

				{description && <CardDescription>{description}</CardDescription>}
			</CardHeader>

			<CardContent className="flex flex-col gap-5">
				<div className="flex flex-col gap-1">
					<p className="flex flex-wrap items-baseline gap-x-1.5">
						{reduced && (
							<>
								<del className="text-muted-foreground text-sm tabular-nums">
									{formatMoney(compareAt, currency, locale)}
								</del>

								<span className="sr-only">{nowLabel} </span>
							</>
						)}

						<span className="font-semibold text-4xl tabular-nums tracking-tight">
							{typeof price === "number" ? formatMoney(price, currency, locale) : price}
						</span>

						{note && <span className="text-muted-foreground text-sm">{note}</span>}
					</p>

					{lowestPrice !== undefined && (
						<p className="text-muted-foreground text-xs">
							{lowestPriceLabel}:{" "}
							<span className="tabular-nums">{formatMoney(lowestPrice, currency, locale)}</span>
						</p>
					)}
				</div>

				{features.length > 0 && (
					<ul className="flex flex-col gap-2 text-sm">
						{features.map((feature) => (
							<li key={feature} className="flex gap-2">
								<Check className="mt-0.5 size-4 shrink-0 text-primary-ink" aria-hidden="true" />

								{feature}
							</li>
						))}
					</ul>
				)}
			</CardContent>

			{cta && <CardFooter className="mt-auto">{cta}</CardFooter>}
		</Card>
	);
}

/** PlanCards side by side, as many columns as fit. */
export function PlanGrid({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"grid w-full gap-4 sm:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]",
				className,
			)}
			{...props}
		/>
	);
}
