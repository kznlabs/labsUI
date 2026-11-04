import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Pager } from "@/components/ui/pager";
import { ordered, sectionProps } from "@/site/catalog";
import { componentPath, groupPath, site, withBase } from "@/site/config";
import { ComponentStructuredData } from "@/site/seo/structured-data";
import { SiteShell } from "@/site/shell";
import { PageNav } from "@/site/showcase/page-nav";
import { ShowcaseSection } from "@/site/showcase/section";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
	return ordered.map((entry) => ({ id: entry.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;
	const entry = ordered.find((entry) => entry.id === id);

	if (!entry) return {};

	const url = `${site.url}${componentPath(entry.id)}`;
	const title = entry.group === "Blocks" ? `${entry.name} block` : `${entry.name} component`;

	return {
		title,
		description: entry.description,
		alternates: { canonical: url, types: { "text/markdown": `${url}.md` } },
		openGraph: {
			type: "article",
			url,
			title: `${title} · ${site.name}`,
			description: entry.description,
		},
		twitter: { title: `${title} · ${site.name}`, description: entry.description },
	};
}

export default async function ComponentPage({ params }: Props) {
	const { id } = await params;
	const index = ordered.findIndex((entry) => entry.id === id);

	if (index < 0) notFound();

	const entry = ordered[index];
	const prev = ordered[index - 1];
	const next = ordered[index + 1];

	return (
		<SiteShell current={withBase(componentPath(id))}>
			<ComponentStructuredData entry={entry} />

			<div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
				<aside className="hidden lg:block">
					<div className="sticky top-24">
						<PageNav current={id} />
					</div>
				</aside>

				<main className="flex min-w-0 flex-col">
					{/* Below lg the sidebar is hidden: the same list, folded, above the breadcrumb. */}
					<Collapsible className="mb-4 rounded-xl border bg-card px-3 py-2 lg:hidden">
						<CollapsibleTrigger chevron className="w-full justify-between text-sm">
							All components
							<span className="ml-auto font-normal text-muted-foreground text-xs">
								{index + 1} of {ordered.length}
							</span>
						</CollapsibleTrigger>

						<CollapsibleContent className="pt-2">
							<PageNav current={id} className="max-h-none overflow-visible pb-1" />
						</CollapsibleContent>
					</Collapsible>

					<Breadcrumb
						className="pt-2 lg:pt-6"
						items={[
							{ label: site.name, href: withBase("/") },
							{
								label: entry.group,
								href: withBase(groupPath(entry.group)),
							},
							{ label: entry.name },
						]}
					/>

					<ShowcaseSection {...sectionProps(entry, true)} titleAs="h1" />

					<Pager
						label="More components"
						className="border-t pt-8"
						previous={prev && { title: prev.name, href: withBase(componentPath(prev.id)) }}
						next={next && { title: next.name, href: withBase(componentPath(next.id)) }}
					/>
				</main>
			</div>
		</SiteShell>
	);
}
