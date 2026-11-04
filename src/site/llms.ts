import { apiFor } from "@/site/api";
import { componentPath, site } from "@/site/config";
import { groups, registry } from "@/site/registry";

const pageUrl = (id: string) => `${site.url}${componentPath(id)}`;

const heading = [`# ${site.name}`, "", `> ${site.description}`, ""];

const install = [
	"## Install",
	"",
	"Components are copied into your project (React 19, Tailwind CSS v4, a `@/*` path alias):",
	"",
	"```sh",
	"npx @kznlabs/labsui init          # styles, theme, utils, motion provider; imports labsui.css",
	"npx @kznlabs/labsui add button    # a component plus everything it imports",
	"npx @kznlabs/labsui search <words> # find by name, export or intent",
	"npx @kznlabs/labsui view <name>   # exact props, examples, dependencies",
	"npx @kznlabs/labsui diff [name]   # how installed files differ from this version",
	"npx @kznlabs/labsui update [name] # this version's changes, merged with local edits",
	"npx @kznlabs/labsui doctor        # check the setup",
	"npx @kznlabs/labsui mcp           # all of the above as MCP tools (stdio)",
	"```",
	"",
	"Every command takes --json. `npx @kznlabs/labsui rules` prints the coding rules for agents.",
	"",
];

/** Compact props per export, from the generated API: agents get exact names and types. */
function props(file: string) {
	const { entries, types } = apiFor(file.split("·").map((file) => file.trim()));
	const lines = entries.flatMap((entry) => {
		if (entry.kind === "function") return [`- \`${entry.signature}\``];

		const own = entry.props.map(
			(prop) =>
				`${prop.name}${prop.required ? "" : "?"}: ${prop.type}${prop.default ? ` = ${prop.default}` : ""}`,
		);
		const rest = entry.extends ? ` (+ ${entry.extends} props)` : "";

		return [`- <${entry.name}>${rest}${own.length ? `: ${own.join("; ")}` : ""}`];
	});
	const defs = types.map(([name, def]) => `- type ${name} = ${def}`);

	return lines.length ? ["Props:", ...lines, ...defs] : [];
}

/** The index (llmstxt.org): what labsUI is, how to install it, a link per component. */
export function llmsIndex() {
	return [
		...heading,
		...install,
		"## Docs",
		"",
		`- [Full text](${site.url}/llms-full.txt): every component with its usage and exact props, in one file`,
		`- [Why labsUI](${site.url}/why): what it does, how it is checked, when it is not a fit`,
		"- [CLI and MCP reference](https://github.com/kznlabs/labsUI/blob/main/packages/cli/README.md): every command, option and MCP tool",
		`- [Registry index](${site.url}/r/index.json): installable items as JSON, each at /r/<name>.json`,
		"",
		...groups.flatMap((group) => [
			`## ${group}`,
			"",
			...registry
				.filter((entry) => entry.group === group)
				.map((entry) => `- [${entry.name}](${pageUrl(entry.id)}.md): ${entry.description}`),
			"",
		]),
	].join("\n");
}

/** Everything in one file: usage and exact props for each component. */
export function llmsFull() {
	return [
		...heading,
		...install,
		`Registry JSON: ${site.url}/r/<name>.json, index at ${site.url}/r/index.json.`,
		"",
		'Import primitives from `@/components/ui/<file>`. All motion uses one spring: { type: "spring", stiffness: 400, damping: 30 }.',
		"",
		"## Components",
		...registry.flatMap((entry) => [
			`### ${entry.name} (${entry.file})`,
			entry.description,
			`Docs: ${pageUrl(entry.id)} (Markdown: ${pageUrl(entry.id)}.md)`,
			"```tsx",
			entry.usage,
			"```",
			...props(entry.file),
			"",
		]),
	].join("\n");
}

export const plainText = (body: string) =>
	new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
