import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { MotionProvider } from "@/components/motion-provider";
import { Toaster } from "@/components/ui/toast";
import { site } from "@/lib/site";
import { themeScript } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL(site.url),
	title: { default: `${site.name} — Minimal React components`, template: `%s · ${site.name}` },
	description: site.description,
	applicationName: site.name,
	keywords: [
		"React",
		"Next.js",
		"Tailwind CSS",
		"motion",
		"shadcn/ui",
		"component library",
		"macOS UI",
	],
	alternates: { canonical: "/" },
	openGraph: {
		type: "website",
		url: "/",
		siteName: site.name,
		title: site.name,
		description: site.description,
	},
	twitter: { card: "summary_large_image", title: site.name, description: site.description },
	robots: { index: true, follow: true },
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#09090b" },
	],
	colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: static pre-paint theme script */}
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
				<noscript>
					<style>
						{`
							[data-reveal] {
								opacity: 1 !important;
								transform: none !important;
							}
							[data-count-to-animated] {
								display: none !important;
							}
							[data-count-to-fallback] {
								display: inline !important;
							}
							[data-typewriter-animated] {
								display: none !important;
							}
							[data-typewriter-fallback] {
								display: inline !important;
							}
						`}
					</style>
				</noscript>
			</head>
			<body className="min-h-dvh">
				<MotionProvider>
					{children}
					<Toaster />
				</MotionProvider>
			</body>
		</html>
	);
}
