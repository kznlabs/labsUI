import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Code } from "@/components/ui/code";
import { TextSwap } from "@/components/ui/text-swap";
import { site } from "@/site/config";
import { tokensFor } from "@/site/prebuilt";
import { StructuredData } from "@/site/seo/structured-data";
import { SiteShell } from "@/site/shell";
import { GettingStarted } from "@/site/showcase/getting-started";
import { ComponentIndex, Showcase } from "@/site/showcase/home";
import { guide } from "@/site/static-code";

export default function Home() {
	return (
		<SiteShell>
			<StructuredData />

			<main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col px-4 py-10 sm:px-6">
				<header className="flex flex-col gap-4 pt-2 pb-12 lg:pt-6">
					<h1 className="font-semibold text-4xl tracking-tight sm:text-6xl">{site.name}</h1>
					<p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
						{site.description}
					</p>
					<div className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
						<span>Featuring</span>
						<span className="font-semibold text-foreground">
							<TextSwap
								items={[
									"one spring physics system",
									"a CLI and MCP server for coding agents",
									"Shiki dual-theme syntax highlighting",
									"typewriter and spring text swap effects",
									"components you copy in and own",
								]}
								interval={3200}
								direction="up"
							/>
						</span>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Code
							code={guide.init}
							tokens={tokensFor(guide.init, "bash")}
							language="bash"
							variant="inline"
						/>
						<a
							href="#getting-started"
							className="rounded-md text-muted-foreground text-sm underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
						>
							read the 5-step setup
						</a>
					</div>
					<ul className="flex flex-wrap gap-2" aria-label="Tech stack">
						{["Next.js 16", "React 19", "Tailwind CSS 4", "motion 14", "lucide-react", "Bun"].map(
							(tool) => (
								<li key={tool}>
									<Badge variant="outline" shape="pill">
										{tool}
									</Badge>
								</li>
							),
						)}
					</ul>
					<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
						<ul className="flex flex-wrap gap-2" aria-label="Automated checks">
							{["WCAG 2.2 AA · 0 axe violations", "Chromium", "Firefox", "WebKit"].map((check) => (
								<li key={check}>
									<Badge variant="success" shape="pill">
										<Check aria-hidden="true" />
										{check}
									</Badge>
								</li>
							))}
						</ul>
						<a
							href="https://github.com/kznlabs/labsUI#accessibility-and-browsers"
							className="rounded-md text-muted-foreground text-sm underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
						>
							what is checked
						</a>
					</div>
				</header>

				<Showcase />
				<GettingStarted />
				<ComponentIndex />
			</main>
		</SiteShell>
	);
}
