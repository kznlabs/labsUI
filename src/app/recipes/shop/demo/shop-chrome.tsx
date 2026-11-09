"use client";

import { ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/blocks/site-footer";
import { SiteHeader } from "@/components/blocks/site-header";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/lib/link";
import { useCart } from "./cart";
import { credits, shopHref } from "./catalog";

export function ShopHeader() {
	const pathname = usePathname();
	const cart = useCart();

	return (
		<SiteHeader
			className="top-12"
			label="Shop"
			brand={
				<AppLink href={shopHref()} className="font-semibold tracking-tight">
					Fieldwork
				</AppLink>
			}
			nav={[
				{ label: "Shop all", href: shopHref() },
				{ label: "Checkout", href: shopHref("/checkout") },
			]}
			current={
				pathname.endsWith("/checkout") || pathname.endsWith("/checkout/")
					? shopHref("/checkout")
					: shopHref()
			}
			actions={
				<Button variant="outline" size="sm" onClick={cart.open}>
					<ShoppingBag aria-hidden="true" />
					Cart
					<span className="min-w-4 rounded-full bg-primary px-1.5 text-primary-foreground text-xs tabular-nums">
						{cart.count}
					</span>
					<span className="sr-only">{cart.count === 1 ? "item" : "items"}</span>
				</Button>
			}
		/>
	);
}

export function ShopFooter() {
	const creators = [...new Set(credits.map((credit) => credit.creator))];

	return (
		<SiteFooter
			className="mt-16"
			brand={
				<AppLink href={shopHref()} className="font-semibold">
					Fieldwork
				</AppLink>
			}
			description="Boots, knits and bags made to be worn for years. A demo shop: sample data, no real payments."
			columns={[
				{
					title: "Shop",
					links: [
						{ label: "All products", href: shopHref() },
						{ label: "Ridge Leather Boot", href: shopHref("/products/ridge-leather-boot") },
						{ label: "Cable Knit Sweater", href: shopHref("/products/cable-knit-sweater") },
						{ label: "Checkout", href: shopHref("/checkout") },
					],
				},
			]}
			legal={`Prices in EUR, including VAT. Photos CC0 from StockSnap by ${creators.join(", ")}.`}
		/>
	);
}
