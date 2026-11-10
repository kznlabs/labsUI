"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import type { Product } from "./catalog";
import { Tile } from "./tile";

const PRICES = [
	{ id: "u80", label: "Under €80", test: (amount: number) => amount < 80 },
	{ id: "80-150", label: "€80 to €150", test: (amount: number) => amount >= 80 && amount <= 150 },
	{ id: "o150", label: "Over €150", test: (amount: number) => amount > 150 },
];

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "40", "41", "42", "43", "44", "One size"];

/** Reads ?color= from the URL so the page itself stays static. Wrap in <Suspense>. */
export function CollectionFromUrl({ products }: { products: Product[] }) {
	const category = useSearchParams().get("c") ?? undefined;

	return <Collection key={category ?? "all"} products={products} category={category} />;
}

function Collection({ products, category }: { products: Product[]; category?: string }) {
	const [sizes, setSizes] = useState<string[]>([]);
	const [colors, setColors] = useState<string[]>([]);
	const [price, setPrice] = useState("");
	const [cols, setCols] = useState("4");

	const allSizes = useMemo(
		() => SIZE_ORDER.filter((size) => products.some((product) => size in product.stock)),
		[products],
	);
	const allColors = useMemo(
		() => [
			...new Map(
				products.flatMap((product) => product.colors).map((color) => [color.name, color]),
			).values(),
		],
		[products],
	);

	const shown = products.filter((product) => {
		if (
			category === "sale"
				? product.compareAt === undefined
				: category && product.category !== category
		)
			return false;
		if (sizes.length && !sizes.some((size) => (product.stock[size] ?? 0) > 0)) return false;
		if (colors.length && !product.colors.some((color) => colors.includes(color.name))) return false;

		const priceRule = PRICES.find((option) => option.id === price);

		if (priceRule && !priceRule.test(product.price)) return false;

		return true;
	});

	const active = sizes.length + colors.length + (price ? 1 : 0);
	const toggle = (list: string[], set: (value: string[]) => void, value: string) =>
		set(list.includes(value) ? list.filter((option) => option !== value) : [...list, value]);

	const chip = "shop-caps h-8 px-3 font-normal";

	return (
		<div>
			<div className="sticky top-26 z-30 border-y border-border bg-background">
				<div className="flex items-center gap-2 overflow-x-auto px-4 py-2.5 sm:px-6">
					<Popover>
						<PopoverTrigger variant={sizes.length ? "default" : "outline"} className={chip}>
							Size{sizes.length > 0 && ` · ${sizes.length}`}
						</PopoverTrigger>

						<PopoverContent align="start" className="w-64 p-4">
							<ul className="grid grid-cols-4 gap-2">
								{allSizes.map((size) => (
									<li key={size}>
										<div className="flex items-center gap-2 text-sm">
											<Checkbox
												id={`size-${size}`}
												checked={sizes.includes(size)}
												onCheckedChange={() => toggle(sizes, setSizes, size)}
											/>

											<Label
												htmlFor={`size-${size}`}
												className="cursor-pointer whitespace-nowrap font-normal"
											>
												{size}
											</Label>
										</div>
									</li>
								))}
							</ul>
						</PopoverContent>
					</Popover>

					<Popover>
						<PopoverTrigger variant={colors.length ? "default" : "outline"} className={chip}>
							Colour{colors.length > 0 && ` · ${colors.length}`}
						</PopoverTrigger>

						<PopoverContent align="start" className="w-56 p-4">
							<ul className="flex flex-col gap-2.5">
								{allColors.map((color) => (
									<li key={color.name}>
										<div className="flex items-center gap-3 text-sm">
											<Checkbox
												id={`colour-${color.name}`}
												checked={colors.includes(color.name)}
												onCheckedChange={() => toggle(colors, setColors, color.name)}
											/>

											<span
												className="size-3 border border-foreground/25"
												style={{ background: color.hex }}
											/>

											<Label
												htmlFor={`colour-${color.name}`}
												className="cursor-pointer font-normal"
											>
												{color.name}
											</Label>
										</div>
									</li>
								))}
							</ul>
						</PopoverContent>
					</Popover>

					<Popover>
						<PopoverTrigger variant={price ? "default" : "outline"} className={chip}>
							Price{price && ` · ${PRICES.find((option) => option.id === price)?.label}`}
						</PopoverTrigger>

						<PopoverContent align="start" className="w-52 p-4">
							<RadioGroup aria-label="Price" value={price} onValueChange={setPrice}>
								{PRICES.map((option) => (
									<RadioGroupItem key={option.id} value={option.id}>
										{option.label}
									</RadioGroupItem>
								))}
							</RadioGroup>
						</PopoverContent>
					</Popover>

					{active > 0 && (
						<button
							type="button"
							onClick={() => {
								setSizes([]);
								setColors([]);
								setPrice("");
							}}
							className="shop-caps shrink-0 cursor-pointer px-2 underline underline-offset-4"
						>
							Clear
						</button>
					)}

					<p
						className="shop-caps ml-auto hidden shrink-0 pl-4 text-muted-foreground sm:block"
						aria-live="polite"
					>
						{shown.length} {shown.length === 1 ? "piece" : "pieces"}
					</p>

					<ToggleGroup
						aria-label="Columns"
						size="sm"
						value={cols}
						onValueChange={(value) => value && setCols(value as string)}
						className="hidden shrink-0 md:flex"
					>
						<ToggleGroupItem value="2" aria-label="2 columns">
							2
						</ToggleGroupItem>

						<ToggleGroupItem value="4" aria-label="4 columns">
							4
						</ToggleGroupItem>
					</ToggleGroup>
				</div>
			</div>

			{shown.length === 0 ? (
				<p className="px-6 py-24 text-sm text-muted-foreground">
					Nothing matches those filters. Try clearing one.
				</p>
			) : (
				<div
					className={cn("grid grid-cols-2 gap-x-1 gap-y-8 pt-1", cols === "4" && "md:grid-cols-4")}
				>
					{shown.map((product, index) => (
						<Tile key={product.slug} product={product} heading="h2" priority={index < 4} />
					))}
				</div>
			)}
		</div>
	);
}
