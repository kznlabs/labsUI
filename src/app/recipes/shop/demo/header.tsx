"use client";

import { useEffect, useState } from "react";
import {
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { AppLink } from "@/lib/link";
import { cn } from "@/lib/utils";
import { useCart } from "./cart";
import { storeHref } from "./catalog";

const nav = [
	{ label: "New in", href: storeHref("#collection") },
	{ label: "Clothing", href: storeHref("?c=clothing#collection") },
	{ label: "Footwear", href: storeHref("?c=footwear#collection") },
	{ label: "Accessories", href: storeHref("?c=accessories#collection") },
	{ label: "Sale", href: storeHref("?c=sale#collection"), sale: true },
];

/** Transparent over the campaign photo when `overHero`, solid once the page scrolls (always solid elsewhere). */
export function Header({ overHero = false }: { overHero?: boolean }) {
	const cart = useCart();
	const [scrolled, setScrolled] = useState(false);
	const solid = !overHero || scrolled;

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 32);

		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });

		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const link = "shop-caps py-2 hover:underline underline-offset-8 decoration-1";

	return (
		<header
			className={cn(
				"fixed inset-x-0 top-12 z-40 transition-colors duration-300",
				solid
					? "border-b border-border bg-background"
					: "border-b border-transparent bg-transparent",
			)}
		>
			<div className="flex h-14 items-center gap-10 px-4 sm:px-6">
				<AppLink href={storeHref("")} className="shop-display text-2xl leading-none tracking-tight">
					Anselm
				</AppLink>

				<nav aria-label="Main" className="hidden gap-8 md:flex">
					{nav.map((item) => (
						<AppLink
							key={item.label}
							href={item.href}
							className={cn(link, item.sale && "text-destructive-ink")}
						>
							{item.label}
						</AppLink>
					))}
				</nav>

				<div className="ml-auto flex items-center gap-6">
					<button
						type="button"
						onClick={() => cart.setOpen(true)}
						className={cn(link, "cursor-pointer")}
					>
						Bag{cart.count > 0 && <span className="ml-1.5 tabular-nums">({cart.count})</span>}
					</button>

					<Drawer>
						<DrawerTrigger
							variant="ghost"
							className={cn(link, "h-auto px-0 font-normal hover:bg-transparent md:hidden")}
						>
							Menu
						</DrawerTrigger>

						<DrawerContent side="left">
							<DrawerHeader>
								<DrawerTitle className="shop-display text-2xl">Anselm</DrawerTitle>
							</DrawerHeader>

							<DrawerBody>
								<nav aria-label="Menu" className="flex flex-col gap-6 pt-4">
									{nav.map((item) => (
										<AppLink
											key={item.label}
											href={item.href}
											className={cn("shop-display text-3xl", item.sale && "text-destructive-ink")}
										>
											{item.label}
										</AppLink>
									))}
								</nav>
							</DrawerBody>
						</DrawerContent>
					</Drawer>
				</div>
			</div>
		</header>
	);
}
