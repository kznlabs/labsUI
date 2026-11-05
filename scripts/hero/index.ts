// Records the README hero from the live site and a real CLI run. Needs ffmpeg on the PATH.
// Usage: bun run hero [--theme dark] [--from cli|site|compose|encode]
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { runCli } from "./cli-run";
import { recordSite, type Theme } from "./page-run";
import { composeFrames, FPS } from "./stage";

// GitHub documents 10 MB for attachments, reports for images in a README start at 5 MB.
const SIZE_LIMIT = 5 * 1024 * 1024;

const WORK_DIRECTORY = ".hero";
const TRANSCRIPT = join(WORK_DIRECTORY, "transcript.json");
const STAGES = ["cli", "site", "compose", "encode"];

const { values } = parseArgs({
	options: { theme: { type: "string" }, from: { type: "string", default: "cli" } },
});

const firstStage = STAGES.indexOf(values.from ?? "cli");

if (firstStage < 0) throw new Error(`--from takes one of: ${STAGES.join(", ")}`);

const reaches = (stage: string) => STAGES.indexOf(stage) >= firstStage;
const themes: Theme[] = values.theme ? [values.theme as Theme] : ["light", "dark"];

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

mkdirSync(WORK_DIRECTORY, { recursive: true });

if (reaches("cli")) {
	console.log("CLI run");

	await runCli(TRANSCRIPT);
}

for (const theme of themes) {
	const directory = join(WORK_DIRECTORY, theme);
	const clips = join(directory, "clips");
	const frames = join(directory, "frames");
	const gif = join(directory, "hero.gif");
	const video = join(directory, "hero.mp4");

	if (reaches("site")) {
		console.log(`Site, ${theme}`);

		await recordSite(theme, clips);
	}

	if (reaches("compose")) {
		console.log(`Compose, ${theme}`);

		await composeFrames(theme, TRANSCRIPT, clips, frames);
	}

	console.log(`Encode, ${theme}`);

	encode(frames, gif, video);

	const { size } = statSync(gif);
	const megabytes = (size / 1024 / 1024).toFixed(2);

	console.log(`  ${megabytes} MB`);

	if (size > SIZE_LIMIT) throw new Error(`${gif} is over the limit, assets left as they were`);

	copyFileSync(gif, `.github/assets/hero-${theme}.gif`);
}
