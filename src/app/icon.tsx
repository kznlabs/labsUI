import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon: the header's traffic lights on a card tile. Satori has no oklch, so tokens are hex. */
export default function Icon() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				gap: 3,
				borderRadius: 8,
				background: "#ffffff",
				border: "1px solid #e4e4e7",
			}}
		>
			{["#ff5f57", "#febc2e", "#28c840"].map((c) => (
				<div key={c} style={{ width: 7, height: 7, borderRadius: 4, background: c }} />
			))}
		</div>,
		size,
	);
}
