// Records the README hero from the live site and a real CLI run. Needs ffmpeg on the PATH.
// Usage: bun run hero [--theme dark] [--from cli|site|compose|encode] [--publish]
// Look at .hero/<theme>/hero.gif first: --publish replaces the GIFs the README shows.
import { execFileSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { runCli, startApp } from "./cli-run";
import { recordClips, type Theme } from "./page-run";
import { composeFrames, FPS } from "./stage";

// GitHub documents 10 MB for attachments, reports for images in a README start at 5 MB.
const SIZE_LIMIT = 5 * 1024 * 1024;

// One force-pushed commit, so old recordings don't stay in every clone.
const HERO_BRANCH = "hero";

const WORK_DIRECTORY = ".hero";
const TRANSCRIPT = join(WORK_DIRECTORY, "transcript.json");
const STAGES = ["cli", "site", "compose", "encode"];

const { values } = parseArgs({
	options: {
		theme: { type: "string" },
		from: { type: "string", default: "cli" },
		publish: { type: "boolean", default: false },
	},
});

const firstStage = STAGES.indexOf(values.from ?? "cli");

if (firstStage < 0) throw new Error(`--from takes one of: ${STAGES.join(", ")}`);

if (values.publish && values.theme) throw new Error("--publish needs both themes");

const reaches = (stage: string) => STAGES.indexOf(stage) >= firstStage;
const themes: Theme[] = values.theme ? [values.theme as Theme] : ["light", "dark"];
const gifOf = (theme: Theme) => join(WORK_DIRECTORY, theme, "hero.gif");

function encode(frameDirectory: string, gif: string, video: string) {
	const input = [
		"-y",
		"-v",
		"error",
		"-framerate",
		String(FPS),
		"-i",
		join(frameDirectory, "%05d.png"),
	];

	const palette =
		"split[frames][source];[source]palettegen=max_colors=128:stats_mode=diff[palette];" +
		"[frames][palette]paletteuse=dither=none:diff_mode=rectangle";

	execFileSync("ffmpeg", [...input, "-filter_complex", palette, "-loop", "0", gif]);

	execFileSync("ffmpeg", [...input, "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p", video]);
}

function publish() {
	const git = (args: string[], input?: string) =>
		execFileSync("git", args, { input, encoding: "utf8" }).trim();

	const entries = themes.map((theme) => {
		const blob = git(["hash-object", "-w", "--no-filters", gifOf(theme)]);

		return `100644 blob ${blob}\thero-${theme}.gif`;
	});

	const tree = git(["mktree"], `${entries.join("\n")}\n`);
	const commit = git(["commit-tree", tree, "-S", "-m", "docs: readme hero"]);

	git(["push", "--force", "origin", `${commit}:refs/heads/${HERO_BRANCH}`]);

	console.log(`Published to ${HERO_BRANCH}: ${commit.slice(0, 7)}`);
}

mkdirSync(WORK_DIRECTORY, { recursive: true });

if (reaches("cli")) {
	console.log("CLI run");

	await runCli(TRANSCRIPT);
}

const stopApp = reaches("site") ? await startApp() : null;

try {
	for (const theme of themes) {
		const directory = join(WORK_DIRECTORY, theme);
		const clips = join(directory, "clips");
		const frames = join(directory, "frames");

		if (reaches("site")) {
			console.log(`Clips, ${theme}`);

			await recordClips(theme, clips);
		}

		if (reaches("compose")) {
			console.log(`Compose, ${theme}`);

			await composeFrames(theme, TRANSCRIPT, clips, frames);
		}

		console.log(`Encode, ${theme}`);

		encode(frames, gifOf(theme), join(directory, "hero.mp4"));

		const { size } = statSync(gifOf(theme));

		console.log(`  ${(size / 1024 / 1024).toFixed(2)} MB`);

		if (size > SIZE_LIMIT) throw new Error(`${gifOf(theme)} is over the limit`);
	}
} finally {
	stopApp?.();
}

if (values.publish) publish();

// The stopped server's pipes would keep the process waiting.
process.exit(0);
