import { existsSync } from "node:fs";
import { basename, join, posix } from "node:path";

export const ROOT = join(import.meta.dirname, "..");
export const SRC = join(ROOT, "src");

export function stem(file: string) {
	return basename(file).replace(/\.(tsx?|css)$/, "");
}

/** Static and dynamic import specifiers. Code in template literals (snippets) has none here. */
export function imports(code: string) {
	const found = new Set<string>();

	for (const pattern of [
		/^\s*(?:import|export)\s[^;]*?\sfrom\s*["']([^"']+)["']/gm,
		/^\s*import\s*["']([^"']+)["']/gm,
		/\bimport\(\s*["']([^"']+)["']\s*\)/g,
	])
		for (const match of code.matchAll(pattern)) if (match[1]) found.add(match[1]);

	return [...found];
}

/** The file an import points to, relative to `src/` (`lib/use-anchor.ts` for `@/lib/use-anchor`); null for packages. */
export function local(spec: string, from: string) {
	let base: string;

	if (spec.startsWith("@/")) base = spec.slice(2);
	else if (spec.startsWith(".")) base = posix.join(posix.dirname(from), spec);
	else return null;
	for (const ext of ["", ".ts", ".tsx", ".css"])
		if (existsSync(join(SRC, base + ext)) && /\.\w+$/.test(base + ext)) return base + ext;
	throw new Error(`${from}: cannot resolve ${spec}`);
}
