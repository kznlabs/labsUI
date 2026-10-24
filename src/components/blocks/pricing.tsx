"use client";

import { Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn, spring } from "@/lib/utils";

type Period = "monthly" | "yearly";

type Plan = {
	name: string;
	description?: string;
	/** Price per month on each billing period, e.g. `{ monthly: 12, yearly: 10 }`. */
	price: Record<Period, number>;
	features: string[];
	/** Call to action, e.g. `<Button className="w-full">Start trial</Button>`. */
	cta: ReactNode;
	/** Outlined in the accent with a badge. */
	featured?: boolean;
	badge?: string;
};

type PricingProps = {
	plans: Plan[];
	currency?: string;
	locale?: string;
	defaultPeriod?: Period;
	/** Next to "Yearly", e.g. "−17%". */
	yearlyNote?: string;
	className?: string;
};

/**
 * Plan cards with a monthly / yearly switch (segmented ToggleGroup). Prices swap on a spring,
 * rolling up when they drop and down when they rise.
 */
export function Pricing({
	plans,
	currency = "USD",
	locale = "en-US",
	defaultPeriod = "monthly",
	yearlyNote,
	className,
}: PricingProps) {
	const [period, setPeriod] = useState<Period>(defaultPeriod);
	const money = new Intl.NumberFormat(locale, {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	});
	const dir = period === "yearly" ? -1 : 1;
	return (
		<div className={cn("flex flex-col items-center gap-6", className)}>
			<ToggleGroup
				aria-label="Billing period"
				value={period}
				onValueChange={(v) => v && setPeriod(v as Period)}
			>
				<ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
				<ToggleGroupItem value="yearly">
					Yearly
					{yearlyNote && (
						<Badge variant="success" shape="pill" className="ml-1.5">
							{yearlyNote}
						</Badge>
					)}
				</ToggleGroupItem>
			</ToggleGroup>
			<div className="grid w-full gap-4 sm:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]">
				{plans.map((plan) => (
					<Card
						key={plan.name}
						className={cn("gap-5", plan.featured && "border-primary ring-1 ring-primary")}
					>
						<CardHeader>
							<div className="flex min-h-6 items-center justify-between gap-2">
								<CardTitle>{plan.name}</CardTitle>
								{plan.badge && (
									<Badge variant={plan.featured ? "default" : "secondary"} shape="pill">
										{plan.badge}
									</Badge>
								)}
							</div>
							{plan.description && <CardDescription>{plan.description}</CardDescription>}
						</CardHeader>
						<CardContent className="flex flex-col gap-5">
							<p className="flex items-baseline gap-1">
								<span className="relative inline-flex overflow-hidden font-semibold text-4xl tabular-nums tracking-tight">
									<AnimatePresence initial={false} mode="popLayout" custom={dir}>
										<motion.span
											key={`${period}-${plan.price[period]}`}
											custom={dir}
											variants={{
												enter: (d: number) => ({ y: `${d * 60}%`, opacity: 0 }),
												center: { y: 0, opacity: 1 },
												exit: (d: number) => ({ y: `${d * -60}%`, opacity: 0 }),
											}}
											initial="enter"
											animate="center"
											exit="exit"
											transition={spring}
										>
											{money.format(plan.price[period])}
										</motion.span>
									</AnimatePresence>
								</span>
								<span className="text-muted-foreground text-sm">
									/ month
									<span className="sr-only">, billed {period}</span>
								</span>
							</p>
							<ul className="flex flex-col gap-2 text-sm">
								{plan.features.map((f) => (
									<li key={f} className="flex gap-2">
										<Check className="mt-0.5 size-4 shrink-0 text-primary-ink" aria-hidden="true" />
										{f}
									</li>
								))}
							</ul>
						</CardContent>
						<CardFooter className="mt-auto">{plan.cta}</CardFooter>
					</Card>
				))}
			</div>
		</div>
	);
}
