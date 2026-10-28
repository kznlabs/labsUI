import { test as base, expect, type Page } from "@playwright/test";
import { registry } from "../../src/site/registry";

// E2E_PAGES: unset or "all", else comma-separated registry ids.
const only = process.env.E2E_PAGES;

export const full = !only || only === "all";

const chosen = new Set(only?.split(",").map((id) => id.trim()));

export const selected = (id: string) => full || chosen.has(id);
export const pages = registry.map((entry) => entry.id).filter(selected);

// Fails the test on any uncaught or console error.
export const test = base.extend<{ errors: string[] }>({
	errors: [
		async ({ page }, use) => {
			const errors: string[] = [];

			page.on("pageerror", (error) => errors.push(String(error)));
			page.on("console", (message) => {
				if (message.type() === "error" && !/Failed to load resource/.test(message.text()))
					errors.push(message.text());
			});
			await use(errors);
			expect(errors, "uncaught errors or console errors").toEqual([]);
		},
		{ auto: true },
	],
});

export async function open(page: Page, path: string) {
	await page.goto(path, { waitUntil: "networkidle" });
	// Two frames let ResizeObserver callbacks (OverflowFocus) run.
	await page.evaluate(async () => {
		await document.fonts.ready;
		for (let i = 0; i < 2; i++) await new Promise(requestAnimationFrame);
	});
}

export { expect };
