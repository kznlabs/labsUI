/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { projectBase, rewriteAlias, safeTarget } from "../packages/cli/src/commands/add.ts";
import { unifiedDiff } from "../packages/cli/src/commands/diff.ts";
import { doctor } from "../packages/cli/src/commands/doctor.ts";
import { searchIndex } from "../packages/cli/src/commands/search.ts";
import { describe as view, viewMarkdown } from "../packages/cli/src/commands/view.ts";
import { handle } from "../packages/cli/src/mcp.ts";
import { findCss } from "../packages/cli/src/project.ts";
import { closest, fetchIndex } from "../packages/cli/src/registry.ts";

const index = await fetchIndex(undefined);
const top = (query: string, kind?: string) => searchIndex(index, query, kind)[0]?.name;

describe("search", () => {
	test("an exact name wins over prose that mentions it", () => {
		expect(top("select")).toBe("select");
		expect(top("button")).toBe("button");
	});

	test("finds an item by an export it ships", () => {
		expect(top("useModal")).toBe("dialog");
		expect(top("cn")).toBe("utils");
	});

	test("every word must match", () => {
		expect(top("date range")).toBe("date-picker");
		expect(searchIndex(index, "date zebra")).toEqual([]);
	});

	test("filters by kind; no query lists the kind", () => {
		const hooks = searchIndex(index, "", "hook");

		expect(hooks.length).toBeGreaterThan(3);
		expect(hooks.every((hook) => hook.kind === "hook")).toBe(true);
	});
});

describe("closest", () => {
	const names = index.map((i) => i.name);

	test("suggests near names and nothing for far ones", () => {
		expect(closest("buton", names)[0]).toBe("button");
		expect(closest("tost", names)[0]).toBe("toast");
		expect(closest("nope", names)).toEqual([]);
	});
});

describe("add helpers", () => {
	test("rewrites the alias in imports only", () => {
		expect(rewriteAlias('import { cn } from "@/lib/utils";', "~/")).toBe(
			'import { cn } from "~/lib/utils";',
		);
		expect(rewriteAlias('"@/x"', "@/")).toBe('"@/x"');
	});

	test("refuses paths that leave the project", () => {
		const base = join(tmpdir(), "labsui-base");

		expect(safeTarget(base, "components/ui/a.tsx")).toBe(join(base, "components/ui/a.tsx"));
		expect(() => safeTarget(base, "../outside.tsx")).toThrow();
		expect(() => safeTarget(base, "/etc/passwd")).toThrow();
	});

	test("refuses a symlinked folder that leads out of the project", () => {
		const dir = mkdtempSync(join(tmpdir(), "labsui-link-"));
		const outside = mkdtempSync(join(tmpdir(), "labsui-outside-"));

		try {
			mkdirSync(join(dir, "src"));
			// A junction on Windows: no admin rights needed, followed like a symlink.
			symlinkSync(outside, join(dir, "src/components"), "junction");
			expect(() => safeTarget(join(dir, "src"), "components/ui/a.tsx")).toThrow(/outside/);
			expect(safeTarget(join(dir, "src"), "lib/utils.ts")).toBe(join(dir, "src/lib/utils.ts"));
			symlinkSync(outside, join(dir, "linked-root"), "junction");
			expect(() => projectBase(dir, { root: "linked-root" } as never)).toThrow(
				/inside the project/,
			);
		} finally {
			rmSync(dir, { recursive: true, force: true });
			rmSync(outside, { recursive: true, force: true });
		}
	});
});

