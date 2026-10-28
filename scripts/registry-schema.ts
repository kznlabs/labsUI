/** JSON Schemas for the published registry: `/r/registry-item.schema.json` and `/r/registry.schema.json`. */

const name = { type: "string", pattern: "^[a-z0-9][a-z0-9-]*$" };
const kind = {
	enum: [
		"registry:ui",
		"registry:block",
		"registry:lib",
		"registry:hook",
		"registry:component",
		"registry:file",
	],
};
const text = { type: "string" };
const list = (items: object) => ({ type: "array", items });

const prop = {
	type: "object",
	required: ["name", "type", "required"],
	properties: {
		name: text,
		type: text,
		required: { type: "boolean" },
		default: text,
		description: text,
	},
	additionalProperties: false,
};
const entry = {
	type: "object",
	required: ["kind", "name"],
	properties: {
		kind: { enum: ["component", "function"] },
		name: text,
		description: text,
		props: list(prop),
		extends: text,
		signature: text,
	},
	additionalProperties: false,
};

export const itemSchema = (id: string) => ({
	$schema: "https://json-schema.org/draft/2020-12/schema",
	$id: id,
	title: "labsUI registry item",
	description: "One installable item: its files, what it imports and how to use it.",
	type: "object",
	required: ["name", "type", "dependencies", "registryDependencies", "files"],
	properties: {
		$schema: text,
		name,
		type: kind,
		title: text,
		description: text,
		docs: { type: "string", format: "uri", description: "Docs page." },
		mount: { ...text, description: "Rendered once in the root layout, e.g. <Toaster />." },
		usage: { ...text, description: "One-line usage." },
		examples: list({
			type: "object",
			required: ["name", "code"],
			properties: { name: text, code: text },
			additionalProperties: false,
		}),
		api: {
			type: "object",
			required: ["entries", "types"],
			properties: {
				entries: list(entry),
				types: { type: "object", additionalProperties: text },
			},
			additionalProperties: false,
		},
		dependencies: list({
			type: "string",
			description: "npm package spec, e.g. motion@14.6.0.",
			pattern: "^(@[a-z0-9][\\w.-]*/)?[a-z0-9][\\w.-]*(@[\\w.^~*+-]+)?$",
		}),
		registryDependencies: list({ type: "string", format: "uri" }),
		files: list({
			type: "object",
			required: ["path", "type", "content"],
			properties: { path: text, type: kind, target: text, content: text },
			additionalProperties: false,
		}),
	},
	additionalProperties: false,
});

export const indexSchema = (id: string) => ({
	$schema: "https://json-schema.org/draft/2020-12/schema",
	$id: id,
	title: "labsUI registry index",
	description: "Every item in the registry, without file contents.",
	type: "object",
	required: ["name", "homepage", "items"],
	properties: {
		$schema: text,
		name: text,
		homepage: { type: "string", format: "uri" },
		items: list({
			type: "object",
			required: ["name", "type", "exports", "keywords", "registryDependencies"],
			properties: {
				name,
				type: kind,
				title: text,
				description: text,
				exports: list(text),
				keywords: list(text),
				registryDependencies: list(name),
			},
			additionalProperties: false,
		}),
	},
	additionalProperties: false,
});
