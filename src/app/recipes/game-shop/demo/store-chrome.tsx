"use client";

import { Flame, ShoppingBag } from "lucide-react";
import { SiteFooter } from "@/components/blocks/site-footer";
import { SiteHeader } from "@/components/blocks/site-header";
import { Button } from "@/components/ui/button";
import { demoPath, withBase } from "@/site/config";
import { useOrder } from "./order";
import { server } from "./store";

const home = withBase(demoPath("game-shop"));
const section = (id: string) => `${home}#${id}`;

function Brand() {
	return (
		<a href={home} className="flex items-center gap-2 font-semibold tracking-tight">
			<span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
				<Flame className="size-4" aria-hidden="true" />
			</span>

			{server.name}
		</a>
	);
}

export function StoreHeader() {
	const order = useOrder();

	return (
		<SiteHeader
			className="top-12"
			label="Store"
			brand={<Brand />}
			nav={[
				{ label: "Ranks", href: section("ranks") },
				{ label: "Cosmetics", href: section("cosmetics") },
				{ label: "Community", href: section("community") },
			]}
			actions={
				<Button variant="outline" size="sm" onClick={order.show}>
					<ShoppingBag aria-hidden="true" />
					Order
					<span className="min-w-4 rounded-full bg-primary px-1.5 text-primary-foreground text-xs tabular-nums">
						{order.lines.length}
					</span>
					<span className="sr-only">{order.lines.length === 1 ? "item" : "items"}</span>
				</Button>
			}
		/>
	);
}

export function StoreFooter() {
	return (
		<SiteFooter
			className="mt-16"
			brand={<Brand />}
			description="A community survival server since 2021. Ranks and cosmetics pay for the hosting; nothing sold here changes a fight."
			columns={[
				{
					title: "Store",
					links: [
						{ label: "Ranks", href: section("ranks") },
						{ label: "Cosmetics", href: section("cosmetics") },
						{ label: "Your order", href: section("order") },
					],
				},
				{
					title: "Server",
					links: [
						{ label: "Status", href: section("status") },
						{ label: "Community goal", href: section("community") },
						{ label: "Top buyers", href: section("top-buyers") },
					],
				},
			]}
			legal="A demo store: sample data, prices in EUR including VAT, no real payments. Not affiliated with any game."
		/>
	);
}
