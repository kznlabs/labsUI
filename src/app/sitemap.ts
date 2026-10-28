import type { MetadataRoute } from "next";
import { componentPath, site } from "@/site/config";
import { registry } from "@/site/registry";

/** Rendered once at build time (also required for the static GitHub Pages export). */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
	const lastModified = new Date();

	return [
		{ url: site.url, lastModified, changeFrequency: "monthly", priority: 1 },
		...registry.map((entry) => ({
			url: `${site.url}${componentPath(entry.id)}`,
			lastModified,
			changeFrequency: "monthly" as const,
			priority: 0.8,
		})),
	];
}
