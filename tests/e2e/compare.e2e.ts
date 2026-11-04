import type { Page } from "@playwright/test";
import { expect, open, selected, test } from "./fixtures";

const section = (page: Page, name: string) => page.locator(`[data-probe=compare-${name}]`);

// The wide and the narrow table share the probe, so each test looks at the one on show.
const table = (page: Page, name: string) => section(page, name).locator("table:visible");

const bar = (page: Page) => section(page, "many").locator("[aria-hidden=true][class*=sticky]");

async function scrollPast(page: Page, label: string) {
	await page
		.getByRole("rowheader", { name: label })
		.or(page.locator("th:visible", { hasText: label }))
		.first()
		.evaluate((element) => {
			scrollTo({ top: scrollY + element.getBoundingClientRect().top - 300, behavior: "instant" });
		});
}

test.describe("wide", () => {
	test.skip(!selected("comparison-table"), "page not in this run");
	test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024);

	test("items are columns, features are rows, groups head their rows", async ({ page }) => {
		await open(page, "e2e/compare");

		const many = table(page, "many");

		await expect(many.getByRole("columnheader", { name: "Feature" })).toBeAttached();
		await expect(many.getByRole("columnheader", { name: /Item H/ })).toBeVisible();
		await expect(many.getByRole("rowheader", { name: "Same text" })).toBeVisible();
		await expect(many.locator('th[scope="rowgroup"]', { hasText: "All the same" })).toBeVisible();
	});

	test("a check and a dash carry text, a value left out is a dash", async ({ page }) => {
		await open(page, "e2e/compare");

		const pair = table(page, "pair");
		const check = pair.getByRole("row", { name: /^Check/ });
		const leftOut = pair.getByRole("row", { name: /^Left out/ });

		await expect(check.getByRole("cell").nth(0)).toHaveText("Included");
		await expect(check.getByRole("cell").nth(1)).toHaveText("Not included");
		await expect(leftOut.getByRole("cell").nth(1)).toHaveText("Not included");
	});

	test("differences only hides equal rows and groups left empty", async ({ page }) => {
		await open(page, "e2e/compare");

		const many = table(page, "many");
		const panel = section(page, "many");

		await panel.getByRole("switch", { name: "Differences only" }).click();

		await expect(panel).toContainText("43 of 46 rows");
		await expect(many.getByRole("rowheader", { name: "Differs everywhere" })).toBeVisible();
		await expect(many.getByRole("rowheader", { name: "Differs after two" })).toBeVisible();
		await expect(many.getByRole("rowheader", { name: "Same text" })).toHaveCount(0);
		await expect(many.locator("th", { hasText: "All the same" })).toHaveCount(0);

		// Own nodes can't be compared: they stay unless the row says otherwise.
		await expect(many.getByRole("rowheader", { name: "Own node", exact: true })).toBeVisible();
		await expect(many.getByRole("rowheader", { name: "Own node, same" })).toHaveCount(0);
	});

	test("nothing left to show says so, under headers that stay", async ({ page }) => {
		await open(page, "e2e/compare");

		const same = table(page, "same");

		await expect(same).toContainText("Every row is the same.");
		await expect(same.getByRole("columnheader", { name: "Left" })).toBeVisible();
		await expect(section(page, "same")).toContainText("0 of 1 rows");
	});

	test("the parent can own differences only", async ({ page }) => {
		await open(page, "e2e/compare");

		const controlled = section(page, "controlled");

		await expect(controlled.locator("output")).toHaveText("on");
		await controlled.getByRole("switch").click();
		await expect(controlled.locator("output")).toHaveText("off");
	});

	test("the name bar shows once the header is gone, under stickyTop, then leaves", async ({
		page,
	}) => {
		await open(page, "e2e/compare");

		await expect(bar(page)).toBeHidden();
		await scrollPast(page, "Long row 12");
		await expect(bar(page)).toBeVisible();

		const box = await bar(page).boundingBox();

		expect(box?.y).toBe(48);

		await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
		await expect(bar(page)).toBeHidden();
	});

	test("the feature column and the name bar stay with a sideways scroll", async ({ page }) => {
		await open(page, "e2e/compare");
		await scrollPast(page, "Long row 12");

		const many = table(page, "many");
		const feature = many.getByRole("rowheader", { name: "Long row 12", exact: true });
		const featureLeft = (await feature.boundingBox())?.x;

		await many.evaluate((element) => {
			element.parentElement?.scrollTo({ left: 200, behavior: "instant" });
		});

		await expect(bar(page)).toHaveAttribute("data-scrolled");
		expect((await feature.boundingBox())?.x).toBe(featureLeft);

		// The name over a column stays over it.
		const name = await bar(page).getByText("Item C").locator("..").boundingBox();
		const head = await many.locator("thead th", { hasText: "Item C" }).boundingBox();

		expect(name?.x).toBeCloseTo(head?.x ?? 0, 0);
		expect(name?.width).toBeCloseTo(head?.width ?? 0, 0);
	});
});

