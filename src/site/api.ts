import api from "@/site/api.generated.json";

type ApiProp = {
	name: string;
	type: string;
	required: boolean;
	default?: string;
	description?: string;
};
type ApiEntry =
	| { kind: "component"; name: string; props: ApiProp[]; extends?: string; description?: string }
	| { kind: "function"; name: string; signature: string; description?: string };
type FileApi = { entries: ApiEntry[]; types: Record<string, string> };

const pascal = (stem: string) =>
	stem.replace(/(^|-)(\w)/g, (_, __, letter: string) => letter.toUpperCase());

/**
 * Generated API (scripts/build-api.ts) for a registry entry's files (`button.tsx`,
 * `blocks/pricing.tsx`): each file's namesake first, functions last, plus the local types used.
 */
export function apiFor(files: string[]) {
	const docs = api as Record<string, FileApi>;
	const found = files.flatMap((file) => {
		const stem = file.replace(/^blocks\//, "").replace(/\.tsx?$/, "");
		const data = docs[file.startsWith("blocks/") ? `blocks/${stem}` : `ui/${stem}`];

		return data ? [{ stem, data }] : [];
	});
	const entries = found.flatMap(({ stem, data }) =>
		[...data.entries].sort(
			(a, b) =>
				Number(b.name === pascal(stem)) - Number(a.name === pascal(stem)) ||
				Number(a.kind === "function") - Number(b.kind === "function"),
		),
	);
	const types: [string, string][] = found.flatMap(({ data }) => Object.entries(data.types));

	return { entries, types };
}
