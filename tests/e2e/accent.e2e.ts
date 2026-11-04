import type { Locator, Page } from "@playwright/test";
import { axe } from "./checks";
import { expect, open, selected, test } from "./fixtures";

test.skip(!selected("accent-picker"), "page not in this run");

const folded = (page: Page) => page.locator("[data-probe=folded]");
const dot = (page: Page, color: string) =>
	folded(page).getByRole("button", { name: `Accent color: ${color}` });
const radio = (page: Page, color: string) => folded(page).getByRole("radio", { name: color });
// The radio itself is visually hidden, its label is what shows and takes the click.
const swatch = (page: Page, color: string) => folded(page).locator(`label[title=${color}]`);
const after = (page: Page) => folded(page).getByRole("button", { name: "After" });
const accent = (page: Page) => page.evaluate(() => document.documentElement.dataset.accent);

// A click during hydration reaches the DOM but no handler, so the first one on a page may retry.
const firstClick = (trigger: Locator) =>
	expect(async () => {
		await trigger.click();
		await expect(trigger).toHaveAttribute("aria-expanded", "true", { timeout: 1000 });
	}).toPass();

async function unfold(page: Page) {
	await open(page, "e2e/accent");
	await firstClick(dot(page, "Blue"));
}

test("the dot is a named button of at least 24 px, the radios stay out while folded", async ({
	page,
}) => {
	await open(page, "e2e/accent");

	const trigger = dot(page, "Blue");
	const box = await trigger.boundingBox();

	expect(box?.width).toBeGreaterThanOrEqual(24);
	expect(box?.height).toBeGreaterThanOrEqual(24);
	await expect(trigger).toHaveAttribute("aria-expanded", "false");
	await expect(radio(page, "blue").locator("xpath=ancestor::*[@inert]")).toHaveCount(1);

	await trigger.focus();
	await page.keyboard.press("Tab");
	await expect(after(page)).toBeFocused();
});

test("arrow keys walk the radios and leave it open, Enter picks and closes", async ({ page }) => {
	await unfold(page);

	await radio(page, "blue").focus();
	await page.keyboard.press("ArrowRight");
	await expect(radio(page, "purple")).toBeChecked();
	await expect(radio(page, "purple")).toBeFocused();
	await expect(dot(page, "Purple")).toHaveAttribute("aria-expanded", "true");

	await page.keyboard.press("ArrowRight");
	await expect(radio(page, "pink")).toBeChecked();
	await expect(dot(page, "Pink")).toHaveAttribute("aria-expanded", "true");

	await page.keyboard.press("Enter");
	await expect(dot(page, "Pink")).toHaveAttribute("aria-expanded", "false");
	await expect(dot(page, "Pink")).toBeFocused();
	expect(await accent(page)).toBe("pink");
});

test("a click picks and closes, also on the current color", async ({ page }) => {
	await unfold(page);

	await swatch(page, "Green").click();
	await expect(dot(page, "Green")).toHaveAttribute("aria-expanded", "false");
	await expect(dot(page, "Green")).toBeFocused();
	expect(await accent(page)).toBe("green");

	await dot(page, "Green").click();
	await swatch(page, "Green").click();
	await expect(dot(page, "Green")).toHaveAttribute("aria-expanded", "false");
});

test("Esc closes, hands focus to the dot and undoes the walk", async ({ page }) => {
	await unfold(page);

	await radio(page, "blue").focus();
	await page.keyboard.press("ArrowLeft");
	await expect(radio(page, "green")).toBeChecked();

	await page.keyboard.press("Escape");
	await expect(dot(page, "Blue")).toHaveAttribute("aria-expanded", "false");
	await expect(dot(page, "Blue")).toBeFocused();
	expect(await accent(page)).toBeUndefined();

	// From the dot itself too.
	await dot(page, "Blue").click();
	await page.keyboard.press("Escape");
	await expect(dot(page, "Blue")).toHaveAttribute("aria-expanded", "false");
	await expect(dot(page, "Blue")).toBeFocused();
});

