# CLAUDE.md

labsUI: clean React primitives, one smooth spring for every motion. Next 16 App
Router · React 19 · Tailwind v4 · motion 14 · lucide-react 1.x. Built with Bun:
repo scripts call `bun`, so use it here. Users can install components with any
package manager (npm, pnpm, yarn, Bun, Deno); docs recommend Bun, never require
it.

## Rule files

Topic rules live in `.claude/rules/`. Each one loads when a file in its `paths`
is read or written. A new file brings its rule in only as it is written, after
the draft exists, so read the rule named here before a task that starts from a
new file or touches no file yet.

| File            | Covers                                                                                                                 | Read first for                                      |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `components.md` | Adding a component, prop docs, floating panels, lists, shortcuts, state, form controls, motion, tokens, focus and WCAG | A new primitive, block, lib helper, demo or token   |
| `registry.md`   | Index of every component and block, with what its props don't say                                                      | Any page or demo built from components              |
| `site.md`       | Routes, API docs, code examples, SEO, images, browser claims, GitHub Pages                                             | A new route, docs page or README claim              |
| `cli.md`        | CLI commands, install registry, MCP server, releases                                                                   | A new command or MCP tool, a release                |
| `e2e.md`        | Playwright + axe runs, generic checks, probe pages                                                                     | A new spec or probe page, a behavior the docs state |

## Commands

- `bun dev` · `bun run build` · `bun run typecheck` (also compiles every
  registry example and `usage` line, `scripts/check-snippets.ts`)
- `bun run lint` (Biome, then Oxlint for what Biome lacks: blank lines
  between statements and between JSX siblings outside prose
  (`scripts/oxlint-plugin.js`), readable names; `.oxlintrc.json`) ·
  `bun run format` (both autofix)
- `bun run check-dead-code` (Knip) · `bun test` (`tests/`, pure helpers). lint +
  typecheck + knip + tests must pass (CI runs them).
- `bun run registry` builds `public/r/*.json` (install registry, generated,
  gitignored; `dev`/`build` run it).
- `bun run cli:build` builds the CLI · `bun run e2e:build`, then `bun run e2e`
  run the browser tests (`e2e.md`).
- `bunx markdownlint-cli2` lints Markdown (`.markdownlint-cli2.jsonc`): blank
  lines around blocks, `-` bullets, `1.` ordered items, prose under 80 columns,
  bare URLs in `<>`.

## Layout

- Installable code is `src/components/{ui,blocks}`,
  `components/motion-provider.tsx` and `src/lib` (shipped to users). It never
  imports `@/site/*` or `@/app/*`; Biome's `noRestrictedImports` fails lint if
  it does.
- Docs-site code lives in `src/site/` (`registry.ts`, `snippets.ts`, `api.ts`,
  `config.ts`, `catalog.tsx` (demo per entry, nav, `sectionProps`),
  `shell.tsx` (header + footer), `showcase/`, `seo/`).
- The CLI lives in `packages/cli`; the registry is bundled into it.

## Rules for every task

- Compose from `@/components/ui/<file>`; never restyle primitives inline when
  a variant/prop exists.
- `cn()` from `@/lib/utils` for all class merging. Accept `className`, spread
  rest props.
- Style: readable names (`event`, `element`, `option`, not `e`, `el`, `o`;
  `i`/`j`, `x`/`y` and sort's `(a, b)` are fine), a blank line between
  steps, and short comments only where the why isn't obvious. Oxlint
  enforces the names and blank lines.
- Extract a helper once logic repeats in three places, not before.
- Server pages: only pass serializable props to client components (icons as
  elements `<Mail />`). Server-callable helper: `buttonVariants` from
  `button-variants.ts`.
- Knip fails on unused exports: don't export internals. A type an exported
  signature uses is exported (users import it); Knip allows that.
- Originality: every component is written here. Copy, docs, comments and names
  describe labsUI on its own terms, without comparisons to other projects. No
  hotlinked images, no logos (`site.md`).
