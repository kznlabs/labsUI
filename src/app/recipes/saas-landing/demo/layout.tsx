import type { ReactNode } from "react";
import { DemoShell } from "@/site/recipe-parts";
import { LandingFooter, LandingHeader } from "./landing-chrome";

export default function DemoLayout({ children }: { children: ReactNode }) {
	return (
		<DemoShell title="SaaS landing">
			<LandingHeader />

			<main id="top">{children}</main>

			<LandingFooter />
		</DemoShell>
	);
}
