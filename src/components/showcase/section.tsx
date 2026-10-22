"use client";

import { type ReactNode, useMemo } from "react";
import { Playground } from "@/components/showcase/playground";
import { CodePanel } from "@/components/ui/code";
import { Reveal } from "@/components/ui/reveal";
import { ShowcaseProvider, useShowcaseContext } from "@/lib/showcase-context";

type ShowcaseSectionProps = {
	id: string;
	name: string;
	description: string;
	files: { name: string; code: string }[];
	previewClassName?: string;
	controls?: ReactNode;
	children: ReactNode;
};

function ShowcaseSectionInner({
	id,
	name,
	description,
	files,
	previewClassName,
	controls,
	children,
}: ShowcaseSectionProps) {
	const { dynamicCode } = useShowcaseContext();

	const activeFiles = useMemo(() => {
		if (!dynamicCode) return files;
		return files.map((file, idx) => (idx === 0 ? { ...file, code: dynamicCode } : file));
	}, [files, dynamicCode]);

	return (
		<section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20">
			<header className="mb-4 flex flex-col gap-1">
				<h2 id={`${id}-title`} className="font-semibold text-xl tracking-tight">
					{name}
				</h2>
				<p className="text-muted-foreground text-sm">{description}</p>
			</header>
			<Reveal className="overflow-hidden rounded-xl border">
				<Playground controls={controls} previewClassName={previewClassName}>
					{children}
				</Playground>
				<CodePanel files={activeFiles} className="rounded-none border-0 border-t bg-transparent" />
			</Reveal>
		</section>
	);
}

/** Docs block: heading, playground with preview, live-updating code snippet, usage files. */
export function ShowcaseSection(props: ShowcaseSectionProps) {
	return (
		<ShowcaseProvider>
			<ShowcaseSectionInner {...props} />
		</ShowcaseProvider>
	);
}
