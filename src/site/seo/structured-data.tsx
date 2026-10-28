import { componentPath, groupPath, site } from "@/site/config";
import { type Entry, registry } from "@/site/registry";

function JsonLd({ graph }: { graph: object }) {
	return (
		<script
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD, "<" escaped
			dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
		/>
	);
}

/** Schema.org JSON-LD for a component page: the article, its code and the breadcrumb trail. */
export function ComponentStructuredData({ entry }: { entry: Entry }) {
	const url = `${site.url}${componentPath(entry.id)}`;

	return (
		<JsonLd
			graph={{
				"@context": "https://schema.org",
				"@graph": [
					{
						"@type": "TechArticle",
						"@id": `${url}#article`,
						url,
						headline: `${entry.name}: React component`,
						description: entry.description,
						isPartOf: { "@id": `${site.url}/#website` },
						about: { "@id": `${site.url}/#library` },
						proficiencyLevel: "Beginner",
					},
					{
						"@type": "SoftwareSourceCode",
						name: entry.name,
						description: entry.description,
						programmingLanguage: "TypeScript",
						codeSampleType: "code snippet",
						text: entry.usage,
						isPartOf: { "@id": `${site.url}/#library` },
					},
					{
						"@type": "BreadcrumbList",
						itemListElement: [
							{ "@type": "ListItem", position: 1, name: site.name, item: site.url },
							{
								"@type": "ListItem",
								position: 2,
								name: entry.group,
								item: `${site.url}${groupPath(entry.group)}`,
							},
							{ "@type": "ListItem", position: 3, name: entry.name, item: url },
						],
					},
				],
			}}
		/>
	);
}

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
				runtimePlatform: "Node.js, Bun, Deno",
				keywords: "React, Next.js, Tailwind CSS, motion, spring animations, component library",
			},
			{
				"@type": "ItemList",
				name: `${site.name} components`,
				itemListElement: registry.map((entry, i) => ({
					"@type": "ListItem",
					position: i + 1,
					url: `${site.url}${componentPath(entry.id)}`,
					name: entry.name,
					description: entry.description,
				})),
			},
		],
	};

	return <JsonLd graph={graph} />;
}
