#!/usr/bin/env node
/**
 * labsui: copy labsUI components into your project, where you own and edit them.
 *
 *   npx @kznlabs/labsui init             styles, theme, utils, motion provider; wires your CSS
 *   npx @kznlabs/labsui add button tabs  components plus everything they import
 *   npx @kznlabs/labsui search date      find by name, export or intent; `view` shows props
 *   npx @kznlabs/labsui doctor           check the setup
 *   npx @kznlabs/labsui mcp              the same, as tools for coding agents
 *
 * Files land at their registry path under your `@/*` alias root (src/ or the project root), so
 * `@/components/ui/button` imports keep working. The registry ships inside the package (built
 * by scripts/build-registry.ts), so it works offline and each version pins its components;
 * `--registry <url>` reads a hosted one instead. Zero dependencies: Node 22+ fetch and fs.
 */
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { add, printAdd } from "./commands/add.ts";
import { diff, printDiff } from "./commands/diff.ts";
import { doctor, printDoctor } from "./commands/doctor.ts";
import { init, printInit } from "./commands/init.ts";
import { list } from "./commands/list.ts";
import { printSearch, searchIndex, suggest } from "./commands/search.ts";
import { printUpdate, update } from "./commands/update.ts";
import { describe, printView } from "./commands/view.ts";
import { bold, CliError, dim, red } from "./log.ts";
import { serve } from "./mcp.ts";
import { loadConfig, readConfig } from "./project.ts";
import { fetchIndex } from "./registry.ts";
import { rules } from "./rules.ts";
import { VERSION } from "./version.ts";

const HELP = `${bold("labsui")} ${dim(`v${VERSION}`)}: add labsUI components to your project

${bold("Usage")}
  labsui init                  set up styles, theme and helpers (run once)
  labsui add <name...>         add components and everything they import
  labsui add --all             add every component and block
  labsui list                  list what can be added
  labsui search <words...>     find by name, export or intent (--kind hook)
  labsui view <name...>        props, examples, what it installs (--source)
  labsui diff [name...]        how installed items differ from this version
  labsui update [name...]      bring installed items to this version, keeping your edits
  labsui doctor                check the setup; exits 1 on a problem
  labsui rules                 coding rules for agents (append to AGENTS.md)
  labsui mcp                   serve all of this to coding agents (MCP, stdio)

${bold("Options")}
  --cwd <dir>        project directory (default: current)
  --registry <url>   read a hosted registry (default: the one bundled with labsui)
  --json             machine-readable output on stdout
  --overwrite        replace files that already exist
  --dry-run          show what would change, write nothing
  --no-install       skip installing npm dependencies
  -h, --help         show this help
  -v, --version      show the version
`;

async function main() {
	const { values, positionals } = parseArgs({
		allowPositionals: true,
		options: {
			cwd: { type: "string" },
			registry: { type: "string" },
			json: { type: "boolean", default: false },
			kind: { type: "string" },
			source: { type: "boolean", default: false },
			overwrite: { type: "boolean", default: false },
			"dry-run": { type: "boolean", default: false },
			"no-install": { type: "boolean", default: false },
			all: { type: "boolean", default: false },
			help: { type: "boolean", short: "h", default: false },
			version: { type: "boolean", short: "v", default: false },
		},
	});

	if (values.version) return console.log(VERSION);

	const [command, ...names] = positionals;

	if (values.help || !command) return console.log(HELP);

	const cwd = resolve(values.cwd ?? process.cwd());
	const registry = values.registry ?? process.env.LABSUI_REGISTRY;
	const json = values.json;
	const opts = {
		overwrite: values.overwrite,
		dryRun: values["dry-run"],
		install: !values["no-install"],
		quiet: json,
	};
	const out = <T>(data: T, print: (data: T) => void) =>
		json ? console.log(JSON.stringify(data, null, 2)) : print(data);

	switch (command) {
		case "init":
			return out(await init(cwd, registry, opts), printInit);

		case "add": {
			const config = loadConfig(cwd, registry);
			let wanted = names;

			if (values.all) {
				const index = await fetchIndex(config.registry);

				wanted = index
					.filter((i) => i.type === "registry:ui" || i.type === "registry:block")
					.map((i) => i.name);
			}

			if (!wanted.length) throw new CliError("Name at least one component: labsui add button");

			return out(await add(cwd, config, wanted, opts), printAdd);
		}

		case "list":
			return out(await fetchIndex(registry ?? readConfig(cwd)?.registry), list);

		case "search": {
			const index = await fetchIndex(registry ?? readConfig(cwd)?.registry);
			const query = names.join(" ");
			const hits = searchIndex(index, query, values.kind);
			const suggestions = hits.length ? [] : suggest(index, query);

			return out({ query, hits, suggestions }, (result) =>
				printSearch(result.hits, result.query, result.suggestions),
			);
		}

		case "view": {
			if (!names.length) throw new CliError("Name at least one item: labsui view dialog");

			const config = readConfig(cwd);
			const views = await Promise.all(
				names.map((name) =>
					describe(registry ?? config?.registry, name, {
						withSource: values.source,
						alias: config?.alias,
					}),
				),
			);

			return out(views, printView);
		}

		case "diff": {
			const config = loadConfig(cwd, registry);

			return out(await diff(cwd, config, names, VERSION), (diff) =>
				printDiff(diff, names.length > 0),
			);
		}

		case "update": {
			const config = loadConfig(cwd, registry);

			return out(await update(cwd, config, names, opts), printUpdate);
		}

		case "doctor": {
			const result = await doctor(cwd, registry);

			out(result, printDoctor);
			if (!result.ok) process.exitCode = 1;

			return;
		}

		case "rules":
			return console.log(rules(readConfig(cwd)?.alias));
		case "mcp":
			return serve({ cwd, pinned: values.cwd !== undefined, registry, version: VERSION });
		default:
			throw new CliError(`Unknown command "${command}". Run labsui --help.`);
	}
}

main().catch((err) => {
	if (err instanceof CliError) {
		if (process.argv.includes("--json"))
			console.log(JSON.stringify({ error: err.message }, null, 2));
		else console.error(`${red("✗")} ${err.message}`);
		process.exit(1);
	}

	throw err;
});
