// Composes the clips and the terminal. Every frame depends only on its time.
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import { APP_URL, type TranscriptStep } from "./cli-run";
import { type Clip, RESULT_VIEWPORT, SITE, type Theme, VIEWPORT } from "./page-run";

export const FPS = 20;

type RowKind = "command" | "note" | "output" | "success" | "warn" | "error" | "muted" | "took";

type Row = { at: number; kind: RowKind; text: string; charTime?: number };

type Timeline = {
	site: Clip;
	result: Clip;
	rows: Row[];
	pushes: number[];
	/** The terminal slides in. */
	enter: number;
	/** The terminal slides out as the browser slides in. */
	swap: number;
	resultStart: number;
	/** The browser slides out and the site comes back. */
	leave: number;
	duration: number;
};

type TerminalRow = { kind: RowKind; text: string };

type StageState = {
	base: string;
	result: string;
	pageScale: number;
	pageBlur: number;
	pageDim: number;
	terminalX: number;
	terminalScale: number;
	browserX: number;
	browserScale: number;
	motionBlur: number;
	rows: TerminalRow[];
};

const SLOWEST_RUN = 0.8;
const SETTLE = 0.55;
const LEAVE_SETTLE = 1.1;
const FAST_TYPING = 0.014;
const NOTE_TYPING = 0.012;
const OFFSCREEN = VIEWPORT.width + 40;

// labsUI's spring (stiffness 400, damping 30) at 0.7 speed, so a frame sequence can show it.
const SPRING_SPEED = 0.7;
const SPRING_DECAY = 15;
const SPRING_FREQUENCY = Math.sqrt(400 - SPRING_DECAY ** 2);

function spring(seconds: number) {
	if (seconds <= 0) return 0;

	const time = seconds * SPRING_SPEED;

	return (
		1 -
		Math.exp(-SPRING_DECAY * time) *
			(Math.cos(SPRING_FREQUENCY * time) +
				(SPRING_DECAY / SPRING_FREQUENCY) * Math.sin(SPRING_FREQUENCY * time))
	);
}

function classify(text: string): RowKind {
	const start = text.trimStart();

	if (start.startsWith("✓")) return "success";
	if (start.startsWith("!")) return "warn";
	if (start.startsWith("✗")) return "error";
	if (start.startsWith("•") || start.startsWith("$ ")) return "muted";

	return "output";
}

function formatTook(seconds: number) {
	return seconds < 1 ? `${Math.round(seconds * 1000)} ms` : `${seconds.toFixed(1)} s`;
}

function scheduleTerminal(steps: TranscriptStep[], start: number) {
	const rows: Row[] = [];
	const pushes: number[] = [];
	let clock = start;

	for (const step of steps) {
		if (step.kind === "note") {
			rows.push({ at: clock, kind: "note", text: `# ${step.text}`, charTime: NOTE_TYPING });
			clock += step.text.length * NOTE_TYPING + 0.25;

			continue;
		}

		pushes.push(clock);
		rows.push({ at: clock, kind: "command", text: step.command, charTime: FAST_TYPING });
		clock += step.command.length * FAST_TYPING + 0.18;

		// A slow step plays faster and says so; "took" stays the real time.
		const speed = Math.max(1, step.took / SLOWEST_RUN);

		for (const line of step.lines)
			rows.push({ at: clock + line.at / speed, kind: classify(line.text), text: line.text });

		clock += step.took / speed;

		if (step.took > 0 && !step.keepsRunning) {
			const shown = speed > 1.05 ? ` · shown at ${Number(speed.toFixed(1))}×` : "";

			rows.push({ at: clock, kind: "took", text: `took ${formatTook(step.took)}${shown}` });
		}

		clock += step.hold;
	}

	return { rows, pushes, end: clock };
}

function buildTimeline(clips: Clip[], steps: TranscriptStep[]): Timeline {
	const site = clips.find((clip) => clip.name === "site");
	const result = clips.find((clip) => clip.name === "result");

	if (!site || !result) throw new Error("Both clips are needed: site and result");

	const enter = site.duration;
	const { rows, pushes, end: swap } = scheduleTerminal(steps, enter + SETTLE);
	const resultStart = swap + SETTLE;
	const leave = resultStart + result.duration;

	return {
		site,
		result,
		rows,
		pushes,
		enter,
		swap,
		resultStart,
		leave,
		duration: leave + LEAVE_SETTLE,
	};
}

