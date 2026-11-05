// Drives the live site and keeps every painted frame, with its time.
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Locator, type Page } from "@playwright/test";

export const SITE = "https://kznlabs.github.io/labsUI";
export const VIEWPORT = { width: 720, height: 540 };

export type Theme = "light" | "dark";
export type ClipFrame = { file: string; at: number };
export type Clip = { name: string; frames: ClipFrame[]; duration: number };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const easeInOut = (progress: number) =>
	progress < 0.5 ? 2 * progress ** 2 : 1 - (-2 * progress + 2) ** 2 / 2;

// Only the title, the install line and the demo card.
const DEMO_ONLY_CSS = `
	body > header, body > footer, body > div:has(main) > :not(main) { display: none !important; }
	body > div:has(main) { display: block !important; padding-top: 0.25rem !important; }
	main > :not(section) { display: none !important; }
	main section { padding-top: 1rem !important; }
	main section > :not(header, :nth-child(2)) { display: none !important; }
	main section header p { display: none !important; }
`;

function createPointer(page: Page) {
	const position = { x: 660, y: 505 };

	async function show() {
		await page.evaluate(({ x, y }) => {
			const dot = document.createElement("div");

			dot.id = "hero-cursor";

			dot.style.cssText = `position:fixed;left:0;top:0;width:16px;height:16px;margin:-8px 0 0 -8px;
				border-radius:50%;border:1.5px solid var(--foreground);
				background:color-mix(in oklch, var(--foreground) 22%, transparent);
				z-index:2147483647;pointer-events:none;transition:scale .12s;
				translate:${x}px ${y}px`;

			document.documentElement.append(dot);

			window.addEventListener("mousemove", (event) => {
				dot.style.translate = `${event.clientX}px ${event.clientY}px`;
			});

			window.addEventListener("mousedown", () => {
				dot.style.scale = "0.75";
			});

			window.addEventListener("mouseup", () => {
				dot.style.scale = "1";
			});
		}, position);

		await page.mouse.move(position.x, position.y);
	}

	async function glide(target: Locator, ms = 380) {
		await target.scrollIntoViewIfNeeded();

		const box = await target.boundingBox();

		if (!box) throw new Error(`Nothing to point at: ${target}`);

		const from = { ...position };
		const to = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
		const started = performance.now();

		for (
			let progress = 0;
			progress < 1;
			progress = Math.min(1, (performance.now() - started) / ms)
		) {
			const eased = easeInOut(progress);

			position.x = from.x + (to.x - from.x) * eased;
			position.y = from.y + (to.y - from.y) * eased;

			await page.mouse.move(position.x, position.y);
			await sleep(12);
		}

		position.x = to.x;
		position.y = to.y;

		await page.mouse.move(to.x, to.y);
	}

	async function click(target: Locator, after = 650) {
		await glide(target);
		await sleep(60);
		await page.mouse.down();
		await sleep(50);
		await page.mouse.up();
		await sleep(after);
	}

	return { show, glide, click };
}

type Pointer = ReturnType<typeof createPointer>;

function scrollBy(page: Page, distance: number, ms: number) {
	return page.evaluate(
		({ distance, ms }) =>
			new Promise<void>((resolve) => {
				const from = window.scrollY;
				const started = performance.now();

				function step(now: number) {
					const progress = Math.min(1, (now - started) / ms);
					const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;

					window.scrollTo({ top: from + distance * eased, behavior: "instant" });

					if (progress < 1) requestAnimationFrame(step);
					else resolve();
				}

				requestAnimationFrame(step);
			}),
		{ distance, ms },
	);
}

async function scrollUntilNear(page: Page, target: Locator, top: number, ms: number) {
	const box = await target.boundingBox();

	if (!box) throw new Error(`Nothing to scroll to: ${target}`);

	await scrollBy(page, box.y - top, ms);
}

type Scene = {
	name: string;
	path: string;
	demoOnly?: boolean;
	act: (page: Page, pointer: Pointer) => Promise<void>;
};

const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });

