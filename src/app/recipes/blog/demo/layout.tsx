import type { ReactNode } from "react";
import { DemoShell } from "@/site/recipe-parts";
import { BlogFooter, BlogHeader } from "./blog-chrome";

export default function DemoLayout({ children }: { children: ReactNode }) {
	return (
		<DemoShell title="Blog">
			<BlogHeader />

			<main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>

			<BlogFooter />
		</DemoShell>
	);
}
