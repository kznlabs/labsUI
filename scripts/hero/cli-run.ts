// Runs the real CLI on a fresh app. What the GIF shows is this run's output and timing.
import { spawn } from "node:child_process";
import { appendFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export type TranscriptLine = { at: number; text: string };

export type TranscriptStep =
	| { kind: "note"; text: string }
	| { kind: "command"; command: string; lines: TranscriptLine[]; took: number; hold: number };

// With @latest, bunx asks the registry instead of reusing a cached older version.
const LABSUI = "bunx @kznlabs/labsui@latest";
const EDITED_FILE = "src/components/ui/tabs.tsx";

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

function cleanLine(raw: string, workspace: string) {
	const withoutColor = raw.replace(
		new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*[A-Za-z]`, "g"),
		"",
	);
	const lastRedraw = withoutColor.slice(withoutColor.lastIndexOf("\r") + 1);

	return lastRedraw
		.replaceAll(workspace, "~/projects")
		.replaceAll(workspace.replaceAll("\\", "/"), "~/projects")
		.replaceAll("~/projects\\", "~/projects/")
		.trimEnd();
}

function runCommand(command: string, cwd: string, workspace: string, hold: number) {
	return new Promise<TranscriptStep>((resolve, reject) => {
		const started = performance.now();
		const lines: TranscriptLine[] = [];
		const pending = { stdout: "", stderr: "" };
		const child = spawn(command, { cwd, env: COMMAND_ENV, shell: true });
		const elapsed = () => (performance.now() - started) / 1000;

		const collect = (stream: "stdout" | "stderr") => (chunk: Buffer) => {
			const parts = (pending[stream] + chunk.toString()).split("\n");

			pending[stream] = parts.pop() ?? "";

			for (const part of parts) lines.push({ at: elapsed(), text: cleanLine(part, workspace) });
		};

		child.stdout.on("data", collect("stdout"));
		child.stderr.on("data", collect("stderr"));
		child.on("error", reject);

		child.on("close", (code) => {
			if (code !== 0) {
				const output = lines.map((line) => line.text).join("\n");

				reject(new Error(`"${command}" exited with ${code}:\n${output}`));

				return;
			}

			const took = elapsed();

			for (const rest of [pending.stdout, pending.stderr])
				if (rest) lines.push({ at: took, text: cleanLine(rest, workspace) });

			resolve({ kind: "command", command, lines, took, hold });
		});
	});
}

/** The edit `init` asks for, so `doctor` can come back clean. */
function wireLayout(app: string) {
	const path = join(app, "src/app/layout.tsx");

	const wired = readFileSync(path, "utf8")
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

	writeFileSync(path, `${imports}\n${wired}`);
}

/** Every step must succeed: a broken run never reaches the GIF. */
export async function runCli(outFile: string) {
	const workspace = mkdtempSync(join(tmpdir(), "labsui-hero-"));
	const app = join(workspace, "shop");
	const steps: TranscriptStep[] = [];

	try {
		const run = async (command: string, cwd: string, hold: number) => {
			console.log(`  ${command}`);

			const step = await runCommand(command, cwd, workspace, hold);

			steps.push(step);

			return step;
		};

		await run(
			"bunx --bun create-next-app@latest shop --tailwind --src-dir --use-bun --yes",
			workspace,
			0.35,
		);

		steps.push({ kind: "command", command: "cd shop", lines: [], took: 0, hold: 0.1 });

		await run(`${LABSUI} init`, app, 0.6);
		await run(`${LABSUI} add tabs toast select`, app, 0.6);

		wireLayout(app);
		steps.push({ kind: "note", text: "wire src/app/layout.tsx, as init printed" });

		appendFileSync(join(app, EDITED_FILE), "// a change of mine\n");
		steps.push({ kind: "note", text: `edit ${EDITED_FILE}` });

		await run(`${LABSUI} diff`, app, 1.4);
		await run(`${LABSUI} update tabs`, app, 1);

		const doctor = await run(`${LABSUI} doctor`, app, 1.8);
		const report =
			doctor.kind === "command" ? doctor.lines.map((line) => line.text).join("\n") : "";

		if (/warning/.test(report)) throw new Error(`doctor is not clean:\n${report}`);

		writeFileSync(outFile, JSON.stringify(steps, null, "\t"));
	} finally {
		rmSync(workspace, { recursive: true, force: true });
	}
}
