import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { installCommand, PACKAGE_SPEC } from "../install.ts";
import { bold, CliError, dim, green, red, yellow } from "../log.ts";
import { hasConflictMarkers } from "../merge.ts";
import { CONFIG, detectAlias, findCss, readConfig, readPackage } from "../project.ts";
import type { Config } from "../types.ts";
import { packageName, projectBase, rewriteAlias } from "./add.ts";
import { installedItems, sameCode } from "./diff.ts";

type Status = "pass" | "info" | "warn" | "fail";
export type Check = { id: string; status: Status; message: string; fix?: string };
export type DoctorResult = { ok: boolean; checks: Check[] };

const SKIP_DIRS = new Set(["node_modules", "dist", "build", "out", "coverage"]);

function sourceFiles(dir: string, depth = 0, out: string[] = []) {
	if (depth > 8 || out.length > 5000 || !existsSync(dir)) return out;

	for (const entry of readdirSync(dir)) {
		if (entry.startsWith(".") || SKIP_DIRS.has(entry)) continue;

		const path = join(dir, entry);

		if (statSync(path).isDirectory()) sourceFiles(path, depth + 1, out);
		else if (/\.(tsx?|jsx?|mdx)$/.test(entry)) out.push(path);
	}

	return out;
}

/** First number of a range: 19 for `^19.2.0`, NaN for `workspace:*`. */
const major = (range: string | undefined) => Number(/(\d+)/.exec(range ?? "")?.[1]);

/**
 * Setup checks that need no framework knowledge: they read package.json, tsconfig, the stylesheet
 * and the project's own source, so a Vite app passes as well as a Next one.
 */
