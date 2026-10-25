#!/usr/bin/env node
/**
 * labsui: copy labsUI components into your project, shadcn-style.
 *
 *   npx labsui init            styles, theme, utils, motion provider; wires your CSS
 *   npx labsui add button tabs  components plus everything they import
 *   npx labsui list             what can be added
 *
 * Files land at their registry path under your `@/*` alias root (src/ or the project root), so
 * `@/components/ui/button` imports keep working. The registry ships inside the package (built
 * by scripts/build-registry.ts), so it works offline and each version pins its components;
 * `--registry <url>` reads a hosted one instead. Zero dependencies: Node 18+ fetch and fs.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { parseArgs } from "node:util";
import manifest from "../jsr.json" with { type: "json" };
import bundled from "./registry.json" with { type: "json" };

const VERSION = manifest.version;
const CONFIG = "labsui.json";

/** A hosted registry base URL, or undefined for the one bundled with this version. */
type Source = string | undefined;
type Config = { registry?: string; alias: string; root: string; css?: string };
type RegistryFile = { path: string; type: string; target?: string; content: string };
type RegistryItem = {
	name: string;
	type: string;
	title?: string;
	description?: string;
	dependencies?: string[];
	registryDependencies?: string[];
	files: RegistryFile[];
};
type IndexItem = { name: string; type: string; title?: string; description?: string };

const color = (code: number) => (s: string) =>
	process.stdout.isTTY && !process.env.NO_COLOR ? `\x1b[${code}m${s}\x1b[0m` : s;
const dim = color(2);
const green = color(32);
const yellow = color(33);
const red = color(31);
const bold = color(1);

class CliError extends Error {}

const HELP = `${bold("labsui")} ${dim(`v${VERSION}`)}: add labsUI components to your project

${bold("Usage")}
  labsui init                  set up styles, theme and helpers (run once)
  labsui add <name...>         add components and everything they import
  labsui add --all             add every component and block
  labsui list                  list what can be added

${bold("Options")}
  --cwd <dir>        project directory (default: current)
  --registry <url>   read a hosted registry (default: the one bundled with labsui)
  --overwrite        replace files that already exist
  --dry-run          show what would change, write nothing
  --no-install       skip installing npm dependencies
  -h, --help         show this help
  -v, --version      show the version
`;

async function main() {
	const { values, positionals } = parseArgs({
		allowPositionals: true,
		options: {
			cwd: { type: "string" },
			registry: { type: "string" },
			overwrite: { type: "boolean", default: false },
			"dry-run": { type: "boolean", default: false },
			"no-install": { type: "boolean", default: false },
			all: { type: "boolean", default: false },
			help: { type: "boolean", short: "h", default: false },
			version: { type: "boolean", short: "v", default: false },
		},
	});
	if (values.version) return console.log(VERSION);
	const [command, ...names] = positionals;
	if (values.help || !command) return console.log(HELP);

	const cwd = resolve(values.cwd ?? process.cwd());
	const registry = values.registry ?? process.env.LABSUI_REGISTRY;
	const opts = {
		overwrite: values.overwrite,
		dryRun: values["dry-run"],
		install: !values["no-install"],
	};

	switch (command) {
		case "init":
			return init(cwd, registry, opts);
		case "add": {
			const config = loadConfig(cwd, registry);
			let wanted = names;
			if (values.all) {
				const index = await fetchIndex(config.registry);
				wanted = index
					.filter((i) => i.type === "registry:ui" || i.type === "registry:block")
					.map((i) => i.name);
			}
			if (!wanted.length) throw new CliError("Name at least one component: labsui add button");
			return add(cwd, config, wanted, opts);
		}
		case "list": {
			return list(await fetchIndex(registry ?? readConfig(cwd)?.registry));
		}
		default:
			throw new CliError(`Unknown command "${command}". Run labsui --help.`);
	}
}

/* ----------------------------------------------------------------------------------------------
 * Project detection
 * -------------------------------------------------------------------------------------------- */

/** JSONC as tsconfig allows it: comments and trailing commas. */
function parseJsonc(text: string) {
	let out = "";
	let inString = false;
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (inString) {
			out += c;
			if (c === "\\") out += text[++i] ?? "";
			else if (c === '"') inString = false;
		} else if (c === '"') {
			inString = true;
			out += c;
		} else if (c === "/" && text[i + 1] === "/") {
			while (i < text.length && text[i] !== "\n") i++;
			out += "\n";
		} else if (c === "/" && text[i + 1] === "*") {
			i += 2;
			while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i++;
			i++;
		} else out += c;
	}
	return JSON.parse(out.replace(/,(\s*[}\]])/g, "$1"));
}

