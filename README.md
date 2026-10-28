# labsUI

Clean, composable React components with one smooth spring for every motion.
Hand-made, accessible, and copied into your project so you own the code.

[Docs and live demos](https://kznlabs.github.io/labsUI) ·
[npm](https://www.npmjs.com/package/@kznlabs/labsui) ·
[JSR](https://jsr.io/@kznlabs/labsui)

[![WCAG 2.2 AA: 0 axe violations](https://img.shields.io/badge/WCAG_2.2_AA-0_axe_violations-2ea44f)](#accessibility-and-browsers)
[![Chromium: tested](https://img.shields.io/badge/Chromium-tested-2ea44f)](#accessibility-and-browsers)
[![Firefox: tested](https://img.shields.io/badge/Firefox-tested-2ea44f)](#accessibility-and-browsers)
[![WebKit: tested](https://img.shields.io/badge/WebKit-tested-2ea44f)](#accessibility-and-browsers)

## Why labsUI

- **One spring.** Every animation shares
  `{ type: "spring", stiffness: 400, damping: 30 }`, so the whole UI moves the
  same way. Reduced motion is respected everywhere.
- **You own the code.** `npx @kznlabs/labsui add` writes plain TSX into your
  repo. No runtime package to upgrade around, edit anything.
- **Accessible by default.** WAI-ARIA patterns, full keyboard support, and WCAG
  AA contrast in light and dark mode for all eight accent colors.
- **Server-friendly.** Many components are server-safe, and form controls use
  native validation, so forms work without JavaScript and with Server Actions.
- **80+ components and blocks.** Inputs, overlays, navigation, data display,
  charts, motion helpers, and ready-made blocks like pricing, site header and
  changelog.

## Accessibility and browsers

CI runs an automated sweep on pull requests (the pages a change reaches) and
weekly (everything): all component pages, light and dark, at 390 px and
1280 px, in three browser engines.

| Check                                         | Result               |
| --------------------------------------------- | -------------------- |
| WCAG 2.2 A + AA rules (axe 4.14)              | 0 violations         |
| JavaScript errors                             | none                 |
| Sideways page overflow                        | none                 |
| Every control reachable by a click            | pass                 |
| Scroll containers move under the wheel        | pass                 |
| Menus, popovers, tabs, sliders, Escape, focus | pass                 |
| Pointer targets                               | 24 × 24 px or larger |
| Text contrast, both themes                    | 4.5:1 or higher      |

| Engine   | Version tested | Covers                                | Status |
| -------- | -------------- | ------------------------------------- | ------ |
| Chromium | 156            | Chrome, Edge, Brave, Opera, Opera GX  | ✔      |
| Gecko    | Firefox 157    | Firefox                               | ✔      |
| WebKit   | 27.2           | Safari (macOS); iOS shares the engine | ✔      |

Minimum versions come from Tailwind CSS v4: Chrome 111, Safari 16.4,
Firefox 128. Two features enhance where supported and fall back cleanly:
styled select popups (`appearance: base-select`, Chromium and newer Safari;
elsewhere the native list) and auto-growing textareas (`field-sizing`; a
resize handle in Firefox).

Automated checks find many problems, not all: axe covers roughly half of the
WCAG criteria, so this is not a full conformance audit. Not yet covered:
screen reader passes, real phones (iOS Safari, Android Chrome), Samsung
Internet and other less common browsers.

## Quick start

Requires React 19, Tailwind CSS v4 and a `@/*` path alias in `tsconfig.json`.
The CLI runs on Node.js 22 or newer, or Deno.

```sh
npx @kznlabs/labsui init               # styles, theme, utils, motion provider
npx @kznlabs/labsui add button dialog  # components plus everything they import
npx @kznlabs/labsui search date range  # find by name, export or intent
npx @kznlabs/labsui view dialog        # exact props, examples, what it installs
npx @kznlabs/labsui doctor             # check the setup, with a fix for each problem
```

Any package manager works: `bunx`, `pnpm dlx`, `yarn dlx` and
`deno run -A jsr:@kznlabs/labsui` too, and npm packages install with whichever
one your lockfile shows. Bun is recommended: labsUI is built with it.
See the [CLI reference](packages/cli/README.md) for every option.

Coding agents get the same through `npx @kznlabs/labsui mcp` (an MCP server with
search, view, add, init and doctor tools, plus the library's coding rules) or
through `--json` on any command.

```tsx
import { Button } from "@/components/ui/button";

export function DeleteButton({ onDelete }: { onDelete: () => void }) {
	return (
		<Button variant="destructive" confirmLabel="Yes, delete" onClick={onDelete}>
			Delete
		</Button>
	);
}
```

## What's inside

| Group               | Examples                                                                    |
| ------------------- | --------------------------------------------------------------------------- |
| Actions & inputs    | Button, Field, Select, Combobox, Date picker, Slider, OTP, Tag input        |
| Overlays & feedback | Dialog, Drawer, Popover, Dropdown and context menus, Command palette, Toast |
| Navigation          | Tabs, Sidebar, Menubar, Navigation menu, Breadcrumb, Pagination             |
| Data display        | Table, Data table, Chart, Carousel, Timeline, Code, Terminal                |
| Layout              | Card, Accordion, App window, Resizable panels, Scroll area                  |
| Motion              | Reveal, Count to, Typewriter, Text swap, Custom cursor                      |
| Blocks              | Pricing, Site header, Stats strip, Product card, Changelog, Newsletter      |

Theming is built on OKLCH tokens with light and dark mode and eight accent
presets, or your own hue through `--accent-hue`.

## Development

labsUI is built with [Bun](https://bun.sh), and the repo scripts run on it, so
install Bun to work on the library itself.

```sh
bun install
bun dev                     # docs site with every component
bun run lint                # Biome
bun run typecheck           # also rebuilds the registry and API docs
bun run check-dead-code     # Knip
bun test                    # unit tests for helpers and the CLI
bunx markdownlint-cli2      # Markdown
```

The docs site deploys from `main` to GitHub Pages. A `cli-v<version>` tag
publishes the CLI to npm and JSR.

## License

[MIT](LICENSE)
