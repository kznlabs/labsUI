import type { ReactNode } from "react";
import { DemoShell } from "@/site/recipe-parts";
import { DocsShell } from "./docs-chrome";

export default function DemoLayout({ children }: { children: ReactNode }) {
	return (
		<DemoShell title="Documentation site">
			<DocsShell>
				<main>{children}</main>
			</DocsShell>
		</DemoShell>
	);
}
