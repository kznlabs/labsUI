// Generic checks for every component page's <main>: no per-component test needed.
import type { Page } from "@playwright/test";
import { expect } from "./fixtures";

const INTERACTIVE =
	'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"], [role="tab"], [role="checkbox"], [role="switch"], [role="slider"], [role="menuitem"], [role="option"], [tabindex]:not([tabindex="-1"])';

/** Every visible control receives a click at its center, not an overlay or a neighbour. */
export async function clickable(page: Page) {
	const covered = await page.evaluate((selector) => {
		const name = (element: Element) =>
			`${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""} "${(element.getAttribute("aria-label") ?? element.textContent ?? "").trim().slice(0, 30)}"`;
		const out: string[] = [];

		for (const candidate of document.querySelectorAll(`main :is(${selector})`)) {
			if (
				candidate.closest("[inert], [aria-hidden='true'], [aria-disabled='true'], [hidden]") ||
				candidate.matches(":disabled")
			)
				continue;
			if (!candidate.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
			candidate.scrollIntoView({ block: "center", inline: "center", behavior: "instant" });

			// What's left of the box after every clipping ancestor cut it.
			let { left, top, right, bottom } = candidate.getBoundingClientRect();

			for (let element = candidate.parentElement; element; element = element.parentElement) {
				const style = getComputedStyle(element);

				if (style.overflowX === "visible" && style.overflowY === "visible") continue;

				const rect = element.getBoundingClientRect();

				left = Math.max(left, rect.left);
				top = Math.max(top, rect.top);
				right = Math.min(right, rect.right);
				bottom = Math.min(bottom, rect.bottom);
			}

			// Clipped away (closed accordion, folded code) or visually hidden: not meant to be hit.
			if (right - left < 4 || bottom - top < 4) continue;

			const hit = document.elementFromPoint((left + right) / 2, (top + bottom) / 2);

			if (
				!hit ||
				candidate === hit ||
				candidate.contains(hit) ||
				hit.closest("label")?.control === candidate
			)
				continue;
			out.push(`${name(candidate)} is covered by ${name(hit)}`);
		}

		scrollTo(0, 0);

		return out;
	}, INTERACTIVE);

	expect(covered, "controls a click can't reach").toEqual([]);
}

/**
 * Scroll containers that overflow by 2-4 px: a focus ring, border or margin poking out. 1 px is
 * rounding; more is real content (a long code line), which may scroll.
 */
export async function hairlineScroll(page: Page) {
	const found = await page.evaluate(() => {
		const out: string[] = [];

		for (const element of document.querySelectorAll("main *")) {
			const style = getComputedStyle(element);

			if (style.scrollbarWidth === "none") continue;
			for (const [axis, extra] of [
				["x", /auto|scroll/.test(style.overflowX) ? element.scrollWidth - element.clientWidth : 0],
				[
					"y",
					/auto|scroll/.test(style.overflowY) ? element.scrollHeight - element.clientHeight : 0,
				],
			] as const)
				if (extra >= 2 && extra <= 4)
					out.push(
						`${element.tagName.toLowerCase()}.${[...element.classList].slice(0, 4).join(".")} scrolls ${extra}px on ${axis}`,
					);
		}

		return out;
	});

	expect(found, "scroll containers that overflow by a hair").toEqual([]);
}

/** Each real scroll container moves under the mouse wheel (desktop only: no wheel on phones). */
export async function wheelScroll(page: Page) {
	const count = await page.evaluate(() => {
		let count = 0;

		for (const element of document.querySelectorAll("main *")) {
			const style = getComputedStyle(element);
			const x =
				/auto|scroll/.test(style.overflowX) && element.scrollWidth - element.clientWidth > 8;
			const y =
				/auto|scroll/.test(style.overflowY) && element.scrollHeight - element.clientHeight > 8;

			if ((!x && !y) || !element.checkVisibility() || element.closest("[aria-hidden='true']"))
				continue;
			element.setAttribute("data-e2e-scroll", y ? "y" : "x");
			if (++count === 6) break;
		}

		return count;
	});

	for (let i = 0; i < count; i++) {
		const box = page.locator("[data-e2e-scroll]").nth(i);

		await box.scrollIntoViewIfNeeded();

		const axis = await box.getAttribute("data-e2e-scroll");
		// Sum over the box and anything scrollable inside, the wheel may land on a nested one.
		const position = () =>
			box.evaluate((element) =>
				[element, ...element.querySelectorAll("*")].reduce(
					(sum, scroller) => sum + scroller.scrollTop + scroller.scrollLeft,
					0,
				),
			);
		const atEnd = await box.evaluate(
			(element, a) =>
				a === "y"
					? element.scrollTop + element.clientHeight >= element.scrollHeight - 1
					: element.scrollLeft + element.clientWidth >= element.scrollWidth - 1,
			axis,
		);
		const before = await position();

		await box.hover();

		const delta = atEnd ? -200 : 200;

		await page.mouse.wheel(axis === "x" ? delta : 0, axis === "y" ? delta : 0);
		await expect
			.poll(position, {
				message: `${await box.evaluate((target) => target.className)} doesn't scroll`,
			})
			.not.toBe(before);
	}
}

/** Marks up to `max` visible matches so clicks that change attributes can't reshuffle them. */
async function tag(page: Page, selector: string, max: number) {
	const marked = await page.evaluate(
		([selector, max]) => {
			let count = 0;

			for (const candidate of document.querySelectorAll(selector)) {
				if (count === max) break;
				if (!candidate.checkVisibility() || candidate.matches(":disabled, [aria-disabled='true']"))
					continue;

				// Inside a collapsed (zero-size, clipping) ancestor = not on screen.
				let hidden = false;

				for (
					let element = candidate.parentElement;
					element && !hidden;
					element = element.parentElement
				) {
					const style = getComputedStyle(element);
					const rect = element.getBoundingClientRect();

					hidden = style.overflow !== "visible" && (rect.width < 4 || rect.height < 4);
				}

				if (hidden) continue;
				candidate.setAttribute("data-e2e", String(count++));
			}

			return count;
		},
		[selector, max] as const,
	);

	return Array.from({ length: marked }, (_, i) => page.locator(`[data-e2e="${i}"]`));
}

/**
 * ARIA contracts, read from the markup: an `aria-expanded` trigger toggles (popups close on
 * Escape and hand focus back), a tab shows its panel, a slider moves on arrow keys.
 */
export async function widgets(page: Page) {
	const clear = () =>
		page.evaluate(() => {
			for (const element of document.querySelectorAll("[data-e2e]"))
				element.removeAttribute("data-e2e");
		});

	for (const toggle of await tag(
		page,
		'main :is(button, [role="button"], [role="combobox"]:not(input))[aria-expanded]',
		8,
	)) {
		const before = await toggle.getAttribute("aria-expanded");
		const popup = (await toggle.getAttribute("aria-haspopup")) ?? "false";

		await toggle.click();
		await expect(toggle).toHaveAttribute("aria-expanded", before === "true" ? "false" : "true");

		if (before === "false" && popup !== "false") {
			await page.keyboard.press("Escape");
			await expect(toggle).toHaveAttribute("aria-expanded", "false");
			await expect(toggle).toBeFocused();
		} else {
			await toggle.click();
			await expect(toggle).toHaveAttribute("aria-expanded", before ?? "false");
		}
	}

	await clear();

	for (const tab of await tag(page, 'main [role="tab"][aria-selected="false"]', 6)) {
		const panel = await tab.getAttribute("aria-controls");

		await tab.click();
		await expect(tab).toHaveAttribute("aria-selected", "true");
		if (panel) await expect(page.locator(`[id="${panel}"]`)).toBeVisible();
	}

	await clear();

	for (const slider of await tag(page, 'main :is([role="slider"], input[type="range"])', 4)) {
		const value = () =>
			slider.evaluate((element) =>
				element instanceof HTMLInputElement ? element.value : element.getAttribute("aria-valuenow"),
			);
		const before = await value();
		const atMax = await slider.evaluate((element) =>
			element instanceof HTMLInputElement
				? element.value === element.max
				: element.getAttribute("aria-valuenow") === element.getAttribute("aria-valuemax"),
		);

		await slider.focus();
		await page.keyboard.press(atMax ? "ArrowLeft" : "ArrowRight");
		await expect.poll(value, { message: "slider ignores arrow keys" }).not.toBe(before);
	}

	await clear();
}
