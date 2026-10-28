import type { ReactNode } from "react";
import { SiteHeader } from "@/components/blocks/site-header";
import { AccentPicker } from "@/components/ui/accent-picker";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { headerNav } from "@/site/catalog";
import { site, version, withBase } from "@/site/config";
import { SiteCommand } from "@/site/showcase/command-demo";

/** Header and footer shared by the gallery and every component page. */
export function SiteShell({ current, children }: { current?: string; children: ReactNode }) {
	return (
		<>
			<SiteHeader
				brand={
					<>
						<a
							href={withBase("/")}
							className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
						>
							{/* biome-ignore lint/performance/noImgElement: an 18px static SVG; the static export has no image optimizer */}
							<img src={withBase("/logo.svg")} alt="" width={18} height={18} />
							{site.name}
						</a>
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
			<footer className="border-t">
				<p className="mx-auto max-w-7xl px-4 py-6 text-muted-foreground text-xs sm:px-6">
					{site.name} · clean components you own, one spring for every motion. Hand-made, MIT
					licensed.
				</p>
			</footer>
		</>
	);
}
