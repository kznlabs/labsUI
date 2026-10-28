import { expect, open, selected, test } from "./fixtures";

function only(id: string, width: "desktop" | "phone") {
	test.skip(!selected(id), "page not in this run");
	test.skip(({ viewport }) => (viewport?.width ?? 0) >= 1024 !== (width === "desktop"));
}

test.describe("dropdown-menu", () => {
	only("dropdown-menu", "desktop");
	test("opens from the keyboard and moves focus to an item", async ({ page }) => {
		await open(page, "components/dropdown-menu");
		await page.locator("#dropdown-menu [aria-haspopup=menu]").first().focus();
		await page.keyboard.press("Enter");
		await expect(page.getByRole("menu").first()).toBeVisible();
		await page.keyboard.press("ArrowDown");
		await expect(page.locator(":focus")).toHaveAttribute("role", /^menuitem/);
		await page.keyboard.press("Escape");
		await expect(page.getByRole("menu")).toHaveCount(0);
	});
});

test.describe("select", () => {
	only("select", "desktop");
	test("picks an option from the keyboard and closes", async ({ page }) => {
		await open(page, "components/select");

		const trigger = page.locator("#select [role=combobox]").first();
		const before = await trigger.textContent();

		await trigger.click();
		await expect(page.getByRole("listbox").first()).toBeVisible();
		await page.keyboard.press("ArrowDown");
		await page.keyboard.press("Enter");
		await expect(page.getByRole("listbox")).toHaveCount(0);
		await expect(trigger).not.toHaveText(before ?? "");
	});
});

test.describe("forms", () => {
	only("forms", "desktop");
	test("textarea grows with its content", async ({ page }) => {
		await open(page, "components/forms");

		const textarea = page.locator("#forms textarea").first();
		const before = (await textarea.boundingBox())?.height ?? 0;

		await textarea.fill("line\n".repeat(8));
		await expect
			.poll(async () => (await textarea.boundingBox())?.height ?? 0)
			.toBeGreaterThan(before);
	});
});

test.describe("input-otp", () => {
	only("input-otp", "desktop");
	test("announces Verified once the code is accepted", async ({ page }) => {
		await open(page, "components/input-otp");
		await page.locator("input[data-slot=input-otp]").first().click();
		await page.keyboard.type("424242");
		await expect(page.locator("[data-verified] [role=status]")).toHaveText("Verified");
	});
});

test.describe("menubar", () => {
	only("menubar", "desktop");
	test("bar shows no scrollbar", async ({ page }) => {
		await open(page, "components/menubar");

		const gutter = await page
			.getByRole("menubar")
			.first()
			.evaluate((element) => (element as HTMLElement).offsetHeight - element.clientHeight);

		expect(gutter).toBeLessThanOrEqual(2);
	});
});

test.describe("scroll-area", () => {
	only("scroll-area", "desktop");
	test("horizontal area takes the mouse wheel", async ({ page }) => {
		await open(page, "components/scroll-area");

		const region = page.getByRole("region", { name: "Clips" });

		await region.scrollIntoViewIfNeeded();
		await region.hover();
		await page.mouse.wheel(0, 200);
		await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
	});
});

test.describe("theme-toggle", () => {
	only("theme-toggle", "desktop");
	test("header toggle flips the theme", async ({ page }) => {
		await open(page, "components/theme-toggle");

		const dark = () => page.evaluate(() => document.documentElement.classList.contains("dark"));
		const before = await dark();

		await page
			.locator("header")
			.getByRole("button", { name: /theme|dark|light/i })
			.first()
			.click();
		await expect.poll(dark).toBe(!before);
	});
});

test.describe("drawer", () => {
	only("drawer", "phone");
	test("header menu drawer closes on a sideways swipe", async ({ page }) => {
		await open(page, "components/drawer");
		await page.getByRole("button", { name: "Open menu" }).click();

		const drawer = page.getByRole("dialog");

		await expect(drawer).toBeVisible();

		const box = await drawer.boundingBox();

		if (!box) throw new Error("drawer has no box");

		const y = box.y + box.height - 80;

		await page.mouse.move(box.x + 60, y);
		await page.mouse.down();
		for (let i = 1; i <= 12; i++) await page.mouse.move(box.x + 60 + i * 22, y);
		await page.mouse.up();
		await expect(drawer).toHaveCount(0);
	});
});
