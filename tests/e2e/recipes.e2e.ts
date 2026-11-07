import type { Page } from "@playwright/test";
import { demoPath, recipePath } from "../../src/site/config";
import { recipes } from "../../src/site/recipes";
import { axe, clickable, hairlineScroll, hiddenTabStops } from "./checks";
import { expect, full, open, test } from "./fixtures";

// Recipes and their demos are site pages, not registry entries: only a full run covers them.
test.skip(!full, "recipes run with every page");

async function sweep(page: Page, path: string) {
	await open(page, path);

	const extra = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);

	expect(extra, "page scrolls sideways by this many px").toBeLessThanOrEqual(0);
	await hairlineScroll(page);
	await clickable(page);
	await hiddenTabStops(page);
	await axe(page, "light", "page");
	await axe(page, "dark", "page");
	await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
}

test("recipes", async ({ page }) => {
	await sweep(page, "recipes");
});

for (const recipe of recipes) {
	test(`recipe ${recipe.id}`, async ({ page }) => {
		await sweep(page, recipePath(recipe.id).slice(1));
	});

	if (recipe.demo)
		test(`demo ${recipe.id}`, async ({ page }) => {
			await sweep(page, demoPath(recipe.id).slice(1));
		});
}

test("a card's Open demo opens the demo", async ({ page }) => {
	const recipe = recipes.find((recipe) => recipe.demo);

	test.skip(!recipe, "no recipe has a demo");
	if (!recipe) return;

	await open(page, "recipes");
	await page
		.getByRole("listitem")
		.filter({ hasText: recipe.title })
		.getByRole("link", { name: "Open demo" })
		.click();
	await expect(page).toHaveURL(new RegExp(`${demoPath(recipe.id)}/?$`));
	await expect(page.getByRole("link", { name: "Back to recipes" })).toBeVisible();
});

test("a demo's buttons answer in demo mode", async ({ page }) => {
	await open(page, demoPath("laptop-comparison").slice(1));
	await page.getByRole("button", { name: "Add to cart" }).first().click();
	await expect(page.getByText(/^Demo mode:/)).toBeVisible();
});