/** The `X/*` path alias and the folder it points to, e.g. `@/` → `src`. */
function detectAlias(cwd: string): { alias: string; root: string } {
	for (const name of ["tsconfig.json", "jsconfig.json"]) {
		const file = join(cwd, name);
		if (!existsSync(file)) continue;
		const json = parseJsonc(readFileSync(file, "utf8"));
		const opts = json.compilerOptions ?? {};
		const paths: Record<string, string[]> = opts.paths ?? {};
		const baseUrl = opts.baseUrl ?? ".";
		const keys = Object.keys(paths).filter((k) => k.endsWith("/*"));
		const key = keys.find((k) => k === "@/*") ?? keys[0];
		const target = key && paths[key]?.[0];
		if (key && target)
			return {
				alias: key.slice(0, -1),
				root:
					relative(cwd, join(cwd, baseUrl, target.replace(/\/?\*$/, ""))).replaceAll("\\", "/") ||
					".",
			};
	}
	throw new CliError(
		'No path alias found. Add one to tsconfig.json, e.g. "compilerOptions": { "paths": { "@/*": ["./src/*"] } }',
	);
}

function readPackage(cwd: string): {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
} {
	const file = join(cwd, "package.json");
	if (!existsSync(file))
		throw new CliError(`No package.json in ${cwd}. Run labsui in your project folder.`);
	return JSON.parse(readFileSync(file, "utf8"));
}

function packageManager(cwd: string) {
	const ua = process.env.npm_config_user_agent ?? "";
	if (existsSync(join(cwd, "bun.lock")) || existsSync(join(cwd, "bun.lockb"))) return "bun";
	if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
	if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
	if (existsSync(join(cwd, "package-lock.json"))) return "npm";
	for (const pm of ["bun", "pnpm", "yarn"]) if (ua.startsWith(pm)) return pm;
	return "npm";
}

