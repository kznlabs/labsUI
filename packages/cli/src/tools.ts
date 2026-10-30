const names = {
	type: "array",
	items: { type: "string", pattern: "^[a-z0-9][a-z0-9-]*$" },
	minItems: 1,
	maxItems: 20,
	description: "Item names as search lists them, e.g. button or date-picker.",
};

const installed = {
	...names,
	minItems: 0,
	description: "Installed item names, e.g. button. Empty: all installed items.",
};

const dryRun = {
	type: "boolean",
	default: false,
	description: "Report what would change, write nothing.",
};

const readOnly = { readOnlyHint: true, openWorldHint: false };

const writes = {
	readOnlyHint: false,
	destructiveHint: false,
	idempotentHint: true,
	openWorldHint: true,
};

export const TOOLS = [
	{
		name: "search",
		title: "Search labsUI",
		description:
			"Find labsUI components, blocks, hooks and helpers by name, export (useModal) or intent (date range, toast promise). All words must match, best match first; no query lists everything. Returns one line per hit: name, kind and summary. Start here when you don't know an item's name, then call view on the hits.",
		inputSchema: {
			type: "object",
			properties: {
				query: { type: "string", description: "Words to match. Empty lists everything." },
				kind: {
					type: "string",
					enum: ["component", "block", "hook", "helper", "setup"],
					description:
						"Only this kind: component (primitive), block (composed section), hook, helper or setup.",
				},
				limit: {
					type: "integer",
					minimum: 1,
					maximum: 200,
					default: 12,
					description: "Most results to return.",
				},
			},
		},
		annotations: readOnly,
	},
	{
		name: "view",
		title: "View labsUI items",
		description:
			"Read the docs of labsUI items by name: exact props and types, a usage line, full examples, and the items and npm packages each brings along. Call it before writing code with a component instead of guessing props; find names with search, install with add.",
		inputSchema: {
			type: "object",
			properties: {
				names: { ...names, maxItems: 10 },
				source: { type: "boolean", default: false, description: "Include the source files." },
			},
			required: ["names"],
		},
		annotations: readOnly,
	},
	{
		name: "add",
		title: "Add labsUI items",
		description:
			"Install labsUI items into the project: copies each item and everything it imports, then installs their npm packages. Existing files are kept, never overwritten. Returns the files written, the packages installed and anything to mount once in the root layout. Needs init first; dryRun previews. To bring installed items to a newer version, use update instead.",
		inputSchema: {
			type: "object",
			properties: { names, dryRun },
			required: ["names"],
		},
		annotations: writes,
	},
	{
		name: "init",
		title: "Set up labsUI",
		description:
			"Set up labsUI in a project, once, before add: writes the styles, theme, utils and motion provider, imports labsui.css into the Tailwind stylesheet and records settings in labsui.json. Returns warnings, the files written and the root layout code to add. Needs React 19 and Tailwind v4; run doctor first if unsure. Safe to repeat: existing files are kept. dryRun previews.",
		inputSchema: {
			type: "object",
			properties: { dryRun },
		},
		annotations: writes,
	},
	{
		name: "diff",
		title: "Diff installed labsUI items",
		description:
			"Compare installed labsUI items with this labsUI version. Returns a unified patch per changed file, from the registry file to the project file (+ lines exist only in the project), with formatting: true when only blank lines or indentation differ; matching items are left out, and when nothing differs it says so. Use it to see local edits before update. Needs init.",
		inputSchema: {
			type: "object",
			properties: { names: installed },
		},
		annotations: readOnly,
	},
	{
		name: "update",
		title: "Update labsUI items",
		description:
			"Bring installed labsUI items to this labsUI version. Unedited files are replaced; edited ones are merged three ways from the version that installed them, with conflict markers where both sides changed the same lines. Returns each changed item as replaced, merged, conflicts (with the files to resolve) or kept with the reason. Run diff first to see local edits; dryRun previews. Only for installed items: new ones go through add.",
		inputSchema: {
			type: "object",
			properties: { names: installed, dryRun },
		},
		annotations: { ...writes, destructiveHint: true },
	},
	{
		name: "doctor",
		title: "Check the labsUI setup",
		description:
			"Check the labsUI setup: React 19, Tailwind v4, the path alias, the stylesheet import, MotionProvider and themeScript wiring, mounted Toaster/Confirmer, missing npm packages or files, and local edits. Returns pass, warn or fail per check, each problem with its fix. Run it after init or add, or when components look unstyled; for line-level changes use diff.",
		inputSchema: { type: "object", properties: {} },
		annotations: readOnly,
	},
];