function frameSource(clip: Clip, seconds: number) {
	let found = clip.frames[0];

	for (const frame of clip.frames) {
		if (frame.at > seconds) break;

		found = frame;
	}

	return `${clip.name}/${found.file}`;
}

function terminalPosition({ enter, swap }: Timeline, time: number) {
	return (spring(time - enter) - 1) * OFFSCREEN + spring(time - swap) * OFFSCREEN;
}

function browserPosition({ swap, leave }: Timeline, time: number) {
	return (spring(time - swap) - 1) * OFFSCREEN + spring(time - leave) * OFFSCREEN;
}

function visibleRows(timeline: Timeline, time: number) {
	const rows: TerminalRow[] = [];

	for (const row of timeline.rows) {
		if (row.at > time) break;

		if (!row.charTime) {
			rows.push({ kind: row.kind, text: row.text });

			continue;
		}

		const typed = Math.ceil((time - row.at) / row.charTime);

		rows.push({ kind: row.kind, text: row.text.slice(0, typed) });
	}

	return rows.slice(-40);
}

function stateAt(timeline: Timeline, time: number): StageState {
	const { site, result, enter, swap, resultStart, leave, pushes } = timeline;

	const speedOf = (position: (line: Timeline, at: number) => number) =>
		Math.abs(position(timeline, time + 0.01) - position(timeline, time)) / 0.01;

	const fastest = Math.max(speedOf(terminalPosition), speedOf(browserPosition));
	const blurAmount = Math.min(36, fastest * 0.018);
	const covered = spring(time - enter) * (1 - spring(time - leave));
	const pushed = pushes.reduce((sum, push) => sum + 0.007 * spring(time - push), 0);

	return {
		base: frameSource(site, time >= leave ? 0 : time),
		result: frameSource(result, time - resultStart),
		pageScale: 1 - 0.06 * covered,
		pageBlur: 7 * covered,
		pageDim: 0.32 * covered,
		terminalX: terminalPosition(timeline, time),
		terminalScale: (1 + 0.05 * (1 - spring(time - enter))) * (1 + pushed),
		browserX: browserPosition(timeline, time),
		browserScale: 1 + 0.05 * (1 - spring(time - swap)),
		motionBlur: blurAmount < 0.4 ? 0 : blurAmount,
		rows: visibleRows(timeline, time),
	};
}

// Runs in the page; takes the state and nothing else.
function paint(state: StageState) {
	const byId = (id: string) => document.getElementById(id) as HTMLElement;
	const body = byId("terminal-body");

	const setSource = (id: string, source: string) => {
		const image = byId(id) as HTMLImageElement;

		if (image.dataset.source === source) return Promise.resolve();

		image.dataset.source = source;
		image.src = `/__hero/${source}`;

		return image.decode();
	};

	const moving = (element: HTMLElement, x: number, scale: number) => {
		element.style.translate = `${x}px 0`;
		element.style.scale = String(scale);
		element.style.filter = state.motionBlur > 0 ? "url(#motion-blur)" : "none";
	};

	byId("page").style.scale = String(state.pageScale);
	byId("page").style.filter = state.pageBlur > 0.05 ? `blur(${state.pageBlur}px)` : "none";
	byId("dim").style.opacity = String(state.pageDim);
	byId("motion-blur-amount").setAttribute("stdDeviation", `${state.motionBlur} 0`);

	moving(byId("terminal"), state.terminalX, state.terminalScale);
	moving(byId("browser"), state.browserX, state.browserScale);

	body.replaceChildren(
		...state.rows.map((row) => {
			const line = document.createElement("div");

			line.dataset.kind = row.kind;
			line.textContent = row.text || " ";

			return line;
		}),
	);

	const cursor = document.createElement("span");

	cursor.id = "terminal-cursor";
	body.lastElementChild?.append(cursor);

	return Promise.all([setSource("base", state.base), setSource("result", state.result)]);
}

const WINDOW_DOTS = "<i></i><i></i><i></i>";

const STAGE_HTML = `
	<div id="page"><img id="base" alt=""><div id="dim"></div></div>
	<svg width="0" height="0" style="position:absolute"><filter id="motion-blur" x="-20%" width="140%">
		<feGaussianBlur id="motion-blur-amount" stdDeviation="0 0" />
	</filter></svg>
	<section id="terminal" class="window">
		<header>${WINDOW_DOTS}<span>~/projects</span></header>
		<div id="terminal-body"></div>
	</section>
	<section id="browser" class="window">
		<header>${WINDOW_DOTS}<span class="address">${APP_URL.replace("http://", "")}</span></header>
		<img id="result" alt="">
	</section>
`;

