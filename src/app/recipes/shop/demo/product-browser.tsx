"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProductCard } from "@/components/blocks/product-card";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { toast } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { spring } from "@/lib/utils";
import {
	categories,
	currency,
	locale,
	type Product,
	products,
	shopHref,
	shopPath,
	soldOut,
} from "./catalog";

const sorts = {
	featured: { label: "Featured", compare: () => 0 },
	"price-up": {
		label: "Price: low to high",
		compare: (a: Product, b: Product) => a.price - b.price,
	},
	"price-down": {
		label: "Price: high to low",
		compare: (a: Product, b: Product) => b.price - a.price,
	},
	rating: { label: "Top rated", compare: (a: Product, b: Product) => b.rating - a.rating },
};

type Sort = keyof typeof sorts;

export function ProductBrowser() {
	const router = useRouter();
	const [category, setCategory] = useState("all");
	const [sort, setSort] = useState<Sort>("featured");
	const shown = products
		.filter((product) => category === "all" || product.category === category)
		.toSorted(sorts[sort].compare);

	return (
		<section aria-labelledby="products-heading" className="flex flex-col gap-6">
			<h2 id="products-heading" className="sr-only">
				Products
			</h2>

			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
					<ToggleGroup
						aria-label="Category"
						value={category}
						onValueChange={(value) => value && setCategory(value)}
					>
						<ToggleGroupItem value="all">All</ToggleGroupItem>

						{categories.map((name) => (
							<ToggleGroupItem key={name} value={name}>
								{name}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				</div>

				<div className="flex items-center gap-3">
					<p className="text-muted-foreground text-sm tabular-nums" aria-live="polite">
						{shown.length} {shown.length === 1 ? "product" : "products"}
					</p>

					<NativeSelect
						aria-label="Sort by"
						value={sort}
						onChange={(event) => setSort(event.target.value as Sort)}
						className="w-auto"
					>
						{Object.entries(sorts).map(([value, option]) => (
							<NativeSelectOption key={value} value={value}>
								{option.label}
							</NativeSelectOption>
						))}
					</NativeSelect>
				</div>
			</div>

			<ul className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
				<AnimatePresence initial={false} mode="popLayout">
					{shown.map((product) => {
						const path = `/products/${product.slug}`;
						const gone = soldOut(product);

						return (
							<motion.li
								key={product.slug}
								layout
								initial={{ opacity: 0, scale: 0.96 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.96 }}
								transition={spring}
							>
								<ProductCard
									as="h3"
									name={product.name}
									href={shopHref(path)}
									price={product.price}
									compareAt={product.was}
									lowestPrice={product.lowest}
									currency={currency}
									locale={locale}
									badge={product.was ? "Sale" : product.badge}
									soldOut={gone}
									rating={product.rating}
									ratingNote={`${product.reviews} reviews`}
									ratio={1}
									media={product.photos.map((photo) => (
										// biome-ignore lint/performance/noImgElement: the static export has no image optimizer
										<img
											key={photo.src}
											src={photo.src}
											alt={photo.alt}
											width={960}
											height={640}
											loading="lazy"
										/>
									))}
									action={
										gone ? (
											<Button
												variant="outline"
												className="w-full"
												onClick={() =>
													toast(`Demo mode: would email you when the ${product.name} is back`)
												}
											>
												Notify me
											</Button>
										) : (
											<a
												href={shopHref(path)}
												onClick={(event) => {
													event.preventDefault();
													router.push(shopPath(path));
												}}
												className={buttonVariants({ variant: "outline", className: "w-full" })}
											>
												Choose size
											</a>
										)
									}
								/>
							</motion.li>
						);
					})}
				</AnimatePresence>
			</ul>
		</section>
	);
}
