import { ArrowRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { demoPath, site as labs } from "@/site/config";
import { InstallTabs } from "./blocks";
import { groups, product, releases } from "./docs";
import { DocsLink } from "./docs-chrome";

const description =
	"A reference build of the docs recipe: side navigation, search, pages with highlighted code, a list of sections, previous and next links and tables of a function's options.";
const url = `${labs.url}${demoPath("docs-site")}`;

export const metadata: Metadata = {
	title: "Docs demo",
	description,
	alternates: { canonical: url },
	openGraph: { url, title: `Docs demo · ${labs.name}`, description },
};

export default function DocsHome() {
	const latest = releases[0];

	return (
		<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
			<header className="max-w-2xl">
				{latest && (
					<DocsLink
						slug="changelog"
						className="inline-flex items-center gap-2 rounded-full border bg-card py-1 pr-3 pl-1 text-sm outline-none transition-colors hover:bg-accent/60 focus-visible:ring-[3px] focus-visible:ring-ring/50"
					>
						<Badge>{latest.version}</Badge>
						{latest.title} are here
						<ArrowRight aria-hidden="true" className="size-3.5 text-muted-foreground" />
					</DocsLink>
				)}

				<h1 className="mt-5 text-balance font-semibold text-4xl tracking-tight sm:text-5xl">
					{product.name} documentation
				</h1>

				<p className="mt-4 text-lg text-muted-foreground leading-relaxed">
					{product.tagline} Runs in browsers, Node.js, Bun and edge runtimes.
				</p>

				<div className="mt-6 flex flex-wrap gap-3">
					<DocsLink slug="quick-start" className={buttonVariants()}>
						<Sparkles aria-hidden="true" />
						Quick start
					</DocsLink>

					<DocsLink slug="create-client" className={buttonVariants({ variant: "outline" })}>
						API reference
					</DocsLink>
				</div>
			</header>

			<section aria-labelledby="install-heading" className="mt-12 max-w-2xl">
				<h2 id="install-heading" className="font-semibold text-xl tracking-tight">
					Install
				</h2>

				<div className="mt-4">
					<InstallTabs packages="tempo-http" />
				</div>
			</section>

			<section aria-labelledby="browse-heading" className="mt-14">
				<h2 id="browse-heading" className="font-semibold text-xl tracking-tight">
					Browse the docs
				</h2>

				<div className="mt-6 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
					{groups.map((group) => (
						<div key={group.label}>
							<h3 className="font-medium text-muted-foreground text-sm">{group.label}</h3>

							<ul className="mt-3 grid gap-1">
								{group.pages.map((page) => (
									<li key={page.slug}>
										<DocsLink
											slug={page.slug}
											className="group -mx-3 block rounded-xl px-3 py-2.5 outline-none transition-colors hover:bg-accent/60 focus-visible:ring-[3px] focus-visible:ring-ring/50"
										>
											<span className="flex items-center gap-2 font-medium">
												{page.title}

												{page.badge && <Badge variant="secondary">{page.badge}</Badge>}

												<ArrowRight
													aria-hidden="true"
													className="ml-auto size-4 -translate-x-1 text-muted-foreground opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
												/>
											</span>

											<span className="mt-0.5 block text-muted-foreground text-sm">
												{page.description}
											</span>
										</DocsLink>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
