/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(import.meta.dir, "..", "public", "r");
const read = (file: string) => JSON.parse(readFileSync(join(OUT, file), "utf8"));

type Schema = {
	type?: string;
	enum?: unknown[];
	pattern?: string;
	required?: string[];
	properties?: Record<string, Schema>;
	additionalProperties?: boolean | Schema;
	items?: Schema;
};

/** JSON Schema keywords the registry schemas use; problems as "path: reason". */
function validate(schema: Schema, value: unknown, path = "$"): string[] {
	if (schema.enum && !schema.enum.includes(value)) return [`${path}: not one of ${schema.enum}`];

	const kind = Array.isArray(value) ? "array" : value === null ? "null" : typeof value;

	if (schema.type && schema.type !== kind) return [`${path}: ${kind}, expected ${schema.type}`];
	if (schema.pattern && !new RegExp(schema.pattern).test(String(value)))
		return [`${path}: "${value}" does not match ${schema.pattern}`];
	if (kind === "array" && schema.items)
		return (value as unknown[]).flatMap((value, i) =>
			validate(schema.items as Schema, value, `${path}[${i}]`),
		);
	if (kind !== "object") return [];

	const obj = value as Record<string, unknown>;
	const errors = (schema.required ?? [])
		.filter((key) => !(key in obj))
		.map((key) => `${path}: missing ${key}`);

	for (const [key, field] of Object.entries(obj)) {
		const sub = schema.properties?.[key];

		if (sub) errors.push(...validate(sub, field, `${path}.${key}`));
		else if (schema.additionalProperties === false) errors.push(`${path}: unexpected ${key}`);
		else if (typeof schema.additionalProperties === "object")
			errors.push(...validate(schema.additionalProperties, field, `${path}.${key}`));
	}

	return errors;
}

describe("registry", () => {
	const items = readdirSync(OUT).filter(
		(file) => file.endsWith(".json") && !file.includes("schema") && file !== "index.json",
	);

	test("every item matches registry-item.schema.json", () => {
		const schema = read("registry-item.schema.json");

		expect(items.length).toBeGreaterThan(50);
		expect(items.flatMap((item) => validate(schema, read(item), item))).toEqual([]);
	});

	test("the index matches registry.schema.json and lists every item", () => {
		const index = read("index.json");

		expect(validate(read("registry.schema.json"), index)).toEqual([]);
		expect(index.items.map((i: { name: string }) => `${i.name}.json`).sort()).toEqual(items.sort());
	});

	test("the validator catches a broken item", () => {
		const schema = read("registry-item.schema.json");
		const broken = { ...read("button.json"), type: "registry:widget", extra: 1 };

		expect(validate(schema, broken).length).toBe(2);
	});
});
