/**
 * Code shown outside the snippets, kept as data so scripts/format-snippets.ts highlights it at
 * build time too.
 */

/** The install command for an entry's files: `npx @kznlabs/labsui add button pricing` for `button.tsx · blocks/pricing.tsx`. */
export const installCommand = (file: string) =>
	`npx @kznlabs/labsui add ${file
		.split("·")
		.map((file) =>
			file
				.trim()
				.replace(/^blocks\//, "")
				.replace(/\.tsx?$/, ""),
		)
		.join(" ")}`;

/** Getting started: the commands and the three files it walks through. */
export const guide = {
	init: "npx @kznlabs/labsui init",
	add: "npx @kznlabs/labsui add button data-table",
	layout: `import type { ReactNode } from "react";
import { MotionProvider } from "@/components/motion-provider";
import { themeScript } from "@/lib/theme";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Sets light/dark and the accent before paint: no flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}`,
	usage: `import { Button } from "@/components/ui/button";

export function Save() {
  return <Button successLabel="Saved!">Save</Button>;
}`,
	mcp: `{
  "mcpServers": {
    "labsui": { "command": "npx", "args": ["-y", "@kznlabs/labsui", "mcp"] }
  }
}`,
	/** Real output, see /why's caption: 0.1.12 install, toast.tsx edited, updated to a later version. */
	updateRun: `$ labsui diff
  toast  +18 -98  src/components/ui/toast.tsx  (your edits and labsUI's since 0.1.12; update merges them)
  utils  +0 -9  src/lib/utils.ts  (only labsUI changed it since 0.1.12; update replaces it)

$ labsui update toast
✓ toast  merged
✓ Wrote 2 file(s):
  src/lib/platform.ts
  src/components/ui/kbd.tsx
• Kept dependencies that differ from this version (older or edited): utils`,
	theming: `import { setAccent, setTheme } from "@/lib/theme";

setTheme("dark"); // or "light"; follows the OS until set, then remembered
setAccent("purple"); // red, orange, yellow, green, blue, purple, pink, slate`,
};