export async function doctor(cwd: string, registryFlag?: string): Promise<DoctorResult> {
	const checks: Check[] = [];
	const add = (id: string, status: Status, message: string, fix?: string) =>
		checks.push({ id, status, message, ...(fix && { fix }) });
	const done = () => ({ ok: !checks.some((check) => check.status === "fail"), checks });

	let deps: Record<string, string>;

	try {
		const pkg = readPackage(cwd);

		deps = { ...pkg.dependencies, ...pkg.devDependencies };
	} catch (err) {
		add("package", "fail", (err as Error).message);

		return done();
	}

	const react = major(deps.react);

	if (!deps.react)
		add("react", "fail", "React is not in package.json.", "Install react@19 and react-dom@19.");
	else if (react < 19)
		add("react", "fail", `React ${deps.react}; labsUI needs 19.`, "Upgrade to react@19.");
	else add("react", "pass", `React ${deps.react}`);

	const tailwind = deps.tailwindcss;

	if (!tailwind)
		add("tailwind", "fail", "Tailwind CSS is not in package.json.", "Install tailwindcss@4.");
	else if (major(tailwind) < 4)
		add("tailwind", "fail", `Tailwind ${tailwind}; labsUI needs v4.`, "Upgrade to tailwindcss@4.");
	else add("tailwind", "pass", `Tailwind ${tailwind}`);

	let detected: { alias: string; root: string };

	try {
		detected = detectAlias(cwd);
		add("alias", "pass", `Alias ${detected.alias} → ${detected.root}`);
	} catch (err) {
		add("alias", "fail", (err as Error).message);

		return done();
	}

	const saved = readConfig(cwd);

	if (!saved) add("config", "warn", `No ${CONFIG}.`, "Run npx @kznlabs/labsui init.");
	else if (saved.alias !== detected.alias || saved.root !== detected.root)
		add(
			"config",
			"warn",
			`${CONFIG} says ${saved.alias} → ${saved.root}, tsconfig says ${detected.alias} → ${detected.root}.`,
			`Fix ${CONFIG}, or run npx @kznlabs/labsui init again.`,
		);
	else add("config", "pass", CONFIG);

	const config: Config = { ...detected, ...saved, ...(registryFlag && { registry: registryFlag }) };

	let base: string;

	try {
		base = projectBase(cwd, config);
	} catch (err) {
		if (err instanceof CliError) add("config", "fail", err.message);

		return done();
	}

	const items = await installedItems(config, base);
	const owned = new Set(items.flatMap(({ files }) => files));

	if (!existsSync(join(base, "styles/labsui.css")))
		add("styles", "fail", "styles/labsui.css is missing.", "Run npx @kznlabs/labsui init.");
	else {
		const css = findCss(cwd, config.root);
		const shown = css && relative(cwd, css).replaceAll("\\", "/");

		if (css && readFileSync(css, "utf8").includes("labsui.css"))
			add("styles", "pass", `${shown} imports labsui.css`);
		else
			add(
				"styles",
				"fail",
				css ? `${shown} does not import labsui.css.` : "No stylesheet imports Tailwind.",
				'Run npx @kznlabs/labsui init, or add @import "<path>/styles/labsui.css"; after @import "tailwindcss".',
			);
	}

	const sources = sourceFiles(cwd === base ? cwd : base)
		.concat(cwd === base ? [] : sourceFiles(join(cwd, "app")))
		.filter((file) => !owned.has(file));
	const texts = sources.map((source) => readFileSync(source, "utf8"));
	const used = (needle: string) => texts.some((text) => text.includes(needle));

	for (const [needle, label, fix] of [
		[
			"<MotionProvider",
			"MotionProvider",
			"Wrap the app in <MotionProvider> (labsui init prints the layout).",
		],
		[
			"themeScript",
			"themeScript",
			"Add <script dangerouslySetInnerHTML={{ __html: themeScript }} /> to <head>.",
		],
	] as const)
		if (used(needle)) add("layout", "pass", `${label} is wired`);
		else add("layout", "warn", `${label} is not used anywhere in your code.`, fix);
	for (const { item } of items)
		if (item.mount)
			if (used(item.mount.replace(/\s*\/>$/, ""))) add("mount", "pass", `${item.mount} is mounted`);
			else
				add(
					"mount",
					"warn",
					`${item.name} is installed, but ${item.mount} is not mounted.`,
					`Render ${item.mount} once in the root layout, inside <MotionProvider>.`,
				);

	const specs = [...new Set(items.flatMap(({ item }) => item.dependencies ?? []))];
	// An agent may run this fix, so only plain package names get here (same check as `add`).
	const invalid = specs.filter((spec) => !PACKAGE_SPEC.test(spec));

	if (invalid.length)
		add(
			"package-specs",
			"fail",
			`The registry lists invalid dependencies: ${invalid.map((dependency) => JSON.stringify(dependency)).join(", ")}`,
			"Check the registry in labsui.json; add refuses these items.",
		);

	const missing = specs
		.filter((spec) => PACKAGE_SPEC.test(spec) && !deps[packageName(spec)])
		.sort();

	if (missing.length)
		add(
			"packages",
			"fail",
			`Missing npm packages: ${missing.map(packageName).join(", ")}`,
			installCommand(cwd, missing).join(" "),
		);
	else if (items.length) add("packages", "pass", "npm packages installed");

	const names = new Set(items.map(({ item }) => item.name));
	const broken = items.flatMap(({ item }) =>
		(item.registryDependencies ?? [])
			.map(
				(dependency) =>
					dependency
						.split("/")
						.pop()
						?.replace(/\.json$/, "") ?? dependency,
			)
			.filter((dependency) => !names.has(dependency))
			.map((dependency) => `${item.name} → ${dependency}`),
	);

	if (broken.length)
		add(
			"files",
			"fail",
			`Missing files: ${broken.join(", ")}`,
			`npx @kznlabs/labsui add ${[...new Set(broken.map((line) => line.split(" → ")[1]))].join(" ")}`,
		);

	const unresolved = items
		.flatMap(({ files }) => files)
		.filter((file) => existsSync(file) && hasConflictMarkers(readFileSync(file, "utf8")))
		.map((file) => relative(cwd, file).replaceAll("\\", "/"));

	if (unresolved.length)
		add(
			"merge",
			"fail",
			`Unresolved update conflicts in ${unresolved.join(", ")}`,
			"Pick between the <<<<<<< yours and >>>>>>> labsui sides, then delete the markers.",
		);

	const drift = (code: boolean) =>
		items
			.filter(({ item, files }) =>
				item.files.some((file, i) => {
					const local = files[i];

					if (!local || !existsSync(local)) return false;

					const yours = readFileSync(local, "utf8");
					const theirs = rewriteAlias(file.content, config.alias);
					const norm = (text: string) => text.replace(/\r\n/g, "\n").trimEnd();

					return code ? !sameCode(yours, theirs) : norm(yours) !== norm(theirs);
				}),
			)
			.map((entry) => entry.item.name);
	const edited = drift(true);
	const formatted = drift(false).filter((name) => !edited.includes(name));
	const parts = [
		edited.length &&
			`${edited.length} differ from this labsui version (your edits or another version, see labsui diff): ${edited.join(", ")}`,
		formatted.length &&
			`${formatted.length} differ only in blank lines or indentation: ${formatted.join(", ")}`,
	].filter(Boolean);

	if (items.length)
		add(
			"drift",
			"info",
			`${items.length} item(s) installed${parts.length ? `; ${parts.join("; ")}` : ", all match this labsui version"}`,
		);

	return done();
}

const MARK: Record<Status, string> = {
	pass: green("✓"),
	info: dim("•"),
	warn: yellow("!"),
	fail: red("✗"),
};

export function printDoctor(result: DoctorResult) {
	for (const entry of result.checks) {
		console.log(`${MARK[entry.status]} ${entry.message}`);
		if (entry.fix) console.log(dim(`    ${entry.fix}`));
	}

	const fails = result.checks.filter((check) => check.status === "fail").length;
	const warns = result.checks.filter((check) => check.status === "warn").length;

	console.log(
		`\n${result.ok ? green(bold("Setup OK")) : red(bold(`${fails} problem(s)`))}${warns ? dim(`, ${warns} warning(s)`) : ""}`,
	);
}
