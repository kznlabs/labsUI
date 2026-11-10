"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useCart } from "./cart";
import { eur, fitHint, isSoldOut, type Product, sizeGuide } from "./catalog";
import { Price, Swatches } from "./tile";

function CrossedOut() {
	return (
		<svg
			aria-hidden
			className="pointer-events-none absolute inset-0 size-full text-muted-foreground/70"
			preserveAspectRatio="none"
			viewBox="0 0 10 10"
		>
			<line
				x1="0"
				y1="10"
				x2="10"
				y2="0"
				stroke="currentColor"
				strokeWidth="1"
				vectorEffect="non-scaling-stroke"
			/>
		</svg>
	);
}

export function ProductPanel({ product }: { product: Product }) {
	const cart = useCart();
	const [size, setSize] = useState<string>();
	const [missing, setMissing] = useState(false);
	const out = isSoldOut(product);
	const sizes = Object.entries(product.stock);
	const low = sizes.filter(([, left]) => left > 0 && left <= 2);
	const chosenLeft = size ? product.stock[size] : undefined;
	const isShoe = product.category === "footwear";

	const add = () => {
		if (!size) return setMissing(true);
		cart.add(product.slug, size);
	};

	const label = out ? "Sold out" : `Add to bag · ${eur(product.price)}`;

	return (
		<div className="px-4 py-8 sm:px-6 lg:px-0 lg:py-0 lg:pr-6">
			<h1 className="shop-display text-4xl leading-tight sm:text-5xl">{product.name}</h1>

			<p className="mt-3 text-base">
				<Price product={product} />
			</p>

			{product.lowest !== undefined && (
				<p className="mt-1 text-xs text-muted-foreground">
					Lowest price in the 30 days before the reduction: {eur(product.lowest)}
				</p>
			)}

			<div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
				<Swatches colors={product.colors} />

				{product.colors.map((color) => color.name).join(", ")}
			</div>

			<div className="mt-10">
				<div className="flex items-baseline justify-between">
					<h2 id="size-label" className="text-sm font-medium">
						Size{size && <span className="ml-2 font-normal text-muted-foreground">{size}</span>}
					</h2>

					{!isShoe && product.category === "clothing" && (
						<Drawer>
							<DrawerTrigger
								variant="ghost"
								className="shop-caps h-auto px-0 font-normal underline underline-offset-4 hover:bg-transparent"
							>
								Size guide
							</DrawerTrigger>

							<DrawerContent side="right" className="sm:max-w-md">
								<DrawerHeader>
									<DrawerTitle className="shop-display text-2xl">Size guide</DrawerTitle>

									<DrawerDescription>
										Body measurements in centimetres. Between two sizes, take the larger.
									</DrawerDescription>
								</DrawerHeader>

								<DrawerBody>
									<table className="w-full text-left text-sm tabular-nums">
										<thead>
											<tr className="border-b border-border text-muted-foreground">
												<th className="py-2 font-normal">Size</th>

												<th className="py-2 font-normal">Chest</th>

												<th className="py-2 font-normal">Waist</th>

												<th className="py-2 font-normal">Hip</th>
											</tr>
										</thead>

										<tbody>
											{sizeGuide.map((row) => (
												<tr
													key={row.size}
													className={cn("border-b border-border", row.size === size && "bg-muted")}
												>
													<th className="py-3 font-medium">{row.size}</th>

													<td>{row.chest}</td>

													<td>{row.waist}</td>

													<td>{row.hip}</td>
												</tr>
											))}
										</tbody>
									</table>

									<p className="mt-6 text-sm text-muted-foreground">
										Measure over underwear, tape level and snug. The cable knit and the green dress
										are cut close; the linen shirts are cut loose.
									</p>
								</DrawerBody>
							</DrawerContent>
						</Drawer>
					)}
				</div>

				<fieldset aria-labelledby="size-label" className="mt-3 flex min-w-0 flex-wrap gap-1.5">
					{sizes.map(([label, left]) => {
						const gone = left === 0;
						const on = size === label;

						return (
							<button
								key={label}
								type="button"
								disabled={gone}
								aria-pressed={on}
								aria-label={gone ? `${label}, unavailable` : label}
								onClick={() => {
									setSize(label);
									setMissing(false);
								}}
								className={cn(
									"relative h-12 min-w-12 cursor-pointer border px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
									on
										? "border-foreground bg-foreground text-background"
										: "border-border hover:border-foreground",
									gone &&
										"cursor-not-allowed border-border text-muted-foreground/70 hover:border-border",
								)}
							>
								{label}

								{gone && <CrossedOut />}
							</button>
						);
					})}
				</fieldset>

				<p aria-live="polite" className="mt-3 min-h-5 text-sm">
					{missing ? (
						<span className="text-destructive-ink">Choose a size first.</span>
					) : chosenLeft !== undefined && chosenLeft <= 2 ? (
						<span className="text-destructive-ink">
							Only {chosenLeft} left in {size}.
						</span>
					) : !size && low.length > 0 ? (
						<span className="text-muted-foreground">
							Only {low.map(([label, left]) => `${left} left in ${label}`).join(", ")}.
						</span>
					) : null}
				</p>

				{!out && <p className="mt-1 text-sm text-muted-foreground">{fitHint[product.fit]}</p>}
			</div>

			<Button size="lg" className="mt-8 hidden w-full lg:inline-flex" disabled={out} onClick={add}>
				{label}
			</Button>

			<div className="mt-10 space-y-4 text-sm leading-relaxed">
				<p>{product.description}</p>

				<p className="text-muted-foreground">{product.material}.</p>
			</div>

			{/* Phones: the add button stays at the bottom edge. */}
			<div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background p-3 lg:hidden">
				<Button size="lg" className="w-full" disabled={out} onClick={add}>
					{label}
				</Button>
			</div>
		</div>
	);
}
