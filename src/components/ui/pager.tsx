import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Server-safe; onNavigate only comes from client parents. */

export type PagerLink = {
	/** Title of the page it leads to. */
	title: ReactNode;
	/** URL of that page. */
	href: string;
};

type PagerProps = Omit<ComponentProps<"nav">, "children"> & {
	/** The page before this one. Left out on the first page. */
	previous?: PagerLink;
	/** The page after this one. Left out on the last page. */
	next?: PagerLink;
	/** Word over the previous page's title. */
	previousLabel?: ReactNode;
	/** Word over the next page's title. */
	nextLabel?: ReactNode;
	/** Accessible name of the navigation. */
	label?: string;
	/** `onClick` for both links, e.g. for client routing or to stub links in a demo. */
	onNavigate?: (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
};

const linkClass =
	"flex min-w-0 flex-col gap-1 rounded-xl border bg-card px-4 py-3 text-sm wrap-break-word outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50";

const hintClass = "inline-flex items-center gap-1 text-muted-foreground text-xs";

/** Links to the previous and next page of a guide or docs site, titled so readers know where they lead. Layout follows its container. */
export function Pager({
	previous,
	next,
	previousLabel = "Previous",
	nextLabel = "Next",
	label = "Pages",
	onNavigate,
	className,
	...props
}: PagerProps) {
	if (!previous && !next) return null;

	return (
		<nav aria-label={label} className={cn("@container", className)} {...props}>
			<div className="grid gap-3 @md:grid-cols-2">
				{previous && (
					<a
						href={previous.href}
						rel="prev"
						onClick={onNavigate ? (event) => onNavigate(previous.href, event) : undefined}
						className={linkClass}
					>
						<span className={hintClass}>
							<ArrowLeft className="size-3.5" aria-hidden="true" />

							{previousLabel}
						</span>

						<span className="font-medium">{previous.title}</span>
					</a>
				)}

				{next && (
					<a
						href={next.href}
						rel="next"
						onClick={onNavigate ? (event) => onNavigate(next.href, event) : undefined}
						className={cn(linkClass, "items-end text-right @md:col-start-2")}
					>
						<span className={hintClass}>
							{nextLabel}

							<ArrowRight className="size-3.5" aria-hidden="true" />
						</span>

						<span className="max-w-full font-medium">{next.title}</span>
					</a>
				)}
			</div>
		</nav>
	);
}
