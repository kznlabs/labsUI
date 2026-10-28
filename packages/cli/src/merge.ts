import { lines, matches } from "./commands/diff.ts";

export type Merged = { text: string; conflicts: number };

const same = (a: string[], b: string[]) =>
	a.length === b.length && a.every((line, i) => line === b[i]);

/**
 * Three-way merge by lines: `ours` and `theirs` both started from `base`. A change on one side
 * is taken as is; the same change on both sides once; different changes to the same lines are
 * kept side by side between conflict markers, ours first.
 */
export function merge3(
	base: string,
	ours: string,
	theirs: string,
	labels = { ours: "yours", theirs: "labsui" },
): Merged {
	const baseLines = lines(base);
	const ourLines = lines(ours);
	const theirLines = lines(theirs);
	const toA = matches(baseLines, ourLines);
	const toB = matches(baseLines, theirLines);
	const out: string[] = [];
	let conflicts = 0;
	let i = 0;
	let ourIndex = 0;
	let theirIndex = 0;

	while (true) {
		// Next base line both sides kept = end of the unstable stretch.
		let key = i;

		while (key < baseLines.length && ((toA[key] ?? -1) < 0 || (toB[key] ?? -1) < 0)) key++;

		const ourStop = key < baseLines.length ? (toA[key] ?? ourLines.length) : ourLines.length;
		const theirStop = key < baseLines.length ? (toB[key] ?? theirLines.length) : theirLines.length;
		const chunkO = baseLines.slice(i, key);
		const chunkA = ourLines.slice(ourIndex, ourStop);
		const chunkB = theirLines.slice(theirIndex, theirStop);

		if (same(chunkA, chunkO)) out.push(...chunkB);
		else if (same(chunkB, chunkO) || same(chunkA, chunkB)) out.push(...chunkA);
		else {
			conflicts++;
			out.push(
				`<<<<<<< ${labels.ours}`,
				...chunkA,
				"=======",
				...chunkB,
				`>>>>>>> ${labels.theirs}`,
			);
		}

		if (key >= baseLines.length) break;
		out.push(baseLines[key] ?? "");
		i = key + 1;
		ourIndex = ourStop + 1;
		theirIndex = theirStop + 1;
	}

	return { text: `${out.join("\n")}\n`, conflicts };
}

/** Lines a merge left for a person to resolve. */
export const hasConflictMarkers = (text: string) =>
	/^<{7} .+\n[\s\S]*?^={7}\n[\s\S]*?^>{7} /m.test(text);
