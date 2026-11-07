/** A hosted registry base URL, or undefined for the one bundled with this version. */
export type Source = string | undefined;
export type Config = {
	registry?: string;
	alias: string;
	root: string;
	css?: string;
	/** The labsui version each item was last written by: the base `update` merges from. */
	installed?: Record<string, string>;
};
/** `quiet`: nothing on stdout (`--json`, MCP); package-manager output goes to stderr. */
export type Opts = { overwrite: boolean; dryRun: boolean; install: boolean; quiet?: boolean };

type RegistryFile = { path: string; type: string; target?: string; content: string };
type ApiProp = {
	name: string;
	type: string;
	required: boolean;
	default?: string;
	description?: string;
};
export type ApiEntry =
	| { kind: "component"; name: string; props: ApiProp[]; extends?: string; description?: string }
	| { kind: "function"; name: string; signature: string; description?: string };
export type RegistryItem = {
	name: string;
	type: string;
	title?: string;
	description?: string;
	/** Docs page on the site. */
	docs?: string;
	/** Mounted once in the root layout, e.g. `<Toaster />`. */
	mount?: string;
	/** One-line usage. */
	usage?: string;
	/** Whole files using the item, as the docs show them. */
	examples?: { name: string; code: string }[];
	/** Exported components (props) and functions (signatures), from the source types. */
	api?: { entries: ApiEntry[]; types: Record<string, string> };
	dependencies?: string[];
	registryDependencies?: string[];
	files: RegistryFile[];
};
export type IndexItem = {
	name: string;
	type: string;
	title?: string;
	description?: string;
	/** Exported values (components, hooks, functions). */
	exports?: string[];
	/** Words from the API docs and prop names. */
	keywords?: string[];
};
/** A prompt checked on a fresh app: what to ask for, the items it uses and what to know. */
export type Recipe = {
	id: string;
	title: string;
	description: string;
	/** The prompt, as a user would paste it into a coding agent. */
	prompt: string;
	/** Registry items the checked run used. */
	items: string[];
	/** Patterns the result needs that no single item's docs cover. */
	notes: { title: string; body: string; code?: string }[];
	/** The recipe's page on the site. */
	docs: string;
	/** A live reference build of the recipe on the site, when there is one. */
	demo?: string;
	/** The run that passed: labsui version, model and date. */
	checked: { version: string; model: string; date: string };
};
