import { expect, open, selected, test } from "./fixtures";

function only(...ids: string[]) {
	test.skip(!ids.some(selected), "page not in this run");
	test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024);
}

test.describe("server HTML", () => {
	only(
		"accordion",
		"collapsible",
		"tabs",
		"code",
		"navigation-menu",
		"typewriter",
		"count-to",
		"terminal",
	);
	test("closed and animated content is in the HTML before any script runs", async ({ request }) => {
		const html = await (await request.get("e2e/display")).text();

		for (const text of [
			"Accordion closed answer",
			"Collapsible closed content",
			"Inactive tab panel",
			"hiddenSecondFile",
			"Closed panel link",
			"Typewriter full sentence",
			"bun add typed-later",
		])
			expect(html, text).toContain(text);

		expect(html).toMatch(/48,?290/);
	});
});

test.describe("sidebar shortcut", () => {
	only("sidebar");
	test("mod+B toggles the rail, but not while typing in a field", async ({ page }) => {
		await open(page, "e2e/display");

		const collapsed = page.locator("[data-state=collapsed]");

		await page.getByRole("textbox", { name: "Notes field" }).focus();
		await page.keyboard.press("ControlOrMeta+b");
		await expect(collapsed).toHaveCount(0);

		await page.getByRole("heading", { name: "Display probes" }).click();
		await page.keyboard.press("ControlOrMeta+b");
		await expect(collapsed).not.toHaveCount(0);
	});
});

test.describe("sidebar trigger", () => {
	only("sidebar");
	test("names its shortcut and shows it on focus", async ({ page }) => {
		await open(page, "e2e/display");

		const trigger = page.getByRole("button", { name: "Collapse sidebar" });

		await expect(trigger).toHaveAttribute("aria-keyshortcuts", /^(Meta|Control)\+B$/);
		await page.getByRole("link", { name: "Settings" }).focus();
		await page.keyboard.press("Tab");
		await expect(trigger).toBeFocused();
		await expect(page.locator("[role=tooltip]")).toContainText("B");
	});
});

test.describe("moving text", () => {
	only("text-swap", "typewriter", "terminal");
	test("text swap holds still under reduced motion", async ({ page }) => {
		await page.clock.install();
		await open(page, "e2e/display");

		const seen = new Set<string | null>();

		for (let i = 0; i < 12; i++) {
			await page.clock.runFor(130);
			seen.add(await page.locator("[data-probe=swap] .sr-only").textContent());
		}

		expect([...seen]).toEqual(["Swap first"]);
	});

	test("nothing blinks under reduced motion", async ({ page }) => {
		await open(page, "e2e/display");

		const running = await page.evaluate(() =>
			document
				.querySelector("main")
				?.getAnimations({ subtree: true })
				.filter((animation) => animation instanceof CSSAnimation)
				.map((animation) => (animation.effect as KeyframeEffect).target?.className),
		);

		expect(running).toEqual([]);
	});

	test.describe("with motion", () => {
		test.use({ reducedMotion: "no-preference" });
		test("the typewriter pauses while hovered", async ({ page }) => {
			await page.clock.install();
			await open(page, "e2e/display");

			const typed = page.locator("[data-probe=type] [data-typewriter-animated]");

			await page.clock.runFor(1000);
			await page.locator("[data-probe=type] > span").hover({ force: true });
			await page.clock.runFor(50);

			const seen = new Set<string | null>();

			for (let i = 0; i < 12; i++) {
				await page.clock.runFor(37);
				seen.add(await typed.textContent());
			}

			expect(seen.size).toBe(1);
		});
	});
});

test.describe("search-input", () => {
	only("search-input");
	test("the shortcut focuses it, steps aside once focused, Esc clears", async ({ page }) => {
		await open(page, "e2e/display");

		const search = page.getByRole("searchbox", { name: "Quick find" });

		await page.getByRole("heading", { name: "Display probes" }).click();
		await page.keyboard.press("/");
		await expect(search).toBeFocused();
		await page.keyboard.type("a/b");
		await expect(search).toHaveValue("a/b");
		await page.keyboard.press("Escape");
		await expect(search).toHaveValue("");
	});
});

test.describe("input-group", () => {
	only("input-group");
	test("clicking addon text focuses the input", async ({ page }) => {
		await open(page, "e2e/display");
		await page.getByText("https://", { exact: true }).click();
		await expect(page.getByRole("textbox", { name: "Site" })).toBeFocused();
	});
});

test.describe("data-table selection", () => {
	only("data-table");
	test("survives paging and search", async ({ page }) => {
		await open(page, "e2e/display");
		await page.getByRole("checkbox", { name: "Select Ada" }).check();
		await expect(page.getByText("1 selected", { exact: true })).toBeVisible();

		await page.getByRole("button", { name: /next/i }).click();
		await page.getByRole("checkbox", { name: "Select Bob" }).check();
		await expect(page.getByText("2 selected", { exact: true })).toBeVisible();

		await page.getByRole("searchbox", { name: "Search people" }).fill("Bob");
		await expect(page.getByText("2 selected", { exact: true })).toBeVisible();
		await page.getByRole("searchbox", { name: "Search people" }).fill("");
		await expect(page.getByRole("checkbox", { name: "Select Ada" })).toBeChecked();
	});
});

test.describe("terminal log", () => {
	only("terminal");
	test("follows the bottom as lines arrive", async ({ page }) => {
		await open(page, "e2e/display");

		const log = page.getByRole("log");
		const atBottom = () =>
			log.evaluate((element) => {
				const body =
					element.scrollHeight > element.clientHeight ? element : element.querySelector("*");

				return !!body && Math.abs(body.scrollHeight - body.clientHeight - body.scrollTop) < 4;
			});

		await page.getByRole("button", { name: "Append line" }).click();
		await expect(log.getByText("newest line")).toBeVisible();
		await expect.poll(atBottom).toBe(true);
	});
});

test.describe("newsletter", () => {
	only("newsletter");
	test("a rejected subscribe shows its message", async ({ page }) => {
		await open(page, "e2e/display");
		await page.getByRole("textbox", { name: /email/i }).fill("ada@example.com");
		await page.getByRole("button", { name: "Subscribe" }).click();
		await expect(page.getByText("That address is already subscribed")).toBeVisible();
	});
});

test.describe("navigation-menu link", () => {
	only("navigation-menu");
	test("following a panel link closes the menu", async ({ page }) => {
		await open(page, "e2e/display");

		const trigger = page.getByRole("button", { name: "Products" });

		await trigger.click();
		await expect(trigger).toHaveAttribute("aria-expanded", "true");
		await page.getByRole("link", { name: /Closed panel link/ }).click();
		await expect(trigger).toHaveAttribute("aria-expanded", "false");
	});
});

test.describe("context-menu keyboard", () => {
	only("context-menu");
	test("Shift+F10 opens it on the first item", async ({ page }) => {
		await open(page, "e2e/display");
		await page.getByLabel("Clip").focus();
		await page.keyboard.press("Shift+F10");
		await expect(page.getByRole("menuitem", { name: "Play" })).toBeFocused();
	});
});

test.describe("hover-card touch", () => {
	only("hover-card");
	test.use({ hasTouch: true });
	test("the first tap opens it, the second follows the link", async ({ page }) => {
		await open(page, "e2e/display");

		const link = page.getByRole("link", { name: "@jane" });

		await link.tap();
		await expect(page.getByText("Card preview")).toBeVisible();
		await expect(page).not.toHaveURL(/#jane$/);
		await link.tap();
		await expect(page).toHaveURL(/#jane$/);
	});
});
