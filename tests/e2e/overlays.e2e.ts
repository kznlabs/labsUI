import type { Page } from "@playwright/test";
import { expect, open, selected, test } from "./fixtures";

function only(id: string) {
	test.skip(!selected(id), "page not in this run");
	test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024);
}

const log = (page: Page) => page.locator("main > output");

test.describe("dialog", () => {
	only("dialog");
	test("focuses the first field, Esc closes and restores focus", async ({ page }) => {
		await open(page, "e2e/overlays");

		const trigger = page.getByRole("button", { name: "Plain dialog" });

		await trigger.click();
		await expect(page.getByRole("textbox", { name: "Plain field" })).toBeFocused();
		await page.keyboard.press("Escape");
		await expect(page.getByRole("dialog")).toHaveCount(0);
		await expect(trigger).toBeFocused();
	});

	test("Tab stays inside", async ({ page }) => {
		await open(page, "e2e/overlays");
		await page.getByRole("button", { name: "Plain dialog" }).click();

		const dialog = page.getByRole("dialog");

		for (let i = 0; i < 4; i++) {
			await page.keyboard.press("Tab");
			await expect(dialog.locator(":focus")).toHaveCount(1);
		}
	});

	test("backdrop closes a plain dialog, not an alert", async ({ page }) => {
		await open(page, "e2e/overlays");

		await page.getByRole("button", { name: "Alert dialog" }).click();
		await expect(page.getByRole("alertdialog")).toBeVisible();
		await page.mouse.click(8, 8);
		await expect(page.getByRole("alertdialog")).toBeVisible();
		await page.getByRole("button", { name: "Cancel" }).click();
		await expect(page.getByRole("alertdialog")).toHaveCount(0);

		await page.getByRole("button", { name: "Plain dialog" }).click();
		await expect(page.getByRole("dialog")).toBeVisible();
		await page.mouse.click(8, 8);
		await expect(page.getByRole("dialog")).toHaveCount(0);
	});
});

test.describe("popover", () => {
	only("popover");
	test("focus moves in, Esc returns it to the trigger", async ({ page }) => {
		await open(page, "e2e/overlays");

		const trigger = page.getByRole("button", { name: "Filters" });

		await trigger.click();
		await expect(page.getByRole("textbox", { name: "First filter" })).toBeFocused();
		await page.keyboard.press("Escape");
		await expect(page.getByRole("textbox", { name: "First filter" })).toBeHidden();
		await expect(trigger).toBeFocused();
	});

	test("Tab past the end closes it", async ({ page }) => {
		await open(page, "e2e/overlays");
		await page.getByRole("button", { name: "Filters" }).click();
		await page.keyboard.press("Tab");
		await expect(page.getByRole("textbox", { name: "Last filter" })).toBeFocused();
		await page.keyboard.press("Tab");
		await expect(page.getByRole("textbox", { name: "Last filter" })).toBeHidden();
		await expect(page.getByRole("button", { name: "After popover" })).toBeFocused();
	});

	test("an outside click closes it", async ({ page }) => {
		await open(page, "e2e/overlays");
		await page.getByRole("button", { name: "Filters" }).click();
		await page.getByRole("heading", { name: "Overlay probes" }).click();
		await expect(page.getByRole("textbox", { name: "First filter" })).toBeHidden();
	});
});

test.describe("dropdown-menu items", () => {
	only("dropdown-menu");
	test("an item closes the menu, checkbox and radio items keep it open", async ({ page }) => {
		await open(page, "e2e/overlays");

		const trigger = page.getByRole("button", { name: "Menu" });

		await trigger.click();
		await page.getByRole("menuitemcheckbox", { name: "Wrap" }).click();
		await expect(page.getByRole("menuitemcheckbox", { name: "Wrap" })).toHaveAttribute(
			"aria-checked",
			"true",
		);
		await page.getByRole("menuitemradio", { name: "Large" }).click();
		await expect(page.getByRole("menuitemradio", { name: "Large" })).toHaveAttribute(
			"aria-checked",
			"true",
		);

		await page.getByRole("menuitem", { name: "Edit" }).click();
		await expect(page.getByRole("menu")).toHaveCount(0);
		await expect(log(page)).toHaveText("edit");
		await expect(trigger).toBeFocused();
	});
});

test.describe("command", () => {
	only("command");
	test("selecting closes the palette, keepOpen keeps it", async ({ page }) => {
		await open(page, "e2e/overlays");
		await page.keyboard.press("ControlOrMeta+k");

		const dialog = page.getByRole("dialog");

		await expect(dialog).toBeVisible();
		await dialog.getByRole("option", { name: "Toggle theme" }).click();
		await expect(dialog).toBeVisible();
		await dialog.getByRole("option", { name: "Home" }).click();
		await expect(dialog).toHaveCount(0);
		await expect(log(page)).toHaveText("theme,home");
	});
});

test.describe("tooltip", () => {
	only("tooltip");
	test("opens on keyboard focus, Esc dismisses", async ({ page }) => {
		await open(page, "e2e/overlays");
		await page.getByRole("button", { name: "Menu" }).focus();
		await page.keyboard.press("Tab");
		await expect(page.getByRole("button", { name: "Bold" })).toBeFocused();
		await expect(page.locator("[role=tooltip]")).toBeVisible();
		await page.keyboard.press("Escape");
		await expect(page.locator("[role=tooltip]")).toHaveCount(0);
	});
});
