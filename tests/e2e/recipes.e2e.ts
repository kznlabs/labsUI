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

// A demo's pages past its first, swept like it.
const demoPages = [
	"blog/demo/posts/typescript-narrowing",
	"blog/demo/about",
	"shop/demo/products/ridge-leather-boot",
	"shop/demo/products/storm-rain-shell",
	"shop/demo/checkout",
];

for (const path of demoPages)
	test(`demo page ${path}`, async ({ page }) => {
		await sweep(page, `recipes/${path}`);
	});

test("the shop demo takes an order from size to confirmation", async ({ page }) => {
	await open(page, "recipes/shop/demo/products/ridge-leather-boot");
	await page.getByRole("button", { name: "Add to cart" }).click();
	await expect(page.getByText("Choose a size first.")).toBeVisible();

	await page.getByText("42", { exact: true }).click();
	await page.getByRole("button", { name: "Add to cart" }).click();

	const drawer = page.getByRole("dialog", { name: /Your cart/ });

	await expect(drawer.getByText("Ridge Leather Boot")).toBeVisible();
	await drawer.getByRole("button", { name: "Go to checkout" }).click();
	await expect(page).toHaveURL(/\/checkout\/?$/);

	await page.getByLabel("Email").fill("ada@example.com");
	await page.getByLabel("First name").fill("Ada");
	await page.getByLabel("Last name").fill("Byrne");
	await page.getByLabel("Street and number").fill("12 Harbour Road");
	await page.getByLabel("Postal code").fill("D02 X285");
	await page.getByLabel("City").fill("Dublin");
	await page.getByRole("button", { name: "Place order" }).click();
	await expect(page.getByText("Order placed", { exact: true })).toBeVisible();
	await expect(page.getByText(/^Demo mode:/)).toBeVisible();
});

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
