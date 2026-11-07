"use client";

import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { SiteFooter } from "@/components/blocks/site-footer";
import { SiteHeader } from "@/components/blocks/site-header";
import { buttonVariants } from "@/components/ui/button-variants";
import { toast } from "@/components/ui/toast";
import { withBase } from "@/site/config";
import { covers, portfolioHref, projects, site } from "./projects";

/** Client routing for a demo link: hrefs carry the base path, the router adds its own. */
export function useNavigate() {
	const router = useRouter();

	return (href: string, event: MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		router.push(href.slice(withBase("").length) || "/");
	};
}

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
	const navigate = useNavigate();
	const onProject = pathname.includes("/work/");

	return (
		<SiteHeader
			className="top-12"
			label="Portfolio"
			brand={
				<a
					href={portfolioHref()}
					onClick={(event) => navigate(portfolioHref(), event)}
					className="font-semibold tracking-tight"
				>
					{site.name}
				</a>
			}
			nav={sections}
			current={onProject ? portfolioHref("#work") : undefined}
			onNavigate={navigate}
			actions={
				<a
					href={portfolioHref("#contact")}
					onClick={(event) => navigate(portfolioHref("#contact"), event)}
					className={buttonVariants({ size: "sm" })}
				>
					Hire me
				</a>
			}
		/>
	);
}

export function PortfolioFooter() {
	const navigate = useNavigate();

	return (
		<SiteFooter
			className="mt-16"
			brand={
				<a
					href={portfolioHref()}
					onClick={(event) => navigate(portfolioHref(), event)}
					className="font-semibold"
				>
					{site.name}
				</a>
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
			onNavigate={navigate}
		/>
	);
}