describe("findCss", () => {
	test("skips a stylesheet that only mentions Tailwind in a comment", () => {
		const dir = mkdtempSync(join(tmpdir(), "labsui-css-"));

		try {
			mkdirSync(join(dir, "src/styles"), { recursive: true });
			mkdirSync(join(dir, "src/app"), { recursive: true });
			writeFileSync(
				join(dir, "src/styles/labsui.css"),
				'/* Import once, right after Tailwind: @import "tailwindcss"; */\n',
			);
			writeFileSync(join(dir, "src/app/globals.css"), ":root { --background: #fff; }\n");

			expect(findCss(dir, "src")).toBeUndefined();

			writeFileSync(join(dir, "src/app/globals.css"), '@import "tailwindcss";\n');

			expect(findCss(dir, "src")).toBe(join(dir, "src/app/globals.css"));
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});
});

describe("diff", () => {
	test("unified hunks with context and line numbers", () => {
		const original = "1\n2\n3\n4\n5\n6\n7\n8\n9\n";
		const edited = original.replace("5", "five");

		expect(unifiedDiff(original, edited, "a", "b")).toBe(
			"--- a\n+++ b\n@@ -2,7 +2,7 @@\n 2\n 3\n 4\n-5\n+five\n 6\n 7\n 8",
		);
	});

	test("line endings alone are not a change", () => {
		expect(unifiedDiff("a\nb\n", "a\r\nb\r\n", "a", "b")).toBe("");
	});
});

describe("view", () => {
	test("brings dependencies, packages and the mount", async () => {
		const value = await view(undefined, "toast", { alias: "~/" });

		expect(value.brings).toContain("utils");
		expect(value.packages.some((spec) => spec.startsWith("motion@"))).toBe(true);
		expect(value.mount).toBe("<Toaster />");
		expect(value.examples[0]?.code).toContain('"~/components/ui/toast"');
		expect(viewMarkdown(value)).toContain("### API");
	});
});

describe("doctor", () => {
	test("reports each missing piece with a fix", async () => {
		const dir = mkdtempSync(join(tmpdir(), "labsui-doctor-"));

		try {
			mkdirSync(join(dir, "src/app"), { recursive: true });
			writeFileSync(
				join(dir, "package.json"),
				JSON.stringify({ dependencies: { react: "^19.2.0", tailwindcss: "^3.4.0" } }),
			);
			writeFileSync(
				join(dir, "tsconfig.json"),
				'{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }',
			);

			const result = await doctor(dir);
			const status = (id: string) => result.checks.find((check) => check.id === id)?.status;

			expect(result.ok).toBe(false);
			expect(status("react")).toBe("pass");
			expect(status("tailwind")).toBe("fail");
			expect(status("alias")).toBe("pass");
			expect(status("config")).toBe("warn");
			expect(status("styles")).toBe("fail");
			expect(
				result.checks.filter((check) => check.status !== "pass").every((check) => check.fix),
			).toBe(true);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	test("keeps invalid registry dependencies out of the install command", async () => {
		const dir = mkdtempSync(join(tmpdir(), "labsui-doctor-"));
		const item = {
			name: "evil",
			type: "registry:ui",
			dependencies: ["left-pad; rm -rf ~", "motion"],
			files: [{ path: "ui/evil.tsx", type: "registry:ui", content: "" }],
		};
		const server = Bun.serve({
			port: 0,
			fetch: (req) =>
				Response.json(
					new URL(req.url).pathname.endsWith("index.json") ? { items: [{ name: "evil" }] } : item,
				),
		});

		try {
			mkdirSync(join(dir, "src/ui"), { recursive: true });
			writeFileSync(join(dir, "src/ui/evil.tsx"), "");
			writeFileSync(
				join(dir, "tsconfig.json"),
				'{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }',
			);
			writeFileSync(join(dir, "package.json"), JSON.stringify({ dependencies: {} }));
			writeFileSync(
				join(dir, "labsui.json"),
				JSON.stringify({ alias: "@/", root: "src", registry: `http://localhost:${server.port}` }),
			);

			const { checks } = await doctor(dir);
			const check = (id: string) => checks.find((check) => check.id === id);

			expect(check("package-specs")?.status).toBe("fail");
			expect(check("packages")?.fix).toContain("motion");
			expect(check("packages")?.fix).not.toContain("rm -rf");
		} finally {
			server.stop(true);
			rmSync(dir, { recursive: true, force: true });
		}
	});
});

describe("mcp", () => {
	const ctx = { cwd: tmpdir(), version: "0.0.0" };
	const call = (method: string, params?: Record<string, unknown>, id: number | null = 1) =>
		handle(ctx, {
			jsonrpc: "2.0",
			...(id !== null && { id }),
			method,
			...(params && { params }),
		});

	test("negotiates the protocol version and sends the rules", async () => {
		const known = (await call("initialize", { protocolVersion: "2025-06-18" })) as {
			result: { protocolVersion: string; instructions: string };
		};

		expect(known.result.protocolVersion).toBe("2025-06-18");
		expect(known.result.instructions).toContain("labsui view");

		const unknown = (await call("initialize", { protocolVersion: "1999-01-01" })) as {
			result: { protocolVersion: string };
		};

		expect(unknown.result.protocolVersion).not.toBe("1999-01-01");
	});

	test("answers requests, stays silent on notifications", async () => {
		expect(await call("notifications/initialized", undefined, null)).toBeUndefined();
		expect(await call("ping")).toEqual({ jsonrpc: "2.0", id: 1, result: {} });
		expect(await call("nope")).toMatchObject({ error: { code: -32601 } });
	});

	test("every tool and parameter is described, tools point to each other", async () => {
		const listed = (await call("tools/list")) as {
			result: {
				tools: {
					name: string;
					description: string;
					inputSchema: { properties: Record<string, { description?: string }> };
				}[];
			};
		};

		const tools = listed.result.tools.map((tool) => tool.name);

		for (const tool of listed.result.tools) {
			const others = tools.filter((name) => name !== tool.name);

			expect(tool.description, tool.name).toBeTruthy();
			expect(
				others.some((name) => new RegExp(`\\b${name}\\b`).test(tool.description)),
				`${tool.name} names no other tool`,
			).toBe(true);
			expect(tool.description, tool.name).not.toMatch(/\blabsui\b(?!\.)/);

			for (const [key, schema] of Object.entries(tool.inputSchema.properties))
				expect(schema.description, `${tool.name}.${key}`).toBeTruthy();
		}
	});

	test("tool errors come back as results the agent can read", async () => {
		const result = (await call("tools/call", {
			name: "view",
			arguments: { names: ["buton"] },
		})) as {
			result: { isError: boolean; content: { text: string }[] };
		};

		expect(result.result.isError).toBe(true);
		expect(result.result.content[0]?.text).toContain("button");
		expect(await call("tools/call", { name: "nope" })).toMatchObject({ error: { code: -32602 } });
	});
});
