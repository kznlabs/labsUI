"use client";

import { useState } from "react";
import { ComparisonTable } from "@/components/blocks/comparison-table";
import { Pricing } from "@/components/blocks/pricing";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/toast";
import { useDisclosure } from "@/lib/use-disclosure";
import {
	comparison,
	euro,
	type Period,
	type PlanId,
	periods,
	planFor,
	plans,
	product,
} from "./content";
import { SignupDialog } from "./signup-dialog";

export function PricingSection() {
	const [period, setPeriod] = useState<Period>("yearly");
	const [needed, setNeeded] = useState(40);
	const [chosen, setChosen] = useState<PlanId>("team");
	const signup = useDisclosure();
	const fit = planFor(needed);
	const yearlySaving = (fit.price.monthly - fit.price.yearly) * 12;

	const start = (id: PlanId) => {
		setChosen(id);
		signup.show();
	};

	return (
		<div className="flex flex-col gap-10">
			<div className="mx-auto grid w-full max-w-xl gap-3 rounded-2xl border bg-card p-5">
				<div className="flex items-baseline justify-between gap-3">
					<Label htmlFor="monitors-needed">How many monitors do you need?</Label>

					<output htmlFor="monitors-needed" className="font-semibold text-lg tabular-nums">
						{needed}
					</output>
				</div>

				<Slider
					id="monitors-needed"
					value={[needed]}
					onValueChange={([value]) => setNeeded(value)}
					min={1}
					max={250}
					aria-describedby="monitors-fit"
				/>

				<p id="monitors-fit" className="text-muted-foreground text-sm">
					<span className="font-medium text-foreground">{fit.name}</span> fits {needed}{" "}
					{needed === 1 ? "monitor" : "monitors"}
					{fit.price.monthly === 0
						? ", free for good."
						: period === "yearly"
							? `: ${euro(fit.price.yearly * 12)} a year, ${euro(yearlySaving)} less than monthly.`
							: `: ${euro(fit.price.monthly)} a month, or ${euro(fit.price.yearly)} a month billed yearly.`}
				</p>
			</div>

			<Pricing
				label="Billing period"
				periods={periods}
				value={period}
				onValueChange={(value) => setPeriod(value as Period)}
				currency={product.currency}
				locale={product.locale}
				plans={plans.map((plan) => ({
					...plan,
					featured: plan.id === fit.id,
					badge: plan.id === fit.id ? "Best fit" : plan.badge,
					cta: (
						<Button
							className="w-full"
							variant={plan.id === fit.id ? "default" : "outline"}
							onClick={() => start(plan.id)}
						>
							{plan.price.monthly === 0 ? "Start for free" : "Start 14-day trial"}
						</Button>
					),
				}))}
			/>

			<p className="text-center text-muted-foreground text-sm">
				Prices in euros, excluding VAT. Need more than 250 monitors or an invoice in advance?{" "}
				<button
					type="button"
					onClick={() => toast.info("Demo mode: there's no sales team behind this button")}
					className="cursor-pointer font-medium text-foreground underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
				>
					Talk to us
				</button>
			</p>

			<Collapsible>
				<div className="flex justify-center">
					<CollapsibleTrigger className="font-medium text-sm">
						Compare every feature
					</CollapsibleTrigger>
				</div>

				<CollapsibleContent>
					<ComparisonTable
						className="pt-6"
						label="Plans compared"
						columnLabel="Plan"
						stickyTop="6.5rem"
						items={plans.map((plan) => ({
							id: plan.id,
							name: plan.name,
							details: (
								<span className="tabular-nums">
									{plan.price.monthly === 0 ? "Free" : `${euro(plan.price[period])} / month`}
								</span>
							),
							featured: plan.id === fit.id,
						}))}
						groups={comparison}
					/>
				</CollapsibleContent>
			</Collapsible>

			<SignupDialog {...signup.props} plan={chosen} period={period} />
		</div>
	);
}
