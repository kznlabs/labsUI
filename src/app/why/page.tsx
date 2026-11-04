import { Check, X } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Hero } from "@/components/blocks/hero";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { buttonVariants } from "@/components/ui/button-variants";
import { Code } from "@/components/ui/code";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { site, withBase } from "@/site/config";
import { tokensFor } from "@/site/prebuilt";
import { registry } from "@/site/registry";
import { ArticleStructuredData } from "@/site/seo/structured-data";
import { SiteShell } from "@/site/shell";
import { guide } from "@/site/static-code";

const title = "Why labsUI";
const description =
	"Why choose labsUI: updates that merge with your edits, exact props for coding agents, automated accessibility checks on every page, and when it is not a fit.";
const url = `${site.url}/why`;
const repository = "https://github.com/kznlabs/labsUI";

export const metadata: Metadata = {
	title,
	description,
	alternates: { canonical: url },
	openGraph: {
		type: "article",
		url,
		title: `${title} · ${site.name}`,
		description,
		images: [`${site.url}/og.png`],
	},
	twitter: {
		card: "summary_large_image",
		title: `${title} · ${site.name}`,
		description,
		images: [`${site.url}/og.png`],
	},
};

const text = "text-muted-foreground leading-relaxed";
const inline =
	"rounded bg-foreground/[0.06] px-1 py-0.5 font-mono text-[0.8125rem] whitespace-nowrap";
const link =
	"rounded-sm font-medium text-foreground underline decoration-border underline-offset-4 outline-none hover:decoration-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50";

function Section({
	id,
	heading,
	lead,
	children,
}: {
	id: string;
	heading: string;
	lead: ReactNode;
	children: ReactNode;
}) {
	return (
		<section
			aria-labelledby={id}
			className="grid gap-6 border-t py-12 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-12"
		>
			<div className="flex flex-col gap-3">
				<h2 id={id} className="text-balance font-semibold text-2xl tracking-tight">
					{heading}
				</h2>

				<p className={text}>{lead}</p>
			</div>

			<div className="flex min-w-0 flex-col gap-6">{children}</div>
		</section>
	);
}

/** Terms and what they mean. `code` sets the terms as command names. */
function Terms({ items, code }: { items: [term: string, meaning: string][]; code?: boolean }) {
	return (
		<dl className="flex flex-col gap-4">
			{items.map(([term, meaning]) => (
				<div key={term} className="grid gap-1 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
					<dt className="font-medium">{code ? <code>{term}</code> : term}</dt>

					<dd className={text}>{meaning}</dd>
				</div>
			))}
		</dl>
	);
}

const tools = [
	["search", "Finds items by name, export or intent."],
	["view", "Exact props and types, usage, examples, what an item brings along."],
	["add", "Installs items and what they import. Never overwrites a file."],
	["init", "One-time setup. Returns the code the root layout needs."],
	["diff", "A patch per changed file, and whose change it is."],
	["update", "Replaces unedited files and merges edited ones three ways."],
	["doctor", "Checks the setup and gives a fix for each problem."],
];

const checks = [
	["WCAG 2.2 A + AA rules (axe)", "0 violations"],
	["JavaScript errors", "none"],
	["Sideways page overflow", "none"],
	["Every control reachable by a click", "pass"],
	["Scroll containers move under the wheel", "pass"],
	["Menus, popovers, tabs, sliders, Escape, focus", "pass"],
	["Pointer targets", "24 × 24 px or larger"],
	["Text contrast, both themes", "4.5:1 or higher"],
];

const goodFit = [
	"You build with React 19 and Tailwind CSS v4, in Next.js or another React framework.",
	"You change components to suit your product and still want new versions.",
	"A coding agent writes part of your UI and should read real props, not guess them.",
	"You want forms built on native validation that work with Server Actions.",
	"You want motion to feel the same across the whole product.",
];

const notAFit = [
	"You want unstyled headless primitives. labsUI ships a look, set by its tokens and classes.",
	"Your app can't move to React 19 or Tailwind CSS v4. Both are required.",
	"You need a large ready-made ecosystem of themes, templates and answers online. labsUI is young and doesn't have one yet.",
	"You need a finished accessibility audit. The checks are automated; screen reader and real phone passes haven't been done.",
];

function FitList({ heading, items, icon }: { heading: string; items: string[]; icon: ReactNode }) {
	return (
		<div className="flex flex-col gap-4">
			<h3 className="font-semibold text-lg tracking-tight">{heading}</h3>

			<ul className="flex flex-col gap-3">
				{items.map((item) => (
					<li key={item} className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-3">
						{icon}

						<span className={text}>{item}</span>
					</li>
				))}
			</ul>
		</div>
	);
}

