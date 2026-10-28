import { apiFor } from "@/site/api";
import { componentPath, site } from "@/site/config";
import { registry } from "@/site/registry";

export const dynamic = "force-static";

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

/** GEO: plain-text library index for LLM crawlers (llmstxt.org). */
export function GET() {
	const body = [
		`# ${site.name}`,
		"",
		`> ${site.description}`,
		"",
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
		`Registry JSON: ${site.url}/r/<name>.json, index at ${site.url}/r/index.json.`,
		"",
		'Import primitives from `@/components/ui/<file>`. All motion uses one spring: { type: "spring", stiffness: 400, damping: 30 }.',
		"",
		"## Components",
		...registry.flatMap((entry) => [
			`### ${entry.name} (${entry.file})`,
			entry.description,
			`Docs: ${site.url}${componentPath(entry.id)} (Markdown: ${site.url}${componentPath(entry.id)}.md)`,
			"```tsx",
			entry.usage,
			"```",
			...props(entry.file),
			"",
		]),
	].join("\n");

	return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
