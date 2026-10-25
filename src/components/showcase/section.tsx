"use client";

import { SearchX } from "lucide-react";
import { type ReactNode, useMemo } from "react";
import { Playground } from "@/components/showcase/playground";
import { Button } from "@/components/ui/button";
import { Code, CodePanel } from "@/components/ui/code";
import { Empty } from "@/components/ui/empty";
import { Reveal } from "@/components/ui/reveal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShowcaseProvider, useComponentFilter, useShowcaseContext } from "@/lib/showcase-context";

type ShowcaseSectionProps = {
	id: string;
	name: string;
	description: string;
	files: { name: string; code: string }[];
	/** CLI command that installs this component, e.g. `npx labsui add button`. */
	install: string;
	previewClassName?: string;
	/** Corner Replay button; only for demos whose point is a first impression. */
	replay?: boolean;
	/** "stacked": code right under a compact demo. "tabs": tall demos switch Preview / Code. */
	layout?: "stacked" | "tabs";
	children: ReactNode;
};

const surface = "overflow-hidden rounded-2xl border bg-card shadow-sm";

function ShowcaseSectionInner({
	id,
	name,
	description,
	files,
	install,
	previewClassName,
	replay,
	layout = "stacked",
	children,
}: ShowcaseSectionProps) {
	const { dynamicCode } = useShowcaseContext();
	const { matches } = useComponentFilter();

	const activeFiles = useMemo(() => {
		if (!dynamicCode) return files;
		return files.map((file, idx) => (idx === 0 ? { ...file, code: dynamicCode } : file));
	}, [files, dynamicCode]);

	const heading = (
		<div className="flex min-w-0 max-w-2xl flex-col gap-1">
			<h2 id={`${id}-title`} className="font-semibold text-2xl tracking-tight">
				{name}
			</h2>
			<p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
			<Code code={install} language="bash" variant="inline" className="mt-2 w-fit max-w-full" />
		</div>
	);
	const preview = (
		<Playground replay={replay} previewClassName={previewClassName}>
			{children}
		</Playground>
	);
	const code = <CodePanel files={activeFiles} format className={`max-h-[28rem] ${surface}`} />;

	return (
		// Natural height: the section is as tall as its demo and code, nothing more.
		<section
			id={id}
			aria-labelledby={`${id}-title`}
			// Hidden, not unmounted: demos keep their state while you search.
			hidden={matches ? !matches.has(id) : undefined}
			className="flex scroll-mt-20 flex-col gap-4 border-t py-12"
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

/** Shown in place of the sections when the docs search matches nothing. */
export function ShowcaseNoResults() {
	const { query, setQuery, matches } = useComponentFilter();
	if (!matches || matches.size > 0) return null;
	return (
		<Empty
			bordered
			icon={<SearchX />}
			title="No components match"
			description={`Nothing matches “${query.trim()}”.`}
			className="mt-4"
		>
			<Button size="sm" variant="outline" onClick={() => setQuery("")}>
				Clear search
			</Button>
		</Empty>
	);
}
