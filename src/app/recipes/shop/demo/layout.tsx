import type { ReactNode } from "react";
import { DemoShell } from "@/site/recipe-parts";
import { CartProvider } from "./cart";
import { ShopFooter, ShopHeader } from "./shop-chrome";

export default function DemoLayout({ children }: { children: ReactNode }) {
	return (
		<DemoShell title="Shop">
			<CartProvider>
				<ShopHeader />

				<main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>

				<ShopFooter />
			</CartProvider>
		</DemoShell>
	);
}
