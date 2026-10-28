import type { Page } from "@playwright/test";
import { expect, open, selected, test } from "./fixtures";

// The rest of the suite runs with reduced motion; here springs must actually move.
test.use({ reducedMotion: "no-preference" });
test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024, "pointer and layout checks: desktop");

// WebKit on CI can stall the first frame after a click for longer than the whole spring. motion
// runs these as Web Animations, so keep a handle and seek them instead of waiting for frames.
// It creates them both ways: element.animate() and new Animation(new KeyframeEffect(...)).
test.beforeEach(({ page }) =>
	page.addInitScript(() => {
		const animate = Element.prototype.animate;
		const NativeAnimation = window.Animation;
		const started: Animation[] = [];

		Object.assign(window, { __animations: started });

		Element.prototype.animate = function (this: Element, ...args: Parameters<Element["animate"]>) {
			const animation = animate.apply(this, args);

			started.push(animation);

			return animation;
		};

		window.Animation = class extends NativeAnimation {
			constructor(...args: ConstructorParameters<typeof Animation>) {
				super(...args);
				started.push(this);
			}
		};
	}),
);

/** Demos load lazily, a click on server HTML gets lost or skips the tween. */
const hydrated = (page: Page, selector: string) =>
	expect
		.poll(() =>
			page.evaluate((selector) => {
				const element = document.querySelector(selector);

				return !!element && Object.keys(element).some((key) => key.startsWith("__reactFiber$"));
			}, selector),
		)
		.toBe(true);

/**
 * Seeks the transform animation `click` starts on `watch`, sampling `steps` points. Empty if none
 * started.
 */
async function tween(page: Page, watch: string, click: string, steps = 8) {
	await hydrated(page, click);

	return page.evaluate(
		async ({ watch, click, steps }) => {
			(document.querySelector(click) as HTMLElement).click();

			const started = (window as unknown as { __animations: Animation[] }).__animations;
			let found: Animation | undefined;

			for (let i = 0; i < 120 && !found; i++) {
				await new Promise(requestAnimationFrame);

				const target = document.querySelector(watch);

				found = started.find((animation) => {
					const effect = animation.effect as KeyframeEffect | null;

					return (
						effect?.target === target && effect.getKeyframes().some((key) => "transform" in key)
					);
				});
			}

			if (!found) return [];

			const element = (found.effect as KeyframeEffect).target as Element;
			const end = Number(found.effect?.getComputedTiming().endTime);
			// motion may have cancelled it already, seeking applies it again.
			const idle = found.playState === "idle";

			found.pause();

			const out: string[] = [];

			for (let i = 0; i <= steps; i++) {
				found.currentTime = (end * i) / steps;
				out.push(getComputedStyle(element).transform);
			}

			if (idle) found.cancel();
			else found.finish();

			return out;
		},
		{ watch, click, steps },
	);
}

async function frames(page: Page, watch: string, click?: string, count = 40) {
	if (click) await hydrated(page, click);

	return page.evaluate(
		async ({ watch, click, count }) => {
			if (click) (document.querySelector(click) as HTMLElement).click();

			const out: (string | null)[] = [];

			for (let i = 0; i < count; i++) {
				await new Promise(requestAnimationFrame);

				const element = document.querySelector(watch);

				out.push(element ? getComputedStyle(element).transform : null);
			}

			return out;
		},
		{ watch, click, count },
	);
}

// The header's NavigationMenu viewport is `data-floating` too and stays in the DOM while closed.
const popoverPanel = "[role=dialog][data-floating]";
const isIdentity = (transform: string | null) =>
	transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)";
/** Springs outlast the recorded frames on slower engines. */
const settles = (page: Page, selector: string) =>
	expect
		.poll(() =>
			page.evaluate((selector) => {
				const element = document.querySelector(selector);

				return element ? getComputedStyle(element).transform : null;
			}, selector),
		)
		.toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
const scaleOf = (transform: string | null) =>
	Number(/^matrix\(([-\d.e]+)/.exec(transform ?? "")?.[1] ?? 1);

test("popover scales in through in-between frames", async ({ page }) => {
	test.skip(!selected("popover"), "page not in this run");
	await open(page, "components/popover");

	const seen = await tween(page, popoverPanel, "#popover [aria-haspopup=dialog]");

	expect(new Set(seen).size, `transforms: ${seen.join(" | ")}`).toBeGreaterThan(2);
	await settles(page, popoverPanel);
});

test("tabs pill slides to the picked tab", async ({ page }) => {
	test.skip(!selected("tabs"), "page not in this run");
	await open(page, "components/tabs");

	const pill = '#tabs [role=tablist] > span[aria-hidden="true"]';

	// Rendered by a layout effect after hydration.
	await expect(page.locator(pill).first()).toBeAttached();

	const seen = await tween(page, pill, "#tabs [role=tab]:nth-of-type(2)");
	const offsets = seen.map((transform) =>
		Number(/,\s*([-\d.]+),\s*[-\d.]+\)$/.exec(transform)?.[1] ?? 0),
	);

	expect(new Set(offsets).size, `x per frame: ${offsets.join(", ")}`).toBeGreaterThan(2);
});

test("a button dips while pressed", async ({ page }) => {
	test.skip(!selected("button"), "page not in this run");
	await open(page, "components/button");

	const button = page.locator("#button button").first();
	const box = await button.boundingBox();

	if (!box) throw new Error("no button");
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
	await button.evaluate((element) => element.setAttribute("data-motion-probe", ""));

	const seen = await frames(page, "[data-motion-probe]", undefined, 20);

	await page.mouse.up();
	expect(Math.min(...seen.map(scaleOf)), `transforms: ${seen.join(" | ")}`).toBeLessThan(1);
});

test.describe("reduced motion", () => {
	test.use({ reducedMotion: "reduce" });

	test("popover appears without a transform tween", async ({ page }) => {
		test.skip(!selected("popover"), "page not in this run");
		await open(page, "components/popover");

		const seen = await frames(page, popoverPanel, "#popover [aria-haspopup=dialog]");
		const shown = seen.filter((transform) => transform !== null);

		expect(shown.length).toBeGreaterThan(0);

		// motion may paint the start state for one frame, then jump: no in-between scales.
		const moving = new Set(shown.filter((transform) => !isIdentity(transform)));

		expect(moving.size, `transforms: ${shown.join(" | ")}`).toBeLessThanOrEqual(1);
		await settles(page, popoverPanel);
	});
});
