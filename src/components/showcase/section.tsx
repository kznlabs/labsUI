import type { ReactNode } from "react";
import { Playground } from "@/components/showcase/playground";
import { CodePanel } from "@/components/ui/code";
import { Reveal } from "@/components/ui/reveal";

type ShowcaseSectionProps = {
	id: string;
	name: string;
	description: string;
	files: { name: string; code: string }[];
	previewClassName?: string;
	children: ReactNode;
};

/** Docs block: heading, playground (replay + spring controls + preview), usage files. */
export function ShowcaseSection({
	id,
	name,
	description,
	files,
	previewClassName,
	children,
}: ShowcaseSectionProps) {
	return (
		<section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20">
			<header className="mb-4 flex flex-col gap-1">
				<h2 id={`${id}-title`} className="font-semibold text-xl tracking-tight">
					{name}
				</h2>
				<p className="text-muted-foreground text-sm">{description}</p>
			</header>
			<Reveal className="overflow-hidden rounded-xl border">
				<Playground previewClassName={previewClassName}>{children}</Playground>
				<CodePanel files={files} className="rounded-none border-0 border-t bg-transparent" />
			</Reveal>
		</section>
	);
}
