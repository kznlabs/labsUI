import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Code, CopyButton } from "@/components/ui/code";
import { Pager } from "@/components/ui/pager";
import { inlineCode } from "@/components/ui/props-table";
import { componentPath, recipePath, site, withBase } from "@/site/config";
import { tokensFor } from "@/site/prebuilt";
import { pageOf, RecipeShot } from "@/site/recipe-parts";
import { recipeInstall, recipes } from "@/site/recipes";
import { registry } from "@/site/registry";
import { ArticleStructuredData } from "@/site/seo/structured-data";
import { SiteShell } from "@/site/shell";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
	return recipes.map((recipe) => ({ id: recipe.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;
	const recipe = recipes.find((recipe) => recipe.id === id);

	if (!recipe) return {};

	const url = `${site.url}${recipePath(id)}`;
	const title = `${recipe.title} recipe`;

	return {
		title,
		description: recipe.description,
		alternates: { canonical: url },
		openGraph: {
			type: "article",
			url,
			title: `${title} · ${site.name}`,
			description: recipe.description,
		},
		twitter: { title: `${title} · ${site.name}`, description: recipe.description },
	};
}

const text = "text-muted-foreground leading-relaxed";
const link =
	"rounded-sm font-medium text-foreground underline decoration-border underline-offset-4 outline-none hover:decoration-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50";

function Section({ id, heading, children }: { id: string; heading: string; children: ReactNode }) {
	return (
		<section aria-labelledby={id} className="flex flex-col gap-4 border-t pt-8">
			<h2 id={id} className="font-semibold text-2xl tracking-tight">
				{heading}
			</h2>

			{children}
		</section>
	);
}

const checkedOn = (date: string) =>
	new Date(`${date}T12:00:00Z`).toLocaleDateString("en", {
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	});

export default async function RecipePage({ params }: Props) {
	const { id } = await params;
	const index = recipes.findIndex((recipe) => recipe.id === id);

	if (index < 0) notFound();

	const recipe = recipes[index];
	const prev = recipes[index - 1];
	const next = recipes[index + 1];
	const install = recipeInstall(recipe.items);
	const path = recipePath(id);

	return (
		<SiteShell current={withBase("/recipes")}>
			<ArticleStructuredData
				path={path}
				title={`${recipe.title} recipe`}
				description={recipe.description}
			/>

			<main className="mx-auto flex w-full min-w-0 max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6">
				<Breadcrumb
					items={[
						{ label: site.name, href: withBase("/") },
						{ label: "Recipes", href: withBase("/recipes") },
						{ label: recipe.title },
					]}
				/>

				<header className="flex flex-col gap-3">
					<h1 className="text-balance font-semibold text-3xl tracking-tight sm:text-4xl">
						{recipe.title}
					</h1>

					<p className={text}>{recipe.description}</p>
				</header>

				<div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs sm:p-5">
					<div className="flex items-center justify-between gap-3">
						<h2 className="font-medium text-sm">Prompt</h2>

						<CopyButton code={recipe.prompt} label="Copy prompt" />
					</div>

					<p className="text-pretty leading-relaxed">{recipe.prompt}</p>

					<p className="text-muted-foreground text-xs">
						Checked on labsUI {recipe.checked.version} with {recipe.checked.model},{" "}
						{checkedOn(recipe.checked.date)}: a fresh Next.js 16 app, the agent using only the
						labsUI MCP server. Its build passed and axe found no violations from labsUI.
					</p>
				</div>

				<figure className="flex flex-col gap-2">
					<div className="aspect-[16/10] overflow-hidden rounded-xl border bg-muted">
						<RecipeShot
							id={recipe.id}
							alt={`The ${recipe.title.toLowerCase()} the checked run built`}
							eager
						/>
					</div>

					<figcaption className="text-muted-foreground text-sm">
						What that run built, unedited. Your agent's result will differ in the details.
					</figcaption>
				</figure>

				<Section id="components" heading="Components it uses">
					<ul className="flex flex-wrap gap-x-4 gap-y-2">
						{recipe.items.map((item) => {
							const page = pageOf(item, registry);

							return (
								<li key={item}>
									{page ? (
										<a href={withBase(componentPath(page))} className={link}>
											{item}
										</a>
									) : (
										<code>{item}</code>
									)}
								</li>
							);
						})}
					</ul>

					<p className={text}>
						The agent adds these itself. To start by hand, after{" "}
						<code>npx @kznlabs/labsui init</code>:
					</p>

					<Code
						code={install}
						language="bash"
						variant="inline"
						tokens={tokensFor(install, "bash")}
					/>
				</Section>

				<Section id="notes" heading="What the result needs">
					{recipe.notes.map((note) => (
						<div key={note.title} className="flex flex-col gap-2">
							<h3 className="font-semibold text-lg tracking-tight">{note.title}</h3>

							<p className={text}>{inlineCode(note.body)}</p>

							{note.code && (
								<Code code={note.code} language="tsx" tokens={tokensFor(note.code, "tsx")} />
							)}
						</div>
					))}
				</Section>

				<Pager
					label="More recipes"
					className="border-t pt-8"
					previous={prev && { title: prev.title, href: withBase(recipePath(prev.id)) }}
					next={next && { title: next.title, href: withBase(recipePath(next.id)) }}
				/>
			</main>
		</SiteShell>
	);
}
