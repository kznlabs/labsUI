---
paths:
  - "packages/cli/**"
  - "scripts/build-registry.ts"
  - "scripts/build-docs-md.ts"
  - "scripts/registry-schema.ts"
  - "tests/cli*.test.ts"
  - "tests/registry.test.ts"
  - ".github/workflows/release-cli.yml"
---

# CLI, MCP and releases

## CLI

- `packages/cli` (`npx @kznlabs/labsui init|add|list`, command `labsui`), zero
  deps; the registry is bundled into it (`src/registry.json`, generated), so a
  CLI release is a component release. `bun run cli:build` (runs on Node 22+ or
  Deno).
- `src/index.ts` parses args. `commands/{init,add,list,search,view,diff,update,doctor}.ts`
  return data and print separately (`--json`, and `mcp.ts` + `tools.ts`, a stdio
  MCP server, reuse them; nothing in a command writes to stdout).
- `merge.ts` (three-way line merge for `update`), `rules.ts` (coding rules for
  agents, MCP instructions), `project.ts` (tsconfig, package.json, CSS,
  `labsui.json` with `installed` versions, the merge base `update` fetches from
  JSR), `registry.ts`, `install.ts`, `log.ts`, `version.ts`.
- Relative imports keep the `.ts` extension (JSR runs the source under Deno).
- Tests: `tests/cli*.test.ts`, `tests/registry.test.ts`.

## Install registry

- Registry items carry `api` (from `api.generated.json`, lib included), `usage`,
  `examples` (snippets), `docs` and `mount` (registry `Entry.mount`, e.g.
  `"<Toaster />"`), validated against `/r/registry-item.schema.json`
  (`scripts/registry-schema.ts`).
- `bun run registry` also writes `public/components/<id>.md` (what `view`
  prints).

## MCP tools

MCP tool definitions live in `tools.ts` (`mcp.ts` handles the protocol): every
parameter has a `description`, and each tool description says what it returns
and names the tool to use before or instead of it (a test fails otherwise).
Glama scores these (TDQS); shared parameters and annotations are reused, not
redefined.

## Release

`bun run release:cli` bumps `packages/cli/package.json`, `jsr.json` **and**
`server.json` together (JSR never reuses a version, even a deleted one; the
header badge reads it), tags `cli-v<version>` and pushes.
`.github/workflows/release-cli.yml` publishes to npm, JSR (`@kznlabs/labsui`)
and then the MCP registry (`io.github.kznlabs/labsui`, OIDC; it checks `mcpName`
in the published npm package, so npm goes first), then creates the GitHub
release that Glama's Auto-Release builds from (Glama installs the npm package).
