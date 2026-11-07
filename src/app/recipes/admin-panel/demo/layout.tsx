import type { ReactNode } from "react";
import { DemoShell } from "@/site/recipe-parts";
import { AdminShell } from "./admin-shell";

export default function DemoLayout({ children }: { children: ReactNode }) {
	return (
		<DemoShell title="Admin panel">
			<AdminShell>{children}</AdminShell>
		</DemoShell>
	);
}
