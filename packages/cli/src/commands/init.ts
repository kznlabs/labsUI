import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { bold, green, yellow } from "../log.ts";
import {
	CONFIG,
	detectAlias,
	findCss,
	readConfig,
	readPackage,
	TAILWIND_IMPORT,
	writeConfig,
} from "../project.ts";
import type { Config, Opts } from "../types.ts";
import { VERSION } from "../version.ts";
import { type AddResult, add, printAdd } from "./add.ts";

export type InitResult = {
	config: Config;
	add: AddResult;
	/** The stylesheet that now imports labsui.css. */
	css?: string;
	/** Code the root layout needs. */
	layout: string;
	/** Problems the user should fix by hand. */
	warnings: string[];
	dryRun: boolean;
};

function missingPeers(cwd: string, warnings: string[]) {
	const pkg = readPackage(cwd);
	const all = { ...pkg.dependencies, ...pkg.devDependencies };
	const tailwind = all.tailwindcss ?? all["@tailwindcss/postcss"] ?? all["@tailwindcss/vite"];

	if (!tailwind) warnings.push("Tailwind CSS v4 not found in package.json; labsUI needs it.");
	else if (/^[~^]?3\./.test(tailwind))
		warnings.push(`Tailwind ${tailwind} found; labsUI needs v4.`);
	if (!all.react) warnings.push("React not found in package.json.");
}

function wireStylesheet(cwd: string, root: string, opts: Opts, warnings: string[]) {
	const css = findCss(cwd, root);

	if (!css) {
		warnings.push(
			'No CSS file importing Tailwind found. Add to it: @import "tailwindcss"; @import "<path>/styles/labsui.css";',
		);

		return;
	}

	const shown = relative(cwd, css).replaceAll("\\", "/");
	let spec = relative(dirname(css), join(cwd, root, "styles/labsui.css")).replaceAll("\\", "/");

	if (!spec.startsWith(".")) spec = `./${spec}`;

	const text = readFileSync(css, "utf8");
	// create-next-app's starter CSS overrides our palette and font.
	const clashes = [
		...new Set(
			[
				...text.matchAll(
					/(--(?:background|foreground|primary|border|radius))\s*:|(font-family)\s*:/g,
				),
			].map((match) => match[1] ?? match[2]),
		),
	];

	if (clashes.length)
		warnings.push(
			`${shown} sets ${clashes.join(", ")}, overriding labsUI's palette and font. Remove those rules (often create-next-app boilerplate) unless you mean to customize them.`,
		);
	if (!text.includes(spec) && !opts.dryRun)
		writeFileSync(
			css,
			text.replace(TAILWIND_IMPORT, (line) => `${line}\n@import "${spec}";`),
		);

	return shown;
}

const layoutCode = (
	alias: string,
) => `import { MotionProvider } from "${alias}components/motion-provider";
import { themeScript } from "${alias}lib/theme";

<html lang="en" suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{ __html: themeScript }} />
  </head>
  <body>
    <MotionProvider>{children}</MotionProvider>
  </body>
</html>`;

export async function init(
	cwd: string,
	registryFlag: string | undefined,
	opts: Opts,
): Promise<InitResult> {
	const warnings: string[] = [];

	missingPeers(cwd, warnings);

	const { alias, root } = detectAlias(cwd);
	const existing = readConfig(cwd);
	// Only a hosted registry gets saved, otherwise the bundled one is used.
	const registry = registryFlag ?? existing?.registry;
	const config: Config = { ...(registry && { registry }), alias, root };

	const added = await add(cwd, config, ["styles", "utils", "theme", "motion-provider"], opts);

	const css = wireStylesheet(cwd, root, opts, warnings);

	if (css) config.css = css;

	const installed = { ...existing?.installed };

	if (!registry) for (const name of added.fresh) installed[name] = VERSION;
	if (Object.keys(installed).length) config.installed = installed;
	if (!opts.dryRun) writeConfig(cwd, config);

	return {
		config,
		add: added,
		...(css && { css }),
		layout: layoutCode(alias),
		warnings,
		dryRun: opts.dryRun,
	};
}

export function printInit(result: InitResult) {
	for (const warning of result.warnings) console.log(`${yellow("!")} ${warning}`);
	printAdd(result.add);
	if (result.css) console.log(`${green("✓")} ${result.css} imports labsui.css`);

	const { alias, root } = result.config;

	console.log(
		`${green("✓")} ${result.dryRun ? "Would write" : "Wrote"} ${CONFIG} (alias ${alias} → ${root})`,
	);
	console.log(`
${bold("Last step")}: wire the root layout (app/layout.tsx). Toaster and Confirmer come with
${bold("labsui add toast confirm")}; drop them if you don't use them.

${result.layout.replace(/^/gm, "  ")}

Then: ${bold("npx labsui add button")}. Check the setup any time: ${bold("npx labsui doctor")}
`);
}
