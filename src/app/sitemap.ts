import type { MetadataRoute } from "next";
import { componentPath, recipePath, site } from "@/site/config";
import { recipes } from "@/site/recipes";
import { registry } from "@/site/registry";

/** Rendered once at build time (also required for the static GitHub Pages export). */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
	const lastModified = new Date();

	return [
		{ url: site.url, lastModified, changeFrequency: "monthly", priority: 1 },
		{ url: `${site.url}/why`, lastModified, changeFrequency: "monthly", priority: 0.9 },
		{ url: `${site.url}/recipes`, lastModified, changeFrequency: "monthly", priority: 0.9 },
		...recipes.map((recipe) => ({
			url: `${site.url}${recipePath(recipe.id)}`,
			lastModified,
			changeFrequency: "monthly" as const,
			priority: 0.8,
		})),
		...registry.map((entry) => ({
			url: `${site.url}${componentPath(entry.id)}`,
			lastModified,
			changeFrequency: "monthly" as const,
			priority: 0.8,
		})),
	];
}
