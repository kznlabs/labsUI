import { bold, dim } from "../log.ts";
import type { IndexItem } from "../types.ts";

const GROUPS: [label: string, type: string][] = [
	["Components", "registry:ui"],
	["Blocks", "registry:block"],
	["Hooks", "registry:hook"],
	["Helpers", "registry:lib"],
];

const firstSentence = (text = "") => text.split(/(?<=\.)\s/)[0] ?? "";

export function list(items: IndexItem[]) {
	for (const [label, type] of GROUPS) {
		const rows = items.filter((i) => i.type === type);

		if (!rows.length) continue;
		console.log(`\n${bold(label)} ${dim(`(${rows.length})`)}`);

		const width = Math.max(...rows.map((row) => row.name.length));

		for (const item of rows) {
			const desc = /hook|lib/.test(type)
				? (item.exports ?? []).join(", ")
				: firstSentence(item.description);
			const max = (process.stdout.columns || 100) - width - 6;

			console.log(
				`  ${item.name.padEnd(width)}  ${dim(desc.length > max ? `${desc.slice(0, max - 1)}…` : desc)}`,
			);
		}
	}

	console.log(`\n${dim("Details: labsui view <name>. Add one: labsui add <name>.")}`);
}
