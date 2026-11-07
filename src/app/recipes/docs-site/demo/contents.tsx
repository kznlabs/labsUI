"use client";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TableOfContents, type TableOfContentsItem } from "@/components/ui/table-of-contents";

// Bars above a heading: the demo's (48 px) and the docs' own (56 px), plus room.
const offset = 128;

/** Folded list of sections, for screens without room for the rail. */
export function Contents({ items }: { items: TableOfContentsItem[] }) {
	return (
		<Collapsible className="rounded-xl border bg-card px-4">
			<CollapsibleTrigger className="w-full py-3 font-medium text-sm">
				On this page
			</CollapsibleTrigger>

			<CollapsibleContent className="pb-3">
				<TableOfContents hideLabel label="On this page" items={items} offset={offset} />
			</CollapsibleContent>
		</Collapsible>
	);
}

export function ContentsRail({ items }: { items: TableOfContentsItem[] }) {
	return (
		<TableOfContents
			label="On this page"
			items={items}
			offset={offset}
			className="sticky top-32 max-h-[calc(100dvh-9rem)]"
		/>
	);
}
