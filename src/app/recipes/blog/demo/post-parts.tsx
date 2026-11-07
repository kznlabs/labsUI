"use client";

import { Link2 } from "lucide-react";
import { motion, useScroll, useSpring } from "motion/react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TableOfContents, type TableOfContentsItem } from "@/components/ui/table-of-contents";
import { toast } from "@/components/ui/toast";

/** A hairline under the headers that fills as the reader scrolls. */
export function ReadingProgress() {
	const { scrollYProgress } = useScroll();
	const scaleX = useSpring(scrollYProgress, { stiffness: 400, damping: 40 });

	return (
		<motion.div
			aria-hidden="true"
			style={{ scaleX }}
			className="fixed inset-x-0 top-12 z-50 h-0.5 origin-left bg-primary"
		/>
	);
}

export function CopyLink() {
	return (
		<Button
			variant="outline"
			size="sm"
			onClick={async () => {
				try {
					await navigator.clipboard.writeText(location.href);
					toast.success("Link copied");
				} catch {
					toast.error("Couldn't copy the link");
				}
			}}
		>
			<Link2 aria-hidden="true" />
			Copy link
		</Button>
	);
}

// Headers above: the demo bar (48 px) and the blog's own (64 px).
const offset = 128;

export function Contents({ items }: { items: TableOfContentsItem[] }) {
	return (
		<>
			<Collapsible className="rounded-xl border bg-card px-4 lg:hidden">
				<CollapsibleTrigger className="w-full py-3 font-medium text-sm">
					On this page
				</CollapsibleTrigger>

				<CollapsibleContent className="pb-3">
					<TableOfContents hideLabel label="On this page" items={items} offset={offset} />
				</CollapsibleContent>
			</Collapsible>

			<TableOfContents
				label="On this page"
				items={items}
				offset={offset}
				className="sticky top-32 max-h-[calc(100dvh-9rem)] max-lg:hidden"
			/>
		</>
	);
}