/** The stylesheet that imports Tailwind: where `@import "./labsui.css"` goes. */
function findCss(cwd: string, root: string): string | undefined {
	const candidates = [
		"app/globals.css",
		"styles/globals.css",
		"app/global.css",
		"index.css",
		"styles.css",
		"app.css",
	].flatMap((f) => [join(cwd, root, f), join(cwd, f)]);
	for (const f of candidates)
		if (existsSync(f) && /@import\s+["']tailwindcss["']/.test(readFileSync(f, "utf8"))) return f;
	// Fall back to a shallow search of the alias root.
	const walk = (dir: string, depth: number): string | undefined => {
		if (depth > 3 || !existsSync(dir)) return;
		for (const entry of readdirSync(dir)) {
			if (entry === "node_modules" || entry.startsWith(".")) continue;
			const p = join(dir, entry);
			if (statSync(p).isDirectory()) {
				const hit = walk(p, depth + 1);
				if (hit) return hit;
			} else if (
				entry.endsWith(".css") &&
				/@import\s+["']tailwindcss["']/.test(readFileSync(p, "utf8"))
			)
				return p;
		}
	};
	return walk(join(cwd, root), 0);
}

function readConfig(cwd: string): Config | undefined {
	const file = join(cwd, CONFIG);
	return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as Config) : undefined;
}

function loadConfig(cwd: string, registry?: string): Config {
	const config = readConfig(cwd);
	if (!config) throw new CliError(`No ${CONFIG} here. Run ${bold("npx labsui init")} first.`);
	return registry ? { ...config, registry } : config;
}

/* ----------------------------------------------------------------------------------------------
 * Registry
 * -------------------------------------------------------------------------------------------- */

const trimSlash = (url: string) => url.replace(/\/+$/, "");

async function fetchJson<T>(url: string): Promise<T> {
	let res: Response;
	try {
		res = await fetch(url);
	} catch (err) {
		throw new CliError(`Could not reach ${url}: ${(err as Error).message}`);
	}
	if (res.status === 404) throw new CliError(`Not found: ${url}`);
	if (!res.ok) throw new CliError(`${url} answered ${res.status}`);
	return (await res.json()) as T;
}

async function fetchIndex(source: Source): Promise<IndexItem[]> {
	if (!source) return bundled.index;
	return (await fetchJson<{ items: IndexItem[] }>(`${trimSlash(source)}/index.json`)).items;
}

async function fetchItem(source: Source, name: string): Promise<RegistryItem> {
	if (source) return fetchJson<RegistryItem>(`${trimSlash(source)}/${name}.json`);
	const item = (bundled.items as Record<string, RegistryItem>)[name];
	if (!item) throw new CliError(`Not found: ${name}`);
	return item;
}

/** `https://…/r/button.json`, `button.json` or `button` → `button`. Anything else is refused. */
function itemName(ref: string) {
	const name =
		ref
			.split("/")
			.pop()
			?.replace(/\.json$/, "") ?? "";
	if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) throw new CliError(`Invalid component name "${ref}"`);
	return name;
}

/**
 * npm package specs as the registry writes them (`motion@14.6.0`, `@scope/pkg@^1.2.0`). The
 * registry is remote, so anything else (flags, spaces, shell characters) is refused.
 */
const PACKAGE_SPEC = /^(@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*(@[\w.^~*+-]+)?$/i;

/** Where a registry file goes: inside the alias folder, or the install is refused. */
function safeTarget(base: string, path: string) {
	const target = resolve(base, path);
	const rel = relative(base, target);
	if (isAbsolute(path) || !rel || rel.startsWith("..") || isAbsolute(rel))
		throw new CliError(`Refusing to write outside ${base}: ${path}`);
	return target;
}

/** The items and everything they depend on, each once. */
async function resolveItems(source: Source, names: string[]) {
	// Marked before the fetch: siblings resolve in parallel and often share dependencies.
	const seen = new Set<string>();
	const order: RegistryItem[] = [];
	const visit = async (name: string, from?: string) => {
		if (seen.has(name)) return;
		seen.add(name);
		let item: RegistryItem;
		try {
			item = await fetchItem(source, name);
		} catch (err) {
			if (err instanceof CliError && err.message.startsWith("Not found"))
				throw new CliError(
					from
						? `${from} needs "${name}", which the registry does not have`
						: `No component named "${name}". Run labsui list.`,
				);
			throw err;
		}
		await Promise.all((item.registryDependencies ?? []).map((d) => visit(itemName(d), name)));
		order.push(item);
	};
	for (const n of names) await visit(itemName(n));
	return order;
}

/* ----------------------------------------------------------------------------------------------
 * Commands
 * -------------------------------------------------------------------------------------------- */

type Opts = { overwrite: boolean; dryRun: boolean; install: boolean };

/** Rewrites `@/` imports when the project uses another alias, e.g. `~/`. */
function rewriteAlias(content: string, alias: string) {
	return alias === "@/" ? content : content.replace(/(["'])@\//g, `$1${alias}`);
}

async function add(cwd: string, config: Config, names: string[], opts: Opts) {
	const base = resolve(cwd, config.root);
	if (base !== cwd && !base.startsWith(cwd + sep))
		throw new CliError(`"root" in ${CONFIG} must be inside the project: ${config.root}`);
	const items = await resolveItems(config.registry, names);
	const pkg = readPackage(cwd);
	const installed = { ...pkg.dependencies, ...pkg.devDependencies };

	const written: string[] = [];
	const skipped: string[] = [];
	const deps = new Set<string>();
	for (const item of items) {
		for (const dep of item.dependencies ?? []) {
			if (!PACKAGE_SPEC.test(dep)) throw new CliError(`${item.name}: invalid dependency "${dep}"`);
			const name = dep.replace(/(?<=.)@[^@]*$/, "");
			if (!installed[name]) deps.add(dep);
		}
		for (const file of item.files) {
			const target = safeTarget(base, file.target ?? file.path);
			const shown = relative(cwd, target).replaceAll("\\", "/");
			if (existsSync(target) && !opts.overwrite) {
				skipped.push(shown);
				continue;
			}
			if (!opts.dryRun) {
				mkdirSync(dirname(target), { recursive: true });
				writeFileSync(target, rewriteAlias(file.content, config.alias));
			}
			written.push(shown);
		}
	}

	const verb = opts.dryRun ? "Would write" : "Wrote";
	if (written.length)
		console.log(
			`${green("✓")} ${verb} ${written.length} file(s):\n${written.map((f) => dim(`  ${f}`)).join("\n")}`,
		);
	if (skipped.length)
		console.log(
			`${yellow("•")} Kept ${skipped.length} existing file(s) (--overwrite replaces them):\n${skipped.map((f) => dim(`  ${f}`)).join("\n")}`,
		);
	installDeps(cwd, [...deps], opts);
	return items;
}

function installDeps(cwd: string, deps: string[], opts: Opts) {
	if (!deps.length) return;
	const pm = packageManager(cwd);
	const args = [pm === "npm" ? "install" : "add", ...deps];
	if (opts.dryRun || !opts.install) {
		console.log(`${yellow("•")} Install these yourself: ${bold(`${pm} ${args.join(" ")}`)}`);
		return;
	}
	console.log(dim(`$ ${pm} ${args.join(" ")}`));
	// Windows runs npm/pnpm/yarn through .cmd shims, which need a shell. Every arg passed
	// PACKAGE_SPEC (no quotes or shell characters), and quoting keeps cmd.exe from eating `^`.
	const win = process.platform === "win32";
	const run = spawnSync(pm, win ? args.map((a) => `"${a}"`) : args, {
		cwd,
		stdio: "inherit",
		shell: win,
	});
	if (run.status !== 0)
		throw new CliError(`${pm} failed. Install manually: ${pm} ${args.join(" ")}`);
	console.log(`${green("✓")} Installed ${deps.length} package(s)`);
}

async function init(cwd: string, registryFlag: string | undefined, opts: Opts) {
	const pkg = readPackage(cwd);
	const all = { ...pkg.dependencies, ...pkg.devDependencies };
	const tw = all.tailwindcss ?? all["@tailwindcss/postcss"] ?? all["@tailwindcss/vite"];
	if (!tw)
		console.log(`${yellow("!")} Tailwind CSS v4 not found in package.json; labsUI needs it.`);
	else if (/^[~^]?3\./.test(tw))
		console.log(`${yellow("!")} Tailwind ${tw} found; labsUI needs v4.`);
	if (!all.react) console.log(`${yellow("!")} React not found in package.json.`);

	const { alias, root } = detectAlias(cwd);
	const existing = readConfig(cwd);
	// Only a hosted registry is recorded; without one, the bundled registry is used.
	const registry = registryFlag ?? existing?.registry;
	const config: Config = { ...(registry && { registry }), alias, root };

	await add(cwd, config, ["styles", "utils", "theme", "motion-provider"], opts);

	// Import the stylesheet right after Tailwind in the CSS entry.
	const css = findCss(cwd, root);
	const sheet = join(cwd, root, "styles/labsui.css");
	if (css) {
		config.css = relative(cwd, css).replaceAll("\\", "/");
		let spec = relative(dirname(css), sheet).replaceAll("\\", "/");
		if (!spec.startsWith(".")) spec = `./${spec}`;
		const text = readFileSync(css, "utf8");
		// A starter stylesheet (create-next-app ships one) redefines the palette and the font.
		const clashes = [
			...new Set(
				[
					...text.matchAll(
						/(--(?:background|foreground|primary|border|radius))\s*:|(font-family)\s*:/g,
					),
				].map((m) => m[1] ?? m[2]),
			),
		];
		if (clashes.length)
			console.log(
				`${yellow("!")} ${config.css} sets ${clashes.join(", ")}, overriding labsUI's palette and font. Remove those rules (often create-next-app boilerplate) unless you mean to customize them.`,
			);
		if (text.includes(spec)) console.log(`${green("✓")} ${config.css} already imports labsui.css`);
		else {
			const next = text.replace(/(@import\s+["']tailwindcss["'][^;]*;)/, `$1\n@import "${spec}";`);
			if (!opts.dryRun) writeFileSync(css, next);
			console.log(`${green("✓")} Added @import "${spec}" to ${config.css}`);
		}
	} else
		console.log(
			`${yellow("!")} No CSS file importing Tailwind found. Add to it: @import "tailwindcss"; @import "<path>/styles/labsui.css";`,
		);

	if (!opts.dryRun) writeFileSync(join(cwd, CONFIG), `${JSON.stringify(config, null, 2)}\n`);
	console.log(
		`${green("✓")} ${opts.dryRun ? "Would write" : "Wrote"} ${CONFIG} (alias ${alias} → ${root})`,
	);

	console.log(`
${bold("Last step")}: wire the root layout (app/layout.tsx). Toaster and Confirmer come with
${bold("labsui add toast confirm")}; drop them if you don't use them.

  import { MotionProvider } from "${alias}components/motion-provider";
  import { themeScript } from "${alias}lib/theme";

  <html lang="en" suppressHydrationWarning>
    <head>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
    </head>
    <body>
      <MotionProvider>{children}</MotionProvider>
    </body>
  </html>

Then: ${bold("npx labsui add button")}
`);
}

function list(items: IndexItem[]) {
	const groups: [string, string][] = [
		["Components", "registry:ui"],
		["Blocks", "registry:block"],
	];
	for (const [label, type] of groups) {
		const rows = items.filter((i) => i.type === type);
		if (!rows.length) continue;
		console.log(`\n${bold(label)} ${dim(`(${rows.length})`)}`);
		const width = Math.max(...rows.map((r) => r.name.length));
		for (const r of rows) {
			const desc = r.description ? r.description.split(/(?<=\.)\s/)[0] : "";
			const max = (process.stdout.columns || 100) - width - 6;
			console.log(
				`  ${r.name.padEnd(width)}  ${dim(desc.length > max ? `${desc.slice(0, max - 1)}…` : desc)}`,
			);
		}
	}
	console.log(`\n${dim("Add one with: npx labsui add <name>")}`);
}

main().catch((err) => {
	if (err instanceof CliError) {
		console.error(`${red("✗")} ${err.message}`);
		process.exit(1);
	}
	throw err;
});
