import { registry } from "@/lib/registry";
import { site } from "@/lib/site";

export const dynamic = "force-static";

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
		"npx labsui init          # styles, theme, utils, motion provider; imports labsui.css",
		"npx labsui add button    # a component plus everything it imports",
		"npx labsui list          # everything you can add",
		"```",
		"",
		`Registry JSON (shadcn registry-item schema): ${site.url}/r/<name>.json, index at ${site.url}/r/index.json.`,
		"",
		'Import primitives from `@/components/ui/<file>`. All motion uses one spring: { type: "spring", stiffness: 400, damping: 30 }.',
		"",
		"## Components",
		...registry.flatMap((c) => [
			`### ${c.name} (${c.file})`,
			c.description,
			"```tsx",
			c.usage,
			"```",
			"",
		]),
	].join("\n");
	return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
