/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { affectedPages } from "../scripts/affected";

const registry = [
	{ id: "button", file: "button.tsx" },
	{ id: "dialog", file: "dialog.tsx" },
	{ id: "forms", file: "input.tsx · textarea.tsx" },
	{ id: "pricing", file: "blocks/pricing.tsx" },
];
const graph = new Map([
	["components/ui/button.tsx", ["lib/utils.ts"]],
	["components/ui/dialog.tsx", ["components/ui/button.tsx", "lib/utils.ts"]],
	["components/ui/input.tsx", ["lib/utils.ts"]],
	["components/ui/textarea.tsx", ["components/ui/input.tsx"]],
	["components/blocks/pricing.tsx", ["components/ui/button.tsx"]],
	["components/ui/orphan.tsx", []],
	["lib/utils.ts", []],
]);
const run = (...changed: string[]) => affectedPages(changed, registry, graph);

describe("affectedPages", () => {
	test("a primitive reaches its own page and every page that imports it", () => {
		expect(run("src/components/ui/button.tsx")).toEqual(["button", "dialog", "pricing"]);
	});

	test("one entry can own several files", () => {
		expect(run("src/components/ui/input.tsx")).toEqual(["forms"]);
	});

	test("blocks map through their folder", () => {
		expect(run("src/components/blocks/pricing.tsx")).toEqual(["pricing"]);
	});

	test("shared lib follows the graph", () => {
		expect(run("src/lib/utils.ts")).toEqual(["button", "dialog", "forms", "pricing"]);
	});

	test("site, styles, config and the suite itself change everything", () => {
		for (const path of [
			"src/site/catalog.tsx",
			"src/styles/labsui.css",
			"src/app/layout.tsx",
			"package.json",
			"tests/e2e/pages.e2e.ts",
		])
			expect(run(path)).toBe("all");
	});

	test("a file no page renders plays safe", () => {
		expect(run("src/components/ui/orphan.tsx")).toBe("all");
		expect(run("src/components/ui/deleted.tsx")).toBe("all");
	});

	test("docs, unit tests and the CLI affect no page", () => {
		expect(run("README.md", "tests/list.test.ts", "packages/cli/src/index.ts")).toEqual([]);
	});
});
