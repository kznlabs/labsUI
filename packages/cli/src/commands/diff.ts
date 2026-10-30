import { existsSync, readFileSync } from "node:fs";
import { relative } from "node:path";
import { lines, sameCode } from "../lines.ts";
import { CliError, dim, green, red } from "../log.ts";
import { fetchAllItems, itemName } from "../registry.ts";
import type { Config, RegistryItem } from "../types.ts";
import { projectBase, rewriteAlias, safeTarget } from "./add.ts";

type Op = { kind: " " | "-" | "+"; line: string };
export type FileDiff = {
	path: string;
	added: number;
	removed: number;
	/** Only blank lines or indentation differ: a formatter, not an edit. */
	formatting: boolean;
	patch: string;
};
/** `installed: false` for an item asked for by name that isn't in the project. */
export type ItemDiff = { name: string; installed: boolean; files: FileDiff[] };

/** For each line of `a`, the index of the line of `b` it is kept as, or -1 where it changed. */
export function matches(a: string[], b: string[]) {
	const out = new Int32Array(a.length).fill(-1);
	let i = 0;
	let j = 0;

	for (const op of edits(a, b)) {
		if (op.kind === " ") out[i] = j;
		if (op.kind !== "+") i++;
		if (op.kind !== "-") j++;
	}

	return out;
}

/** LCS line diff, removals before additions. */
function edits(a: string[], b: string[]): Op[] {
	const aLength = a.length;
	const bLength = b.length;
	const lcs = new Uint32Array((aLength + 1) * (bLength + 1));
	const at = (i: number, j: number) => lcs[i * (bLength + 1) + j] ?? 0;

	for (let i = aLength - 1; i >= 0; i--)
		for (let j = bLength - 1; j >= 0; j--)
			lcs[i * (bLength + 1) + j] =
				a[i] === b[j] ? at(i + 1, j + 1) + 1 : Math.max(at(i + 1, j), at(i, j + 1));

	const ops: Op[] = [];
	let i = 0;
	let j = 0;

	while (i < aLength || j < bLength) {
		if (i < aLength && j < bLength && a[i] === b[j]) {
			ops.push({ kind: " ", line: a[i] ?? "" });
			i++;
			j++;
		} else if (i < aLength && (j === bLength || at(i + 1, j) >= at(i, j + 1)))
			ops.push({ kind: "-", line: a[i++] ?? "" });
		else ops.push({ kind: "+", line: b[j++] ?? "" });
	}

	return ops;
}

/** A unified diff with three lines of context, or "" when the texts match. */
export function unifiedDiff(
	from: string,
	to: string,
	fromName: string,
	toName: string,
	context = 3,
) {
	const ops = edits(lines(from), lines(to));
	const changed = ops.flatMap((op, key) => (op.kind === " " ? [] : [key]));

	if (!changed.length) return "";

	const hunks: [start: number, end: number][] = [];

	for (const key of changed) {
		const last = hunks[hunks.length - 1];
		const start = Math.max(0, key - context);

		if (last && start <= last[1] + 1) last[1] = Math.min(ops.length - 1, key + context);
		else hunks.push([start, Math.min(ops.length - 1, key + context)]);
	}

	// Lines of each side consumed before op k.
	const before: [a: number, b: number][] = [];
	let seenA = 0;
	let seenB = 0;

	for (const op of ops) {
		before.push([seenA, seenB]);
		if (op.kind !== "+") seenA++;
		if (op.kind !== "-") seenB++;
	}

	const out = [`--- ${fromName}`, `+++ ${toName}`];

	for (const [start, end] of hunks) {
		const slice = ops.slice(start, end + 1);
		const [aSeen, bSeen] = before[start] ?? [0, 0];
		const aLen = slice.filter((edit) => edit.kind !== "+").length;
		const bLen = slice.filter((edit) => edit.kind !== "-").length;

		// Empty side points at the line before the hunk, like unified diffs.
		out.push(`@@ -${aLen ? aSeen + 1 : aSeen},${aLen} +${bLen ? bSeen + 1 : bSeen},${bLen} @@`);
		for (const edit of slice) out.push(`${edit.kind}${edit.line}`);
	}

	return out.join("\n");
}

/**
 * Registry items with files in the project, and those files' local paths. Paths are contained
 * like `add`'s: a registry that points outside the alias folder is refused, since `update` writes
 * to them.
 */
export async function installedItems(config: Config, base: string, all?: RegistryItem[]) {
	return (all ?? (await fetchAllItems(config.registry))).flatMap((item: RegistryItem) => {
		const files = item.files.map((file) => safeTarget(base, file.target ?? file.path));

		return files.some((file) => existsSync(file)) ? [{ item, files }] : [];
	});
}

/**
 * How installed items differ from this labsui version, as patches from the registry file to
 * yours. No names: every installed item that differs. A name that isn't installed comes back with
 * `installed: false`; an unknown one is an error.
 */
export async function diff(cwd: string, config: Config, names: string[], version: string) {
	const base = projectBase(cwd, config);
	const wanted = new Set(names.map(itemName));
	const all = await fetchAllItems(config.registry);
	const unknown = [...wanted].filter((name) => !all.some((item) => item.name === name));

	if (unknown.length)
		throw new CliError(`Unknown item(s): ${unknown.join(", ")}. Search finds the names.`);

	const installed = await installedItems(config, base, all);
	const out: ItemDiff[] = [...wanted]
		.filter((name) => !installed.some(({ item }) => item.name === name))
		.map((name) => ({ name, installed: false, files: [] }));

	for (const { item, files } of installed) {
		if (wanted.size && !wanted.has(item.name)) continue;

		const changed: FileDiff[] = [];

		item.files.forEach((file, i) => {
			const local = files[i];

			if (!local || !existsSync(local)) return;

			const shown = relative(cwd, local).replaceAll("\\", "/");
			const theirs = rewriteAlias(file.content, config.alias);
			const yours = readFileSync(local, "utf8");
			const patch = unifiedDiff(theirs, yours, `labsui@${version}/${file.path}`, shown);

			if (!patch) return;

			const body = patch.split("\n").slice(2);

			changed.push({
				path: shown,
				added: body.filter((line) => line.startsWith("+")).length,
				removed: body.filter((line) => line.startsWith("-")).length,
				formatting: sameCode(theirs, yours),
				patch,
			});
		});
		if (changed.length) out.push({ name: item.name, installed: true, files: changed });
	}

	return out;
}

export function printDiff(items: ItemDiff[], full: boolean) {
	if (!items.length) return console.log(`${green("✓")} Installed items match this labsui version.`);

	for (const item of items) {
		if (!item.installed)
			console.log(`  ${item.name.padEnd(24)} ${dim(`not installed (labsui add ${item.name})`)}`);

		for (const file of item.files) {
			if (!full) {
				console.log(
					`  ${item.name.padEnd(24)} ${green(`+${file.added}`)} ${red(`-${file.removed}`)}  ${dim(file.path)}${file.formatting ? dim("  (formatting only)") : ""}`,
				);
				continue;
			}

			for (const line of file.patch.split("\n"))
				console.log(
					line.startsWith("+")
						? green(line)
						: line.startsWith("-")
							? red(line)
							: line.startsWith("@@")
								? dim(line)
								: line,
				);
		}
	}

	if (!full)
		console.log(
			`\n${dim("labsui diff <name> shows the changes; add <name> --overwrite takes this version.")}`,
		);
}
