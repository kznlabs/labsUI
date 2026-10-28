import cli from "../../packages/cli/package.json";

/** Sub-path the site is served under: "/labsUI" on GitHub Pages, "" locally. Set at build time. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const site = {
	name: "labsUI",
	url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kznlabs.github.io/labsUI",
	description:
		"labsUI is a clean, composable React component library with one smooth spring for every motion. You copy components into your project and own the code. Built for Next.js 16 and Tailwind CSS v4; install with npm, pnpm, yarn or Bun (recommended).",
};

/** Prefixes a root-relative path for plain <a>/<img>; Next prefixes its own links and assets. */
export const withBase = (path: string) => `${basePath}${path}`;

/** Root-relative path of a component's own page (before `withBase`). */
export const componentPath = (id: string) => `/components/${id}`;

/** Root-relative link to a group in the homepage's component index (before `withBase`). */
export const groupPath = (group: string) =>
	`/#group-${group.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

/** Released CLI (and component) version, shown in the header. */
export const version = cli.version;
