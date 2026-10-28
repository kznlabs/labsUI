/// <reference types="bun" />
import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installedItems } from "../packages/cli/src/commands/diff.ts";
import { doctor } from "../packages/cli/src/commands/doctor.ts";
import { update } from "../packages/cli/src/commands/update.ts";
import { hasConflictMarkers, merge3 } from "../packages/cli/src/merge.ts";
import { readConfig } from "../packages/cli/src/project.ts";
import bundled from "../packages/cli/src/registry.json" with { type: "json" };
import type { RegistryItem } from "../packages/cli/src/types.ts";
import { VERSION } from "../packages/cli/src/version.ts";

const text = (...parts: string[]) => `${parts.join("\n")}\n`;

describe("merge3", () => {
	const base = text("a", "b", "c", "d", "e");

	test("takes each side's change when they touch different lines", () => {
		const ours = text("a", "B", "c", "d", "e");
		const theirs = text("a", "b", "c", "d", "E");

		expect(merge3(base, ours, theirs)).toEqual({
			text: text("a", "B", "c", "d", "E"),
			conflicts: 0,
		});
	});

	test("the same change on both sides lands once", () => {
		const both = text("a", "b", "x", "d", "e");

		expect(merge3(base, both, both)).toEqual({ text: both, conflicts: 0 });
	});

	test("additions and removals merge", () => {
		const ours = text("a", "b", "c", "d", "e", "f");
		const theirs = text("b", "c", "d", "e");

		expect(merge3(base, ours, theirs).text).toBe(text("b", "c", "d", "e", "f"));
	});

	test("different changes to one line become a marked conflict", () => {
		const result = merge3(base, text("a", "b", "mine", "d", "e"), text("a", "b", "new", "d", "e"));

		expect(result.conflicts).toBe(1);
		expect(result.text).toBe(
			text("a", "b", "<<<<<<< yours", "mine", "=======", "new", ">>>>>>> labsui", "d", "e"),
		);
		expect(hasConflictMarkers(result.text)).toBe(true);
		expect(hasConflictMarkers(base)).toBe(false);
	});
});

describe("update", () => {
	const items = bundled.items as Record<string, RegistryItem>;
	const kbd = items.kbd as RegistryItem;
	const current = kbd.files[0]?.content as string;
	const lines = current.split("\n");
	// A pretend older release: one line of kbd.tsx differed.
	const at = lines.findIndex((line) => line.includes("export function Kbd"));
	const older = lines.map((line, i) => (i === at + 1 ? `${line} // 0.0.9` : line)).join("\n");
	const loadBase = async () => ({
		kbd: { ...kbd, files: [{ ...kbd.files[0], content: older }] } as RegistryItem,
	});
	const opts = { overwrite: false, dryRun: false, install: false, quiet: true };
	let dir = "";

	const project = (local: string, installed: Record<string, string>) => {
		dir = mkdtempSync(join(tmpdir(), "labsui-update-"));
		mkdirSync(join(dir, "src/components/ui"), { recursive: true });
		mkdirSync(join(dir, "src/lib"), { recursive: true });
		writeFileSync(join(dir, "package.json"), JSON.stringify({ dependencies: {} }));
		writeFileSync(
			join(dir, "tsconfig.json"),
			JSON.stringify({ compilerOptions: { paths: { "@/*": ["./src/*"] } } }),
		);

		const config = { alias: "@/", root: "src", installed };

		writeFileSync(join(dir, "labsui.json"), JSON.stringify(config));
		writeFileSync(join(dir, "src/components/ui/kbd.tsx"), local);
		writeFileSync(join(dir, "src/lib/utils.ts"), items.utils?.files[0]?.content as string);

		return config;
	};

	const kbdFile = () => readFileSync(join(dir, "src/components/ui/kbd.tsx"), "utf8");

	afterEach(() => rmSync(dir, { recursive: true, force: true }));

	test("replaces an unedited file and records the version", async () => {
		const config = project(older, { kbd: "0.0.9" });
		const res = await update(dir, config, ["kbd"], opts, loadBase);

		expect(res.items[0]?.status).toBe("replaced");
		expect(kbdFile()).toBe(current);
		expect(readConfig(dir)?.installed?.kbd).toBe(VERSION);
	});

	test("keeps your edit and takes the new lines", async () => {
		const edited = `// my note\n${older}`;
		const config = project(edited, { kbd: "0.0.9" });
		const res = await update(dir, config, ["kbd"], opts, loadBase);

		expect(res.items[0]).toMatchObject({ name: "kbd", status: "merged", conflicts: 0 });
		expect(kbdFile().replace(/\n$/, "")).toBe(`// my note\n${current}`.replace(/\n$/, ""));
	});

	test("marks a clash, and doctor reports it", async () => {
		const clash = older.replace("// 0.0.9", "// mine");
		const config = project(clash, { kbd: "0.0.9" });
		const res = await update(dir, config, ["kbd"], opts, loadBase);

		expect(res.items[0]).toMatchObject({ status: "conflicts", conflicts: 1 });
		expect(hasConflictMarkers(kbdFile())).toBe(true);

		const checks = (await doctor(dir)).checks;

		expect(checks.find((check) => check.id === "merge")?.status).toBe("fail");
	});

	test("without the old version an edited file is kept", async () => {
		const edited = `// my note\n${current}`;
		const none = async () => undefined;
		const config = project(edited, { kbd: "0.0.9" });
		const res = await update(dir, config, ["kbd"], opts, none);

		expect(res.items[0]).toMatchObject({ status: "kept" });
		expect(kbdFile()).toBe(edited);
	});
});

describe("installedItems", () => {
	test("refuses registry paths outside the alias folder", async () => {
		const dir = mkdtempSync(join(tmpdir(), "labsui-escape-"));
		const evil: RegistryItem = {
			name: "evil",
			type: "registry:ui",
			files: [{ path: "ui/evil.tsx", target: "../evil.tsx", type: "registry:ui", content: "" }],
		} as RegistryItem;
		const server = Bun.serve({
			port: 0,
			fetch: (req) =>
				Response.json(
					new URL(req.url).pathname.endsWith("index.json") ? { items: [{ name: "evil" }] } : evil,
				),
		});

		try {
			const config = { alias: "@/", root: "src", registry: `http://localhost:${server.port}` };

			await expect(installedItems(config as never, join(dir, "src"))).rejects.toThrow(
				/Refusing to write outside/,
			);
		} finally {
			server.stop(true);
			rmSync(dir, { recursive: true, force: true });
		}
	});
});
