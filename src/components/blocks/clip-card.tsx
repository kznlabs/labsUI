"use client";

import { Film } from "lucide-react";
import type { ReactNode } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type ClipCardProps = {
	/** Clip name; also the accessible name of the card. */
	title: string;
	/** "0:42". */
	duration: string;
	/** `<img>` thumbnail; a film glyph stands in without one. */
	thumbnail?: ReactNode;
	/** Width/height, e.g. 9 / 16 for vertical clips. */
	ratio?: number;
	/** How much was watched, 0 to 100: a thin bar along the bottom of the thumbnail. */
	watched?: number;
	/** Small print under the title, e.g. "12.4K views · 2 days ago". */
	meta?: ReactNode;
	/** Context menu items (`<ContextMenuItem>`s): right-click or Shift+F10 opens them. */
	actions?: ReactNode;
	className?: string;
};

/** Video tile: thumbnail in an AspectRatio, duration Badge, watched Progress and a context menu. */
export function ClipCard({
	title,
	duration,
	thumbnail,
	ratio = 16 / 9,
	watched,
	meta,
	actions,
	className,
}: ClipCardProps) {
	const body = (
		<>
			<AspectRatio
				ratio={ratio}
				className="grid place-items-center overflow-hidden rounded-lg bg-foreground/[0.06] text-muted-foreground"
			>
				{thumbnail ?? <Film className="size-5" aria-hidden="true" />}

				<Badge variant="secondary" className="absolute right-1.5 bottom-2 tabular-nums">
					<span className="sr-only">Duration </span>

					{duration}
				</Badge>

				{watched !== undefined && watched > 0 && (
					<Progress
						value={watched}
						aria-label="Watched"
						size="sm"
						className="absolute inset-x-0 bottom-0 [&_[role=progressbar]]:rounded-none"
					/>
				)}
			</AspectRatio>

			<div className="grid gap-0.5 px-0.5 text-left">
				<p className="truncate font-medium text-sm">{title}</p>

				{meta && <p className="truncate text-muted-foreground text-xs">{meta}</p>}
			</div>
		</>
	);
	const classes = cn(
		"grid content-start gap-2 rounded-xl p-1.5 transition-colors hover:bg-accent",
		className,
	);

	if (!actions) return <div className={classes}>{body}</div>;

	return (
		<ContextMenu>
			<ContextMenuTrigger
				aria-label={`${title}, ${duration}. Right-click or press Shift+F10 for actions.`}
				className={classes}
			>
				{body}
			</ContextMenuTrigger>

			<ContextMenuContent>{actions}</ContextMenuContent>
		</ContextMenu>
	);
}
