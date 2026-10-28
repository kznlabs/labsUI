"use client";

import { useEffect, useRef } from "react";

/**
 * Drop inside a scroll container: while the container overflows it becomes keyboard-focusable
 * (tabIndex 0) so arrow keys can scroll it, and it leaves the tab order again once it fits.
 * Renders a hidden span, so server components (Table) can use it as a child.
 */
export function OverflowFocus() {
	const marker = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const box = marker.current?.parentElement;

		if (!box) return;

		const update = () => {
			const overflows =
				box.scrollWidth > box.clientWidth + 1 || box.scrollHeight > box.clientHeight + 1;

			if (overflows) box.tabIndex = 0;
			else box.removeAttribute("tabindex");
		};

		const observer = new ResizeObserver(update);

		observer.observe(box);
		for (const child of box.children) observer.observe(child);
		update();

		return () => observer.disconnect();
	}, []);

	return <span ref={marker} hidden />;
}
