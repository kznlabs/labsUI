# labsui

Add [labsUI](https://kznlabs.github.io/labsUI) components to your project:
clean React primitives with one smooth spring for every motion. Components are
copied into your codebase, so you own and edit them.

Requires React 19, Tailwind CSS v4 and a path alias
(`"paths": { "@/*": ["./src/*"] }` in `tsconfig.json`). The CLI runs on
Node.js 22 or newer, or Deno. It has no dependencies and works offline.

## Usage

```sh
npx @kznlabs/labsui init                # once: styles, theme, utils, motion provider
npx @kznlabs/labsui add button tabs     # components plus everything they import
npx @kznlabs/labsui search date range   # find by name, export or intent
npx @kznlabs/labsui view dialog         # props, examples, what it installs
npx @kznlabs/labsui update              # newer components, keeping your edits
npx @kznlabs/labsui doctor              # check the setup
```

Any runner works: `bunx @kznlabs/labsui add button`, `pnpm dlx @kznlabs/labsui …`,
`yarn dlx @kznlabs/labsui …`, or from JSR with
`deno run -A jsr:@kznlabs/labsui add button`. npm dependencies install with
whatever package manager your lockfile shows.

The component registry ships inside the package: no network needed beyond
installing npm dependencies, and each labsui version installs the same
component code. `npx @kznlabs/labsui@latest add …` gets the newest components.

### Global install

To type `labsui` instead of `npx @kznlabs/labsui` in every project:

```sh
npm install -g @kznlabs/labsui    # or: bun add -g @kznlabs/labsui
deno install -gA -n labsui jsr:@kznlabs/labsui
```

A global install pins its components to that version, the same way the
registry ships inside each release. Update it when you want newer ones
(`npm install -g @kznlabs/labsui@latest`); `npx @kznlabs/labsui@latest`
always gets them.

## Commands

### `init`

- Writes `styles/labsui.css` (tokens, accent presets, animations) and imports
  it right after `@import "tailwindcss"` in your stylesheet.
- Adds `lib/utils`, `lib/theme` and `components/motion-provider`, and installs
  `motion`, `clsx` and `tailwind-merge`.
- Saves `labsui.json` with the registry URL, your alias and its folder.
- Prints the lines your root layout needs (theme script, `MotionProvider`).

Run it again any time: existing files are kept.

### `add`

Resolves dependencies through the registry (`data-table` brings `table`,
`checkbox`, `pagination`, …), writes each file under your alias folder and
installs the npm packages it imports. Existing files are kept unless you pass
`--overwrite`; a kept dependency whose code differs from this version is
named, with the `labsui update` that brings it level, since the new item may
need it. If your alias isn't `@/`, imports are rewritten to match.
Components that live once in the root layout (`toast`, `confirm`) print the
line to add there. A mistyped name gets a suggestion: `buton` suggests `button`.

### `list` and `search`

`list` shows everything: components, blocks, hooks (`use-disclosure`,
`use-hotkey`, …) and helpers (`utils`, `theme`, …). Hooks and helpers come
along with the components that import them; add one by name to use it on its
own.

`search` ranks by name first, then by what an item exports, then by its
description, and every word must match:

```sh
labsui search useModal         # finds dialog
labsui search toast promise    # finds toast
labsui search --kind hook      # every hook
```

### `view`

Everything you need before writing code with an item, without leaving the
terminal:

- Exact props and types of each export, read from the component source.
- A usage line and the full examples from the docs.
- What it brings along and which npm packages it installs.
- What to mount in the root layout, if anything.

Imports in the examples use your alias. `--source` adds the files themselves.

### `update` and `diff`

Components are yours to edit, so an update must not silently undo your
changes. `labsui.json` records which labsui version wrote each item, and
`labsui update` (or `labsui update dialog`) uses that version as the base:

- Files you never edited are replaced.
- Edited files are merged three ways: your changes and this version's
  changes both land.
- Where both changed the same lines, the file gets `<<<<<<< yours` /
  `>>>>>>> labsui` markers and `update` lists it. `labsui doctor` fails until
  they are resolved.
- New dependencies of updated items are added.

The base comes from JSR, which keeps every release's files. Offline, with a
hosted registry, or for items installed before versions were recorded,
edited files are left as they are. `labsui diff` lists installed items that
differ from this version, marking those that differ only in blank lines or
indentation; `labsui diff dialog` prints the patch from this version's file
to yours, or says `dialog` isn't installed.

### `doctor`

Checks the setup and prints a fix for each problem: React 19 and Tailwind v4,
the path alias and `labsui.json`, the stylesheet import, `MotionProvider` and
the theme script, `<Toaster />` and `<Confirmer />` mounted when installed,
missing npm packages, and files your installed components import but the
project lacks. It also lists installed items that differ from this version,
your edits or an older install. Exits with 1 when something is
broken, so it can run in CI.

It reads your code, not a framework's conventions: it works the same in any
React app.

## Coding agents

### MCP server

`labsui mcp` serves the same commands to any agent that speaks the Model
Context Protocol, over stdio. Register it with your agent:

```json
{
	"mcpServers": {
		"labsui": { "command": "npx", "args": ["-y", "@kznlabs/labsui", "mcp"] }
	}
}
```

It works in the folder your agent shares as its workspace (MCP roots), or
the one it starts the server in. If your agent starts servers elsewhere and
shares no workspace, add `"--cwd", "/path/to/app"` after `"mcp"`; `--cwd`
always wins. Claude Desktop is one of those: it shares no workspace, so give
it `--cwd`. On Windows, Desktop starts `npx` through `cmd`:

```json
{
	"mcpServers": {
		"labsui": {
			"command": "cmd",
			"args": ["/c", "npx", "-y", "@kznlabs/labsui", "mcp", "--cwd", "C:\\path\\to\\app"]
		}
	}
}
```

| Tool     | Does                                                     |
| -------- | -------------------------------------------------------- |
| `search` | find items by name, export or intent                     |
| `view`   | exact props, examples, dependencies, optional source     |
| `add`    | install items into the project (never overwrites a file) |
| `init`   | one-time setup; returns the root layout code             |
| `diff`   | patches from this version to your edited files           |
| `update` | update items, merging your edits three ways              |
| `doctor` | the setup checks, each problem with its fix              |

On connect, the server also sends the labsUI coding rules (imports, tokens,
motion, mounting), so the agent writes code the way the library expects. It
runs in the folder the agent starts it in and writes only inside that
project.

### Without MCP

- `labsui rules` prints the same coding rules as Markdown. Append them to the
  file your agent reads: `labsui rules >> AGENTS.md`.
- `--json` on any command prints one JSON document on stdout; npm output goes
  to stderr. Errors are `{ "error": "…" }` with exit code 1.

## Options

| Flag               | Meaning                                                            |
| ------------------ | ------------------------------------------------------------------ |
| `--json`           | machine-readable output on stdout                                  |
| `--kind <kind>`    | `search` only: component, block, hook, helper or setup             |
| `--source`         | `view` only: include the source files                              |
| `--overwrite`      | replace files that already exist                                   |
| `--dry-run`        | show what would change, write nothing                              |
| `--no-install`     | print the install command instead of running it                    |
| `--registry <url>` | another registry (also `LABSUI_REGISTRY`, or `registry` in config) |
| `--cwd <dir>`      | run against another project folder                                 |

## License

MIT. Every component is original, hand-made labsUI code.