test("an outside click closes and undoes the walk: focus on the dot, or on what it hit", async ({
	page,
	browserName,
}) => {
	await unfold(page);

	await radio(page, "blue").focus();
	await page.keyboard.press("ArrowRight");
	await page.getByText("Nothing to click here.").click();
	await expect(dot(page, "Blue")).toHaveAttribute("aria-expanded", "false");
	await expect(dot(page, "Blue")).toBeFocused();
	expect(await accent(page)).toBeUndefined();

	await dot(page, "Blue").click();
	await expect(dot(page, "Blue")).toHaveAttribute("aria-expanded", "true");
	await after(page).click();
	await expect(dot(page, "Blue")).toHaveAttribute("aria-expanded", "false");
	// WebKit doesn't focus a button on click: focus lands nowhere, so the dot takes it.
	if (browserName !== "webkit") await expect(after(page)).toBeFocused();
});

test("tabbing away closes it", async ({ page }) => {
	await unfold(page);

	await radio(page, "blue").focus();
	await page.keyboard.press("ArrowRight");
	await page.keyboard.press("Tab");
	await expect(after(page)).toBeFocused();
	await expect(dot(page, "Blue")).toHaveAttribute("aria-expanded", "false");
});

test("nothing beside the dot moves, the colors stay on screen and inside the row", async ({
	page,
}) => {
	for (const width of [320, 375, 1280]) {
		await page.setViewportSize({ width, height: 800 });
		await open(page, "e2e/accent");

		const boxes = () =>
			Promise.all(
				[dot(page, "Blue"), after(page), folded(page).getByRole("button", { name: "Before" })].map(
					(control) => control.boundingBox(),
				),
			);
		const before = await boxes();

		await firstClick(dot(page, "Blue"));
		await expect(swatch(page, "Red")).toBeInViewport({ ratio: 1 });
		expect(await boxes()).toEqual(before);

		const row = await folded(page).boundingBox();

		for (const name of ["Red", "Slate"]) {
			const box = await swatch(page, name).boundingBox();

			expect(box?.x).toBeGreaterThanOrEqual(0);
			expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(
				(row?.y ?? 0) + (row?.height ?? 0),
			);
		}
	}
});

test("the row still picks with a click and arrow keys, with no dot", async ({ page }) => {
	await open(page, "e2e/accent");

	const row = page.locator("[data-probe=row]");

	await expect(row.getByRole("button")).toHaveCount(0);

	await row.locator("label[title=Green]").click();
	expect(await accent(page)).toBe("green");

	await row.getByRole("radio", { name: "green" }).focus();
	await page.keyboard.press("ArrowLeft");
	await expect(row.getByRole("radio", { name: "yellow" })).toBeFocused();
	expect(await accent(page)).toBe("yellow");
});

test("the site header keeps its nav and search in place at every width", async ({ page }) => {
	for (const width of [320, 375, 768, 1024, 1280, 1536]) {
		await page.setViewportSize({ width, height: 800 });
		await open(page, "components/accent-picker");

		const header = page.locator("header").first();
		const trigger = header.getByRole("button", { name: "Accent color: Blue" });
		const search = header.getByRole("button", { name: "Search" });
		const before = await search.boundingBox();

		await expect(trigger).toBeVisible();
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
		).toBeLessThanOrEqual(0);

		await firstClick(trigger);
		await expect(header.locator("label[title=Red]")).toBeInViewport({ ratio: 1 });
		expect(await search.boundingBox()).toEqual(before);

		// Over the nav, every swatch has to take the press, not the link under it.
		const covered = await header.locator("label").evaluateAll((labels) =>
			labels
				.filter((label) => {
					const box = label.getBoundingClientRect();
					const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);

					return !hit || !label.contains(hit);
				})
				.map((label) => label.getAttribute("title")),
		);

		expect(covered, `covered at ${width}`).toEqual([]);
	}
});

for (const width of [375, 1280])
	test(`axe at ${width}, folded and open, both themes`, async ({ page }) => {
		await page.setViewportSize({ width, height: 800 });
		await open(page, "e2e/accent");
		await axe(page, "light", "main");
		await axe(page, "dark", "main");

		await page.emulateMedia({ colorScheme: "light" });
		await firstClick(dot(page, "Blue"));
		await axe(page, "light", "main");
		await axe(page, "dark", "main");
	});