export default function WhyPage() {
	return (
		<SiteShell current={withBase("/why")}>
			<ArticleStructuredData path="/why" title={title} description={description} />

			<main className="mx-auto w-full min-w-0 max-w-7xl">
				<Breadcrumb
					className="px-4 pt-8 sm:px-6"
					items={[{ label: site.name, href: withBase("/") }, { label: title }]}
				/>

				<Hero
					title="Copy the code. Keep the updates."
					description="labsUI components live in your repo as plain TSX you can edit. When a new version ships, update merges it with your edits, and a coding agent can read the exact props before it writes a line."
					actions={
						<>
							<a href={withBase("/#getting-started")} className={buttonVariants()}>
								Get started
							</a>

							<a
								href={`${repository}/blob/main/packages/cli/README.md`}
								className={buttonVariants({ variant: "outline" })}
							>
								Read the CLI reference
							</a>
						</>
					}
				/>

				<div className="flex flex-col px-4 sm:px-6">
					<Section
						id="updates"
						heading="Updates that keep your edits"
						lead="Editing a component doesn't cut it off from new versions. labsUI records which version wrote each file, so it can tell your changes from its own."
					>
						<figure className="flex min-w-0 flex-col gap-2">
							<Code
								code={guide.updateRun}
								tokens={tokensFor(guide.updateRun, "console")}
								language="console"
							/>

							<figcaption className="text-muted-foreground text-sm leading-relaxed">
								A real run, shortened: an app installed with 0.1.12, its{" "}
								<code className={inline}>toast.tsx</code> edited by hand, updated to a later
								version. The hand edit is still in the file.
							</figcaption>
						</figure>

						<Terms
							code
							items={[
								[
									"diff",
									"Lists what differs from this version and whose change each file is: only labsUI's, only yours, or both.",
								],
								[
									"update",
									"Replaces files you never edited and merges the rest three ways. Where both sides changed the same lines, it adds conflict markers and lists the file.",
								],
								[
									"doctor",
									"Checks the setup and prints a fix for each problem. It exits with 1 when something is broken, so it can run in CI.",
								],
							]}
						/>

						<p className={text}>
							The merge base comes from JSR, which keeps every release's files. Offline, or for
							items installed before versions were recorded, edited files are left as they are.
						</p>
					</Section>

					<Section
						id="agents"
						heading="Exact props for coding agents"
						lead="The CLI is also an MCP server. Props come from each component's TypeScript types, so an agent reads what the code accepts, not a summary of it."
					>
						<Code code={guide.mcp} tokens={tokensFor(guide.mcp, "json")} language="json" />

						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Tool</TableHead>

									<TableHead>What it does</TableHead>
								</TableRow>
							</TableHeader>

							<TableBody>
								{tools.map(([tool, does]) => (
									<TableRow key={tool}>
										<TableCell>
											<code>{tool}</code>
										</TableCell>

										<TableCell className="whitespace-normal">{does}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>

						<p className={text}>
							On connect the server also sends the library's coding rules. Without MCP,{" "}
							<code className={inline}>--json</code> works on every command,{" "}
							<code className={inline}>labsui rules</code> prints the rules, and the docs come as{" "}
							<a href={withBase("/llms.txt")} className={link}>
								an index
							</a>{" "}
							or{" "}
							<a href={withBase("/llms-full.txt")} className={link}>
								one full file
							</a>
							.
						</p>
					</Section>

					<Section
						id="checks"
						heading="Checks that run on every page"
						lead={`Every day, CI opens all ${registry.length} component pages in Chromium, Firefox and WebKit, at 390 and 1280 px, in light and dark.`}
					>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Check</TableHead>

									<TableHead>Required</TableHead>
								</TableRow>
							</TableHeader>

							<TableBody>
								{checks.map(([check, required]) => (
									<TableRow key={check}>
										<TableCell className="whitespace-normal">{check}</TableCell>

										<TableCell>{required}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>

						<p className={text}>
							Behavior the docs promise, like a required field blocking submit or a form control
							going back to its default on reset, has its own tests. You can read{" "}
							<a href={`${repository}/actions/workflows/e2e.yml`} className={link}>
								the latest runs
							</a>{" "}
							and{" "}
							<a href={`${repository}/tree/main/tests/e2e`} className={link}>
								the tests themselves
							</a>
							.
						</p>

						<p className={text}>
							Automated checks find many problems, not all: axe covers roughly half of the WCAG
							criteria, so this is not a full conformance audit. Not covered yet: screen reader
							passes, real phones, Samsung Internet and other less common browsers.
						</p>
					</Section>

					<Section
						id="approach"
						heading="How it's built"
						lead="A small set of rules that every component follows, so what you learn from one holds for the next."
					>
						<Terms
							items={[
								[
									"Your code",
									"The CLI writes plain TSX into your repo, and no labsUI package ends up in your bundle. It has no dependencies and carries the registry inside, so each version installs the same code, offline too.",
								],
								[
									"One spring",
									'Every animation shares { type: "spring", stiffness: 400, damping: 30 }, and reduced motion is respected everywhere.',
								],
								[
									"The platform first",
									"Form controls use native constraints, so forms validate without JavaScript and work with Server Actions.",
								],
								[
									"Tokens",
									"Colors are OKLCH tokens, with light and dark themes and eight accent presets tuned for AA contrast.",
								],
							]}
						/>
					</Section>

					<section aria-labelledby="fit" className="flex flex-col gap-8 border-t py-12">
						<h2 id="fit" className="font-semibold text-2xl tracking-tight">
							Is it a fit?
						</h2>

						<div className="grid gap-10 md:grid-cols-2 md:gap-12">
							<FitList
								heading="Good fit"
								items={goodFit}
								icon={<Check aria-hidden="true" className="mt-1 size-5 text-success-ink" />}
							/>

							<FitList
								heading="Not a fit"
								items={notAFit}
								icon={<X aria-hidden="true" className="mt-1 size-5 text-muted-foreground" />}
							/>
						</div>

						<Code
							code={guide.init}
							tokens={tokensFor(guide.init, "bash")}
							language="bash"
							variant="inline"
							className="w-fit max-w-full"
						/>
					</section>
				</div>
			</main>
		</SiteShell>
	);
}