// Window dots are spelled out: the site only ships the tokens it uses on a page.
const STAGE_CSS = `
	html, body { margin: 0; width: 720px; height: 540px; overflow: hidden; background: var(--background); }
	#page, #page img, #dim { position: absolute; inset: 0; width: 720px; height: 540px; }
	#dim { background: #000; opacity: 0; }
	.window {
		position: absolute; inset: 22px 26px; display: flex; flex-direction: column; overflow: hidden;
		box-sizing: border-box; border: 1px solid var(--border); border-radius: 14px; background: var(--card);
		box-shadow: 0 18px 50px rgb(0 0 0 / 0.35);
		font: 13px/19px "SF Mono", ui-monospace, Menlo, "JetBrains Mono", Consolas, monospace;
	}
	.window header {
		flex: none; box-sizing: border-box; height: 38px; display: flex; align-items: center; gap: 7px;
		padding: 0 14px; border-bottom: 1px solid var(--border); color: var(--muted-foreground); font-size: 12px;
	}
	.window header i { width: 11px; height: 11px; border-radius: 50%; }
	.window header i:nth-child(1) { background: #f2554e; }
	.window header i:nth-child(2) { background: #f5b730; }
	.window header i:nth-child(3) { background: #30bd4c; }
	.window header span { margin-left: 8px; }
	.window header .address {
		padding: 2px 12px; border-radius: 999px; background: color-mix(in oklch, var(--foreground) 8%, transparent);
	}
	#result { display: block; width: ${RESULT_VIEWPORT.width}px; height: ${RESULT_VIEWPORT.height}px; }
	#terminal-body {
		flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: flex-end; overflow: hidden;
		padding: 12px 16px; color: color-mix(in oklch, var(--foreground) 80%, transparent);
	}
	#terminal-body div { white-space: pre-wrap; overflow-wrap: anywhere; min-height: 19px; flex: none; }
	[data-kind="command"] { color: var(--foreground); font-weight: 600; margin-top: 8px; }
	[data-kind="command"]::before { content: "$ "; color: var(--muted-foreground); }
	[data-kind="note"], [data-kind="muted"], [data-kind="took"] { color: var(--muted-foreground); }
	[data-kind="note"] { margin-top: 8px; }
	[data-kind="success"] { color: var(--success-ink); }
	[data-kind="warn"] { color: var(--warning-ink); }
	[data-kind="error"] { color: var(--destructive-ink); }
	#terminal-cursor {
		display: inline-block; width: 7px; height: 14px; margin-left: 2px; vertical-align: -2px;
		background: var(--foreground);
	}
`;

export async function composeFrames(
	theme: Theme,
	transcriptFile: string,
	clipDirectory: string,
	frameDirectory: string,
) {
	const clips: Clip[] = JSON.parse(readFileSync(join(clipDirectory, "clips.json"), "utf8"));
	const steps: TranscriptStep[] = JSON.parse(readFileSync(transcriptFile, "utf8"));
	const timeline = buildTimeline(clips, steps);
	const browser = await chromium.launch({ channel: "chromium" });

	rmSync(frameDirectory, { recursive: true, force: true });
	mkdirSync(frameDirectory, { recursive: true });

	const page = await browser.newPage({ viewport: VIEWPORT, colorScheme: theme });

	// The live site's stylesheet, tokens and fonts, without its scripts.
	await page.route("**/*.js", (route) => route.abort());
	await page.route("**/*.js?*", (route) => route.abort());

	await page.route("**/__hero/**", (route) => {
		const source = new URL(route.request().url()).pathname.split("/__hero/")[1];

		return route.fulfill({ path: join(clipDirectory, source), contentType: "image/jpeg" });
	});

	await page.goto(`${SITE}/`, { waitUntil: "load" });

	await page.evaluate(
		({ html, theme }) => {
			document.documentElement.classList.toggle("dark", theme === "dark");
			document.body.innerHTML = html;
		},
		{ html: STAGE_HTML, theme },
	);

	await page.addStyleTag({ content: STAGE_CSS });

	const total = Math.ceil(timeline.duration * FPS);

	console.log(`  ${total} frames, ${timeline.duration.toFixed(1)} s`);

	try {
		for (let frame = 0; frame < total; frame++) {
			await page.evaluate(paint, stateAt(timeline, frame / FPS));

			await page.screenshot({
				path: join(frameDirectory, `${String(frame).padStart(5, "0")}.png`),
			});
		}
	} finally {
		await browser.close();
	}
}
