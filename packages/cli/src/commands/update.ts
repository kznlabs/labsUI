import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative } from "node:path";
import { bold, CliError, dim, green, yellow } from "../log.ts";
import { merge3 } from "../merge.ts";
import { recordInstalled } from "../project.ts";
import { itemName } from "../registry.ts";
import type { Config, Opts, RegistryItem } from "../types.ts";
import { VERSION } from "../version.ts";
import { type AddResult, add, printAdd, projectBase, rewriteAlias } from "./add.ts";
import { installedItems } from "./diff.ts";

/** The registry a published version shipped, by item name; undefined when it can't be had. */
export type BaseLoader = (version: string) => Promise<Record<string, RegistryItem> | undefined>;

/** JSR serves every published version's files, the bundled registry among them. */
export const jsrBase: BaseLoader = async (version) => {
	try {
		const res = await fetch(`https://jsr.io/@kznlabs/labsui/${version}/src/registry.json`);

		return res.ok
			? ((await res.json()) as { items: Record<string, RegistryItem> }).items
			: undefined;
	} catch {
		return undefined;
	}
};

type Status = "current" | "replaced" | "merged" | "conflicts" | "kept";
export type ItemUpdate = {
	name: string;
	status: Status;
	/** Files written, or with conflicts left to resolve. */
	files: string[];
	conflicts: number;
	/** Why an edited item was left alone. */
	reason?: string;
};
export type UpdateResult = { items: ItemUpdate[]; added?: AddResult; dryRun: boolean };

const norm = (text: string) => text.replace(/\r\n/g, "\n").replace(/\n*$/, "\n");

/**
 * Brings installed items to this version. Unedited files are replaced; edited ones are merged
 * three ways from the version that installed them, with conflict markers where both sides
 * changed the same lines. Without that version (offline, a hosted registry) edits are kept.
 */
export async function update(
	cwd: string,
	config: Config,
	names: string[],
	opts: Opts,
	loadBase: BaseLoader = jsrBase,
): Promise<UpdateResult> {
	const base = projectBase(cwd, config);
	const wanted = new Set(names.map(itemName));
	const installed = (await installedItems(config, base)).filter(
		({ item }) => !wanted.size || wanted.has(item.name),
	);
	const missing = [...wanted].filter((name) => !installed.some(({ item }) => item.name === name));

	if (missing.length)
		throw new CliError(`Not installed: ${missing.join(", ")}. Add with labsui add.`);

	const bases = new Map<string, Promise<Record<string, RegistryItem> | undefined>>();

	const baseOf = (version: string) => {
		if (!bases.has(version)) bases.set(version, loadBase(version));

		return bases.get(version);
	};

	const items: ItemUpdate[] = [];

	for (const { item, files } of installed) {
		const shown = (file: string) => relative(cwd, file).replaceAll("\\", "/");
		const next = item.files.map((file) => norm(rewriteAlias(file.content, config.alias)));
		const local = files.map((file) =>
			existsSync(file) ? norm(readFileSync(file, "utf8")) : undefined,
		);

		if (local.every((line, i) => line === next[i])) {
			items.push({ name: item.name, status: "current", files: [], conflicts: 0 });
			continue;
		}

		const version = config.installed?.[item.name];
		const old =
			version && version !== VERSION && !config.registry
				? (await baseOf(version))?.[item.name]
				: undefined;

		if (!old) {
			const reason =
				version === VERSION
					? "edited after this version was installed"
					: version
						? `labsui ${version} could not be fetched to merge from`
						: "installed before labsui recorded versions";

			items.push({ name: item.name, status: "kept", files: [], conflicts: 0, reason });
			continue;
		}

		const written: string[] = [];
		let conflicts = 0;
		let merged = false;

		item.files.forEach((entry, i) => {
			const target = files[i] as string;
			const mine = local[i];
			const theirs = next[i] as string;
			const was = old?.files.find((file) => file.path === entry.path);
			let text = theirs;

			if (mine !== undefined && mine !== theirs && was) {
				const before = norm(rewriteAlias(was.content, config.alias));

				if (mine !== before) {
					const mergeResult = merge3(before, mine, theirs, {
						ours: "yours",
						theirs: `labsui ${VERSION}`,
					});

					text = mergeResult.text;
					conflicts += mergeResult.conflicts;
					merged = true;
				}
			}

			if (mine === text) return;

			if (!opts.dryRun) {
				mkdirSync(dirname(target), { recursive: true });
				writeFileSync(target, text);
			}

			written.push(shown(target));
		});
		items.push({
			name: item.name,
			status: conflicts ? "conflicts" : merged ? "merged" : "replaced",
			files: written,
			conflicts,
		});
	}

	const changed = items
		.filter((i) => i.status !== "current" && i.status !== "kept")
		.map((i) => i.name);
	let added: AddResult | undefined;

	if (changed.length) {
		added = await add(cwd, config, changed, { ...opts, overwrite: false });
		added.kept = [];
		if (!opts.dryRun && !config.registry) recordInstalled(cwd, changed, VERSION);
	}

	return { items, ...(added && { added }), dryRun: opts.dryRun };
}

export function printUpdate(result: UpdateResult) {
	const verb = result.dryRun ? "would be " : "";
	const rows = result.items.filter((i) => i.status !== "current");

	if (!rows.length) return console.log(`${green("✓")} Everything is on labsui ${VERSION}.`);

	const width = Math.max(...rows.map((i) => i.name.length));

	for (const i of rows) {
		const name = i.name.padEnd(width);

		if (i.status === "kept") console.log(`${yellow("•")} ${name}  kept: ${i.reason}`);
		else if (i.status === "conflicts")
			console.log(
				`${yellow("!")} ${name}  ${verb}merged with ${i.conflicts} conflict(s): resolve the <<<<<<< markers in ${i.files.join(", ")}`,
			);
		else console.log(`${green("✓")} ${name}  ${verb}${i.status}`);
	}

	if (result.added) printAdd(result.added);
	if (rows.some((i) => i.status === "kept"))
		console.log(
			dim(`\nlabsui diff <name> shows the edits; add <name> --overwrite takes ${VERSION}.`),
		);
	if (rows.some((i) => i.status === "conflicts"))
		console.log(`\n${bold("Then")} run labsui doctor.`);
}
