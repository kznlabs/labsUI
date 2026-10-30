import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { MotionProvider } from "@/components/motion-provider";
import { Confirmer } from "@/components/ui/confirm";
import { Toaster } from "@/components/ui/toast";
import { themeScript } from "@/lib/theme";
import { site, withBase } from "@/site/config";
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
		"component library",
		"spring animations",
	],
	alternates: { canonical: site.url },
	icons: { icon: [{ url: withBase("/icon.svg"), type: "image/svg+xml" }] },
	openGraph: {
		type: "website",
		url: site.url,
		siteName: site.name,
		title: site.name,
		description: site.description,
		images: [
			{
				url: `${site.url}/og.png`,
				width: 1200,
				height: 630,
				alt: `${site.name}: clean React components with spring motion`,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: site.name,
		description: site.description,
		images: [`${site.url}/og.png`],
	},
	robots: { index: true, follow: true },
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#f7f7f7" },
		{ media: "(prefers-color-scheme: dark)", color: "#141415" },
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
							[data-marker] {
								background-size: 100% 100% !important;
							}
						`}
					</style>
				</noscript>
			</head>

			<body className="min-h-dvh">
				<MotionProvider>
					{children}

					<Toaster />

					<Confirmer />
				</MotionProvider>
			</body>
		</html>
	);
}
