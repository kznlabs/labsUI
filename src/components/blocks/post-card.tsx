import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { AppLink } from "@/lib/link";
import { cn } from "@/lib/utils";

/* Server-safe; onNavigate only comes from client parents. */

type PostCardProps = Omit<ComponentProps<"article">, "title" | "children"> & {
	/** Title of the post or project, the card's heading. */
	title: ReactNode;
	/** Page it leads to. The whole card becomes the link. */
	href?: string;
	/** Heading level, to fit the page's outline. */
	as?: "h2" | "h3" | "h4";
	/** One or two sentences, cut off after three lines. */
	excerpt?: ReactNode;
	/** Cover (`<img>`). Left out, the card is text only. */
	media?: ReactNode;
	/** Cover width/height, e.g. 1 for square. */
	ratio?: number;
	/** Date as shown, e.g. "Oct 21, 2026" or a year. */
	time?: ReactNode;
	/** Machine-readable date for `time`, e.g. "2026-10-21". */
	dateTime?: string;
	/** Beside the date, e.g. the author or "6 min read". */
	meta?: ReactNode;
	/** Topics or a project's stack, as badges. */
	tags?: string[];
	/** Your own links, e.g. to a project's source. They stay clickable over the card's link. */
	action?: ReactNode;
	/** `onClick` for the card's link, e.g. for client routing or to stub the link in a demo. */
	onNavigate?: (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
};

/** Tile for a blog post or portfolio project: cover, date, title, excerpt and tags, with the whole card as one link. */
export function PostCard({
	title,
	href,
	as: Heading = "h3",
	excerpt,
	media,
	ratio = 16 / 9,
	time,
	dateTime,
	meta,
	tags,
	action,
	onNavigate,
	className,
	...props
}: PostCardProps) {
	return (
		<article
			className={cn(
				"group/post relative flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-xs has-[a[data-post-link]:focus-visible]:ring-[3px] has-[a[data-post-link]:focus-visible]:ring-ring/50",
				className,
			)}
			{...props}
		>
			{media && (
				<AspectRatio ratio={ratio} className="overflow-hidden bg-muted">
					{media}
				</AspectRatio>
			)}

			<div className="flex flex-1 flex-col gap-2 p-4">
				{(time || meta) && (
					<p className="flex flex-wrap items-center gap-x-1.5 text-muted-foreground text-xs">
						{time && <time dateTime={dateTime}>{time}</time>}

						{time && meta && <span aria-hidden="true">·</span>}

						{meta}
					</p>
				)}

				<Heading className="font-medium text-base wrap-break-word">
					{href ? (
						<AppLink
							data-post-link
							href={href}
							onClick={onNavigate ? (event) => onNavigate(href, event) : undefined}
							className="outline-none group-hover/post:underline after:absolute after:inset-0"
						>
							{title}
						</AppLink>
					) : (
						title
					)}
				</Heading>

				{excerpt && <p className="line-clamp-3 text-muted-foreground text-sm">{excerpt}</p>}

				{(tags?.length || action) && (
					<div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
						{tags?.length ? (
							<ul className="flex flex-wrap gap-1.5">
								{tags.map((tag) => (
									<li key={tag}>
										<Badge variant="secondary">{tag}</Badge>
									</li>
								))}
							</ul>
						) : null}

						{action && <div className="relative z-10 flex items-center gap-2">{action}</div>}
					</div>
				)}
			</div>
		</article>
	);
}
