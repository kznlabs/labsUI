// Turns a CI run into README badges (shields.io endpoint JSON).
//   bun tests/e2e/report.ts summary <results.json> <dir>   one file per engine the run covered
//   bun tests/e2e/report.ts badges <dir> <out>              merges them into badge files
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Result = { errors?: { message?: string }[] };
type TestRun = { projectName: string; status: string; results: Result[] };
type Suite = { specs?: { tests: TestRun[] }[]; suites?: Suite[] };
type Summary = { engine: string; version: string; axeVersion: string; failed: number; axe: number };

const ENGINES = ["chromium", "firefox", "webkit"] as const;
const NAMES = { chromium: "Chromium", firefox: "Firefox", webkit: "WebKit" };
const GREEN = "2ea44f";
const RED = "d73a49";

const read = (file: string) => JSON.parse(readFileSync(file, "utf8"));

function versions() {
	const { browsers } = read("node_modules/playwright-core/browsers.json") as {
		browsers: { name: string; browserVersion?: string }[];
	};

	// 156.0.8078.4 → 156, 157.0 → 157, 27.2 → 27.2
	const short = (version = "") => version.split(".").slice(0, 2).join(".").replace(/\.0$/, "");

	return Object.fromEntries(
		browsers.map((browser) => [browser.name, short(browser.browserVersion)]),
	);
}

function* tests(suite: Suite): Generator<TestRun> {
	for (const spec of suite.specs ?? []) yield* spec.tests;
	for (const child of suite.suites ?? []) yield* tests(child);
}

function summary(resultsFile: string, dir: string) {
	const results = read(resultsFile) as { suites: Suite[] };
	const known = versions();
	const axeVersion = (read("node_modules/axe-core/package.json") as { version: string }).version;
	const byEngine = new Map<string, Summary>();

	for (const run of results.suites.flatMap((suite) => [...tests(suite)])) {
		const engine = run.projectName.split("-")[0] ?? "";
		const entry = byEngine.get(engine) ?? {
			engine,
			version: known[engine] ?? "",
			axeVersion,
			failed: 0,
			axe: 0,
		};

		byEngine.set(engine, entry);

		if (run.status !== "unexpected") continue;

		entry.failed++;

		// The axe helper labels its assertion "axe, light theme" / "axe, dark theme".
		const errors = run.results.at(-1)?.errors ?? [];

		if (errors.some((error) => error.message?.includes("axe, "))) entry.axe++;
	}

	mkdirSync(dir, { recursive: true });

	for (const entry of byEngine.values())
		writeFileSync(join(dir, `${entry.engine}.json`), JSON.stringify(entry));
}

function badge(label: string, message: string, color: string) {
	return JSON.stringify({ schemaVersion: 1, label, message, color });
}

function badges(dir: string, out: string) {
	const found = existsSync(dir) ? readdirSync(dir) : [];
	const summaries = found.map((file) => read(join(dir, file)) as Summary);
	const axeVersion = summaries[0]?.axeVersion ?? "";

	mkdirSync(out, { recursive: true });

	for (const engine of ENGINES) {
		const entry = summaries.find((summary) => summary.engine === engine);
		const label = `${NAMES[engine]} ${entry?.version ?? ""}`.trim();

		writeFileSync(
			join(out, `${engine}.json`),
			!entry
				? badge(label, "no data", "lightgrey")
				: entry.failed
					? badge(label, `${entry.failed} failing`, RED)
					: badge(label, "passing", GREEN),
		);
	}

	const axeFailures = summaries.reduce((sum, entry) => sum + entry.axe, 0);
	const complete = summaries.length === ENGINES.length;
	const axe = axeVersion ? ` · axe ${axeVersion.split(".").slice(0, 2).join(".")}` : "";
	const label = `WCAG 2.2 AA${axe}`;

	writeFileSync(
		join(out, "wcag.json"),
		!complete
			? badge(label, "no data", "lightgrey")
			: axeFailures
				? badge(label, `${axeFailures} failing ${axeFailures === 1 ? "page" : "pages"}`, RED)
				: badge(label, "0 violations", GREEN),
	);
}

const [command, from, to] = process.argv.slice(2);

if (command === "summary" && from && to) summary(from, to);
else if (command === "badges" && from && to) badges(from, to);
else {
	console.error("usage: report.ts summary <results.json> <dir> | badges <dir> <out>");
	process.exit(1);
}
