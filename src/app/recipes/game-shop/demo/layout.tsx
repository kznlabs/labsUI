import type { ReactNode } from "react";
import { DemoShell } from "@/site/recipe-parts";
import { OrderBar, OrderProvider } from "./order";
import { StoreFooter, StoreHeader } from "./store-chrome";

export default function DemoLayout({ children }: { children: ReactNode }) {
	return (
		<DemoShell title="Game item shop">
			<OrderProvider>
				<StoreHeader />

				<main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>

				<StoreFooter />

				<OrderBar />
			</OrderProvider>
		</DemoShell>
	);
}
