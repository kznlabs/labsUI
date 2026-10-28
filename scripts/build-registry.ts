import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import apiJson from "../src/site/api.generated.json";
import { componentPath, site } from "../src/site/config";
import { registry as showcase } from "../src/site/registry";
import { snippets } from "../src/site/snippets";
import { imports, local, ROOT, SRC, stem } from "./imports";
import { indexSchema, itemSchema } from "./registry-schema";

const OUT = join(ROOT, "public", "r");
const CLI_BUNDLE = join(ROOT, "packages", "cli", "src", "registry.json");
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
type Item = {
	name: string;
	type: Kind;
	file: string;
	title?: string;
	description?: string;
	mount?: string;
	docs?: string;
	usage?: string;
	examples?: { name: string; code: string }[];
};

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
	dependencies: Record<string, string>;
};

const list = (dir: string) =>
	readdirSync(join(SRC, dir))
		.filter((file) => /\.(tsx?|css)$/.test(file))
		.map((file) => `${dir}/${file}`);

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

type FileApi = {
	entries: {
		name: string;
		description?: string;
		props?: { name: string; description?: string }[];
	}[];
	types: Record<string, string>;
};

const api = apiJson as Record<string, FileApi>;

/** Words from the API docs (`promise` from `toast.promise`) and prop names, for `labsui search`. */
const keywords = (fileApi: FileApi | undefined) => {
	const text = (fileApi?.entries ?? [])
		.flatMap((entry) => [
			entry.description ?? "",
			...(entry.props ?? []).flatMap((prop) => [prop.name, prop.description ?? ""]),
		])
		.join(" ")
		.toLowerCase();

	return [...new Set(text.match(/[a-z][a-z0-9]{2,}/g) ?? [])].sort();
};

/** Exported values, not types: what `list` shows and `search` matches. */
const exportNames = (content: string) =>
	[...content.matchAll(/^export (?:async )?(?:function|const|class) (\w+)/gm)].map(
		(match) => match[1],
	);

/** The package of an import: `motion` for `motion/react`, `@scope/pkg` for `@scope/pkg/sub`. */
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

for (const root of entries) add(root);

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

for (const section of showcase)
	for (const part of section.file.split("·").map((file) => file.trim()))
		for (const candidate of items.values())
			if (candidate.file.endsWith(`/${part}`) || candidate.file === `components/${part}`) {
				candidate.title ??= section.name;
				candidate.description ??= section.description;
				candidate.docs ??= `${site.url}${componentPath(section.id)}`;
				candidate.usage ??= section.usage;
				candidate.examples ??= snippets[section.id];
				if (section.mount && candidate.file.endsWith(`/${section.file}`))
					candidate.mount = section.mount;
			}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const ITEM_SCHEMA = `${BASE}/registry-item.schema.json`;
const INDEX_SCHEMA = `${BASE}/registry.schema.json`;
const writeJson = (file: string, data: unknown) =>
	writeFileSync(join(OUT, file), `${JSON.stringify(data, null, "\t")}\n`);

writeJson("registry-item.schema.json", itemSchema(ITEM_SCHEMA));
writeJson("registry.schema.json", indexSchema(INDEX_SCHEMA));

const index: {
	name: string;
	type: Kind;
	title?: string;
	description?: string;
	exports: string[];
	keywords: string[];
	registryDependencies: string[];
}[] = [];
const bundle: Record<string, unknown> = {};

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
	const apiKey = it.file.replace(/^components\//, "").replace(/\.tsx?$/, "");
	const fileApi = api[apiKey];

	// Hooks and helpers have no docs entry: their main export's JSDoc describes them.
	it.description ??= fileApi?.entries.find((entry) => entry.description)?.description;

	const json = {
		$schema: ITEM_SCHEMA,
		name: it.name,
		type: it.type,
		...(it.title && { title: it.title }),
		...(it.description && { description: it.description }),
		...(it.docs && { docs: it.docs }),
		...(it.mount && { mount: it.mount }),
		...(it.usage && { usage: it.usage }),
		...(it.examples && { examples: it.examples }),
		...(fileApi && { api: fileApi }),
		dependencies: [...deps].sort(),
		registryDependencies: names.map((name) => `${BASE}/${name}.json`),
		files: [
			{
				path: it.file,
				type: it.type,
				content,
			},
		],
	};

	writeJson(`${it.name}.json`, json);
	bundle[it.name] = json;
	index.push({
		name: it.name,
		type: it.type,
		title: it.title,
		description: it.description,
		exports: it.file.endsWith(".css") ? [] : exportNames(content),
		keywords: keywords(fileApi),
		registryDependencies: names,
	});
}

writeJson("index.json", {
	$schema: INDEX_SCHEMA,
	name: "labsui",
	homepage: site.url,
	items: index,
});
// The CLI ships the whole registry, so `npx labsui add` needs no server and each CLI version
// pins the components it installs.
writeFileSync(CLI_BUNDLE, `${JSON.stringify({ items: bundle, index })}\n`);

console.log(
	`registry: ${index.length} items → ${relative(ROOT, OUT)} (${BASE}) + ${relative(ROOT, CLI_BUNDLE)}`,
);
