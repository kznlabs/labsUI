import type { Page } from "@playwright/test";
import { expect, open, selected, test } from "./fixtures";

function only(...ids: string[]) {
	test.skip(!ids.some(selected), "page not in this run");
	test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024);
}

const section = (page: Page, name: string) => page.locator(`[data-probe=${name}]`);

test.describe("pricing", () => {
	only("pricing");
	test("the switcher changes prices, notes and what a cta knows", async ({ page }) => {
		await open(page, "e2e/shop");

		const pricing = section(page, "pricing");

		await expect(pricing).toContainText("$49.99");
		await expect(pricing).toContainText("for 30 days");
		await expect(pricing.getByRole("button", { name: "Buy for 30" })).toBeVisible();

		await pricing.getByRole("button", { name: "90 days" }).click();
		await expect(pricing.getByText("$49", { exact: true })).toBeVisible();
		await expect(pricing).not.toContainText("for 30 days");
		await expect(pricing.getByRole("button", { name: "Buy for 90" })).toBeVisible();
	});

	test("a plan with no price for the period stays out", async ({ page }) => {
		await open(page, "e2e/shop");

		const pricing = section(page, "pricing");

		await expect(pricing.getByRole("heading", { name: "Forever only" })).toHaveCount(0);

		await pricing.getByRole("button", { name: "Forever" }).click();
		await expect(pricing.getByRole("heading", { name: "Forever only" })).toBeVisible();
	});

	test("a reduction shows the earlier and the lowest price per period", async ({ page }) => {
		await open(page, "e2e/shop");

		const pricing = section(page, "pricing");

		await expect(pricing.locator("del")).toHaveCount(0);
		await expect(pricing).not.toContainText("Lowest price");

		await pricing.getByRole("button", { name: "Forever" }).click();
		await expect(pricing.locator("del")).toHaveText("$149");
		await expect(pricing).toContainText("Lowest price in the 30 days before the reduction: $139");
	});

	test("the parent can own the period", async ({ page }) => {
		await open(page, "e2e/shop");

		const pricing = section(page, "pricing-controlled");

		await expect(pricing.getByText("$2", { exact: true })).toBeVisible();

		await pricing.getByRole("button", { name: "Forever" }).click();
		await expect(pricing.locator("output")).toHaveText("forever");
		await expect(pricing.getByText("$3", { exact: true })).toBeVisible();
	});
});

test.describe("plan-card", () => {
	only("plan-card");
	test("an earlier price that isn't higher stays out", async ({ page }) => {
		await open(page, "e2e/shop");

		const cards = section(page, "plan-card");

		await expect(cards).toContainText("$9.99");
		await expect(cards.locator("del")).toHaveCount(0);
	});
});

test.describe("product-card", () => {
	only("product-card");
	test("sold out disables the add button and replaces the badge", async ({ page }) => {
		await open(page, "e2e/shop");

		const card = section(page, "product").getByRole("article").first();

		await expect(card.getByRole("button", { name: "Add to cart" })).toBeDisabled();
		await expect(card).toContainText("Sold out");
		await expect(card).not.toContainText("New");
		await expect(card).toContainText("$49.99");
	});

	test("an action replaces the add button", async ({ page }) => {
		await open(page, "e2e/shop");

		const card = section(page, "product").getByRole("article").nth(1);

		await expect(card.getByRole("button", { name: "Notify me" })).toBeEnabled();
		await expect(card.getByRole("button", { name: "Add to cart" })).toHaveCount(0);
	});

	test("rating and the lowest price read as text", async ({ page }) => {
		await open(page, "e2e/shop");

		const card = section(page, "product").getByRole("article").nth(2);

		await expect(card.getByRole("img", { name: "4.5 out of 5" })).toBeVisible();
		await expect(card).toContainText("3 reviews");
		await expect(card).toContainText("Lowest price in the 30 days before the reduction: $15");
	});
});

test.describe("radio-group cards", () => {
	only("radio-group");
	test("the whole card picks, the keyboard moves and disabled stays out", async ({ page }) => {
		await open(page, "e2e/shop");

		const form = section(page, "radio-cards");
		const locker = form.getByRole("radio", { name: "Locker" });
		const courier = form.getByRole("radio", { name: "Courier" });

		// The label stretches over the card, so a click anywhere lands on it: force clicks by position.
		await form.getByText("Parcel locker.").click({ force: true });
		await expect(locker).toBeChecked();

		await form.getByText("$5").click({ force: true });
		await expect(courier).toBeChecked();

		// WebKit doesn't focus a radio on click.
		await courier.focus();
		await page.keyboard.press("ArrowUp");
		await expect(locker).toBeChecked();

		await form.getByText("Closed.").click({ force: true });
		await expect(form.getByRole("radio", { name: "Pickup" })).not.toBeChecked();
		await expect(locker).toBeChecked();

		await expect(courier).toHaveAccessibleDescription("To your door.");
	});

	test("the ring follows the card", async ({ page }) => {
		await open(page, "e2e/shop");

		const form = section(page, "radio-cards");

		const locker = form.getByRole("radio", { name: "Locker" });

		await locker.focus();

		const card = locker.locator("xpath=../..");

		await expect(card).toHaveCSS("box-shadow", /\d+px \d+px \d+px 3px/);
	});
});

