"use client";

import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SiteFooter } from "@/components/blocks/site-footer";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { SearchInput } from "@/components/ui/search-input";
import { AppLink } from "@/lib/link";
import { useCart } from "./cart";
import { categories, storeHref, storePath } from "./catalog";

export function StoreHeader() {
	const router = useRouter();
	const { count } = useCart();
	const [cat, setCat] = useState("all");
	const [query, setQuery] = useState("");

	return (
		<header className="sticky top-12 z-40 border-b bg-background">
			<div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2">
				<AppLink href={storeHref()} className="shrink-0 text-lg font-semibold tracking-tight">
					Bench
				</AppLink>

				<search className="order-last min-w-0 basis-full sm:order-none sm:basis-0 sm:flex-1">
					<form
						className="flex items-stretch gap-0"
						onSubmit={(event) => {
							event.preventDefault();
							router.push(
								storePath(
									`/c/${cat}${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`,
								),
							);
						}}
					>
						<NativeSelect
							aria-label="Category"
							value={cat}
							onChange={(event) => setCat(event.target.value)}
							className="w-32 shrink-0 rounded-r-none border-r-0 sm:w-44"
						>
							<NativeSelectOption value="all">All categories</NativeSelectOption>

							{categories.map((entry) => (
								<NativeSelectOption key={entry.id} value={entry.id}>
									{entry.label}
								</NativeSelectOption>
							))}
						</NativeSelect>

						<SearchInput
							value={query}
							onValueChange={setQuery}
							shortcut="/"
							label="Search products"
							placeholder="Search by name, brand or spec, e.g. 120 Hz"
							className="min-w-0 flex-1 rounded-none"
						/>

						<Button type="submit" className="rounded-l-none">
							Search
						</Button>
					</form>
				</search>

				<AppLink
					href={storeHref("/cart")}
					className="relative ml-auto flex shrink-0 sm:ml-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium hover:bg-secondary"
				>
					<ShoppingCart className="size-4" aria-hidden />

					<span className="sr-only sm:not-sr-only">Cart</span>

					<span className="min-w-5 rounded-full bg-primary px-1.5 text-center text-xs tabular-nums text-primary-foreground">
						{count}

						<span className="sr-only"> {count === 1 ? "item" : "items"}</span>
					</span>
				</AppLink>
			</div>

			<nav
				aria-label="Categories"
				className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 pb-1.5 text-sm"
			>
				{categories.map((entry) => (
					<AppLink
						key={entry.id}
						href={storeHref(`/c/${entry.id}`)}
						className="rounded-md px-2 py-1 whitespace-nowrap text-muted-foreground hover:bg-secondary hover:text-foreground"
					>
						{entry.label}
					</AppLink>
				))}
			</nav>
		</header>
	);
}

export function StoreFooter() {
	return (
		<SiteFooter
			className="mt-16"
			brand={
				<AppLink href={storeHref()} className="font-semibold">
					Bench
				</AppLink>
			}
			description="A demo store: prices, stock and brands are invented, and nothing here can be bought."
			columns={[
				{
					title: "Shop",
					links: categories.map((category) => ({
						label: category.label,
						href: storeHref(`/c/${category.id}`),
					})),
				},
				{
					title: "About prices",
					links: [{ label: "How we show discounts", href: storeHref("/prices") }],
				},
			]}
			legal="Prices in EUR, VAT included. Photos: CC0 from the WordPress Photo Directory."
		/>
	);
}