test.describe("narrow", () => {
	test.skip(!selected("comparison-table"), "page not in this run");
	test.skip(({ viewport }) => (viewport?.width ?? 0) >= 1024);

	const picker = (page: Page, column: number) =>
		section(page, "many").getByRole("combobox", { name: `Column ${column}` });

	async function pick(page: Page, column: number, name: string) {
		await picker(page, column).click();
		await page.getByRole("option", { name }).click();
	}

	test("two columns, each feature's name above its values, no sideways scroll", async ({
		page,
	}) => {
		await open(page, "e2e/compare");

		const many = table(page, "many");

		await expect(picker(page, 1)).toContainText("Item A");
		await expect(picker(page, 2)).toContainText("Item B");
		await expect(many.getByRole("columnheader", { name: /Item C/ })).toHaveCount(0);

		const name = await many.locator("th", { hasText: "Differs everywhere" }).boundingBox();
		const value = await many.getByRole("cell", { name: "Value a" }).boundingBox();

		expect((name?.y ?? 0) + (name?.height ?? 0)).toBeLessThanOrEqual(value?.y ?? 0);

		expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
	});

	test("a value's cell names its column, group and feature", async ({ page }) => {
		await open(page, "e2e/compare");

		const names = await table(page, "many")
			.getByRole("cell", { name: "Value b" })
			.evaluate((cell) =>
				(cell.getAttribute("headers") ?? "")
					.split(" ")
					.map((id) => document.getElementById(id)?.textContent),
			);

		expect(names).toEqual([expect.stringContaining("Item B"), "Mixed", "Differs everywhere"]);
	});

	test("a picker changes its own column and keeps focus", async ({ page }) => {
		await open(page, "e2e/compare");
		await pick(page, 2, "Item D");

		const many = table(page, "many");

		await expect(picker(page, 2)).toContainText("Item D");
		await expect(picker(page, 2)).toBeFocused();
		await expect(many.getByRole("cell", { name: "Value d" })).toBeVisible();
		await expect(many.getByRole("cell", { name: "Value b" })).toHaveCount(0);
	});

	test("asking for what the other column shows swaps them", async ({ page }) => {
		await open(page, "e2e/compare");
		await pick(page, 1, "Item B");

		await expect(picker(page, 1)).toContainText("Item B");
		await expect(picker(page, 2)).toContainText("Item A");
	});

	test("differences follow the two in view", async ({ page }) => {
		await open(page, "e2e/compare");

		const panel = section(page, "many");
		const many = table(page, "many");

		await panel.getByRole("switch", { name: "Differences only" }).click();
		await expect(many.locator("th", { hasText: "Differs after two" })).toHaveCount(0);
		await expect(panel).toContainText("42 of 46 rows");

		await pick(page, 2, "Item C");
		await expect(many.locator("th", { hasText: "Differs after two" })).toBeVisible();
		await expect(panel).toContainText("43 of 46 rows");
	});

	test("the pickers stay on screen under stickyTop", async ({ page }) => {
		await open(page, "e2e/compare");
		await scrollPast(page, "Long row 12");

		// stickyTop plus the cell's padding.
		await expect.poll(async () => (await picker(page, 1).boundingBox())?.y).toBe(56);
	});

	test("two items need no pickers", async ({ page }) => {
		await open(page, "e2e/compare");

		await expect(section(page, "pair").getByRole("combobox")).toHaveCount(0);
		await expect(table(page, "pair").getByRole("columnheader", { name: "Right" })).toBeAttached();
	});
});
