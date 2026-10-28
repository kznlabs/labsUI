import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { bold, CliError } from "./log.ts";
import type { Config } from "./types.ts";

export const CONFIG = "labsui.json";

/** tsconfig is JSONC: comments and trailing commas. */
function parseJsonc(text: string) {
	let out = "";
	let inString = false;

	for (let i = 0; i < text.length; i++) {
		const char = text[i];

		if (inString) {
			out += char;
			if (char === "\\") out += text[++i] ?? "";
			else if (char === '"') inString = false;
		} else if (char === '"') {
			inString = true;
			out += char;
		} else if (char === "/" && text[i + 1] === "/") {
			while (i < text.length && text[i] !== "\n") i++;
			out += "\n";
		} else if (char === "/" && text[i + 1] === "*") {
			i += 2;
			while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i++;
			i++;
		} else out += char;
	}

	return JSON.parse(out.replace(/,(\s*[}\]])/g, "$1"));
}

/** The `X/*` path alias and the folder it points to, e.g. `@/` and `src`. */
export function detectAlias(cwd: string): { alias: string; root: string } {
	for (const name of ["tsconfig.json", "jsconfig.json"]) {
		const file = join(cwd, name);

		if (!existsSync(file)) continue;

		const json = parseJsonc(readFileSync(file, "utf8"));
		const opts = json.compilerOptions ?? {};
		const paths: Record<string, string[]> = opts.paths ?? {};
		const baseUrl = opts.baseUrl ?? ".";
		const keys = Object.keys(paths).filter((key) => key.endsWith("/*"));
		const key = keys.find((key) => key === "@/*") ?? keys[0];
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

export function readPackage(cwd: string): {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
} {
	const file = join(cwd, "package.json");

	if (!existsSync(file))
		throw new CliError(`No package.json in ${cwd}. Run labsui in your project folder.`);

	return JSON.parse(readFileSync(file, "utf8"));
}

// Real imports only: labsui.css itself mentions `@import "tailwindcss"` in a comment.
export const TAILWIND_IMPORT = /^[ \t]*@import\s+["']tailwindcss["'][^;]*;/m;

const importsTailwind = (file: string) =>
	TAILWIND_IMPORT.test(readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, ""));

/** The stylesheet that imports Tailwind: where `@import "./labsui.css"` goes. */
export function findCss(cwd: string, root: string): string | undefined {
	const candidates = [
		"app/globals.css",
		"styles/globals.css",
		"app/global.css",
		"index.css",
		"styles.css",
		"app.css",
	].flatMap((file) => [join(cwd, root, file), join(cwd, file)]);

	for (const candidate of candidates)
		if (existsSync(candidate) && importsTailwind(candidate)) return candidate;

	const walk = (dir: string, depth: number): string | undefined => {
		if (depth > 3 || !existsSync(dir)) return;

		for (const entry of readdirSync(dir)) {
			if (entry === "node_modules" || entry === "labsui.css" || entry.startsWith(".")) continue;

			const path = join(dir, entry);

			if (statSync(path).isDirectory()) {
				const hit = walk(path, depth + 1);

				if (hit) return hit;
			} else if (entry.endsWith(".css") && importsTailwind(path)) return path;
		}
	};

	return walk(join(cwd, root), 0);
}

export function readConfig(cwd: string): Config | undefined {
	const file = join(cwd, CONFIG);

	return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as Config) : undefined;
}

export function writeConfig(cwd: string, config: Config) {
	writeFileSync(join(cwd, CONFIG), `${JSON.stringify(config, null, 2)}\n`);
}

/** Notes which version wrote these items, in an existing labsui.json. */
export function recordInstalled(cwd: string, names: string[], version: string) {
	const config = readConfig(cwd);

	if (!config || !names.length) return;

	const installed = { ...config.installed };

	for (const name of names) installed[name] = version;
	writeConfig(cwd, {
		...config,
		installed: Object.fromEntries(Object.entries(installed).sort(([a], [b]) => a.localeCompare(b))),
	});
}

export function loadConfig(cwd: string, registry?: string): Config {
	const config = readConfig(cwd);

	if (!config)
		throw new CliError(`No ${CONFIG} here. Run ${bold("npx @kznlabs/labsui init")} first.`);

	return registry ? { ...config, registry } : config;
}
