"use client";

import { useEffect } from "react";

const accent = "green";

/** Applies the shop's look to <html> while the demo is mounted, and restores the page on leave. */
export function PrintTheme({ fontClass }: { fontClass: string }) {
	useEffect(() => {
		const root = document.documentElement;
		const classes = fontClass.split(" ");
		const previousAccent = root.getAttribute("data-accent");

		root.classList.add("shop-print", ...classes);
		root.setAttribute("data-accent", accent);

		return () => {
			root.classList.remove("shop-print", ...classes);

			if (previousAccent === null) root.removeAttribute("data-accent");
			else root.setAttribute("data-accent", previousAccent);
		};
	}, [fontClass]);

	return null;
}
