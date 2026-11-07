import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Prose } from "@/components/ui/prose";
import { Separator } from "@/components/ui/separator";
import { site as labs } from "@/site/config";
import { BlockView } from "../blocks";
import { Contents, ContentsRail } from "../contents";
import { docsPath, formatDate, pageBySlug, pages } from "../docs";
import { DocsPager, EditPage, Feedback } from "../docs-chrome";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
	return pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const found = pageBySlug((await params).slug);

	if (!found) return {};

	const url = `${labs.url}${docsPath(found.page.slug)}`;

	return {
		title: `${found.page.title} · Docs demo`,
		description: found.page.description,
		alternates: { canonical: url },
		openGraph: {
			url,
			title: `${found.page.title} · Docs demo · ${labs.name}`,
			description: found.page.description,
		},
	};
}

export default async function DocPage({ params }: Props) {
	const found = pageBySlug((await params).slug);

	if (!found) notFound();

	const { page, group } = found;
	const sections = page.sections.map(({ id, title, level }) => ({ id, label: title, level }));

	return (
		<div className="mx-auto grid max-w-6xl gap-x-12 px-4 py-8 sm:px-6 sm:py-10 xl:grid-cols-[minmax(0,1fr)_13rem]">
			<div className="min-w-0">
				<header>
					<p className="font-medium text-primary-ink text-sm">{group?.label}</p>

					<h1 className="mt-1 text-balance font-semibold text-3xl tracking-tight sm:text-4xl">
						{page.title}
					</h1>

					<p className="mt-3 text-lg text-muted-foreground leading-relaxed">{page.description}</p>
				</header>

				{sections.length > 1 && (
					<div className="mt-6 xl:hidden">
						<Contents items={sections} />
					</div>
				)}

				<Prose as="article" className="mt-8 max-w-3xl">
					{page.sections.map((section) => {
						const Heading = section.level === 3 ? "h3" : "h2";

						return (
							<section key={section.id}>
								<Heading id={section.id} className="scroll-mt-32">
									{section.title}
								</Heading>

								{section.blocks.map((block, i) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: sample blocks never reorder
									<BlockView key={i} block={block} />
								))}
							</section>
						);
					})}
				</Prose>

				<div className="mt-12 flex max-w-3xl flex-wrap items-center justify-between gap-4">
					<Feedback />

					<div className="flex items-center gap-1 text-muted-foreground text-sm">
						<span>
							Updated <time dateTime={page.updated}>{formatDate(page.updated)}</time>
						</span>

						<EditPage />
					</div>
				</div>

				<Separator className="my-8 max-w-3xl" />

				<DocsPager slug={page.slug} />
			</div>

			{sections.length > 1 && (
				<aside className="max-xl:hidden">
					<ContentsRail items={sections} />
				</aside>
			)}
		</div>
	);
}
