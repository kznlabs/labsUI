import { ImageResponse } from "next/og";
import { registry } from "@/lib/registry";
import { site } from "@/lib/site";

export const alt = `${site.name}: minimal React components with macOS polish`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Share card, built at build time. Satori has no oklch, so the theme tokens appear as hex. */
export default function OpengraphImage() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				padding: 72,
				background: "#f7f7f7",
				color: "#18181a",
			}}
		>
			<div style={{ display: "flex", gap: 14 }}>
				{["#ff5f57", "#febc2e", "#28c840"].map((c) => (
					<div key={c} style={{ width: 26, height: 26, borderRadius: 13, background: c }} />
				))}
			</div>
			<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
				<div style={{ fontSize: 128, fontWeight: 600, letterSpacing: -4 }}>{site.name}</div>
				<div style={{ fontSize: 36, color: "#68686d", maxWidth: 900, lineHeight: 1.35 }}>
					shadcn/ui structure, macOS refinement, one spring.
				</div>
			</div>
			<div style={{ fontSize: 28, color: "#68686d" }}>
				{`${registry.length} components · Next.js 16 · React 19 · Tailwind CSS 4 · motion`}
			</div>
		</div>,
		size,
	);
}
