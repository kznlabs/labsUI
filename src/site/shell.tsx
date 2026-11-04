import type { ReactNode } from "react";
import { SiteFooter } from "@/components/blocks/site-footer";
import { SiteHeader } from "@/components/blocks/site-header";
import { AccentPicker } from "@/components/ui/accent-picker";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { headerNav, nav } from "@/site/catalog";
import { groupPath, site, version, withBase } from "@/site/config";
import { SiteCommand } from "@/site/showcase/command-demo";

/** Header and footer shared by the gallery and every component page. */
export function SiteShell({ current, children }: { current?: string; children: ReactNode }) {
	const brand = (
		<a
			href={withBase("/")}
			className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
		>
			{/* biome-ignore lint/performance/noImgElement: an 18px static SVG; the static export has no image optimizer */}
			<img src={withBase("/logo.svg")} alt="" width={18} height={18} />

			{site.name}
		</a>
	);

	return (
		<>
			<SiteHeader
				brand={
					<>
						{brand}

						<Badge variant="secondary" shape="pill" className="hidden sm:inline-flex">
							v{version}
						</Badge>
					</>
				}
				nav={headerNav}
				current={current}
				actions={
					<>
						<AccentPicker className="hidden xl:flex" />

						<SiteCommand />

						<ThemeToggle />
					</>
				}
			/>

			{children}

			<SiteFooter
				brand={brand}
				description="Clean components you own, one spring for every motion."
				label="Site"
				columns={[
					{
						title: "Docs",
						links: [
							{ label: "Get started", href: withBase("/#getting-started") },
							{ label: "llms.txt", href: withBase("/llms.txt") },
						],
					},
					{
						title: "Components",
						links: nav.map((group) => ({
							label: group.label,
							href: withBase(groupPath(group.label)),
						})),
					},
					{
						title: "Project",
						links: [
							{ label: "GitHub", href: "https://github.com/kznlabs/labsUI" },
							{ label: "npm", href: "https://www.npmjs.com/package/@kznlabs/labsui" },
							{ label: "JSR", href: "https://jsr.io/@kznlabs/labsui" },
							{
								label: "MCP registry",
								href: "https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.kznlabs/labsui",
							},
						],
					},
				]}
				legal="Hand-made, MIT licensed."
			/>
		</>
	);
}
