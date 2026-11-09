/**
 * How to write code with labsUI, for coding agents: sent as the MCP server's instructions and
 * printed by `labsui rules` (append it to AGENTS.md or similar). Markdown, lint-clean.
 */
export const rules = (alias = "@/") => `# labsUI

labsUI components live in this project as source: edit them like your own code.
The copy here is the version that installed it (\`labsui.json\`), often older
than this labsUI. Asked how an installed component behaves, or to change one,
run \`labsui diff <name>\` (or the MCP \`diff\` tool) first, before you
answer: say what the current version changes, and when it already does what
is asked, offer \`labsui update <name>\` instead of editing by hand.

## Before writing UI

- Look a component up before using it: \`labsui view <name>\` (or the MCP
  \`view\` tool) gives exact props, an example and what it installs. Do not
  guess props.
- Find one by intent: \`labsui search date range\`. Add it with
  \`labsui add <name>\`; it brings everything it imports.
- For a whole page or app (blog, docs, shop), \`labsui search\` also finds
  recipes: \`labsui view <recipe>\` lists the components a checked build used
  and the patterns it needed.
- After changing the setup, run \`labsui doctor\`.

## Look and layout

- Before the first page, pick a direction from the product: who it is for
  and how it should feel. Set it once with tokens, not per element: an accent
  preset (\`setAccent()\` from \`${alias}lib/theme\`, or \`data-accent\` on
  \`<html>\`), \`--radius\` in your CSS (0 for sharp, larger for soft), a
  display font from \`next/font\` for headings, light or dark first.
- Lead with the product's own content (items, prices, data, a working demo)
  and give one thing the most weight. Avoid the template look: a small label
  above every heading, a centered hero with two equal buttons, rows of three
  identical cards, round numbers like 10,000+.

## Writing code

- Import primitives from \`${alias}components/ui/<file>\`, blocks from
  \`${alias}components/blocks/<file>\`.
- Compose primitives; use a variant or prop before restyling. Merge classes
  with \`cn()\` from \`${alias}lib/utils\`; components take \`className\`.
- Motion: \`motion/react\` with \`spring\` from \`${alias}lib/utils\`, no
  duration tweens. Animate \`x\`, \`y\`, \`scale\`, not a \`transform\` string.
- Colors are tokens: \`background\`, \`foreground\`, \`card\`, \`popover\`,
  \`primary\`, \`secondary\`, \`muted\`, \`accent\`, \`destructive\`,
  \`success\`, \`warning\`, \`border\`, \`input\`, \`ring\` (each with
  \`-foreground\`). Text in \`primary\` or a status color on a surface uses the
  \`-ink\` twin (\`text-primary-ink\`, \`text-destructive-ink\`), never
  \`text-primary\`.
- No gradients or glows. Radii \`rounded-lg|xl|2xl\`, shadows
  \`shadow-xs|sm|md\`.
- Focus ring: \`outline-none focus-visible:ring-[3px]
  focus-visible:ring-ring/50\`.
- Dark mode is \`.dark\` on \`<html>\`; switch it with \`setTheme()\` from
  \`${alias}lib/theme\`.
- Feedback: \`toast()\` from \`${alias}components/ui/toast\`, \`await
  confirm()\` from \`${alias}components/ui/confirm\`. \`<Toaster />\` and
  \`<Confirmer />\` are mounted once in the root layout.
- Server components pass only serializable props to client components: icons
  as elements (\`icon={<Mail />}\`).
- Links in components render \`<a>\` until the app sets its router's link
  once: wrap the root layout's body in \`<LinkProvider component={Link}>\`
  (\`${alias}lib/link\`, \`Link\` from \`next/link\`). Then nav, footer,
  pager, sidebar and card links route on the client; no \`onNavigate\` needed.
- Pointer targets are at least 24×24 px. Prefer native validation
  (\`required\`, \`type\`, \`pattern\`).`;
