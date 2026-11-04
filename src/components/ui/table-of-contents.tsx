"use client";

import { motion } from "motion/react";
import { type ComponentProps, type MouseEvent, useEffect, useId, useRef } from "react";
import { scrollIntoList } from "@/lib/list";
import { closestScroller, useScrollSpy } from "@/lib/scroll-spy";
import { useIndicator } from "@/lib/use-indicator";
import { cn, spring } from "@/lib/utils";

export type TableOfContentsItem = {
	/** `id` of the heading this entry links to. */
	id: string;
	/** Text of the link. */
	label: string;
	/** Heading level, e.g. 2 for an `h2`. Deeper levels indent. */
	level?: number;
};

type TableOfContentsProps = Omit<ComponentProps<"nav">, "children"> & {
	/** Sections in page order. */
	items: TableOfContentsItem[];
	/** Title over the list and the navigation's accessible name. */
	label?: string;
	/** Keeps `label` for screen readers only, e.g. inside a Collapsible that already says it. */
	hideLabel?: boolean;
	/** Pixels below the top of the scroller where a heading becomes current. Keep it at or above the headings' `scroll-margin-top`. */
	offset?: number;
};

function jump(target: HTMLElement, scroller: HTMLElement) {
	const margin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
	const top =
		target.getBoundingClientRect().top -
		scroller.getBoundingClientRect().top -
		scroller.clientTop +
		scroller.scrollTop -
		margin;
	const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

	scroller.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
	history.pushState(null, "", `#${target.id}`);

	// Tab continues from the section, as it does after a jump on the page.
	if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
	target.focus({ preventScroll: true });
}

/**
 * Links to a page's sections that follow the reader. Works on the page or in a nested scroller, and
 * short sections at the end still get their turn. Give the root a `max-h-*` and it scrolls itself,
 * keeping the current link in view.
 */
export function TableOfContents({
	items,
	label = "On this page",
	hideLabel = false,
	offset = 96,
	className,
	...props
}: TableOfContentsProps) {
	const titleId = useId();
	const { active, pin } = useScrollSpy(
		items.map((item) => item.id),
		offset,
	);
	const links = useRef(new Map<string, HTMLAnchorElement>()).current;
	const list = useRef<HTMLDivElement>(null);
	const box = useIndicator(links, active);
	const topLevel = Math.min(...items.map((item) => item.level ?? 2));

	useEffect(() => {
		const link = active === undefined ? undefined : links.get(active);

		if (link && list.current) scrollIntoList(list.current, link);
	}, [active, links]);

	const onClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

		pin(id);

		const target = document.getElementById(id);
		const scroller = target && closestScroller(target);

		// On the page the browser's own jump keeps the hash, history and Tab order right, but in a
		// nested scroller it would also move the page.
		if (!target || !scroller) return;

		event.preventDefault();
		jump(target, scroller);
	};

	return (
		<nav
			aria-label={hideLabel ? label : undefined}
			aria-labelledby={hideLabel ? undefined : titleId}
			className={cn("flex min-h-0 flex-col gap-2 text-sm", className)}
			{...props}
		>
			{!hideLabel && (
				<p id={titleId} className="font-medium">
					{label}
				</p>
			)}

			<div ref={list} className="relative min-h-0 flex-1 overflow-y-auto py-1 pr-1">
				{box.height > 0 && (
					<motion.span
						aria-hidden="true"
						className="absolute top-0 left-0 w-0.5 rounded-full bg-primary"
						initial={false}
						animate={{ y: box.y, height: box.height }}
						transition={spring}
					/>
				)}

				<ul className="flex flex-col gap-0.5 border-l pl-1">
					{items.map((item) => (
						<li key={item.id}>
							<a
								ref={(element) => {
									if (element) links.set(item.id, element);
									else links.delete(item.id);
								}}
								href={`#${item.id}`}
								aria-current={item.id === active ? "location" : undefined}
								onClick={(event) => onClick(event, item.id)}
								style={{ paddingLeft: `${0.5 + ((item.level ?? 2) - topLevel) * 0.75}rem` }}
								className={cn(
									"block rounded-md py-1 pr-2 outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50",
									item.id === active
										? "text-foreground"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								{item.label}
							</a>
						</li>
					))}
				</ul>
			</div>
		</nav>
	);
}
