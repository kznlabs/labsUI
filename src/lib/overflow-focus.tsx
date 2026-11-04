"use client";

import { useEffect, useRef } from "react";

// A table that scrolls itself is display:block, which costs it its role in some engines.
function keepTableRoles(table: HTMLTableElement) {
	if (getComputedStyle(table).display === "table") return;

	table.setAttribute("role", "table");

	for (const section of [table.tHead, ...table.tBodies, table.tFoot])
		section?.setAttribute("role", "rowgroup");

	for (const row of table.rows) {
		row.setAttribute("role", "row");

		for (const cell of row.cells) {
			const isColumnHeader = cell.closest("thead") !== null || cell.getAttribute("scope") === "col";
			const headerRole = isColumnHeader ? "columnheader" : "rowheader";

			cell.setAttribute("role", cell.tagName === "TH" ? headerRole : "cell");
		}
	}
}

function updateFocus(box: HTMLElement) {
	const overflows =
		box.scrollWidth > box.clientWidth + 1 || box.scrollHeight > box.clientHeight + 1;

	if (overflows) box.tabIndex = 0;
	else box.removeAttribute("tabindex");
}

/**
 * Drop inside a scroll container: while the container overflows it becomes keyboard-focusable
 * (tabIndex 0) so arrow keys can scroll it, and it leaves the tab order again once it fits.
 * Renders a hidden span, so server components (Table) can use it as a child.
 */
export function OverflowFocus({
	selector,
}: {
	/** Watch the parent's matching descendants instead of the parent: for scrollers you don't render, like the `pre` and `table` of a Markdown body. */
	selector?: string;
}) {
	const marker = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const parent = marker.current?.parentElement;

		if (!parent) return;

		let boxes: HTMLElement[] = [];

		const update = () => {
			for (const box of boxes) updateFocus(box);
		};

		const observer = new ResizeObserver(update);

		const watch = () => {
			observer.disconnect();
			boxes = selector ? [...parent.querySelectorAll<HTMLElement>(selector)] : [parent];

			for (const box of boxes) {
				observer.observe(box);
				for (const child of box.children) observer.observe(child);

				if (box instanceof HTMLTableElement) keepTableRoles(box);
			}

			update();
		};

		watch();

		if (!selector) return () => observer.disconnect();

		// A body rendered on the client can swap its blocks after this effect runs.
		const content = new MutationObserver(watch);

		content.observe(parent, { childList: true, subtree: true });

		return () => {
			content.disconnect();
			observer.disconnect();
		};
	}, [selector]);

	return <span ref={marker} hidden />;
}
