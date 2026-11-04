import type { Page } from "@playwright/test";
import { expect, open, selected, test } from "./fixtures";

const probe = (page: Page, name: string) => page.locator(`[data-probe=${name}]`);

const current = (page: Page, name: string) =>
	probe(page, name).locator('[aria-current="location"]');

// Direct jumps, so a test doesn't race the page's smooth scrolling.
const scrollPage = (page: Page, top: number) =>
	page.evaluate((to) => scrollTo({ top: to, behavior: "instant" }), top);

const toHeading = (page: Page, id: string) =>
	page.evaluate((headingId) => {
		const heading = document.getElementById(headingId);

		if (heading)
			scrollTo({ top: scrollY + heading.getBoundingClientRect().top - 40, behavior: "instant" });
	}, id);

const toEnd = (page: Page) =>
	page.evaluate(() =>
		scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
	);

const scrollNested = (page: Page, top: number) =>
	page
		.locator("[data-nested-scroller]")
		.evaluate((box, to) => box.scrollTo({ top: to, behavior: "instant" }), top);

test.describe("table of contents", () => {
	test.skip(!selected("table-of-contents"), "page not in this run");

	test("names itself, links to every section and starts with none current", async ({ page }) => {
		await open(page, "e2e/content");

		const nav = page.getByRole("navigation", { name: "On this page" });

		await expect(nav.getByRole("link")).toHaveCount(6);
		await expect(nav.getByRole("link", { name: "One" })).toHaveAttribute("href", "#page-one");
		await expect(current(page, "toc-page")).toHaveCount(0);
	});

	test("the current link follows the page and the marker follows it", async ({ page }) => {
		await open(page, "e2e/content");

		await toHeading(page, "page-one");
		await expect(current(page, "toc-page")).toHaveText("One");

		const marker = probe(page, "toc-page").locator("nav span[aria-hidden=true]");
		const offset = () =>
			marker.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m42);
		const before = await offset();

		await toHeading(page, "page-two");
		await expect(current(page, "toc-page")).toHaveText("Two");
		await expect.poll(offset).toBeGreaterThan(before);
	});

	test("a heading that is hidden never turns current", async ({ page }) => {
		await open(page, "e2e/content");

		await toHeading(page, "page-one");
		await expect(current(page, "toc-page")).toHaveText("One");

		for (const top of [100, 400, 700]) {
			const start = await page
				.locator("#page-one")
				.evaluate((heading) => scrollY + heading.getBoundingClientRect().top);

			await scrollPage(page, start + top);
			await expect(current(page, "toc-page")).toHaveText("One");
		}
	});

	test("short last sections get a turn, the last one at the end of the page", async ({ page }) => {
		await open(page, "e2e/content");

		const seen = new Set<string>();
		const end = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);

		for (let top = end - 200; top <= end; top += 10) {
			await scrollPage(page, top);
			await page.evaluate(() => new Promise(requestAnimationFrame));
			await page.evaluate(() => new Promise(requestAnimationFrame));

			const text = await current(page, "toc-page").textContent();

			if (text) seen.add(text);
		}

		await toEnd(page);
		await expect(current(page, "toc-page")).toHaveText("Tail B");
		expect(seen).toContain("Tail A");
	});

	test("a clicked link to a short section stays current until the user scrolls", async ({
		page,
	}) => {
		await open(page, "e2e/content");

		await page.getByRole("link", { name: "Tail A" }).click();
		await expect(page).toHaveURL(/#page-tail-a$/);
		await expect(current(page, "toc-page")).toHaveText("Tail A");

		await page.evaluate(() => new Promise(requestAnimationFrame));
		await page.evaluate(() => new Promise(requestAnimationFrame));
		await expect(current(page, "toc-page")).toHaveText("Tail A");

		await page.keyboard.press("Control+c");
		await expect(current(page, "toc-page")).toHaveText("Tail A");

		await page.keyboard.press("PageUp");
		await expect(current(page, "toc-page")).not.toHaveText("Tail A");
	});

	test("a hash in the URL is current on load", async ({ page }) => {
		await open(page, "e2e/content#page-tail-a");

		await expect(current(page, "toc-page")).toHaveText("Tail A");
	});

	test("going back returns to the earlier section", async ({ page }) => {
		await open(page, "e2e/content");

		await page.getByRole("link", { name: "Three" }).click();
		await expect(current(page, "toc-page")).toHaveText("Three");

		await page.getByRole("link", { name: "Tail B" }).click();
		await expect(current(page, "toc-page")).toHaveText("Tail B");

		await page.goBack();
		await expect(current(page, "toc-page")).toHaveText("Three");
	});

	test("in a nested scroller it follows that scroller, not the page", async ({ page }) => {
		await open(page, "e2e/content");

		await page.locator("[data-nested-scroller]").scrollIntoViewIfNeeded();
		await scrollNested(page, 0);
		await expect(current(page, "toc-nested")).toHaveText("Nested one");

		await scrollNested(page, 512);
		await expect(current(page, "toc-nested")).toHaveText("Nested two");

		await scrollNested(page, 5000);
		await expect(current(page, "toc-nested")).toHaveText("Nested tail");
	});

	test("a link in a nested scroller moves it and leaves the page alone", async ({ page }) => {
		await open(page, "e2e/content");

		const nav = page.getByRole("navigation", { name: "Nested" });

		await nav.getByRole("link", { name: "Nested two" }).scrollIntoViewIfNeeded();

		const pageTop = await page.evaluate(() => scrollY);

		await nav.getByRole("link", { name: "Nested two" }).click();

		await expect
			.poll(() =>
				page.locator("[data-nested-scroller]").evaluate((box) => {
					const heading = box.querySelector("#nested-two");

					return (heading?.getBoundingClientRect().top ?? 0) - box.getBoundingClientRect().top;
				}),
			)
			.toBeLessThan(4);

		await expect(page).toHaveURL(/#nested-two$/);
		expect(await page.evaluate(() => scrollY)).toBe(pageTop);
		await expect(page.locator("#nested-two")).toBeFocused();
	});

	test("a list that scrolls keeps the current link in view", async ({ page }) => {
		await open(page, "e2e/content");

		const scroller = probe(page, "toc-long").locator("h2").last();
		const link = page
			.getByRole("navigation", { name: "Long" })
			.getByRole("link", { name: "Long 29" });

		await scroller.evaluate((heading) =>
			heading.parentElement?.scrollTo({ top: 100000, behavior: "instant" }),
		);
		await expect(link).toHaveAttribute("aria-current", "location");
		await probe(page, "toc-long").scrollIntoViewIfNeeded();
		await expect(link).toBeInViewport({ ratio: 1 });
	});
});

