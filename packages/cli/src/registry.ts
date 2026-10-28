import { CliError } from "./log.ts";
import bundled from "./registry.json" with { type: "json" };
import type { IndexItem, RegistryItem, Source } from "./types.ts";

const trimSlash = (url: string) => url.replace(/\/+$/, "");

/** What each registry type is called in output and in `search --kind`. */
export const KINDS: Record<string, string> = {
	"registry:ui": "component",
	"registry:block": "block",
	"registry:hook": "hook",
	"registry:lib": "helper",
	"registry:component": "setup",
	"registry:file": "setup",
};

function distance(a: string, b: string) {
	let prev = Array.from({ length: b.length + 1 }, (_, i) => i);

	for (let i = 1; i <= a.length; i++) {
		const row = [i];

		for (let j = 1; j <= b.length; j++)
			row[j] = Math.min(
				(prev[j] ?? 0) + 1,
				(row[j - 1] ?? 0) + 1,
				(prev[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1),
			);
		prev = row;
	}

	return prev[b.length] ?? 0;
}

/** Names close to a mistyped one (`button` for `buton`), nearest first. */
export function closest(name: string, names: string[], max = 3) {
	const limit = Math.max(1, Math.floor(name.length / 4));

	return names
		.map((known) => ({
			n: known,
			d: known.includes(name) || name.includes(known) ? 1 : distance(name, known),
		}))
		.filter((candidate) => candidate.d <= limit)
		.sort((a, b) => a.d - b.d || a.n.localeCompare(b.n))
		.slice(0, max)
		.map((candidate) => candidate.n);
}

async function fetchJson<T>(url: string): Promise<T> {
	let res: Response;

	try {
		res = await fetch(url);
	} catch (err) {
		throw new CliError(`Could not reach ${url}: ${(err as Error).message}`);
	}

	if (res.status === 404) throw new CliError(`Not found: ${url}`);
	if (!res.ok) throw new CliError(`${url} answered ${res.status}`);

	return (await res.json()) as T;
}

export async function fetchIndex(source: Source): Promise<IndexItem[]> {
	if (!source) return bundled.index;

	return (await fetchJson<{ items: IndexItem[] }>(`${trimSlash(source)}/index.json`)).items;
}

async function fetchItem(source: Source, name: string): Promise<RegistryItem> {
	if (source) return fetchJson<RegistryItem>(`${trimSlash(source)}/${name}.json`);

	const item = (bundled.items as Record<string, RegistryItem>)[name];

	if (!item) throw new CliError(`Not found: ${name}`);

	return item;
}

/** The item name in a URL (`https://host/r/button.json`), a file name or a name. Anything else is refused. */
export function itemName(ref: string) {
	const name =
		ref
			.split("/")
			.pop()
			?.replace(/\.json$/, "") ?? "";

	if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) throw new CliError(`Invalid component name "${ref}"`);

	return name;
}

/** The items and everything they depend on, each once. */
export async function resolveItems(source: Source, names: string[]) {
	// Mark before fetching, siblings resolve in parallel and share deps.
	const seen = new Set<string>();
	const order: RegistryItem[] = [];

	const visit = async (name: string, from?: string) => {
		if (seen.has(name)) return;
		seen.add(name);

		let item: RegistryItem;

		try {
			item = await fetchItem(source, name);
		} catch (err) {
			if (!(err instanceof CliError && err.message.startsWith("Not found"))) throw err;
			if (from) throw new CliError(`${from} needs "${name}", which the registry does not have`);

			const near = closest(
				name,
				(await fetchIndex(source)).map((i) => i.name),
			);

			throw new CliError(
				`No component named "${name}".${near.length ? ` Did you mean ${near.join(", ")}?` : ""} Run labsui search <words>.`,
			);
		}

		await Promise.all(
			(item.registryDependencies ?? []).map((dependency) => visit(itemName(dependency), name)),
		);
		order.push(item);
	};

	for (const spec of names) await visit(itemName(spec));

	return order;
}

/** Every item in the registry, for checks that look at the whole install. */
export async function fetchAllItems(source: Source): Promise<RegistryItem[]> {
	if (!source) return Object.values(bundled.items as Record<string, RegistryItem>);

	const index = await fetchIndex(source);

	return Promise.all(index.map((i) => fetchItem(source, i.name)));
}
