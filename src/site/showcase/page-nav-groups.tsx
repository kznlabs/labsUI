"use client";

import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { componentPath, withBase } from "@/site/config";

type PageNavGroup = { label: string; items: { id: string; name: string }[] };

/** One group open at a time, starting on the current component's. */
export function PageNavGroups({ groups, current }: { groups: PageNavGroup[]; current: string }) {
	const currentGroup = groups.find((group) => group.items.some((item) => item.id === current));
	const [openGroup, setOpenGroup] = useState(currentGroup?.label ?? "");

	return groups.map((group) => (
		<Collapsible
			key={group.label}
			open={openGroup === group.label}
			onOpenChange={(open) => setOpenGroup(open ? group.label : "")}
		>
			<CollapsibleTrigger
				className={cn(
					"w-full px-2 py-1.5 text-xs hover:text-foreground",
					group === currentGroup ? "text-foreground" : "text-muted-foreground",
				)}
			>
				{group.label}
			</CollapsibleTrigger>

			<CollapsibleContent>
				<ul className="flex flex-col gap-0.5 pt-0.5 pb-2">
					{group.items.map((item) => (
						<li key={item.id}>
							<a
								href={withBase(componentPath(item.id))}
								aria-current={item.id === current ? "page" : undefined}
								className={cn(
									"block rounded-md px-2 py-1.5 text-sm outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset",
									item.id === current
										? "bg-accent font-medium text-foreground"
										: "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
								)}
							>
								{item.name}
							</a>
						</li>
					))}
				</ul>
			</CollapsibleContent>
		</Collapsible>
	));
}
