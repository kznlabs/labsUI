"use client";

import { Check, Shield } from "lucide-react";
import { useState } from "react";
import { Pricing } from "@/components/blocks/pricing";
import { Button } from "@/components/ui/button";
import { useOrder } from "./order";
import { currency, euro, locale, type Period, periodLabel, periods, ranks } from "./store";

const rankTint = "bg-primary/15 text-primary-ink";

export function RankShop() {
	const order = useOrder();
	const [period, setPeriod] = useState<Period>("30");

	return (
		<div className="flex flex-col gap-4">
			<Pricing
				label="Rank duration"
				currency={currency}
				locale={locale}
				value={period}
				onValueChange={(value) => setPeriod(value as Period)}
				periods={[...periods]}
				plans={ranks.map((rank) => ({
					...rank,
					cta: (value: string) => {
						const chosen = value as Period;
						const id = `rank-${rank.id}-${chosen}`;
						const added = order.has(id);

						return (
							<Button
								className="w-full"
								variant={rank.featured ? "default" : "outline"}
								disabled={added}
								onClick={() =>
									order.add({
										id,
										name: rank.name,
										detail: `Rank · ${periodLabel(chosen)}`,
										price: rank.price[chosen],
										icon: Shield,
										tint: rankTint,
										rank: true,
									})
								}
							>
								{added ? <Check aria-hidden="true" /> : null}

								{added ? `${rank.name} is in your order` : `Add ${rank.name}`}
							</Button>
						);
					},
				}))}
			/>

			<p className="text-muted-foreground text-sm">
				{period === "forever"
					? "Forever means for as long as the server runs. One rank per order; a new one replaces the old."
					: `That is ${euro.format(ranks[1].price[period] / Number(period))} a day for Knight. One rank per order; a new one replaces the old.`}
			</p>
		</div>
	);
}
