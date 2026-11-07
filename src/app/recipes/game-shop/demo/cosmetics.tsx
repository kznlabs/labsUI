"use client";

import { Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ProductCard } from "@/components/blocks/product-card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { spring } from "@/lib/utils";
import { ItemTile, useOrder } from "./order";
import { type Category, categories, cosmetics, currency, locale, rarities } from "./store";

export function CosmeticBrowser() {
	const order = useOrder();
	const [category, setCategory] = useState<Category | "all">("all");
	const shown = cosmetics.filter((item) => category === "all" || item.category === category);

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
					<ToggleGroup
						aria-label="Category"
						value={category}
						onValueChange={(value) => value && setCategory(value as Category | "all")}
					>
						<ToggleGroupItem value="all">All</ToggleGroupItem>

						{categories.map((name) => (
							<ToggleGroupItem key={name} value={name}>
								{name}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				</div>

				<p className="text-muted-foreground text-sm tabular-nums" aria-live="polite">
					{shown.length} {shown.length === 1 ? "item" : "items"}
				</p>
			</div>

			<ul className="grid gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
				<AnimatePresence initial={false} mode="popLayout">
					{shown.map((item) => {
						const added = order.has(item.id);

						return (
							<motion.li
								key={item.id}
								layout
								initial={{ opacity: 0, scale: 0.96 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.96 }}
								transition={spring}
							>
								<ProductCard
									as="h3"
									name={item.name}
									price={item.price}
									compareAt={item.was}
									lowestPrice={item.lowest}
									currency={currency}
									locale={locale}
									badge={item.was ? "Sale" : item.badge}
									soldOut={item.soldOut}
									rating={item.rating}
									ratingNote={`${item.reviews} reviews`}
									ratio={4 / 3}
									media={[
										<div key="tile" className="relative size-full">
											<ItemTile icon={item.icon} tint={rarities[item.rarity]} />

											<p className="absolute right-3 bottom-3 rounded-full bg-card px-2 py-0.5 font-medium text-xs shadow-xs">
												{item.rarity}

												<span className="sr-only"> {item.category.toLowerCase().slice(0, -1)}</span>
											</p>
										</div>,
									]}
									action={
										item.soldOut ? (
											<Button
												variant="outline"
												className="w-full"
												onClick={() =>
													toast(`Demo mode: would tell you in game when ${item.name} is back`)
												}
											>
												Tell me when it's back
											</Button>
										) : added ? (
											<Button
												variant="secondary"
												className="w-full"
												onClick={() => order.remove(item.id)}
											>
												<Check aria-hidden="true" />
												In your order · remove
											</Button>
										) : (
											<Button
												variant="outline"
												className="w-full"
												onClick={() =>
													order.add({
														id: item.id,
														name: item.name,
														detail: `${item.rarity} ${item.category.toLowerCase().slice(0, -1)}`,
														price: item.price,
														icon: item.icon,
														tint: rarities[item.rarity],
													})
												}
											>
												Add to order
											</Button>
										)
									}
								/>
							</motion.li>
						);
					})}
				</AnimatePresence>
			</ul>
		</div>
	);
}
