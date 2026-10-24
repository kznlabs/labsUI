import { Rocket } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { KbdGroup } from "@/components/ui/kbd";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { cn } from "@/lib/utils";

/* Server-safe (no "use client"). */

type Change = { type: "new" | "improved" | "fixed"; text: ReactNode };

type Release = {
	version: string;
	title: string;
	/** Shown, e.g. "Oct 21, 2026". */
	date: string;
	/** Machine-readable, e.g. "2026-10-21". */
	dateTime?: string;
	changes: Change[];
	/** Keys to try the headline feature, e.g. ["⌘", "K"]. */
	shortcut?: string[];
};

const kinds = {
	new: { label: "New", variant: "default" },
	improved: { label: "Improved", variant: "secondary" },
	fixed: { label: "Fixed", variant: "outline" },
} as const;

/** Release notes on a Timeline: the newest release is the highlighted one, changes are typed with Badges, Kbd shows how to try it. */
export function Changelog({ releases, className }: { releases: Release[]; className?: string }) {
	return (
		<Timeline className={cn("w-full", className)}>
			{releases.map((r, i) => (
				<TimelineItem
					key={r.version}
					icon={i === 0 ? <Rocket /> : undefined}
					variant={i === 0 ? "active" : "default"}
					time={r.date}
					dateTime={r.dateTime}
					title={
						<span className="flex flex-wrap items-center gap-2">
							<Badge variant="secondary" className="font-mono">
								{r.version}
							</Badge>
							{r.title}
						</span>
					}
				>
					<ul className="mt-2 flex flex-col gap-1.5">
						{r.changes.map((c, j) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: release notes are static
							<li key={j} className="flex items-start gap-2">
								<Badge variant={kinds[c.type].variant} className="mt-px w-16 justify-center">
									{kinds[c.type].label}
								</Badge>
								<span>{c.text}</span>
							</li>
						))}
					</ul>
					{r.shortcut && (
						<p className="mt-3 flex items-center gap-2 text-muted-foreground text-xs">
							Try it <KbdGroup keys={r.shortcut} />
						</p>
					)}
				</TimelineItem>
			))}
		</Timeline>
	);
}
