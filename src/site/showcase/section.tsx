"use client";

import { type ReactNode, useMemo } from "react";
import { Code, CodePanel } from "@/components/ui/code";
import { Reveal } from "@/components/ui/reveal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CodeToken } from "@/lib/highlight";
import { cn } from "@/lib/utils";
import { Playground } from "@/site/showcase/playground";
import { ShowcaseProvider, useShowcaseContext } from "@/site/showcase-context";

type ShowcaseSectionProps = {
	id: string;
	name: string;
	description: string;
	files: { name: string; code: string }[];
	/** CLI command that installs this component, e.g. `npx @kznlabs/labsui add button`. */
	install: string;
	/** The install line, highlighted at build time. */
	installTokens?: CodeToken[][];
	/** Collapsed props reference, rendered on the server (ApiReference). */
	api?: ReactNode;
	previewClassName?: string;
	/** Corner Replay button; only for demos whose point is a first impression. */
	replay?: boolean;
	/** "stacked": code right under a compact demo. "tabs": tall demos switch Preview / Code. */
	layout?: "stacked" | "tabs";
	/** Links the title to the component's own page (gallery). */
	href?: string;
	/** "h1" on the component's own page, "h2" in the gallery. */
	titleAs?: "h1" | "h2";
	children: ReactNode;
};

const surface = "overflow-hidden rounded-2xl border bg-card shadow-sm";

function ShowcaseSectionInner({
	id,
	name,
	description,
	files,
	install,
	installTokens,
	api,
	previewClassName,
	replay,
	layout = "stacked",
	href,
	titleAs: Title = "h2",
	children,
}: ShowcaseSectionProps) {
	const { dynamicCode } = useShowcaseContext();

	const activeFiles = useMemo(() => {
		if (!dynamicCode) return files;

		// Live code drops the prebuilt tokens, they belong to the original.
		return files.map((file, idx) => (idx === 0 ? { name: file.name, code: dynamicCode } : file));
	}, [files, dynamicCode]);

	const heading = (
		<div className="flex min-w-0 max-w-2xl flex-col gap-1">
			<Title
				id={`${id}-title`}
				className={
					Title === "h1"
						? "font-semibold text-4xl tracking-tight sm:text-5xl"
						: "font-semibold text-2xl tracking-tight"
				}
			>
				{href ? (
					<a
						href={href}
						className="rounded-md underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
					>
						{name}
					</a>
				) : (
					name
				)}
			</Title>

			<p className="text-muted-foreground text-sm leading-relaxed">{description}</p>

			<Code
				code={install}
				tokens={installTokens}
				language="bash"
				variant="inline"
				className="mt-2 w-fit max-w-full"
			/>
		</div>
	);
	const preview = (
		<Playground replay={replay} previewClassName={previewClassName}>
			{children}
		</Playground>
	);
	// Snippets arrive formatted, only code a demo rewrites live needs Prettier.
	const code = (
		<CodePanel files={activeFiles} format={!!dynamicCode} collapse={20} className={surface} />
	);

	return (
		// Natural height: as tall as the demo and code.
		<section
			id={id}
			aria-labelledby={`${id}-title`}
			// The rule separates sections in a list, a component page's own section has none above.
			className={cn("flex scroll-mt-20 flex-col gap-4 py-12", Title !== "h1" && "border-t")}
		>
			{layout === "stacked" ? (
				<>
					<header>{heading}</header>

					<Reveal className={surface}>{preview}</Reveal>

					{code}
				</>
			) : (
				<Tabs defaultValue="preview" className="gap-4">
					<header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
						{heading}

						<TabsList aria-label={`${name} view`}>
							<TabsTrigger value="preview">Preview</TabsTrigger>

							<TabsTrigger value="code">Code</TabsTrigger>
						</TabsList>
					</header>

					<TabsContent value="preview">
						<Reveal className={surface}>{preview}</Reveal>
					</TabsContent>

					<TabsContent value="code">{code}</TabsContent>
				</Tabs>
			)}

			{api}
		</section>
	);
}

/** One docs section: title, the demo stage, and its code (below it, or behind a Preview / Code switch). */
export function ShowcaseSection(props: ShowcaseSectionProps) {
	return (
		<ShowcaseProvider>
			<ShowcaseSectionInner {...props} />
		</ShowcaseProvider>
	);
}
