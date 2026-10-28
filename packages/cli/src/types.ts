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
