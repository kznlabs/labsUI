import { add } from "./commands/add.ts";
import { diff } from "./commands/diff.ts";
import { doctor } from "./commands/doctor.ts";
import { init } from "./commands/init.ts";
import { searchIndex, suggest } from "./commands/search.ts";
import { update } from "./commands/update.ts";
import { describe, viewMarkdown } from "./commands/view.ts";
import { CliError } from "./log.ts";
import { readConfig } from "./project.ts";
import { fetchIndex } from "./registry.ts";
import { rules } from "./rules.ts";
import { TOOLS } from "./tools.ts";

/** Newest first; an unknown client version gets the newest. */
const PROTOCOLS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];

type Json = Record<string, unknown>;
type Request = { jsonrpc: "2.0"; id?: string | number | null; method: string; params?: Json };
type Context = { cwd: string; registry?: string; version: string };

const text = (text: string, structured?: unknown) => ({
	content: [{ type: "text", text: text }],
	...(structured !== undefined && { structuredContent: structured }),
});

async function callTool(ctx: Context, name: string, args: Json) {
	const config = readConfig(ctx.cwd);
	const source = ctx.registry ?? config?.registry;
	const alias = config?.alias ?? "@/";
	const list = (value: unknown) => (Array.isArray(value) ? value.map(String) : []);
	const opts = { overwrite: false, dryRun: args.dryRun === true, install: true, quiet: true };

	switch (name) {
		case "search": {
			const index = await fetchIndex(source);
			const query = String(args.query ?? "");
			const kind = typeof args.kind === "string" ? args.kind : undefined;
			const limit = Number(args.limit ?? 12);
			const hits = searchIndex(index, query, kind).slice(0, limit);
			const body = hits.length
				? hits
						.map((hit) => `- \`${hit.name}\` (${hit.kind}): ${hit.description ?? hit.title ?? ""}`)
						.join("\n")
				: `No match.${suggest(index, query)
						.map((suggestion, i) => `${i ? "," : " Did you mean"} ${suggestion}`)
						.join("")}`;

			return text(body, { hits });
		}

		case "view": {
			const views = await Promise.all(
				list(args.names).map((name) =>
					describe(source, name, { withSource: args.source === true, alias }),
				),
			);

			return text(views.map(viewMarkdown).join("\n\n"), { items: views });
		}

		case "add": {
			if (!config) throw new CliError("labsUI is not set up here. Call the init tool first.");

			const added = await add(
				ctx.cwd,
				{ ...config, ...(ctx.registry && { registry: ctx.registry }) },
				list(args.names),
				opts,
			);
			const lines = [
				`${added.dryRun ? "Would write" : "Wrote"} ${added.written.length} file(s)${added.written.length ? `: ${added.written.join(", ")}` : ""}.`,
				...(added.kept.length ? [`Kept existing: ${added.kept.join(", ")}.`] : []),
				...(added.installCommand
					? [`Install: ${added.installCommand}`]
					: added.packages.length
						? [`Installed ${added.packages.join(", ")}.`]
						: []),
				...added.mounts.map(
					(mount) =>
						`Mount once in the root layout, inside <MotionProvider>: ${mount.tag} from "${mount.from}".`,
				),
			];

			return text(lines.join("\n"), added);
		}

		case "init": {
			const initialized = await init(ctx.cwd, ctx.registry, opts);
			const lines = [
				...initialized.warnings.map((warning) => `Warning: ${warning}`),
				`${initialized.dryRun ? "Would write" : "Wrote"} ${initialized.add.written.length} file(s); stylesheet: ${initialized.css ?? "none found"}.`,
				...(initialized.add.installCommand ? [`Install: ${initialized.add.installCommand}`] : []),
				"Root layout needs:",
				"```tsx",
				initialized.layout,
				"```",
			];

			return text(lines.join("\n"), initialized);
		}

		case "diff": {
			if (!config) throw new CliError("labsUI is not set up here. Call the init tool first.");

			const items = await diff(
				ctx.cwd,
				{ ...config, ...(ctx.registry && { registry: ctx.registry }) },
				list(args.names),
				ctx.version,
			);
			const body = items.length
				? items
						.flatMap((i) => i.files.map((file) => `\`\`\`diff\n${file.patch}\n\`\`\``))
						.join("\n\n")
				: "Installed items match this labsui version.";

			return text(body, { items });
		}

		case "update": {
			if (!config) throw new CliError("labsUI is not set up here. Call the init tool first.");

			const updated = await update(
				ctx.cwd,
				{ ...config, ...(ctx.registry && { registry: ctx.registry }) },
				list(args.names),
				opts,
			);
			const rows = updated.items.filter((i) => i.status !== "current");
			const body = rows.length
				? rows
						.map((i) =>
							i.status === "kept"
								? `- ${i.name}: kept, ${i.reason}`
								: `- ${i.name}: ${i.status}${i.conflicts ? ` (${i.conflicts} conflicts to resolve in ${i.files.join(", ")})` : ""}`,
						)
						.join("\n")
				: "Everything is on this version.";

			return text(body, updated);
		}

		case "doctor": {
			const result = await doctor(ctx.cwd, ctx.registry);
			const body = result.checks
				.map(
					(check) => `- ${check.status}: ${check.message}${check.fix ? ` Fix: ${check.fix}` : ""}`,
				)
				.join("\n");

			return text(body, result);
		}
	}

	return undefined;
}

