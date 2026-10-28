import type { ReactNode } from "react";
import { Code, CodePanel } from "@/components/ui/code";
import { tokensFor } from "@/site/prebuilt";
import { guide } from "@/site/static-code";

function Step({ n: step, title, children }: { n: number; title: string; children: ReactNode }) {
	return (
		<li className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-4">
			<span
				aria-hidden="true"
				className="flex size-7 items-center justify-center rounded-full border bg-card font-medium text-sm tabular-nums shadow-xs"
			>
				{step}
			</span>
			<div className="flex min-w-0 flex-col gap-3 pb-2">
				<h3 className="pt-0.5 font-medium">{title}</h3>
				{children}
			</div>
		</li>
	);
}

const text = "max-w-2xl text-muted-foreground text-sm leading-relaxed";
const inline =
	"rounded bg-foreground/[0.06] px-1 py-0.5 font-mono text-[0.8125rem] whitespace-nowrap";

/** Install and setup, above the component sections. Server-rendered. */
export function GettingStarted() {
	return (
		<section
			id="getting-started"
			aria-labelledby="getting-started-title"
			className="flex scroll-mt-20 flex-col gap-6 border-t py-12"
		>
			<header className="flex max-w-2xl flex-col gap-1">
				<h2 id="getting-started-title" className="font-semibold text-2xl tracking-tight">
					Get started
				</h2>
				<p className={text}>
					labsUI isn't a dependency you import from a package. The CLI copies each component's
					source into your project, so you own it and can change anything.
				</p>
			</header>
			<ol className="flex flex-col gap-6">
				<Step n={1} title="Check the requirements">
					<p className={text}>
						React 19, Tailwind CSS v4 and a path alias in{" "}
						<code className={inline}>tsconfig.json</code> (
						<code className={inline}>"@/*": ["./src/*"]</code>, the Next.js default). Any React
						framework works; the examples use the Next.js App Router. The CLI needs Node.js 22 or
						newer, or Deno.
					</p>
				</Step>
				<Step n={2} title="Run init once">
					<Code
						code={guide.init}
						tokens={tokensFor(guide.init, "bash")}
						language="bash"
						variant="inline"
						className="w-fit max-w-full"
					/>
					<p className={text}>
						Adds <code className={inline}>styles/labsui.css</code> (colors, accents, animations) and
						imports it right after Tailwind, plus the theme helpers and the motion provider. Any
						package manager works: <code className={inline}>bunx</code>,{" "}
						<code className={inline}>pnpm dlx</code>, <code className={inline}>yarn dlx</code> or{" "}
						<code className={inline}>deno run -A jsr:@kznlabs/labsui</code>. Bun is recommended;
						labsUI is built with it.
					</p>
				</Step>
				<Step n={3} title="Wire the root layout">
					<p className={text}>
						The theme script picks light or dark before the first paint; the motion provider gives
						every animation the same spring and honors reduced motion.
					</p>
					<CodePanel
						files={[
							{
								name: "app/layout.tsx",
								code: guide.layout,
								tokens: tokensFor(guide.layout, "tsx"),
							},
						]}
						collapse={20}
					/>
				</Step>
				<Step n={4} title="Add components">
					<Code
						code={guide.add}
						tokens={tokensFor(guide.add, "bash")}
						language="bash"
						variant="inline"
						className="w-fit max-w-full"
					/>
					<p className={text}>
						Each component brings what it imports (other components, helpers, npm packages). Every
						section below shows its own command, a live demo, the code and its props.
					</p>
					<CodePanel
						files={[{ name: "save.tsx", code: guide.usage, tokens: tokensFor(guide.usage, "tsx") }]}
					/>
				</Step>
				<Step n={5} title="Make it yours">
					<p className={text}>
						Colors are CSS variables in <code className={inline}>labsui.css</code>; set an accent on{" "}
						<code className={inline}>{'<html data-accent="purple">'}</code> or at runtime. Every
						component accepts <code className={inline}>className</code> for one-off changes.
					</p>
					<CodePanel
						files={[
							{ name: "theme.ts", code: guide.theming, tokens: tokensFor(guide.theming, "ts") },
						]}
					/>
				</Step>
			</ol>
		</section>
	);
}
