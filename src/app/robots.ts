import type { MetadataRoute } from "next";
import { site } from "@/site/config";

/** Rendered once at build time (also required for the static GitHub Pages export). */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
	return { rules: [{ userAgent: "*", allow: "/" }], sitemap: `${site.url}/sitemap.xml` };
}
