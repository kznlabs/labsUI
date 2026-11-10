import { AppLink } from "@/lib/link";
import { storeHref } from "./catalog";

export function Footer() {
	return (
		<footer className="mt-40 grid gap-8 border-t border-border px-4 py-12 text-sm sm:px-6 md:grid-cols-12">
			<p className="shop-display text-2xl md:col-span-4">Anselm</p>

			<p className="max-w-sm text-muted-foreground md:col-span-5">
				This is a sample store. Prices are in euros, photos are public domain, and no payment is
				ever taken.
			</p>

			<nav aria-label="Footer" className="shop-caps flex gap-6 md:col-span-3 md:justify-end">
				<AppLink href={storeHref("?c=clothing#collection")}>Clothing</AppLink>

				<AppLink href={storeHref("/checkout")}>Checkout</AppLink>
			</nav>
		</footer>
	);
}
