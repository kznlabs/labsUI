import { existsSync, mkdirSync, realpathSync, writeFileSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { installCommand, installDeps, PACKAGE_SPEC } from "../install.ts";
import { bold, CliError, dim, green, yellow } from "../log.ts";
import { CONFIG, readPackage, recordInstalled } from "../project.ts";
import { itemName, resolveItems } from "../registry.ts";
import type { Config, Opts, RegistryItem } from "../types.ts";
import { VERSION } from "../version.ts";

/** Rewrites `@/` imports when the project uses another alias, e.g. `~/`. */
export function rewriteAlias(content: string, alias: string) {
	return alias === "@/" ? content : content.replace(/(["'])@\//g, `$1${alias}`);
}

/** Resolves symlinks in the part of the path that exists. */
function real(path: string): string {
	if (existsSync(path)) return realpathSync(path);

	const parent = dirname(path);

	return parent === path ? path : join(real(parent), basename(path));
}

/** Compared on disk, so a symlinked folder doesn't count as inside. */
function inside(parent: string, child: string, strict = false) {
	const rel = relative(real(parent), real(child));

	return !rel.startsWith("..") && !isAbsolute(rel) && (!strict || rel !== "");
}

/** Where a registry file goes: inside the alias folder, or the install is refused. */
export function safeTarget(base: string, path: string) {
	const target = resolve(base, path);

	if (isAbsolute(path) || !inside(base, target, true))
		throw new CliError(`Refusing to write outside ${base}: ${path}`);

	return target;
}

/** Inside the project, or refused: `root` comes from a config file anyone can edit. */
export function projectBase(cwd: string, config: Config) {
	const base = resolve(cwd, config.root);

	if (!inside(cwd, base))
		throw new CliError(`"root" in ${CONFIG} must be inside the project: ${config.root}`);

	return base;
}

/** The npm name of a spec: `@scope/pkg` for `@scope/pkg@^1`. */
export const packageName = (spec: string) => spec.replace(/(?<=.)@[^@]*$/, "");

export type AddResult = {
	/** Every item installed or kept, dependencies first. */
	items: string[];
	/** Items this run wrote files for. */
	fresh: string[];
	written: string[];
	/** Existing files of the items asked for; dependencies already there are expected. */
	kept: string[];
	/** npm packages the items need and package.json lacks. */
	packages: string[];
	/** Set when the packages still need installing (dry run, --no-install). */
	installCommand?: string;
	/** Components to mount once in the root layout. */
	mounts: { tag: string; from: string }[];
	dryRun: boolean;
};

export async function add(
	cwd: string,
	config: Config,
	names: string[],
	opts: Opts,
): Promise<AddResult> {
	const base = projectBase(cwd, config);
	const items = await resolveItems(config.registry, names);
	const named = new Set(names.map(itemName));
	const pkg = readPackage(cwd);
	const installed = { ...pkg.dependencies, ...pkg.devDependencies };

	const result: AddResult = {
		items: items.map((i) => i.name),
		fresh: [],
		written: [],
		kept: [],
		packages: [],
		mounts: [],
		dryRun: opts.dryRun,
	};
	const deps = new Set<string>();

	for (const item of items) {
		for (const dep of item.dependencies ?? []) {
			if (!PACKAGE_SPEC.test(dep)) throw new CliError(`${item.name}: invalid dependency "${dep}"`);
			if (!installed[packageName(dep)]) deps.add(dep);
		}

		if (!writeItem(item, base, cwd, config, opts, result, named.has(item.name))) continue;
		result.fresh.push(item.name);
		if (item.mount)
			result.mounts.push({
				tag: item.mount,
				from: `${config.alias}${item.files[0]?.path.replace(/\.tsx?$/, "")}`,
			});
	}

	// Only the bundled registry has a version `update` can merge from.
	if (!opts.dryRun && !config.registry) recordInstalled(cwd, result.fresh, VERSION);
	result.packages = [...deps];
	if (!installDeps(cwd, result.packages, opts) && deps.size)
		result.installCommand = installCommand(cwd, result.packages).join(" ");

	return result;
}

function writeItem(
	item: RegistryItem,
	base: string,
	cwd: string,
	config: Config,
	opts: Opts,
	result: AddResult,
	named: boolean,
) {
	let fresh = false;

	for (const file of item.files) {
		const target = safeTarget(base, file.target ?? file.path);
		const shown = relative(cwd, target).replaceAll("\\", "/");

		if (existsSync(target) && !opts.overwrite) {
			if (named) result.kept.push(shown);
			continue;
		}

		if (!opts.dryRun) {
			mkdirSync(dirname(target), { recursive: true });
			writeFileSync(target, rewriteAlias(file.content, config.alias));
		}

		result.written.push(shown);
		fresh = true;
	}

	return fresh;
}

const fileList = (files: string[]) => files.map((file) => dim(`  ${file}`)).join("\n");

export function printAdd(result: AddResult) {
	const verb = result.dryRun ? "Would write" : "Wrote";

	if (result.written.length)
		console.log(
			`${green("✓")} ${verb} ${result.written.length} file(s):\n${fileList(result.written)}`,
		);
	if (result.kept.length)
		console.log(
			`${yellow("•")} Kept ${result.kept.length} existing file(s) (--overwrite replaces them):\n${fileList(result.kept)}`,
		);
	if (result.installCommand)
		console.log(`${yellow("•")} Install these yourself: ${bold(result.installCommand)}`);
	else if (result.packages.length)
		console.log(`${green("✓")} Installed ${result.packages.length} package(s)`);

	if (result.mounts.length) {
		const width = Math.max(...result.mounts.map((mount) => mount.tag.length));

		console.log(`\n${bold("Mount once")} in the root layout, inside <MotionProvider>:`);
		for (const mounted of result.mounts)
			console.log(`  ${mounted.tag.padEnd(width)}  ${dim(`from "${mounted.from}"`)}`);
	}
}
