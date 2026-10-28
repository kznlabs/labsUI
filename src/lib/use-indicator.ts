"use client";

import { useLayoutEffect, useState } from "react";

/**
 * Offset and width of the active item, for one indicator that springs between items (Tabs,
 * ToggleGroup). Re-measures when the item or its row resizes (font swap, wrap), or the pill
 * drifts off its label. Width 0 when nothing is active.
 */
export function useIndicator(items: ReadonlyMap<string, HTMLElement>, active: string | undefined) {
	const [box, setBox] = useState({ x: 0, width: 0 });

	useLayoutEffect(() => {
		const element = active === undefined ? undefined : items.get(active);

		if (!element) return setBox({ x: 0, width: 0 });

		const measure = () => setBox({ x: element.offsetLeft, width: element.offsetWidth });

		measure();

		const observer = new ResizeObserver(measure);

		if (element.parentElement) observer.observe(element.parentElement);
		observer.observe(element);

		return () => observer.disconnect();
	}, [items, active]);

	return box;
}