const SCENES: Scene[] = [
	{
		name: "home",
		path: "/",
		act: async (page, pointer) => {
			await sleep(1300);

			const yearly = page.getByRole("button", { name: /^Yearly/ }).first();

			await scrollUntilNear(page, yearly, 90, 1150);
			await sleep(120);
			await pointer.click(yearly, 700);
		},
	},
	{
		name: "tabs",
		path: "/components/tabs",
		demoOnly: true,
		act: async (page, pointer) => {
			await pointer.click(page.getByRole("tab", { name: "Reports" }), 380);
			await pointer.click(page.getByRole("tab", { name: "Notifications" }), 420);
		},
	},
	{
		name: "select",
		path: "/components/select",
		demoOnly: true,
		act: async (page, pointer) => {
			await pointer.click(page.getByRole("combobox").nth(1), 300);
			await pointer.click(page.getByRole("option", { name: "Moderator" }), 420);
		},
	},
	{
		name: "toast",
		path: "/components/toast",
		demoOnly: true,
		act: async (page, pointer) => {
			await pointer.click(button(page, "With action"), 500);
			await pointer.glide(page.locator("body > section li").first(), 320);
			await sleep(200);
			await pointer.click(
				page.locator("body > section").getByRole("button", { name: "Dismiss" }),
				300,
			);
		},
	},
	{
		name: "drawer",
		path: "/components/drawer",
		demoOnly: true,
		act: async (page, pointer) => {
			await pointer.click(button(page, "Cart"), 700);
			await pointer.click(button(page, "Keep shopping"), 380);
		},
	},
	{
		name: "install",
		path: "/",
		act: async (page, pointer) => {
			await sleep(120);
			await pointer.click(page.getByRole("button", { name: "Copy code" }).first(), 60);
			await pointer.glide(page.getByRole("link", { name: "read the 5-step setup" }), 240);
			await sleep(800);
		},
	},
];

async function recordScene(page: Page, scene: Scene, directory: string): Promise<Clip> {
	const clipDirectory = join(directory, scene.name);

	mkdirSync(clipDirectory, { recursive: true });

	await page.goto(SITE + scene.path, { waitUntil: "networkidle" });

	if (scene.demoOnly) await page.addStyleTag({ content: DEMO_ONLY_CSS });

	// Demos load as they come into view, and a late one would shift the page mid-take.
	await page.evaluate(async () => {
		for (let top = 0; top < document.documentElement.scrollHeight; top += 400) {
			window.scrollTo({ top, behavior: "instant" });

			await new Promise((resolve) => setTimeout(resolve, 60));
		}

		window.scrollTo({ top: 0, behavior: "instant" });
	});

	await page.waitForLoadState("networkidle");

	const pointer = createPointer(page);

	await pointer.show();
	await sleep(300);

	const session = await page.context().newCDPSession(page);
	const frames: ClipFrame[] = [];
	const started = Date.now() / 1000;

	session.on("Page.screencastFrame", ({ data, sessionId, metadata }) => {
		const file = `${String(frames.length).padStart(5, "0")}.jpg`;

		frames.push({ file, at: Math.max(0, (metadata.timestamp ?? started) - started) });
		writeFileSync(join(clipDirectory, file), Buffer.from(data, "base64"));
		// A frame can land after the take ends; nothing is left to acknowledge.
		session.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
	});

	await session.send("Page.startScreencast", {
		format: "jpeg",
		quality: 95,
		maxWidth: VIEWPORT.width * 2,
		maxHeight: VIEWPORT.height * 2,
		everyNthFrame: 1,
	});

	await scene.act(page, pointer);

	const duration = Date.now() / 1000 - started;

	await session.send("Page.stopScreencast");
	await session.detach();

	if (frames.length === 0) throw new Error(`No frames for ${scene.name}`);

	const seconds = duration.toFixed(1);

	console.log(`  ${scene.name}: ${frames.length} frames over ${seconds} s`);

	return { name: scene.name, frames, duration };
}

export async function recordSite(theme: Theme, directory: string) {
	rmSync(directory, { recursive: true, force: true });

	const browser = await chromium.launch({ channel: "chromium" });

	const context = await browser.newContext({
		viewport: VIEWPORT,
		deviceScaleFactor: 2,
		colorScheme: theme,
		permissions: ["clipboard-read", "clipboard-write"],
	});

	const page = await context.newPage();
	const clips: Clip[] = [];

	try {
		for (const scene of SCENES) clips.push(await recordScene(page, scene, directory));
	} finally {
		await browser.close();
	}

	writeFileSync(join(directory, "clips.json"), JSON.stringify(clips));
}
