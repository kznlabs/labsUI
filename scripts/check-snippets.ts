import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Registry examples and usage lines, typechecked as a user's app would see them.
const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "node_modules", ".cache", "labsui-snippets");

type Item = {
	name: string;
	usage?: string;
	examples?: { name: string; code: string }[];
};

const { items } = JSON.parse(
	readFileSync(join(ROOT, "packages", "cli", "src", "registry.json"), "utf8"),
) as { items: Record<string, Item> };
const api = JSON.parse(
	readFileSync(join(ROOT, "src", "site", "api.generated.json"), "utf8"),
) as Record<string, { entries: { name: string }[] }>;

const owner = new Map<string, string>();

for (const [key, { entries }] of Object.entries(api))
	for (const { name } of entries) if (!owner.has(name)) owner.set(name, key);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

for (const item of Object.values(items)) {
	for (const example of item.examples ?? []) {
		mkdirSync(join(OUT, item.name), { recursive: true });
		writeFileSync(join(OUT, item.name, example.name), example.code);
	}

	if (!item.usage) continue;

	const names = new Set(
		[...item.usage.matchAll(/\b([A-Za-z]\w*)\b/g)]
			.map((match) => match[1] ?? "")
			.filter((name) => owner.has(name)),
	);
	const imports = [...names]
		.map(
			(name) =>
				`import { ${name} } from "@/${owner.get(name)?.replace(/^(ui|blocks)\//, "components/$1/")}";`,
		)
		.join("\n");
	const body = /^[<{]/.test(item.usage) ? `return <>${item.usage}</>;` : item.usage;

	writeFileSync(
		join(OUT, `${item.name}.usage.tsx`),
		`${imports}\n\nexport async function Usage() {\n\t${body}\n}\n`,
	);
}

writeFileSync(
	join(OUT, "tsconfig.json"),
	JSON.stringify({
		extends: "../../../tsconfig.json",
		compilerOptions: { incremental: false, plugins: [], noUnusedLocals: false },
		include: ["**/*.tsx", "../../../src/**/*.d.ts"],
		exclude: [],
	}),
);

const tsc = spawnSync(
	join(ROOT, "node_modules", ".bin", "tsc"),
	["-p", join(OUT, "tsconfig.json")],
	{
		encoding: "utf8",
		shell: process.platform === "win32",
	},
);

if (tsc.error) throw tsc.error;

// Usage lines leave the reader's own state undeclared (`value={v}`); only those errors pass.
const errors = tsc.stdout
	.split("\n")
	.filter((line) => /error TS/.test(line))
	.filter((line) => !(/\.usage\.tsx/.test(line) && /TS(2304|2552|7006|18004|18046)/.test(line)));

if (errors.length) {
	console.error(`snippets: ${errors.length} type errors\n  ${errors.join("\n  ")}`);
	process.exit(1);
}

console.log(`snippets: ${Object.keys(items).length} items typecheck`);
