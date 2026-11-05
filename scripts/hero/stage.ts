// Composes the page clips and the terminal. Every frame depends only on its time.
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import type { TranscriptStep } from "./cli-run";
import { type Clip, SITE, type Theme, VIEWPORT } from "./page-run";

export const FPS = 20;

type RowKind = "command" | "note" | "output" | "success" | "warn" | "error" | "muted" | "took";

type Row = { at: number; kind: RowKind; text: string; charTime?: number };

type Timeline = {
	clips: Clip[];
	clipStarts: number[];
	rows: Row[];
	pushes: number[];
	enter: number;
	leave: number;
	duration: number;
};

type TerminalRow = { kind: RowKind; text: string };

type StageState = {
	base: string;
	over: string | null;
	overOpacity: number;
	pageScale: number;
	pageBlur: number;
	pageDim: number;
	terminalX: number;
	terminalBlur: number;
	terminalScale: number;
	rows: TerminalRow[];
};

const CROSSFADE = 0.22;
const SLOWEST_RUN = 0.8;
const LEAVE_SETTLE = 1.1;
const FAST_TYPING = 0.014;
const NOTE_TYPING = 0.012;

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
	if (text.startsWith("✓")) return "success";
	if (text.startsWith("!")) return "warn";
	if (text.startsWith("✗")) return "error";
	if (text.startsWith("•") || text.startsWith("$ ")) return "muted";

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

		if (step.took > 0) {
			const shown = speed > 1.05 ? ` · shown at ${Number(speed.toFixed(1))}×` : "";

			rows.push({ at: clock, kind: "took", text: `took ${formatTook(step.took)}${shown}` });
		}

		clock += step.hold;
	}

	return { rows, pushes, end: clock };
}

function buildTimeline(clips: Clip[], steps: TranscriptStep[]): Timeline {
	const clipStarts: number[] = [];
	let clock = 0;

	for (const clip of clips) {
		clipStarts.push(clock);
		clock += clip.duration;
	}

	const enter = clock;
	const { rows, pushes, end } = scheduleTerminal(steps, enter + 0.55);
	const leave = end;

	return { clips, clipStarts, rows, pushes, enter, leave, duration: leave + LEAVE_SETTLE };
}

function frameSource(clip: Clip, seconds: number) {
	let found = clip.frames[0];

	for (const frame of clip.frames) {
		if (frame.at > seconds) break;

		found = frame;
	}

	return `${clip.name}/${found.file}`;
}

function terminalPosition(timeline: Timeline, time: number) {
	const entering = spring(time - timeline.enter);
	const leaving = spring(time - timeline.leave);
	const offscreen = VIEWPORT.width + 40;

	return (entering - 1) * offscreen + leaving * offscreen;
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
	const { clips, clipStarts, enter, leave, pushes } = timeline;
	const home = clips[0];
	const last = clips.length - 1;

	let index = last;

	while (index > 0 && clipStarts[index] > time) index--;

	const local = time - clipStarts[index];
	const base = time >= leave ? frameSource(home, 0) : frameSource(clips[index], local);

	const fading = index > 0 && local < CROSSFADE;
	const lastOfPrevious = index > 0 ? clips[index - 1] : home;

	const covered = spring(time - enter) * (1 - spring(time - leave));
	const velocity =
		(terminalPosition(timeline, time + 0.01) - terminalPosition(timeline, time)) / 0.01;
	const blurAmount = Math.min(36, Math.abs(velocity) * 0.018);

	const zoom = pushes.reduce((sum, push) => sum + 0.007 * spring(time - push), 0);
	const entranceZoom = 0.05 * (1 - spring(time - enter));

	return {
		base: fading ? frameSource(lastOfPrevious, lastOfPrevious.duration) : base,
		over: fading ? base : null,
		overOpacity: fading ? local / CROSSFADE : 0,
		pageScale: 1 - 0.06 * covered,
		pageBlur: 7 * covered,
		pageDim: 0.32 * covered,
		terminalX: terminalPosition(timeline, time),
		terminalBlur: blurAmount < 0.4 ? 0 : blurAmount,
		terminalScale: (1 + entranceZoom) * (1 + zoom),
		rows: visibleRows(timeline, time),
	};
}

// Runs in the page; takes the state and nothing else.
function paint(state: StageState) {
	const byId = (id: string) => document.getElementById(id) as HTMLElement;
	const base = byId("base") as HTMLImageElement;
	const over = byId("over") as HTMLImageElement;
	const page = byId("page");
	const terminal = byId("terminal");
	const body = byId("terminal-body");
	const blur = byId("motion-blur-amount");

	const setSource = (image: HTMLImageElement, source: string) => {
		if (image.dataset.source === source) return Promise.resolve();

		image.dataset.source = source;
		image.src = `/__hero/${source}`;

		return image.decode();
	};

	page.style.scale = String(state.pageScale);
	page.style.filter = state.pageBlur > 0.05 ? `blur(${state.pageBlur}px)` : "none";
	byId("dim").style.opacity = String(state.pageDim);

	over.style.opacity = String(state.overOpacity);

	terminal.style.translate = `${state.terminalX}px 0`;
	terminal.style.scale = String(state.terminalScale);
	blur.setAttribute("stdDeviation", `${state.terminalBlur} 0`);
	terminal.style.filter = state.terminalBlur > 0 ? "url(#motion-blur)" : "none";

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

	return Promise.all([
		setSource(base, state.base),
		state.over ? setSource(over, state.over) : null,
	]);
}

const STAGE_HTML = `
	<div id="page"><img id="base" alt=""><img id="over" alt=""><div id="dim"></div></div>
	<svg width="0" height="0" style="position:absolute"><filter id="motion-blur" x="-20%" width="140%">
		<feGaussianBlur id="motion-blur-amount" stdDeviation="0 0" />
	</filter></svg>
	<section id="terminal">
		<header><i></i><i></i><i></i><span>~/projects</span></header>
		<div id="terminal-body"></div>
	</section>
`;

// Window dots are spelled out: the site only ships the tokens it uses on a page.
const STAGE_CSS = `
	html, body { margin: 0; width: 720px; height: 540px; overflow: hidden; background: var(--background); }
	#page, #page img, #dim { position: absolute; inset: 0; width: 720px; height: 540px; }
	#dim { background: #000; opacity: 0; }
	#terminal {
		position: absolute; inset: 22px 26px; display: flex; flex-direction: column; overflow: hidden;
		border: 1px solid var(--border); border-radius: 14px; background: var(--card);
		box-shadow: 0 18px 50px rgb(0 0 0 / 0.35);
		font: 13px/19px "SF Mono", ui-monospace, Menlo, "JetBrains Mono", Consolas, monospace;
	}
	#terminal header {
		display: flex; align-items: center; gap: 7px; padding: 10px 14px; border-bottom: 1px solid var(--border);
		color: var(--muted-foreground); font-size: 12px;
	}
	#terminal header i { width: 11px; height: 11px; border-radius: 50%; }
	#terminal header i:nth-child(1) { background: #f2554e; }
	#terminal header i:nth-child(2) { background: #f5b730; }
	#terminal header i:nth-child(3) { background: #30bd4c; }
	#terminal header span { margin-left: 8px; }
	#terminal-body {
		flex: 1; display: flex; flex-direction: column; justify-content: flex-end; overflow: hidden;
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
