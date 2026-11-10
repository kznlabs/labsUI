import { Cormorant_Garamond } from "next/font/google";
import type { ReactNode } from "react";
import { DemoShell } from "@/site/recipe-parts";
import { BagDrawer } from "./bag-drawer";
import { CartProvider } from "./cart";
import { PrintTheme } from "./print-theme";
import "./print.css";

const display = Cormorant_Garamond({
	variable: "--font-display",
	subsets: ["latin"],
	weight: ["400", "500"],
});

// Runs before the first paint, so the page never flashes the site's own theme.
const firstPaint = `document.documentElement.classList.add("shop-print");document.documentElement.setAttribute("data-accent","green")`;

export default function DemoLayout({ children }: { children: ReactNode }) {
	return (
		<DemoShell title="Fashion store">
			{/* biome-ignore lint/security/noDangerouslySetInnerHtml: static pre-paint script */}
			<script dangerouslySetInnerHTML={{ __html: firstPaint }} />

			<PrintTheme fontClass={display.variable} />

			<CartProvider>
				{children}

				<BagDrawer />
			</CartProvider>
		</DemoShell>
	);
}
