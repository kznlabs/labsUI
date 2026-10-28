// Usage: bun scripts/affected.ts [base-ref]. Prints "all", page ids, or nothing.
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { imports, local, SRC } from "./imports";

type Entry = { id: string; file: string };

// Changes here affect every page.
const GLOBAL = [
	/^src\/(?!components\/|lib\/)/,
	/^tests\/e2e\//,
	/^public\//,
	/^scripts\//,
	/^\.github\/workflows\/e2e\.yml$/,
	/^(package\.json|bun\.lock|next\.config\.ts|postcss\.config\.mjs|tsconfig\.json)$/,
];

/** Pages that render a changed file, following imports backwards. */
export function affectedPages(
	changed: string[],
	registry: Entry[],
	graph: Map<string, string[]>,
): "all" | string[] {
	const dependents = new Map<string, string[]>();

	for (const [file, deps] of graph)
		for (const dep of deps) dependents.set(dep, [...(dependents.get(dep) ?? []), file]);

	const ids = new Set<string>();

	for (const path of changed) {
		if (GLOBAL.some((pattern) => pattern.test(path))) return "all";
		if (!/^src\/(components|lib)\//.test(path)) continue;

		const reached = new Set([path.slice("src/".length)]);

		for (const file of reached)
			for (const dependent of dependents.get(file) ?? []) reached.add(dependent);

		const hits = registry.filter((entry) =>
			entry.file
				.split("·")
				.some((part) =>
					["components/", "components/ui/"].some((dir) => reached.has(dir + part.trim())),
				),
		);

		// Deleted or not rendered by any page: run everything.
		if (!hits.length) return "all";
		for (const hit of hits) ids.add(hit.id);
	}

	return [...ids].sort();
}

function walk(dir: string): string[] {
	return readdirSync(join(SRC, dir), { withFileTypes: true }).flatMap((child) =>
		child.isDirectory()
			? walk(`${dir}/${child.name}`)
			: /\.tsx?$/.test(child.name)
				? [`${dir}/${child.name}`]
				: [],
	);
}

if (import.meta.main) {
	const { registry } = await import("../src/site/registry");
	const graph = new Map<string, string[]>();

	for (const file of [...walk("components"), ...walk("lib")])
		graph.set(
			file,
			imports(readFileSync(join(SRC, file), "utf8"))
				.map((spec) => local(spec, file))
				.filter((file): file is string => file !== null),
		);

	const git = (...args: string[]) =>
		execFileSync("git", args, { encoding: "utf8" }).split("\n").filter(Boolean);
	const base = git("merge-base", process.argv[2] ?? "origin/main", "HEAD")[0] ?? "HEAD";
	const changed = [
		...git("diff", "--name-only", base),
		...git("ls-files", "--others", "--exclude-standard"),
	];
	const pages = affectedPages(changed, registry, graph);

	console.log(pages === "all" ? "all" : pages.join(","));
}
