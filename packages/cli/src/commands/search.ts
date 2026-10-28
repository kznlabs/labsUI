import { bold, dim } from "../log.ts";
import { closest, KINDS } from "../registry.ts";
import type { IndexItem } from "../types.ts";

export type Hit = {
	name: string;
	kind: string;
	title?: string;
	description?: string;
	exports?: string[];
	score: number;
};

/** Score for one lowercase term, 0 = no match. */
function termScore(item: IndexItem, term: string) {
	const name = item.name;
	const exports = (item.exports ?? []).map((exported) => exported.toLowerCase());
	const words = `${item.title ?? ""} ${item.description ?? ""}`.toLowerCase();
	let score = 0;

	if (name === term) score += 100;
	else if (name.startsWith(term)) score += 40;
	else if (name.includes(term)) score += 25;
	if (exports.includes(term)) score += 60;
	else if (exports.some((exported) => exported.includes(term))) score += 15;
	if (item.title?.toLowerCase().includes(term)) score += 20;
	if (new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(words)) score += 8;
	else if (words.includes(term)) score += 3;
	else if (item.keywords?.includes(term)) score += 4;
	else if (term.length > 3 && item.keywords?.some((key) => key.startsWith(term))) score += 2;

	return score;
}

/**
 * Items matching every term (`date range`, `useModal`, `toast promise`), best first. Names and
 * exports outweigh the description, which outweighs API docs and prop names, so `select` ranks
 * Select above components that mention selecting.
 */
export function searchIndex(items: IndexItem[], query: string, kind?: string): Hit[] {
	const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
	const hits: Hit[] = [];

	for (const item of items) {
		const itemKind = KINDS[item.type] ?? item.type;

		if (kind && itemKind !== kind) continue;

		let score = 0;

		for (const term of terms) {
			const points = termScore(item, term);

			if (!points) {
				score = 0;
				break;
			}

			score += points;
		}

		if (score || !terms.length)
			hits.push({
				name: item.name,
				kind: itemKind,
				...(item.title && { title: item.title }),
				...(item.description && { description: item.description }),
				...(item.exports?.length && { exports: item.exports }),
				score,
			});
	}

	return hits.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

/** Names close to a query that matched nothing, for "did you mean". */
export const suggest = (items: IndexItem[], query: string) =>
	closest(
		query.toLowerCase().replace(/\s+/g, "-"),
		items.map((i) => i.name),
	);

export function printSearch(hits: Hit[], query: string, suggestions: string[]) {
	if (!hits.length) {
		const hint = suggestions.length ? ` Did you mean ${suggestions.join(", ")}?` : "";

		console.log(`No match for "${query}".${hint} ${dim("labsui list shows everything.")}`);

		return;
	}

	const width = Math.max(...hits.map((hit) => hit.name.length));
	const kindWidth = Math.max(...hits.map((hit) => hit.kind.length));
	const max = (process.stdout.columns || 100) - width - kindWidth - 8;

	for (const match of hits) {
		const desc = match.description?.split(/(?<=\.)\s/)[0] ?? match.exports?.join(", ") ?? "";

		console.log(
			`  ${bold(match.name.padEnd(width))}  ${dim(match.kind.padEnd(kindWidth))}  ${desc.length > max ? `${desc.slice(0, max - 1)}…` : desc}`,
		);
	}

	console.log(`\n${dim(`labsui view ${hits[0]?.name} shows props and an example.`)}`);
}
