"use client";

import { useEffect, useState } from "react";
import { clamp } from "@/lib/utils";

/**
 * Index of the current heading: the last one above the line `offset` below the scroller's top, -1
 * before the first. `tops` are positions in the scrolled content. Headings too low to reach the
 * line move it down over the last stretch of scrolling, so each one gets a turn.
 */
export function spyIndex(
	tops: readonly number[],
	scrollTop: number,
	maxScroll: number,
	offset: number,
) {
	let lowest = Number.NEGATIVE_INFINITY;

	for (const top of tops) if (top !== Number.POSITIVE_INFINITY && top > lowest) lowest = top;

	const short = lowest - (maxScroll + offset) + 1;
	let line = scrollTop + offset;

	if (short > 0 && maxScroll > 0) {
		const stretch = Math.min(short, maxScroll);
		// Scroll positions are fractional and can stop just short of the end.
		const remaining = Math.max(0, maxScroll - scrollTop - 1);

		line += short * clamp(1 - remaining / stretch, 0, 1);
	}

	let current = -1;

	for (let i = 0; i < tops.length; i++) if (tops[i] <= line) current = i;

	return current;
}

/** The ancestor that scrolls `element`, or null when the page does. */
export function closestScroller(element: Element) {
	const { body, documentElement } = document;

	for (
		let node = element.parentElement;
		node && node !== body && node !== documentElement;
		node = node.parentElement
	) {
		const { overflowY } = getComputedStyle(node);

		// overflow-x alone computes overflow-y to auto too, so it has to really overflow.
		if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight)
			return node;
	}

	return null;
}

const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);

/**
 * The id whose heading is being read, on the page or in a nested scroller. `pin(id)` keeps an id
 * current until the user scrolls, so a link to a short section stays lit where it lands.
 */
export function useScrollSpy(ids: readonly string[], offset: number) {
	const key = ids.join(" ");
	const [index, setIndex] = useState(-1);
	const [pinned, pin] = useState<string>();

	useEffect(() => {
		const list = key.split(" ").filter(Boolean);
		const tops = list.map(() => Number.POSITIVE_INFINITY);
		const first = list.map((id) => document.getElementById(id)).find(Boolean);
		let scroller = first ? closestScroller(first) : null;
		let frame = 0;

		const measure = () => {
			frame = 0;

			const scrollTop = scroller ? scroller.scrollTop : scrollY;
			const maxScroll = scroller
				? scroller.scrollHeight - scroller.clientHeight
				: document.documentElement.scrollHeight - innerHeight;
			const origin = scroller ? scroller.getBoundingClientRect().top + scroller.clientTop : 0;

			for (let i = 0; i < list.length; i++) {
				const heading = document.getElementById(list[i]);

				// No boxes: display none, e.g. a closed tab.
				tops[i] = heading?.getClientRects().length
					? heading.getBoundingClientRect().top - origin + scrollTop
					: Number.POSITIVE_INFINITY;
			}

			setIndex(spyIndex(tops, scrollTop, maxScroll, offset));
		};

		const schedule = () => {
			frame ||= requestAnimationFrame(measure);
		};

		const observer = new ResizeObserver(() => {
			scroller = first ? closestScroller(first) : null;
			schedule();
		});

		if (first?.parentElement) observer.observe(first.parentElement);

		// Scroll events don't bubble, capture sees a nested scroller's too.
		addEventListener("scroll", schedule, { capture: true, passive: true });
		addEventListener("resize", schedule, { passive: true });
		schedule();

		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			removeEventListener("scroll", schedule, { capture: true });
			removeEventListener("resize", schedule);
		};
	}, [key, offset]);

	useEffect(() => {
		const list = key.split(" ");

		const readHash = () => {
			const target = document.querySelector(":target")?.id;

			pin(target && list.includes(target) ? target : undefined);
		};

		readHash();
		addEventListener("hashchange", readHash);

		return () => removeEventListener("hashchange", readHash);
	}, [key]);

	useEffect(() => {
		if (!pinned) return;

		const release = () => pin(undefined);

		const releaseOnKey = (event: KeyboardEvent) => {
			if (SCROLL_KEYS.has(event.key)) release();
		};

		addEventListener("wheel", release, { passive: true });
		addEventListener("touchmove", release, { passive: true });
		addEventListener("pointerdown", release);
		addEventListener("keydown", releaseOnKey);

		return () => {
			removeEventListener("wheel", release);
			removeEventListener("touchmove", release);
			removeEventListener("pointerdown", release);
			removeEventListener("keydown", releaseOnKey);
		};
	}, [pinned]);

	return { active: pinned && ids.includes(pinned) ? pinned : ids[index], pin };
}