/** One JSON-RPC message in, its response out (undefined for notifications). */
export async function handle(ctx: Context, msg: Request): Promise<Json | undefined> {
	const reply = (result: unknown) => ({ jsonrpc: "2.0", id: msg.id, result });
	const fail = (code: number, message: string) => ({
		jsonrpc: "2.0",
		id: msg.id ?? null,
		error: { code, message },
	});

	if (msg?.jsonrpc !== "2.0" || typeof msg.method !== "string")
		return fail(-32600, "Invalid request");

	const isNotification = msg.id === undefined;

	switch (msg.method) {
		case "initialize": {
			const asked = String(msg.params?.protocolVersion ?? "");
			const config = readConfig(ctx.cwd);

			return reply({
				protocolVersion: PROTOCOLS.includes(asked) ? asked : PROTOCOLS[0],
				capabilities: { tools: { listChanged: false } },
				serverInfo: { name: "labsui", title: "labsUI", version: ctx.version },
				instructions: rules(config?.alias),
			});
		}

		case "ping":
			return reply({});
		case "tools/list":
			return reply({ tools: TOOLS });

		case "tools/call": {
			const name = String(msg.params?.name ?? "");
			const args = (msg.params?.arguments ?? {}) as Json;

			try {
				const result = await callTool(ctx, name, args);

				return result ? reply(result) : fail(-32602, `Unknown tool: ${name}`);
			} catch (err) {
				if (!(err instanceof CliError)) throw err;

				return reply({ ...text(err.message), isError: true });
			}
		}
	}

	if (isNotification) return;

	return fail(-32601, `Method not found: ${msg.method}`);
}

/** Serves MCP over stdio: one JSON message per line. stdout carries only protocol messages. */
export function serve(ctx: Context) {
	console.log = console.error;

	const write = (message: Json | undefined) =>
		message && process.stdout.write(`${JSON.stringify(message)}\n`);
	let queue = Promise.resolve();
	let buffer = "";

	const onLine = (line: string) => {
		let msg: Request | Request[];

		try {
			msg = JSON.parse(line);
		} catch {
			return write({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
		}

		// One call at a time, file writes and installs can't interleave.
		queue = queue.then(async () => {
			try {
				if (Array.isArray(msg)) {
					const out = (await Promise.all(msg.map((message) => handle(ctx, message)))).filter(
						Boolean,
					);

					if (out.length) process.stdout.write(`${JSON.stringify(out)}\n`);
				} else write(await handle(ctx, msg));
			} catch (err) {
				const id = Array.isArray(msg) ? null : (msg.id ?? null);

				write({ jsonrpc: "2.0", id, error: { code: -32603, message: (err as Error).message } });
			}
		});
	};

	process.stdin.setEncoding("utf8");
	process.stdin.on("data", (chunk: string) => {
		buffer += chunk;

		let newline = buffer.indexOf("\n");

		while (newline >= 0) {
			const line = buffer.slice(0, newline).trim();

			buffer = buffer.slice(newline + 1);
			if (line) onLine(line);
			newline = buffer.indexOf("\n");
		}
	});
}
