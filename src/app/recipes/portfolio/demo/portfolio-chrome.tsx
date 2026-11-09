"use client";

import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { SiteFooter } from "@/components/blocks/site-footer";
import { SiteHeader } from "@/components/blocks/site-header";
import { buttonVariants } from "@/components/ui/button-variants";
import { toast } from "@/components/ui/toast";
import { AppLink } from "@/lib/link";
import { covers, portfolioHref, projects, site } from "./projects";

/** Links that would leave the demo (a live site, a profile) answer with a toast instead. */
export function demoLink(event: MouseEvent<HTMLAnchorElement>, what: string) {
	event.preventDefault();
	toast.info(`Demo mode: ${what} is sample data, there's nothing to open`);
}

const sections = [
	{ label: "Work", href: portfolioHref("#work") },
	{ label: "About", href: portfolioHref("#about") },
	{ label: "Contact", href: portfolioHref("#contact") },
];

export function PortfolioHeader() {
	const pathname = usePathname();
	const onProject = pathname.includes("/work/");

	return (
		<SiteHeader
			className="top-12"
			label="Portfolio"
			brand={
				<AppLink href={portfolioHref()} className="font-semibold tracking-tight">
					{site.name}
				</AppLink>
			}
			nav={sections}
			current={onProject ? portfolioHref("#work") : undefined}
			actions={
				<AppLink href={portfolioHref("#contact")} className={buttonVariants({ size: "sm" })}>
					Hire me
				</AppLink>
			}
		/>
	);
}

export function PortfolioFooter() {
	return (
		<SiteFooter
			className="mt-16"
			brand={
				<AppLink href={portfolioHref()} className="font-semibold">
					{site.name}
				</AppLink>
			}
			description={`${site.description} A demo portfolio: sample projects and people.`}
			columns={[
				{
					title: "Recent work",
					links: projects.slice(0, 3).map((project) => ({
						label: project.title,
						href: portfolioHref(`/work/${project.slug}`),
					})),
				},
				{ title: "Site", links: sections },
			]}
			legal={`Cover photos CC0 from StockSnap by ${covers.map((cover) => cover.creator).join(", ")}.`}
		/>
	);
}
