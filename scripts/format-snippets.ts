import { writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { format } from "prettier";
import { highlightCode, languageOf } from "../src/lib/highlight";
import { registry } from "../src/site/registry";
import { snippets } from "../src/site/snippets";
import { guide, installCommand } from "../src/site/static-code";
import { ROOT } from "./imports";

/**
 * The site's code samples, formatted and highlighted once here instead of in every visitor's
 * browser (no Prettier or Shiki download). Same result as CodePanel's `format`: default options,
 * babel-ts, no semicolon on a bare JSX line.
 */
const OUT = join(ROOT, "src", "site", "snippets.formatted.json");

async function prettify(name: string, code: string) {
	if (!/\.(tsx?|jsx?)$/.test(name)) return code;

	let out = (await format(code, { parser: "babel-ts" })).trimEnd();

	if (code.trimStart().startsWith("<") && !code.trimEnd().endsWith(";"))
		out = out.replace(/;$/, "");

	return out;
}

type Tokens = NonNullable<Awaited<ReturnType<typeof highlightCode>>>;

const sections: Record<string, { name: string; code: string; tokens?: Tokens }[]> = {};

for (const entry of registry)
	sections[entry.id] = await Promise.all(
		(snippets[entry.id] ?? [{ name: entry.file, code: entry.usage }]).map(async (file) => {
			const first = file.name.split("·")[0]?.trim() ?? "";
			const code = await prettify(first, file.code);
			const tokens = await highlightCode(code, languageOf(first));

			return { name: file.name, code, ...(tokens && { tokens }) };
		}),
	);

// Code shown as-is elsewhere: install lines and Getting started.
const prebuilt: Record<string, Record<string, Tokens>> = {};
const statics: [code: string, language: string][] = [
	...registry.map((entry) => [installCommand(entry.file), "bash"] as [string, string]),
	[guide.init, "bash"],
	[guide.add, "bash"],
	[guide.layout, "tsx"],
	[guide.usage, "tsx"],
	[guide.theming, "ts"],
];

for (const [code, language] of statics) {
	const tokens = await highlightCode(code, language);

	if (!tokens) continue;
	prebuilt[language] ??= {};
	prebuilt[language][code] = tokens;
}

writeFileSync(OUT, `${JSON.stringify({ sections, prebuilt })}\n`);
console.log(
	`snippets: ${registry.length} sections and ${statics.length} lines highlighted → ${relative(ROOT, OUT)}`,
);
