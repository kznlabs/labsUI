import { ChevronRight } from "lucide-react";
import type { ComponentProps, MouseEventHandler, ReactNode } from "react";

export type BreadcrumbItem = {
	/** What the step reads as. */
	label: ReactNode;
	/** Leave out for a step that has no page of its own. */
	href?: string;
	/** Client parents only, e.g. to route without a reload. */
	onClick?: MouseEventHandler<HTMLAnchorElement>;
};

type BreadcrumbProps = Omit<ComponentProps<"nav">, "children"> & {
	/** The trail, outermost first. The last item is the current page. */
	items: BreadcrumbItem[];
	/** Drawn between items. Default a chevron. */
	separator?: ReactNode;
};

/** Where the page sits in the site: a list of links ending at the current page. Server-safe. */
export function Breadcrumb({
	items,
	separator,
	className,
	"aria-label": label = "Breadcrumb",
	...props
}: BreadcrumbProps) {
	return (
		<nav aria-label={label} className={className} {...props}>
			<ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium text-muted-foreground text-sm">
				{items.map((item, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: a trail is positional and has no ids
					<li key={i} className="inline-flex items-center gap-2">
						{i > 0 && (
							<span aria-hidden="true" className="text-muted-foreground/60 [&>svg]:size-3.5">
								{separator ?? <ChevronRight />}
							</span>
						)}

						{i === items.length - 1 ? (
							<span aria-current="page" className="text-foreground">
								{item.label}
							</span>
						) : item.href ? (
							<a
								href={item.href}
								onClick={item.onClick}
								className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
							>
								{item.label}
							</a>
						) : (
							<span>{item.label}</span>
						)}
					</li>
				))}
			</ol>
		</nav>
	);
}
