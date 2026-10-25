/**
 * Builds the install registry served at /r: one JSON per installable item plus /r/index.json.
 * Items follow shadcn's registry-item schema, so `npx shadcn add <url>` works too; the labsui CLI
 * reads the same files. Dependencies are read from each file's imports, so nothing is listed by
 * hand: `@/components/ui/*`, `@/components/blocks/*` and `@/lib/*` become registry dependencies,
 * bare imports become npm dependencies (versions from package.json).
 *
 * Run: bun scripts/build-registry.ts (part of `bun run build`).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, posix, relative } from "node:path";
import { registry as showcase } from "../src/lib/registry";
import { site } from "../src/lib/site";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "src");
const OUT = join(ROOT, "public", "r");
const BASE = `${(process.env.NEXT_PUBLIC_SITE_URL ?? site.url).replace(/\/$/, "")}/r`;

/** Supplied by the host app, never installed by the CLI. */
const PEERS = new Set(["react", "react-dom", "next"]);

type Kind =
	| "registry:ui"
	| "registry:block"
	| "registry:lib"
	| "registry:hook"
	| "registry:component"
	| "registry:file";
type Item = { name: string; type: Kind; file: string; title?: string; description?: string };

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
	dependencies: Record<string, string>;
};

const list = (dir: string) =>
	readdirSync(join(SRC, dir))
		.filter((f) => /\.(tsx?|css)$/.test(f))
		.map((f) => `${dir}/${f}`);

/** Entry items: every primitive, every block, the motion provider and the stylesheet. */
const entries: Item[] = [
	...list("components/ui").map((file) => ({
		name: stem(file),
		type: "registry:ui" as const,
		file,
	})),
	...list("components/blocks").map((file) => ({
		name: stem(file),
		type: "registry:block" as const,
		file,
	})),
	{ name: "motion-provider", type: "registry:component", file: "components/motion-provider.tsx" },
	{ name: "styles", type: "registry:file", file: "styles/labsui.css" },
];

function stem(file: string) {
	return basename(file).replace(/\.(tsx?|css)$/, "");
}

/** Static and dynamic import specifiers. Code in template literals (snippets) has none here. */
function imports(code: string) {
	const found = new Set<string>();
	for (const re of [
		/^\s*(?:import|export)\s[^;]*?\sfrom\s*["']([^"']+)["']/gm,
		/^\s*import\s*["']([^"']+)["']/gm,
		/\bimport\(\s*["']([^"']+)["']\s*\)/g,
	])
		for (const m of code.matchAll(re)) if (m[1]) found.add(m[1]);
	return [...found];
}

/** `@/lib/use-anchor` or `./button` → `lib/use-anchor.ts`; null for packages. */
function local(spec: string, from: string) {
	let base: string;
	if (spec.startsWith("@/")) base = spec.slice(2);
	else if (spec.startsWith(".")) base = posix.join(posix.dirname(from), spec);
	else return null;
	for (const ext of ["", ".ts", ".tsx", ".css"])
		if (existsSync(join(SRC, base + ext)) && /\.\w+$/.test(base + ext)) return base + ext;
	throw new Error(`${from}: cannot resolve ${spec}`);
}

/** `motion/react` → `motion`, `@scope/pkg/sub` → `@scope/pkg`. */
const packageName = (spec: string) =>
	spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : (spec.split("/")[0] ?? spec);

const items = new Map<string, Item>();
const byFile = new Map<string, Item>();
const add = (item: Item) => {
	const clash = items.get(item.name);
	if (clash && clash.file !== item.file)
		throw new Error(`Item name "${item.name}" is used by ${clash.file} and ${item.file}`);
	items.set(item.name, item);
	byFile.set(item.file, item);
};
for (const e of entries) add(e);

// Pull in every lib file the entries reach (utils, hooks, theme…), transitively.
const queue = [...entries];
while (queue.length) {
	const item = queue.shift() as Item;
	if (item.file.endsWith(".css")) continue;
	for (const spec of imports(readFileSync(join(SRC, item.file), "utf8"))) {
		const file = local(spec, item.file);
		if (!file || byFile.has(file)) continue;
		if (!file.startsWith("lib/") && !file.startsWith("components/"))
			throw new Error(`${item.file} imports ${file}, which is not installable`);
		const name = stem(file);
		const lib: Item = {
			name,
			type: name.startsWith("use-") ? "registry:hook" : "registry:lib",
			file,
		};
		add(lib);
		queue.push(lib);
	}
}

// Titles and descriptions from the showcase registry, where one entry names the file.
for (const s of showcase)
	for (const part of s.file.split("·").map((f) => f.trim()))
		for (const it of items.values())
			if (it.file.endsWith(`/${part}`) || it.file === `components/${part}`) {
				it.title ??= s.name;
				it.description ??= s.description;
			}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const index: {
	name: string;
	type: Kind;
	title?: string;
	description?: string;
	registryDependencies: string[];
}[] = [];
for (const it of [...items.values()].sort((a, b) => a.name.localeCompare(b.name))) {
	const content = readFileSync(join(SRC, it.file), "utf8");
	const deps = new Set<string>();
	const regDeps = new Set<string>();
	if (!it.file.endsWith(".css"))
		for (const spec of imports(content)) {
			const file = local(spec, it.file);
			if (file) {
				const dep = byFile.get(file);
				if (dep && dep !== it) regDeps.add(dep.name);
				continue;
			}
			const name = packageName(spec);
			if (PEERS.has(name)) continue;
			const range = pkg.dependencies[name];
			if (!range) throw new Error(`${it.file} imports ${name}, which is not in dependencies`);
			deps.add(`${name}@${range}`);
		}
	const names = [...regDeps].sort();
	const json = {
		$schema: "https://ui.shadcn.com/schema/registry-item.json",
		name: it.name,
		type: it.type,
		...(it.title && { title: it.title }),
		...(it.description && { description: it.description }),
		dependencies: [...deps].sort(),
		registryDependencies: names.map((n) => `${BASE}/${n}.json`),
		files: [
			{
				path: it.file,
				type: it.type,
				// shadcn needs a target for plain files; the labsui CLI writes every file at its path.
				...(it.type === "registry:file" && { target: it.file }),
				content,
			},
		],
	};
	writeFileSync(join(OUT, `${it.name}.json`), `${JSON.stringify(json, null, "\t")}\n`);
	index.push({
		name: it.name,
		type: it.type,
		title: it.title,
		description: it.description,
		registryDependencies: names,
	});
}

writeFileSync(
	join(OUT, "index.json"),
	`${JSON.stringify({ name: "labsui", homepage: site.url, items: index }, null, "\t")}\n`,
);
console.log(`registry: ${index.length} items → ${relative(ROOT, OUT)} (${BASE})`);
