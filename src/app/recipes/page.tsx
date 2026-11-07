import type { Metadata } from "next";
import { PostCard } from "@/components/blocks/post-card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { recipePath, site, withBase } from "@/site/config";
import { OpenDemo, RecipeShot } from "@/site/recipe-parts";
import { recipes } from "@/site/recipes";
import { ArticleStructuredData } from "@/site/seo/structured-data";
import { SiteShell } from "@/site/shell";

const title = "Recipes";
const description =
	"Prompts for a whole app built with labsUI: a blog, docs, a shop, a comparison page and a portfolio. Each one was run by a coding agent on a fresh Next.js app and checked before it was listed.";
const url = `${site.url}/recipes`;

export const metadata: Metadata = {
	title,
	description,
	alternates: { canonical: url },
	openGraph: { type: "article", url, title: `${title} · ${site.name}`, description },
	twitter: { title: `${title} · ${site.name}`, description },
};

const text = "text-muted-foreground leading-relaxed";
const inline = "rounded bg-foreground/[0.06] px-1 py-0.5 font-mono text-[0.8125rem]";

export default function RecipesPage() {
	return (
		<SiteShell current={withBase("/recipes")}>
			<ArticleStructuredData path="/recipes" title={title} description={description} />

			<main className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6">
				<Breadcrumb items={[{ label: site.name, href: withBase("/") }, { label: title }]} />

				<header className="flex max-w-3xl flex-col gap-3">
					<h1 className="text-balance font-semibold text-3xl tracking-tight sm:text-4xl">
						Recipes
					</h1>

					<p className={text}>
						A recipe is a prompt for a whole app, the components it uses and what the result needs.
						Each one ran in a coding agent with the labsUI MCP server on a fresh Next.js 16 app; it
						is listed once the build passed and its pages had no accessibility violations from
						labsUI. Copy a prompt into your agent, or ask it with{" "}
						<code className={inline}>labsui view &lt;recipe&gt;</code>. A recipe with a live demo
						shows a reference build, polished by hand from that run.
					</p>
				</header>

				<ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{recipes.map((recipe, i) => (
						<li key={recipe.id}>
							<PostCard
								as="h2"
								title={recipe.title}
								href={withBase(recipePath(recipe.id))}
								excerpt={recipe.description}
								ratio={16 / 10}
								media={
									<>
										<RecipeShot
											name={recipe.demo ? `${recipe.id}-demo` : recipe.id}
											alt=""
											eager={i < 3}
										/>

										{recipe.demo && <OpenDemo id={recipe.id} group="post" />}
									</>
								}
								meta={`${recipe.items.length} components · labsUI ${recipe.checked.version}`}
							/>
						</li>
					))}
				</ul>
			</main>
		</SiteShell>
	);
}
