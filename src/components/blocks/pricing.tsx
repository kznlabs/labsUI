"use client";

import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useState } from "react";
import { PlanCard, PlanGrid } from "@/components/blocks/plan-card";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useControllableState } from "@/lib/use-controllable-state";
import { cn, formatMoney, spring } from "@/lib/utils";

export type PricingPeriodOption = {
	/** Key of this period in each plan's `price`. */
	value: string;
	/** Text on the switcher, e.g. "Yearly" or "30 days". */
	label: ReactNode;
	/** Small badge on the switcher, e.g. "−20%". */
	note?: string;
	/** Beside each price, e.g. "/ month" or "forever". */
	priceNote?: ReactNode;
};

export type PricingPlan = {
	/** Plan name, the card's heading. */
	name: string;
	/** One line under the name. */
	description?: ReactNode;
	/** Price per period value, e.g. `{ monthly: 12, yearly: 10 }`. A period left out hides the plan while it is selected. */
	price: Record<string, number>;
	/** Struck-through earlier price per period value. */
	compareAt?: Record<string, number>;
	/** Lowest price from the 30 days before a reduction, per period value. Pass it only during a promotion. */
	lowestPrice?: Record<string, number>;
	/** What the plan includes, one check mark each. */
	features?: string[];
	/** Call to action; a function gets the selected period, so a Buy button knows the choice. */
	cta?: ReactNode | ((period: string) => ReactNode);
	/** Outlined in the accent. */
	featured?: boolean;
	/** Small label on the card, e.g. "Popular". */
	badge?: string;
};

type PricingProps = {
	/** Plans in display order. */
	plans: PricingPlan[];
	/** Periods on the switcher, in order. With only one, the switcher stays out. */
	periods: PricingPeriodOption[];
	/** Controlled period value; pair with `onValueChange`. */
	value?: string;
	/** Period at first render (uncontrolled). Defaults to the first one. */
	defaultValue?: string;
	/** Called with the picked period value. */
	onValueChange?: (value: string) => void;
	/** Names the switcher for screen readers. */
	label?: string;
	/** ISO 4217 code for the price, e.g. "EUR". */
	currency?: string;
	/** BCP 47 locale for number formatting. */
	locale?: string;
	/** Text before a plan's `lowestPrice`. Polish: "Najniższa cena z 30 dni przed obniżką". */
	lowestPriceLabel?: ReactNode;
	/** Read by screen readers between a struck-through price and the price. */
	nowLabel?: string;
	className?: string;
};

/** A price that rolls down when it drops and up when it rises. */
function RollingPrice({
	amount,
	currency,
	locale,
}: {
	amount: number;
	currency?: string;
	locale?: string;
}) {
	const [shown, setShown] = useState({ amount, direction: 1 });

	if (shown.amount !== amount) setShown({ amount, direction: amount < shown.amount ? -1 : 1 });

	return (
		<span className="relative inline-flex overflow-hidden">
			<AnimatePresence initial={false} mode="popLayout" custom={shown.direction}>
				<motion.span
					key={amount}
					custom={shown.direction}
					variants={{
						enter: (direction: number) => ({ y: `${direction * 60}%`, opacity: 0 }),
						center: { y: 0, opacity: 1 },
						exit: (direction: number) => ({ y: `${direction * -60}%`, opacity: 0 }),
					}}
					initial="enter"
					animate="center"
					exit="exit"
					transition={spring}
				>
					{formatMoney(amount, currency, locale)}
				</motion.span>
			</AnimatePresence>
		</span>
	);
}

/**
 * PlanCards with a switcher over any periods: months and years, or a rank for 30 days, 90 days and
 * forever. Prices roll on a spring in the direction they moved.
 */
export function Pricing({
	plans,
	periods,
	value,
	defaultValue,
	onValueChange,
	label = "Billing period",
	currency,
	locale,
	lowestPriceLabel,
	nowLabel,
	className,
}: PricingProps) {
	const [period, setPeriod] = useControllableState(
		value,
		defaultValue ?? periods[0]?.value ?? "",
		onValueChange,
	);
	const priceNote = periods.find((option) => option.value === period)?.priceNote;

	return (
		<div className={cn("@container flex flex-col items-center gap-6", className)}>
			{periods.length > 1 && (
				<ToggleGroup
					aria-label={label}
					value={period}
					onValueChange={(next) => next && setPeriod(next)}
				>
					{periods.map((option) => (
						// A narrow card puts the note under its label, so the switcher keeps to one row.
						<ToggleGroupItem
							key={option.value}
							value={option.value}
							className="@max-md:h-auto @max-md:min-h-7 @max-md:flex-col @max-md:gap-0.5 @max-md:self-stretch @max-md:py-1"
						>
							{option.label}

							{option.note && (
								<Badge variant="success" shape="pill" className="@md:ml-1.5">
									{option.note}
								</Badge>
							)}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			)}

			<PlanGrid>
				{plans.map((plan) => {
					const amount = plan.price[period];
					const compareAt = plan.compareAt?.[period];

					if (amount === undefined) return null;

					return (
						<PlanCard
							key={plan.name}
							name={plan.name}
							description={plan.description}
							price={<RollingPrice amount={amount} currency={currency} locale={locale} />}
							compareAt={compareAt !== undefined && compareAt > amount ? compareAt : undefined}
							note={priceNote}
							lowestPrice={plan.lowestPrice?.[period]}
							lowestPriceLabel={lowestPriceLabel}
							nowLabel={nowLabel}
							features={plan.features}
							cta={typeof plan.cta === "function" ? plan.cta(period) : plan.cta}
							featured={plan.featured}
							badge={plan.badge}
							currency={currency}
							locale={locale}
						/>
					);
				})}
			</PlanGrid>
		</div>
	);
}