test.describe("cart", () => {
	only("cart");

	async function openCart(page: Page) {
		await open(page, "e2e/shop");
		await section(page, "cart").getByRole("button", { name: "Add to cart" }).click();

		return page.getByRole("dialog", { name: "Cart" });
	}

	test("a line totals its quantity and the summary follows", async ({ page }) => {
		const cart = await openCart(page);

		await expect(cart.getByRole("listitem").nth(1)).toContainText("$39.98");
		await expect(cart.locator("output")).toHaveText("$54.98");
		await expect(cart).toContainText("Free");

		await cart.getByRole("spinbutton", { name: "Quantity of Line A" }).fill("3");
		await expect(cart.locator("output")).toHaveText("$74.98");
	});

	test("quantity stays between 1 and max", async ({ page }) => {
		const cart = await openCart(page);
		const quantity = cart.getByRole("spinbutton", { name: "Quantity of Line B" });

		await quantity.focus();
		await page.keyboard.press("ArrowUp");
		await page.keyboard.press("ArrowUp");
		await expect(quantity).toHaveValue("3");

		await quantity.fill("0");
		await quantity.blur();
		await expect(quantity).toHaveValue("1");
	});

	test("removing lines keeps focus inside the drawer", async ({ page }) => {
		const cart = await openCart(page);
		const remove = (name: string) => cart.getByRole("button", { name: `Remove Line ${name}` });

		await remove("B").focus();
		await page.keyboard.press("Enter");
		await expect(remove("B")).toHaveCount(0);
		await expect(remove("C")).toBeFocused();

		await page.keyboard.press("Enter");
		await expect(remove("A")).toBeFocused();

		await page.keyboard.press("Enter");
		await expect(cart.getByRole("listitem")).toHaveCount(0);
		await expect(cart.locator(":focus")).toHaveCount(1);
	});

	test("closing returns focus to the add button", async ({ page }) => {
		const cart = await openCart(page);

		await page.keyboard.press("Escape");
		await expect(cart).toHaveCount(0);
		await expect(section(page, "cart").getByRole("button", { name: "Add to cart" })).toBeFocused();
	});
});

test.describe("product-gallery", () => {
	only("product-gallery", "carousel");

	const viewport = (page: Page) => section(page, "gallery").locator("[tabindex='0']").first();

	test("a thumbnail goes to its slide and shows which one is current", async ({ page }) => {
		await open(page, "e2e/shop");

		const gallery = section(page, "gallery");
		const third = gallery.getByRole("button", { name: "Show photo 3 of 3" });

		await third.click();
		await expect(third).toHaveAttribute("aria-current", "true");
		await expect
			.poll(() => viewport(page).evaluate((element) => element.scrollLeft))
			.toBeGreaterThan(0);
		await expect(gallery.getByRole("button", { name: "Show photo 1 of 3" })).not.toHaveAttribute(
			"aria-current",
		);
	});

	test("moving the slides moves the current thumbnail", async ({ page }) => {
		await open(page, "e2e/shop");

		const gallery = section(page, "gallery");

		await viewport(page).focus();
		await page.keyboard.press("ArrowRight");
		await expect(gallery.getByRole("button", { name: "Show photo 2 of 3" })).toHaveAttribute(
			"aria-current",
			"true",
		);
	});

	test("thumbnails hide their pictures from the accessibility tree", async ({ page }) => {
		await open(page, "e2e/shop");

		await expect(
			section(page, "gallery").getByRole("button", { name: "Show photo 1 of 3" }),
		).toHaveAccessibleName("Show photo 1 of 3");
		await expect(section(page, "gallery").locator("span[aria-hidden=true]").first()).toBeAttached();
	});

	test("photos keep a gap while they scroll, and a slide still lands exactly", async ({ page }) => {
		await open(page, "e2e/shop");

		const slides = section(page, "gallery").locator("[data-carousel-slide]");
		const first = await slides.nth(0).boundingBox();
		const second = await slides.nth(1).boundingBox();

		expect((second?.x ?? 0) - ((first?.x ?? 0) + (first?.width ?? 0))).toBeGreaterThan(0);

		await section(page, "gallery").getByRole("button", { name: "Show photo 2 of 3" }).click();
		await expect
			.poll(() =>
				viewport(page).evaluate(
					(element) =>
						element.scrollLeft -
						(element.querySelectorAll<HTMLElement>("[data-carousel-slide]")[1]?.offsetLeft ?? 0),
				),
			)
			.toBe(0);
	});

	test("one photo needs no carousel", async ({ page }) => {
		await open(page, "e2e/shop");

		const single = section(page, "gallery-single");

		await expect(single).toContainText("only");
		await expect(single.getByRole("button")).toHaveCount(0);
	});
});
