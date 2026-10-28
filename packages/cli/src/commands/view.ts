import { bold } from "../log.ts";
import { KINDS, resolveItems } from "../registry.ts";
import type { ApiEntry, RegistryItem, Source } from "../types.ts";
import { rewriteAlias } from "./add.ts";

export type View = {
	name: string;
	kind: string;
	title?: string;
	description?: string;
	docs?: string;
	install: string;
	/** Registry items it brings along, transitively. */
	brings: string[];
	/** npm packages it needs, transitively. */
	packages: string[];
	mount?: string;
	usage?: string;
	api?: RegistryItem["api"];
	examples: { name: string; code: string }[];
	/** Source, with `source: true`. */
	files?: { path: string; content: string }[];
};

/** Everything an author (or an agent) needs before using an item, imports in the project's alias. */
export async function describe(
	source: Source,
	name: string,
	{ withSource = false, alias = "@/" } = {},
): Promise<View> {
	const order = await resolveItems(source, [name]);
	const item = order[order.length - 1] as RegistryItem;
	const packages = [...new Set(order.flatMap((i) => i.dependencies ?? []))].sort();

	return {
		name: item.name,
		kind: KINDS[item.type] ?? item.type,
		...(item.title && { title: item.title }),
		...(item.description && { description: item.description }),
		...(item.docs && { docs: item.docs }),
		install: `npx labsui add ${item.name}`,
		brings: order
			.slice(0, -1)
			.map((i) => i.name)
			.sort(),
		packages,
		...(item.mount && { mount: item.mount }),
		...(item.usage && { usage: rewriteAlias(item.usage, alias) }),
		...(item.api && { api: item.api }),
		examples: (item.examples ?? []).map((example) => ({
			...example,
			code: rewriteAlias(example.code, alias),
		})),
		...(withSource && {
			files: item.files.map((file) => ({
				path: file.target ?? file.path,
				content: rewriteAlias(file.content, alias),
			})),
		}),
	};
}

function apiLines(entry: ApiEntry) {
	if (entry.kind === "function")
		return [
			`- \`${entry.signature.replace(/\s+/g, " ")}\`${entry.description ? `: ${entry.description}` : ""}`,
		];

	const head = `- \`<${entry.name}>\`${entry.extends ? ` (+ ${entry.extends} props)` : ""}${entry.description ? `: ${entry.description}` : ""}`;

	return [
		head,
		...entry.props.map(
			(prop) =>
				`  - \`${prop.name}${prop.required ? "" : "?"}: ${prop.type}\`${prop.default ? ` = \`${prop.default}\`` : ""}${prop.description ? `: ${prop.description}` : ""}`,
		),
	];
}

const fence = (code: string, lang: string) => {
	const ticks = "`".repeat(
		Math.max(3, ...[...code.matchAll(/`{3,}/g)].map((match) => match[0].length + 1)),
	);

	return `${ticks}${lang}\n${code.trimEnd()}\n${ticks}`;
};

const lang = (path: string) => path.split(".").pop() ?? "text";

/** The view as Markdown: what `labsui view` prints and the MCP `view` tool returns. */
export function viewMarkdown(value: View) {
	const out = [`## ${value.title ?? value.name} (\`${value.name}\`, ${value.kind})`, ""];

	if (value.description) out.push(value.description, "");
	out.push(`- Install: \`${value.install}\``);
	if (value.docs) out.push(`- Docs: <${value.docs}>`);
	if (value.brings.length) out.push(`- Brings: ${value.brings.join(", ")}`);
	if (value.packages.length) out.push(`- npm: ${value.packages.join(", ")}`);
	if (value.mount)
		out.push(`- Mount once in the root layout, inside \`<MotionProvider>\`: \`${value.mount}\``);
	out.push("");

	if (value.api?.entries.length) {
		out.push("### API", "", ...value.api.entries.flatMap(apiLines));

		const types = Object.entries(value.api.types);

		if (types.length)
			out.push("", ...types.map(([name, definition]) => `- \`type ${name} = ${definition}\``));
		out.push("");
	}

	if (value.usage) out.push("### Usage", "", fence(value.usage, "tsx"), "");
	for (const example of value.examples)
		out.push(`### Example: ${example.name}`, "", fence(example.code, lang(example.name)), "");
	for (const file of value.files ?? [])
		out.push(`### Source: ${file.path}`, "", fence(file.content, lang(file.path)), "");

	return out.join("\n").trimEnd();
}

export function printView(views: View[]) {
	const md = views.map(viewMarkdown).join("\n\n");

	console.log(md.replace(/^(#{2,3} .*)$/gm, (line) => bold(line)));
}
