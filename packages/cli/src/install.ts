import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { CliError, dim } from "./log.ts";
import type { Opts } from "./types.ts";

/**
 * npm package specs as the registry writes them (`motion@14.6.0`, `@scope/pkg@^1.2.0`). The
 * registry is remote, so anything else (flags, spaces, shell characters) is refused.
 */
export const PACKAGE_SPEC = /^(@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*(@[\w.^~*+-]+)?$/i;

function packageManager(cwd: string) {
	const userAgent = process.env.npm_config_user_agent ?? "";

	if (existsSync(join(cwd, "bun.lock")) || existsSync(join(cwd, "bun.lockb"))) return "bun";
	if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
	if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
	if (existsSync(join(cwd, "package-lock.json"))) return "npm";
	for (const manager of ["bun", "pnpm", "yarn"]) if (userAgent.startsWith(manager)) return manager;

	return "npm";
}

/** The install command for `deps`, e.g. `pnpm add motion@14.6.0`. */
export function installCommand(cwd: string, deps: string[]) {
	const manager = packageManager(cwd);

	return [manager, manager === "npm" ? "install" : "add", ...deps];
}

/** Runs the package manager; `quiet` keeps its output off stdout. True when it ran. */
export function installDeps(cwd: string, deps: string[], opts: Opts) {
	if (!deps.length || opts.dryRun || !opts.install) return false;

	const [manager = "npm", ...args] = installCommand(cwd, deps);

	if (!opts.quiet) console.log(dim(`$ ${manager} ${args.join(" ")}`));

	// Windows: npm/pnpm/yarn are .cmd shims and need a shell. Args are plain PACKAGE_SPECs (no quotes
	// or shell chars), quoting stops cmd.exe from eating `^`.
	const win = process.platform === "win32";
	const run = spawnSync(manager, win ? args.map((arg) => `"${arg}"`) : args, {
		cwd,
		stdio: opts.quiet ? ["ignore", 2, 2] : "inherit",
		shell: win,
	});

	if (run.status !== 0)
		throw new CliError(`${manager} failed. Install manually: ${manager} ${args.join(" ")}`);

	return true;
}
