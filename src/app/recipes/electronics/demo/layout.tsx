import type { ReactNode } from "react";
import { DemoShell } from "@/site/recipe-parts";
import { CartProvider } from "./cart";
import { StoreFooter, StoreHeader } from "./store-chrome";

export default function DemoLayout({ children }: { children: ReactNode }) {
	return (
		<DemoShell title="Electronics store">
			<CartProvider>
				<StoreHeader />

				<main className="mx-auto w-full max-w-7xl px-4 py-4">{children}</main>

				<StoreFooter />
			</CartProvider>
		</DemoShell>
	);
}
