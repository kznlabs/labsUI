import { registry } from "@/lib/registry";
import { site } from "@/lib/site";

/** Schema.org JSON-LD: WebSite + SoftwareSourceCode + ItemList of components. */
export function StructuredData() {
	const graph = {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "WebSite",
				"@id": `${site.url}/#website`,
				url: site.url,
				name: site.name,
				description: site.description,
			},
			{
				"@type": "SoftwareSourceCode",
				"@id": `${site.url}/#library`,
				name: site.name,
				description: site.description,
				programmingLanguage: "TypeScript",
				runtimePlatform: "Bun",
				keywords: "React, Next.js, Tailwind CSS, motion, shadcn/ui, macOS, component library",
			},
			{
				"@type": "ItemList",
				name: `${site.name} components`,
				itemListElement: registry.map((c, i) => ({
					"@type": "ListItem",
					position: i + 1,
					url: `${site.url}/#${c.id}`,
					name: c.name,
					description: c.description,
				})),
			},
		],
	};
	return (
		<script
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD, "<" escaped
			dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
		/>
	);
}
