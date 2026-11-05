// Runs the real CLI on a fresh app. What the GIF shows is this run's output and timing.
import { type ChildProcess, spawn, spawnSync } from "node:child_process";
import {
	appendFileSync,
	copyFileSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export type TranscriptLine = { at: number; text: string };

export type TranscriptStep =
	| { kind: "note"; text: string }
	| {
			kind: "command";
			command: string;
			lines: TranscriptLine[];
			took: number;
			hold: number;
			/** A server: it never finishes, so it reports no time of its own. */
			keepsRunning?: boolean;
	  };

// With @latest, bunx asks the registry instead of reusing a cached older version.
const LABSUI = "bunx @kznlabs/labsui@latest";
const EDITED_FILE = "src/components/ui/tabs.tsx";
const RESULT_PAGE = "scripts/hero/result-page.tsx";
const SERVER_READY = /Ready in/;

// The machine's address on its own network has no place in a public recording.
const LOCAL_ADDRESS = /Network:\s+http/;

// Stays after the run: `--from site` records this app again.
const WORKSPACE = join(tmpdir(), "labsui-hero");
const APP = join(WORKSPACE, "shop");

export const APP_URL = "http://localhost:3000";

// create-next-app commits, and a global signing key would ask for a passphrase.
const COMMAND_ENV = {
	...process.env,
	NO_COLOR: "1",
	FORCE_COLOR: "0",
	NEXT_TELEMETRY_DISABLED: "1",
	GIT_CONFIG_COUNT: "1",
	GIT_CONFIG_KEY_0: "commit.gpgsign",
	GIT_CONFIG_VALUE_0: "false",
};

const isWindows = process.platform === "win32";

function startProcess(command: string, cwd: string) {
	return spawn(command, { cwd, env: COMMAND_ENV, shell: true, detached: !isWindows });
}

// The shell's children have to go too, or the server keeps its port.
function stopProcess(child: ChildProcess) {
	if (!child.pid) return;

	if (isWindows)
		spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore" });
	else process.kill(-child.pid);
}

function cleanLine(raw: string) {
	const withoutColor = raw.replace(
		new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*[A-Za-z]`, "g"),
		"",
	);

	const lastRedraw = withoutColor.slice(withoutColor.lastIndexOf("\r") + 1);

	return lastRedraw
		.replaceAll(WORKSPACE, "~/projects")
		.replaceAll(WORKSPACE.replaceAll("\\", "/"), "~/projects")
		.replaceAll("~/projects\\", "~/projects/")
		.trimEnd();
}

function runCommand(command: string, cwd: string, hold: number, until?: RegExp) {
	return new Promise<Extract<TranscriptStep, { kind: "command" }>>((resolve, reject) => {
		const started = performance.now();
		const lines: TranscriptLine[] = [];
		const pending = { stdout: "", stderr: "" };
		const child = startProcess(command, cwd);
		const elapsed = () => (performance.now() - started) / 1000;
		let isDone = false;

		function finish(keepsRunning: boolean) {
			isDone = true;
			resolve({ kind: "command", command, lines, took: elapsed(), hold, keepsRunning });
		}

		const collect = (stream: "stdout" | "stderr") => (chunk: Buffer) => {
			const parts = (pending[stream] + chunk.toString()).split("\n");

			pending[stream] = parts.pop() ?? "";

			for (const part of parts) {
				const text = cleanLine(part);

				if (isDone) return;

				if (LOCAL_ADDRESS.test(text)) continue;

				lines.push({ at: elapsed(), text });

				if (until?.test(text)) {
					finish(true);
					stopProcess(child);
				}
			}
		};

		child.stdout.on("data", collect("stdout"));
		child.stderr.on("data", collect("stderr"));
		child.on("error", reject);

		child.on("close", (code) => {
			if (isDone) return;

			if (code !== 0) {
				const output = lines.map((line) => line.text).join("\n");

				reject(new Error(`"${command}" exited with ${code}:\n${output}`));

				return;
			}

			for (const rest of [pending.stdout, pending.stderr])
				if (rest) lines.push({ at: elapsed(), text: cleanLine(rest) });

			finish(false);
		});
	});
}

/** The edits `init` asks for, so `doctor` comes back clean and the app looks like labsUI. */
function wireApp() {
	const layout = join(APP, "src/app/layout.tsx");

	const wired = readFileSync(layout, "utf8")
		.replace(
			"<body",
			"<head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>\n<body",
		)
		.replace("{children}", "<MotionProvider>{children}<Toaster /></MotionProvider>");

	const imports = [
		'import { MotionProvider } from "@/components/motion-provider";',
		'import { Toaster } from "@/components/ui/toast";',
		'import { themeScript } from "@/lib/theme";',
	].join("\n");

	writeFileSync(layout, `${imports}\n${wired}`);

	const styles = join(APP, "src/app/globals.css");

	const importsOnly = readFileSync(styles, "utf8")
		.split("\n")
		.filter((line) => line.startsWith("@import"))
		.join("\n");

	writeFileSync(styles, `${importsOnly}\n`);
}

/** Every step must succeed: a broken run never reaches the GIF. */
export async function runCli(outFile: string) {
	rmSync(WORKSPACE, { recursive: true, force: true });
	mkdirSync(WORKSPACE, { recursive: true });

	const steps: TranscriptStep[] = [];

	const run = async (command: string, cwd: string, hold: number, until?: RegExp) => {
		console.log(`  ${command}`);

		const step = await runCommand(command, cwd, hold, until);

		steps.push(step);

		return step.lines.map((line) => line.text).join("\n");
	};

	await run(
		"bunx --bun create-next-app@latest shop --tailwind --src-dir --use-bun --yes",
		WORKSPACE,
		0.3,
	);

	steps.push({ kind: "command", command: "cd shop", lines: [], took: 0, hold: 0.1 });

	await run(`${LABSUI} init`, APP, 0.45);
	await run(`${LABSUI} add tabs select toast field input button card`, APP, 0.45);

	wireApp();
	steps.push({ kind: "note", text: "wire layout.tsx and globals.css, as init printed" });

	copyFileSync(RESULT_PAGE, join(APP, "src/app/page.tsx"));
	steps.push({ kind: "note", text: "write src/app/page.tsx" });

	appendFileSync(join(APP, EDITED_FILE), "// a change of mine\n");
	steps.push({ kind: "note", text: `edit ${EDITED_FILE}` });

	await run(`${LABSUI} diff`, APP, 1.1);

	const report = await run(`${LABSUI} doctor`, APP, 1.1);

	if (/warning/.test(report)) throw new Error(`doctor is not clean:\n${report}`);

	const server = await run("bun dev", APP, 0.7, SERVER_READY);

	if (!server.includes(APP_URL)) throw new Error(`The app is not on ${APP_URL}:\n${server}`);

	writeFileSync(outFile, JSON.stringify(steps, null, "\t"));
}

/** The same app, off camera, for the part of the GIF that shows it. */
export function startApp() {
	const child = startProcess("bun dev", APP);

	return new Promise<() => void>((resolve, reject) => {
		child.on("error", reject);

		child.on("close", (code) => reject(new Error(`The app exited with ${code}`)));

		child.stdout.on("data", (chunk: Buffer) => {
			if (SERVER_READY.test(chunk.toString())) resolve(() => stopProcess(child));
		});
	});
}
