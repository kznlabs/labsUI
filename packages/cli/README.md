# labsui

Add [labsUI](https://github.com/kznlabs/labsUI) components to your project: shadcn-style primitives with macOS polish and one spring for every motion. Components are copied into your codebase, so you own and edit them.

Requires React 19, Tailwind CSS v4 and a path alias (`"paths": { "@/*": ["./src/*"] }` in `tsconfig.json`).

## Usage

```sh
npx labsui init                # once: styles, theme, utils, motion provider
npx labsui add button tabs     # components plus everything they import
npx labsui add --all           # every component and block
npx labsui list                # what you can add
```

Works with `bunx`, `pnpm dlx` and `yarn dlx` too. The CLI installs npm dependencies with whatever package manager your lockfile shows.

### `init`

- Writes `styles/labsui.css` (tokens, accent presets, animations) and imports it right after `@import "tailwindcss"` in your stylesheet.
- Adds `lib/utils`, `lib/theme` and `components/motion-provider`, and installs `motion`, `clsx` and `tailwind-merge`.
- Saves `labsui.json` with the registry URL, your alias and its folder.
- Prints the three lines your root layout needs (theme script, `MotionProvider`).

Run it again any time: existing files are kept.

### `add`

Resolves dependencies through the registry (`data-table` brings `table`, `checkbox`, `pagination`, …), writes each file under your alias folder and installs the npm packages it imports. Existing files are kept unless you pass `--overwrite`. If your alias isn't `@/`, imports are rewritten to match.

### Options

| Flag               | Meaning                                                            |
| ------------------ | ------------------------------------------------------------------ |
| `--overwrite`      | replace files that already exist                                   |
| `--dry-run`        | show what would change, write nothing                              |
| `--no-install`     | print the install command instead of running it                    |
| `--registry <url>` | another registry (also `LABSUI_REGISTRY`, or `registry` in config) |
| `--cwd <dir>`      | run against another project folder                                 |
