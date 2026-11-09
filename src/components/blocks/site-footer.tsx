import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { AppLink } from "@/lib/link";
import { cn } from "@/lib/utils";

/* Server-safe; onNavigate only comes from client parents. */

export type SiteFooterColumn = {
	/** Column heading. */
	title: string;
	/** Links under the heading, top to bottom. */
	links: { label: string; href: string }[];
};

type SiteFooterProps = ComponentProps<"footer"> & {
	/** Logo link, e.g. `<a href="/">Acme</a>`. */
	brand?: ReactNode;
	/** One or two lines under the brand. */
	description?: ReactNode;
	/** Link columns, left to right. */
	columns?: SiteFooterColumn[];
	/** Controls under the description, e.g. social links or a ThemeToggle. */
	actions?: ReactNode;
	/** Bottom line: copyright, company details, legal links. */
	legal?: ReactNode;
	/** Accessible name of the links' navigation. */
	label?: string;
	/** `onClick` for every column link, e.g. for client routing or to stub links in a demo. */
	onNavigate?: (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
};

/** Page footer: brand, link columns and a legal line. Every part is optional. */
export function SiteFooter({
	brand,
	description,
	columns,
	actions,
	legal,
	label = "Footer",
	onNavigate,
	className,
	...props
}: SiteFooterProps) {
	const hasIntro = Boolean(brand || description || actions);
	const hasColumns = Boolean(columns?.length);
	const hasMain = hasIntro || hasColumns;

	return (
		<footer className={cn("@container border-t", className)} {...props}>
			<div
				className={cn(
					"mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6",
					hasMain ? "py-10" : "py-6",
				)}
			>
				{hasMain && (
					<div className="grid gap-10 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
						{hasIntro && (
							<div className="flex flex-col items-start gap-3">
								{brand && (
									<div className="flex items-center gap-2 font-semibold text-sm [&>a]:inline-flex [&>a]:min-h-6 [&>a]:items-center">
										{brand}
									</div>
								)}

								{description && (
									<p className="max-w-xs text-muted-foreground text-sm">{description}</p>
								)}

								{actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
							</div>
						)}

						{hasColumns && (
							<nav
								aria-label={label}
								className={cn(
									"grid grid-cols-2 gap-x-6 gap-y-8 @xl:grid-cols-3 @5xl:grid-cols-4",
									!hasIntro && "@3xl:col-span-2",
								)}
							>
								{columns?.map((column) => (
									<section key={column.title} className="flex min-w-0 flex-col gap-2">
										<h2 className="font-medium text-sm">{column.title}</h2>

										<ul className="flex flex-col gap-1">
											{column.links.map((link) => (
												<li key={link.href}>
													<AppLink
														href={link.href}
														onClick={
															onNavigate ? (event) => onNavigate(link.href, event) : undefined
														}
														className="inline-flex min-h-6 items-center rounded-sm text-muted-foreground text-sm underline-offset-4 outline-none transition-colors hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
													>
														{link.label}
													</AppLink>
												</li>
											))}
										</ul>
									</section>
								))}
							</nav>
						)}
					</div>
				)}

				{legal && (
					<div className={cn("text-muted-foreground text-xs", hasMain && "border-t pt-6")}>
						{legal}
					</div>
				)}
			</div>
		</footer>
	);
}
