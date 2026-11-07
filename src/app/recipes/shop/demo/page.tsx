import type { Metadata } from "next";
import { demoPath, site } from "@/site/config";
import { euro, freeShippingFrom } from "./catalog";
import { ProductBrowser } from "./product-browser";

const description =
	"A reference build of the shop recipe: a product grid with filters, product pages, a cart drawer and a checkout.";
const url = `${site.url}${demoPath("shop")}`;

export const metadata: Metadata = {
	title: "Shop demo",
	description,
	alternates: { canonical: url },
	openGraph: { url, title: `Shop demo · ${site.name}`, description },
};

export default function ShopDemo() {
	return (
		<>
			<header className="mb-8 max-w-2xl">
				<p className="font-medium text-muted-foreground text-sm">Autumn and winter</p>

				<h1 className="mt-2 text-balance font-semibold text-3xl tracking-tight sm:text-4xl">
					Boots, knits and bags for the cold months
				</h1>

				<p className="mt-3 text-muted-foreground leading-relaxed">
					Made to be worn for years and mended when they need it. Free standard delivery over{" "}
					{euro.format(freeShippingFrom)}, 30-day returns.
				</p>
			</header>

			<ProductBrowser />
		</>
	);
}
