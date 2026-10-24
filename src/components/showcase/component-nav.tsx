"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Separator } from "@/components/ui/separator";
import { useComponentFilter } from "@/lib/showcase-context";
import { cn } from "@/lib/utils";

/**
 * Docs sidebar: own scroll area, search (Ctrl/⌘+F focuses) that also filters the page's
 * sections, groups split by separators, scroll-spy.
 */
export function ComponentNav() {
	const { groups, query, setQuery, shown, matches } = useComponentFilter();
	const [active, setActive] = useState<string>();
	const list = useRef<HTMLDivElement>(null);
	const first = shown[0]?.items[0];

	// Filtering collapses the page under you; bring the first match back into view if it left.
	useEffect(() => {
		if (!matches || !first) return;
		const el = document.getElementById(first.id);
		if (!el) return;
		const { top } = el.getBoundingClientRect();
		if (top < 0 || top > innerHeight) el.scrollIntoView({ block: "start" });
	}, [matches, first]);

	// Scroll-spy: the current section is the last one whose top has passed a line a third of the
	// way down the viewport. Several short sections can share the viewport.
	useEffect(() => {
		const sections = groups
			.flatMap((g) => g.items)
			.map((i) => document.getElementById(i.id))
			.filter((el): el is HTMLElement => el !== null);
		let frame = 0;
		const update = () => {
			frame = 0;
			const line = innerHeight / 3;
			let current: string | undefined;
			for (const s of sections)
				if (!s.hidden && s.getBoundingClientRect().top <= line) current = s.id;
			setActive(current);
		};
		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};
		update();
		// Sections hidden by the search change the layout without a scroll event.
		const mo = new MutationObserver(onScroll);
		for (const s of sections) mo.observe(s, { attributeFilter: ["hidden"] });
		addEventListener("scroll", onScroll, { passive: true });
		addEventListener("resize", onScroll);
		return () => {
			cancelAnimationFrame(frame);
			mo.disconnect();
			removeEventListener("scroll", onScroll);
			removeEventListener("resize", onScroll);
		};
	}, [groups]);

	// Keep the current link inside the nav's own scroll area, without moving the page.
	useEffect(() => {
		const box = list.current;
		const link = box?.querySelector<HTMLElement>(`[href="#${active}"]`);
		if (!box || !link) return;
		const top = link.offsetTop - box.offsetTop;
		if (top < box.scrollTop) box.scrollTop = top - 8;
		else if (top + link.offsetHeight > box.scrollTop + box.clientHeight)
			box.scrollTop = top + link.offsetHeight - box.clientHeight + 8;
	}, [active]);

	return (
		<nav aria-label="Components" className="flex max-h-[calc(100dvh-6rem)] flex-col gap-3">
			<SearchInput
				label="Search components"
				placeholder="Search…"
				shortcut="mod+f"
				value={query}
				onValueChange={setQuery}
				onKeyDown={(e) => {
					if (e.key === "Enter" && first) {
						e.preventDefault();
						location.hash = first.id;
					}
				}}
				className="shrink-0"
			/>
			<div
				ref={list}
				className="-mx-1 relative min-h-0 overflow-y-auto overscroll-contain px-1 pb-4"
			>
				{shown.length === 0 ? (
					<p className="px-2 py-6 text-center text-muted-foreground text-sm">
						No components match “{query.trim()}”.
					</p>
				) : (
					shown.map((g, gi) => (
						<Fragment key={g.label}>
							{gi > 0 && <Separator className="my-3" />}
							<p className="mb-1 px-2 font-medium text-muted-foreground text-xs">{g.label}</p>
							<ul className="flex flex-col">
								{g.items.map((c) => (
									<li key={c.id}>
										<a
											href={`#${c.id}`}
											aria-current={active === c.id ? "location" : undefined}
											className={cn(
												"block rounded-md px-2 py-1.5 text-sm outline-none transition-colors duration-400 ease-in-out focus-visible:ring-[3px] focus-visible:ring-ring/50",
												active === c.id
													? "bg-accent font-medium text-foreground"
													: "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
											)}
										>
											{c.name}
										</a>
									</li>
								))}
							</ul>
						</Fragment>
					))
				)}
			</div>
		</nav>
	);
}
