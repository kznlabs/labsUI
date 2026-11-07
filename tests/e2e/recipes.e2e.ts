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
	"docs-site/demo/create-client",
	"docs-site/demo/interceptors",
	"docs-site/demo/changelog",
	"shop/demo/products/ridge-leather-boot",
	"shop/demo/products/storm-rain-shell",
	"shop/demo/checkout",
	"portfolio/demo/work/harbor-booking",
	"portfolio/demo/work/grain",
	"admin-panel/demo#orders",
	"admin-panel/demo#products",
	"admin-panel/demo#customers",
	"admin-panel/demo#settings",
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

test("the game shop demo takes an order for a nickname and moves the goal", async ({ page }) => {
	await open(page, "recipes/game-shop/demo");

	const goal = page.getByRole("progressbar", { name: "Season goal funded" });

	await expect(goal).toHaveAttribute("aria-valuenow", "68");

	await page.getByRole("button", { name: "Add Knight" }).click();
	await page.getByRole("button", { name: "Pets", exact: true }).click();
	await page
		.getByRole("listitem")
		.filter({ hasText: "Ash Fox" })
		.getByRole("button", { name: "Add to order" })
		.click();

	const order = page.locator("#order");

	await order.getByRole("button", { name: /^Pay/ }).click();
	await expect(order.getByText("Enter the nickname that receives the items.")).toBeVisible();

	await order.getByLabel("Nickname that receives the purchase").fill("Ironroot");
	await expect(order.getByText("Player found, online now.")).toBeVisible();
	await order.getByRole("button", { name: /^Pay/ }).click();
	await expect(order.getByText("Order placed", { exact: true })).toBeVisible();
	await expect(page.getByText(/^Demo mode:/)).toBeVisible();
	await expect(goal).toHaveAttribute("aria-valuenow", "69");
});

test("the admin demo ships an order, undoes a delete and flags stock by the threshold", async ({
	page,
}) => {
	// The hash picks the view, so this runs the same where the sidebar is a drawer.
	const view = (name: string) => page.evaluate((hash) => (location.hash = hash), name);

	await open(page, "recipes/admin-panel/demo#orders");
	await page.getByRole("button", { name: "To fulfil 5" }).click();
	await page.getByRole("button", { name: "#1312", exact: true }).click();

	const drawer = page.getByRole("dialog", { name: "Order #1312" });

	await drawer.getByRole("combobox", { name: "Status" }).click();
	await page.getByRole("option", { name: "Shipped" }).click();
	await drawer.getByRole("button", { name: "Save changes" }).click();
	await expect(drawer.getByText("Use the carrier's format, like FH123456789IE.")).toBeVisible();

	await drawer.getByLabel("Tracking number").fill("fh204118731ie");
	await drawer.getByRole("button", { name: "Save changes" }).click();
	await expect(page.getByText("Order #1312 saved")).toBeVisible();
	await expect(page.getByRole("button", { name: "To fulfil 4" })).toBeVisible();

	await page.getByRole("button", { name: "All 120" }).click();
	await page.getByRole("button", { name: "#1311", exact: true }).click();
	await page
		.getByRole("dialog", { name: "Order #1311" })
		.getByRole("button", { name: "Delete" })
		.click();
	await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
	await expect(page.getByRole("button", { name: "All 119" })).toBeVisible();
	await page.getByRole("button", { name: "Undo" }).click();
	await expect(page.getByRole("button", { name: "#1311", exact: true })).toBeVisible();

	await view("settings");
	await page.getByLabel("Low stock at").fill("20");
	await page.getByRole("button", { name: "Save settings" }).click();
	await view("products");
	await expect(page.getByText("Low", { exact: true })).toHaveCount(7);
});

test("the portfolio demo filters projects and answers a message in demo mode", async ({ page }) => {
	await open(page, "recipes/portfolio/demo");
	await page.getByRole("button", { name: /^Open source/ }).click();
	await expect(page.getByText("1 project", { exact: true })).toBeVisible();

	await page.getByLabel("Name").fill("Jane Doe");
	await page.getByLabel("Email").fill("jane@example.com");
	await page.getByLabel("Message").fill("We need a booking flow for three ferry routes by spring.");
	await page.getByRole("button", { name: "Send message" }).click();
	await expect(page.getByText("Thanks, Jane!")).toBeVisible();
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
