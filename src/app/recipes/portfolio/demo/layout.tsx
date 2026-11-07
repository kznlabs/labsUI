import type { ReactNode } from "react";
import { DemoShell } from "@/site/recipe-parts";
import { PortfolioFooter, PortfolioHeader } from "./portfolio-chrome";

export default function DemoLayout({ children }: { children: ReactNode }) {
	return (
		<DemoShell title="Portfolio">
			<PortfolioHeader />

			<main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>

			<PortfolioFooter />
		</DemoShell>
	);
}
