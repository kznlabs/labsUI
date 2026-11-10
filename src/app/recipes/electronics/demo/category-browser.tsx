"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ComparisonTable } from "@/components/blocks/comparison-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Empty } from "@/components/ui/empty";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Rating } from "@/components/ui/rating";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { AppLink } from "@/lib/link";
import { cn } from "@/lib/utils";
import { AddToCart } from "./add-to-cart";
import { brandsIn, euro, lowest30, type Product, price, storeHref } from "./catalog";
import { Delivery } from "./delivery";
import { Instalments, PriceBlock } from "./price";

const MAX_COMPARE = 4;

/** Reads ?q= on the client so the category page itself can be prerendered. */
export function CategoryWithQuery({ products }: { products: Product[] }) {
	const query = useSearchParams().get("q") ?? "";

	return <CategoryBrowser key={query} products={products} query={query} />;
}

export function CategoryBrowser({ products, query = "" }: { products: Product[]; query?: string }) {
	const brands = useMemo(() => brandsIn(products), [products]);
	const bounds = useMemo(() => {
		const prices = products.map(price);

		return [
			Math.floor(Math.min(...prices) / 10) * 10,
			Math.ceil(Math.max(...prices) / 10) * 10,
		] as const;
	}, [products]);

	const [picked, setPicked] = useState<string[]>([]);
	const [range, setRange] = useState<number[]>([bounds[0], bounds[1]]);
	const [inStock, setInStock] = useState(false);
	const [sort, setSort] = useState("rating");
	const [compare, setCompare] = useState<string[]>([]);
	const [open, setOpen] = useState(false);

	const needle = query.trim().toLowerCase();
	const shown = useMemo(() => {
		const list = products.filter((product) => {
			const hay = [product.name, product.brand, ...product.key.flat()].join(" ").toLowerCase();

			return (
				(!needle || needle.split(/\s+/).every((word) => hay.includes(word))) &&
				(!picked.length || picked.includes(product.brand)) &&
				price(product) >= range[0] &&
				price(product) <= range[1] &&
				(!inStock || product.stock > 0)
			);
		});
		const by: Record<string, (a: Product, b: Product) => number> = {
			rating: (a, b) => b.rating - a.rating,
			low: (a, b) => price(a) - price(b),
			high: (a, b) => price(b) - price(a),
		};

		return list.sort(by[sort]);
	}, [products, needle, picked, range, inStock, sort]);

	const chosen = products.filter((product) => compare.includes(product.slug));
	const toggleCompare = (slug: string, on: boolean) =>
		setCompare((current) =>
			on ? [...current, slug].slice(0, MAX_COMPARE) : current.filter((other) => other !== slug),
		);

	const reset = () => {
		setPicked([]);
		setRange([bounds[0], bounds[1]]);
		setInStock(false);
	};

	const filtered = picked.length > 0 || inStock || range[0] !== bounds[0] || range[1] !== bounds[1];

	return (
		<div className="grid gap-4 lg:grid-cols-[14.5rem_1fr]">
			<aside
				aria-label="Filters"
				className="h-fit space-y-4 rounded-xl border p-3 lg:sticky lg:top-40"
			>
				<fieldset>
					<legend className="mb-1.5 text-sm font-semibold">Brand</legend>

					<ul className="space-y-1">
						{brands.map(([brand, count]) => (
							<li key={brand} className="flex items-center gap-2">
								<Checkbox
									id={`b-${brand}`}
									checked={picked.includes(brand)}
									onCheckedChange={(on) =>
										setPicked((current) =>
											on ? [...current, brand] : current.filter((other) => other !== brand),
										)
									}
								/>

								<Label htmlFor={`b-${brand}`} className="flex-1 font-normal">
									{brand}
								</Label>

								<span className="text-xs text-muted-foreground tabular-nums">{count}</span>
							</li>
						))}
					</ul>
				</fieldset>

				<div>
					<p className="mb-1 text-sm font-semibold" id="price-l">
						Price
					</p>

					<Slider
						value={range}
						onValueChange={setRange}
						min={bounds[0]}
						max={bounds[1]}
						step={10}
						labels={["Lowest price", "Highest price"]}
					/>

					<p className="mt-1.5 text-xs text-muted-foreground tabular-nums">
						{euro(range[0])} – {euro(range[1])}
					</p>
				</div>

				<div className="flex items-center justify-between gap-2">
					<Label htmlFor="stock" className="text-sm font-semibold">
						In stock only
					</Label>

					<Switch id="stock" checked={inStock} onCheckedChange={setInStock} />
				</div>

				{filtered && (
					<Button variant="ghost" size="sm" onClick={reset} className="-ml-2">
						Clear filters
					</Button>
				)}
			</aside>

			<section aria-label="Products" className="min-w-0">
				<div className="mb-2 flex items-center justify-between gap-3 text-sm">
					<p className="text-muted-foreground" aria-live="polite">
						{query ? <>Results for “{query}”: </> : null}
						<span className="tabular-nums">{shown.length}</span> of{" "}
						<span className="tabular-nums">{products.length}</span> products
					</p>

					<div className="flex items-center gap-2">
						<label htmlFor="sort" className="text-muted-foreground">
							Sort
						</label>

						<NativeSelect
							id="sort"
							value={sort}
							onChange={(event) => setSort(event.target.value)}
							className="w-44"
						>
							<NativeSelectOption value="rating">Best rated</NativeSelectOption>

							<NativeSelectOption value="low">Price, low to high</NativeSelectOption>

							<NativeSelectOption value="high">Price, high to low</NativeSelectOption>
						</NativeSelect>
					</div>
				</div>

				{shown.length === 0 ? (
					<Empty title="Nothing matches" description="Widen the price range or clear a brand.">
						<Button onClick={reset}>Clear filters</Button>
					</Empty>
				) : (
					<ul className="divide-y rounded-xl border">
						{shown.map((product) => {
							const on = compare.includes(product.slug);
							const full = compare.length >= MAX_COMPARE && !on;

							return (
								<li
									key={product.slug}
									className="grid gap-x-4 gap-y-2 p-3 sm:grid-cols-[6.5rem_1fr_auto] xl:grid-cols-[6.5rem_minmax(0,1fr)_11rem_15rem]"
								>
									<AppLink
										href={storeHref(`/p/${product.slug}`)}
										className="block aspect-[4/3] self-start overflow-hidden rounded-lg bg-muted sm:aspect-square"
										tabIndex={-1}
										aria-hidden
									>
										{/* biome-ignore lint/performance/noImgElement: the static export has no image optimizer */}
										<img
											src={product.image}
											alt=""
											loading="lazy"
											className={cn("size-full object-cover", product.stock === 0 && "opacity-50")}
											style={{ objectPosition: product.imagePosition }}
										/>
									</AppLink>

									<div className="min-w-0">
										<h2 className="text-base font-semibold leading-snug">
											<AppLink href={storeHref(`/p/${product.slug}`)} className="hover:underline">
												{product.name}
											</AppLink>
										</h2>

										<p className="text-xs text-muted-foreground">{product.brand}</p>

										<dl className="mt-1.5 grid grid-cols-3 gap-x-3 text-sm">
											{product.key.map(([label, value]) => (
												<div key={label} className="min-w-0">
													<dt className="text-xs text-muted-foreground">{label}</dt>

													<dd className="font-medium leading-snug">{value}</dd>
												</div>
											))}
										</dl>

										<div className="mt-2 flex items-center gap-2">
											<Checkbox
												id={`cmp-${product.slug}`}
												checked={on}
												disabled={full}
												onCheckedChange={(value) => toggleCompare(product.slug, value)}
											/>

											<Label htmlFor={`cmp-${product.slug}`} className="text-sm font-normal">
												Compare{full ? " (max 4)" : ""}
											</Label>
										</div>
									</div>

									<div className="flex items-start gap-1.5 text-sm xl:flex-col xl:gap-0.5">
										<Rating readOnly value={product.rating} size="sm" />

										<span className="text-xs text-muted-foreground tabular-nums">
											{product.rating.toFixed(1)} · {product.reviews} reviews
										</span>
									</div>

									<div className="space-y-1.5 sm:col-span-3 xl:col-span-1">
										<PriceBlock product={product} />

										<Instalments amount={price(product)} />

										{product.stock > 0 ? (
											<Delivery className="text-xs" />
										) : (
											<p className="text-xs text-muted-foreground">
												Back in stock soon, no delivery date yet
											</p>
										)}

										<AddToCart product={product} className="w-full" />
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</section>

			{chosen.length > 0 && (
				<div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background shadow-md">
					<div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2">
						<ul className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
							{chosen.map((product) => (
								<li
									key={product.slug}
									className="flex shrink-0 items-center gap-1.5 rounded-lg border py-0.5 pl-0.5 pr-2 text-sm"
								>
									{/* biome-ignore lint/performance/noImgElement: the static export has no image optimizer */}
									<img src={product.image} alt="" className="size-7 rounded-md object-cover" />

									<span className="max-w-32 truncate">{product.name}</span>

									<button
										type="button"
										aria-label={`Remove ${product.name} from comparison`}
										onClick={() => toggleCompare(product.slug, false)}
										className="rounded px-1 text-muted-foreground hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
									>
										×
									</button>
								</li>
							))}
						</ul>

						<span className="hidden text-xs text-muted-foreground sm:inline">
							{chosen.length < 2
								? "Pick one more to compare"
								: `${chosen.length} of ${MAX_COMPARE}`}
						</span>

						<Button variant="ghost" size="sm" onClick={() => setCompare([])}>
							Clear
						</Button>

						<Button size="sm" disabled={chosen.length < 2} onClick={() => setOpen(true)}>
							Compare {chosen.length}
						</Button>
					</div>
				</div>
			)}

			<Drawer open={open} onOpenChange={setOpen}>
				<DrawerContent side="bottom" className="max-h-[88dvh]">
					<DrawerHeader>
						<DrawerTitle>Side by side</DrawerTitle>

						<DrawerDescription>
							Switch on “Differences only” to hide rows that match.
						</DrawerDescription>
					</DrawerHeader>

					<DrawerBody>
						<CompareTable items={chosen} />
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</div>
	);
}

function CompareTable({ items }: { items: Product[] }) {
	const specOf = (product: Product, group: string, row: string) =>
		product.specs
			.find((spec) => spec.label === group)
			?.rows.find(([label]) => label === row)?.[1] ?? "—";

	// Every group and row any product has, in the order first seen.
	const groups = new Map<string, Set<string>>();

	for (const product of items)
		for (const spec of product.specs) {
			const rows = groups.get(spec.label) ?? new Set<string>();

			for (const [label] of spec.rows) rows.add(label);

			groups.set(spec.label, rows);
		}

	const each = (read: (product: Product) => string | number) =>
		Object.fromEntries(items.map((product) => [product.slug, read(product)]));

	return (
		<ComparisonTable
			label="Products compared"
			items={items.map((product) => ({
				id: product.slug,
				name: product.name,
				href: storeHref(`/p/${product.slug}`),
				details: euro(price(product)),
			}))}
			groups={[
				{
					label: "Price and rating",
					rows: [
						{ label: "Price", values: each((product) => euro(price(product))) },
						{ label: "Lowest in 30 days", values: each((product) => euro(lowest30(product))) },
						{
							label: "Rating",
							values: each((product) => `${product.rating.toFixed(1)} (${product.reviews})`),
						},
						{ label: "Brand", values: each((product) => product.brand) },
					],
				},
				...[...groups].map(([label, rows]) => ({
					label,
					rows: [...rows].map((row) => ({
						label: row,
						values: Object.fromEntries(
							items.map((product) => [product.slug, specOf(product, label, row)]),
						),
					})),
				})),
			]}
		/>
	);
}
