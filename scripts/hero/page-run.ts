// Drives the live site and the fresh app, and keeps every painted frame with its time.
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Locator, type Page } from "@playwright/test";
import { APP_URL } from "./cli-run";

export const SITE = "https://kznlabs.github.io/labsUI";
export const VIEWPORT = { width: 720, height: 540 };

// What the browser window on the stage leaves for the page inside it.
export const RESULT_VIEWPORT = { width: 666, height: 456 };

export type Theme = "light" | "dark";
export type ClipFrame = { file: string; at: number };
export type Clip = { name: string; frames: ClipFrame[]; duration: number };

type Point = { x: number; y: number };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const easeInOut = (progress: number) =>
	progress < 0.5 ? 2 * progress ** 2 : 1 - (-2 * progress + 2) ** 2 / 2;

function createPointer(page: Page, start: Point) {
	const position = { ...start };

	async function show() {
		await page.evaluate(({ x, y }) => {
			const dot = document.createElement("div");

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

	async function moveTo(to: Point, ms: number) {
		const from = { ...position };
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

	async function click(target: Locator, after: number) {
		await target.scrollIntoViewIfNeeded();

		const box = await target.boundingBox();

		if (!box) throw new Error(`Nothing to point at: ${target}`);

		await moveTo({ x: box.x + box.width / 2, y: box.y + box.height / 2 }, 380);
		await sleep(60);
		await page.mouse.down();
		await sleep(50);
		await page.mouse.up();
		await sleep(after);
	}

	return { show, moveTo, click };
}

type Pointer = ReturnType<typeof createPointer>;

type Scene = {
	name: string;
	url: string;
	viewport: typeof VIEWPORT;
	pointerStart: Point;
	/** CSS for what only the recording should hide. */
	css?: string;
	act: (page: Page, pointer: Pointer) => Promise<void>;
};

const SCENES: Scene[] = [
	{
		name: "site",
		url: `${SITE}/`,
		viewport: VIEWPORT,
		pointerStart: { x: 660, y: 505 },
		act: async (page, pointer) => {
			await sleep(2300);
			await pointer.click(page.getByRole("link", { name: "read the 5-step setup" }), 1500);

			await pointer.click(
				page.locator("#getting-started").getByRole("button", { name: "Copy code" }).first(),
				60,
			);

			// Off the button, so "Copied" can be read.
			await pointer.moveTo({ x: 560, y: 500 }, 240);
			await sleep(800);
		},
	},
	{
		name: "result",
		url: APP_URL,
		viewport: RESULT_VIEWPORT,
		pointerStart: { x: 560, y: 400 },
		css: "nextjs-portal { display: none !important; }",
		act: async (page, pointer) => {
			await sleep(450);
			await pointer.click(page.getByRole("tab", { name: "Invite" }), 420);
			await pointer.click(page.getByRole("combobox"), 320);
			await pointer.click(page.getByRole("option", { name: "Moderator" }), 380);
			await pointer.click(page.getByRole("button", { name: "Send invite" }), 1400);
		},
	},
];

async function recordScene(page: Page, scene: Scene, directory: string): Promise<Clip> {
	const clipDirectory = join(directory, scene.name);

	mkdirSync(clipDirectory, { recursive: true });

	await page.setViewportSize(scene.viewport);
	await page.goto(scene.url, { waitUntil: "networkidle" });

	if (scene.css) await page.addStyleTag({ content: scene.css });

	// Demos load as they come into view, and a late one would shift the page mid-take.
	await page.evaluate(async () => {
		for (let top = 0; top < document.documentElement.scrollHeight; top += 400) {
			window.scrollTo({ top, behavior: "instant" });

			await new Promise((resolve) => setTimeout(resolve, 60));
		}

		window.scrollTo({ top: 0, behavior: "instant" });
	});

	await page.waitForLoadState("networkidle");

	const pointer = createPointer(page, scene.pointerStart);

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
		maxWidth: scene.viewport.width * 2,
		maxHeight: scene.viewport.height * 2,
		everyNthFrame: 1,
	});

	await scene.act(page, pointer);

	const duration = Date.now() / 1000 - started;

	await session.send("Page.stopScreencast");
	await session.detach();

	if (frames.length === 0) throw new Error(`No frames for ${scene.name}`);

	console.log(`  ${scene.name}: ${frames.length} frames over ${duration.toFixed(1)} s`);

	return { name: scene.name, frames, duration };
}

export async function recordClips(theme: Theme, directory: string) {
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
