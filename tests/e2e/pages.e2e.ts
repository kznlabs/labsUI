import type { Page } from "@playwright/test";
import { axe, clickable, hairlineScroll, hiddenTabStops, wheelScroll, widgets } from "./checks";
import { expect, full, open, pages, test } from "./fixtures";

async function overflow(page: Page) {
	const extra = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);

	expect(extra, "page scrolls sideways by this many px").toBeLessThanOrEqual(0);
}

// The homepage: showcase, Getting started and the component index.
if (full)
	test("home", async ({ page }) => {
		await open(page, "");
		await overflow(page);
		await axe(page, "light", "page");
		await axe(page, "dark", "page");
	});

for (const id of pages)
	test(id, async ({ page }) => {
		await open(page, `components/${id}`);
		await overflow(page);
		await hairlineScroll(page);
		await clickable(page);
		await hiddenTabStops(page);
		await axe(page, "light", "main");
		await axe(page, "dark", "main");

		// Wheel and widget sweeps need a mouse and the desktop layout.
		if ((page.viewportSize()?.width ?? 0) >= 1024) {
			await wheelScroll(page);
			await widgets(page);
		}
	});

// Header, sidebar and footer, the per-page checks skip them.
test("page chrome", async ({ page }) => {
	await open(page, `components/${pages[0] ?? "button"}`);
	await axe(page, "light", "page");
	await axe(page, "dark", "page");
});

test.describe("docs sidebar", () => {
	test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024);

	const sidebar = (page: Page) => page.locator("aside").getByRole("navigation");
	const group = (page: Page, name: string) => sidebar(page).getByRole("button", { name });

	test("opens on the current group with the current link in view", async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 600 });
		await open(page, "components/timeline");

		const link = sidebar(page).getByRole("link", { name: "Timeline" });

		await expect(link).toHaveAttribute("aria-current", "page");
		await expect(link).toBeInViewport({ ratio: 1 });
		await expect(group(page, "Data display")).toHaveAttribute("aria-expanded", "true");
		await expect(sidebar(page).locator('button[aria-expanded="true"]')).toHaveCount(1);
	});

	test("the list is in place before scripts run", async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 600 });
		await page.route("**/_next/static/**/*.js", (route) => route.abort());
		await page.goto("components/timeline", { waitUntil: "domcontentloaded" });

		await expect(sidebar(page).getByRole("link", { name: "Timeline" })).toBeInViewport({
			ratio: 1,
		});
	});

	test("opening a group closes the other", async ({ page }) => {
		await open(page, "components/timeline");
		await group(page, "Motion").click();

		await expect(group(page, "Motion")).toHaveAttribute("aria-expanded", "true");
		await expect(group(page, "Data display")).toHaveAttribute("aria-expanded", "false");
		await expect(sidebar(page).locator('button[aria-expanded="true"]')).toHaveCount(1);
	});
});