test.describe("pager", () => {
	test.skip(!selected("pager"), "page not in this run");

	test("links say where they lead and carry rel", async ({ page }) => {
		await open(page, "e2e/content");

		const nav = page.getByRole("navigation", { name: "Both" });

		await expect(nav.getByRole("link", { name: "Previous Earlier" })).toHaveAttribute(
			"rel",
			"prev",
		);
		await expect(nav.getByRole("link", { name: "Next Later" })).toHaveAttribute("rel", "next");
	});

	test("next stays on the right without a previous page", async ({ page }) => {
		test.skip((page.viewportSize()?.width ?? 0) < 640);
		await open(page, "e2e/content");

		const nav = page.getByRole("navigation", { name: "Next only" });
		const navBox = await nav.boundingBox();
		const linkBox = await nav.getByRole("link").boundingBox();

		expect(linkBox && navBox && linkBox.x > navBox.x + navBox.width / 3).toBe(true);
	});

	test("nothing renders with no pages", async ({ page }) => {
		await open(page, "e2e/content");

		await expect(probe(page, "pager-none").getByRole("navigation")).toHaveCount(0);
	});
});

test.describe("post card", () => {
	test.skip(!selected("post-card"), "page not in this run");

	test("the whole card is one link, and the date is machine-readable", async ({ page }) => {
		await open(page, "e2e/content");

		const post = probe(page, "post");
		const card = post.getByRole("article").first();

		await expect(card.getByRole("heading", { level: 2, name: "Full post" })).toBeVisible();
		await expect(card.locator("time")).toHaveAttribute("datetime", "2026-10-21");

		const box = await card.boundingBox();

		if (!box) throw new Error("no card");

		await page.mouse.click(box.x + 8, box.y + 8);
		await expect(post.locator("output")).toHaveText("/full");
	});

	test("the action stays clickable over the card's link", async ({ page }) => {
		await open(page, "e2e/content");

		const post = probe(page, "post");

		await post.getByRole("button", { name: "Source" }).click();
		await expect(post.locator("output")).toHaveText("action");
	});

	test("the focus ring goes on the card", async ({ page }) => {
		await open(page, "e2e/content");

		const post = probe(page, "post");

		await post.getByRole("link", { name: "Full post" }).focus();
		await expect(post.getByRole("article").first()).toHaveCSS(
			"box-shadow",
			/\d+px \d+px \d+px 3px/,
		);
	});

	test("without href the title is plain text", async ({ page }) => {
		await open(page, "e2e/content");

		const card = probe(page, "post").getByRole("article").nth(1);

		await expect(card.getByRole("heading", { level: 3, name: "Text only" })).toBeVisible();
		await expect(card.getByRole("link")).toHaveCount(0);
	});
});

test.describe("props table", () => {
	test.skip(!selected("props-table"), "page not in this run");

	test("the layout follows the container, not the screen", async ({ page }) => {
		test.skip((page.viewportSize()?.width ?? 0) < 1024);
		await open(page, "e2e/content");

		await expect(probe(page, "props-wide").getByRole("table")).toBeVisible();
		await expect(probe(page, "props-wide").getByRole("list", { name: "Wide" })).toBeHidden();
		await expect(probe(page, "props-narrow").getByRole("table")).toBeHidden();
		await expect(probe(page, "props-narrow").getByRole("list", { name: "Narrow" })).toBeVisible();
	});

	test("backticks become code and required says so in words", async ({ page }) => {
		await open(page, "e2e/content");

		const list = probe(page, "props-narrow").getByRole("list", { name: "Narrow" });

		await expect(list.locator("code", { hasText: "retry" })).toBeVisible();
		await expect(list.locator(".sr-only", { hasText: "required" })).toBeAttached();
		await expect(list).not.toContainText("`");
		await expect(probe(page, "props-narrow").locator("> div > p")).toContainText("required");
	});

	test("a column can be renamed for a function's options", async ({ page }) => {
		test.skip((page.viewportSize()?.width ?? 0) < 1024);
		await open(page, "e2e/content");

		await expect(
			probe(page, "props-wide").getByRole("columnheader", { name: "Prop" }),
		).toBeVisible();
		await expect(probe(page, "props-narrow").locator("th", { hasText: "Option" })).toBeAttached();
	});
});
