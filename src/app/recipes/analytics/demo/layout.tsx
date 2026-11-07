import type { ReactNode } from "react";
import { DemoShell } from "@/site/recipe-parts";

export default function DemoLayout({ children }: { children: ReactNode }) {
	return <DemoShell title="Analytics dashboard">{children}</DemoShell>;
}
