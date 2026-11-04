---
paths:
  - "src/components/**"
  - "src/lib/**"
  - "src/styles/**"
  - "src/site/showcase/**"
---

# Components

## Adding one

- New primitive → `src/components/ui/<kebab>.tsx`, named export, add to
  `src/site/registry.ts` (with a `group`), a demo in `src/site/showcase/` wired
  through `src/site/demo.tsx` (lazy, one chunk per demo module) and
  `src/site/catalog.tsx` (`<Demo name="…" />`), a snippet in
  `src/site/snippets.ts` + its line in `registry.md`.
- Composition of several primitives (pricing, stat tile…) →
  `src/components/blocks/<kebab>.tsx`, registry group `"Blocks"`, server-safe
  when it needs no state.
- `bun run registry` takes deps from each file's imports: `@/components/*` and
  `@/lib/*` → registry deps, bare imports → npm deps (must be in
  `dependencies`), react/react-dom/next are peers.
- Library CSS lives in `src/styles/labsui.css` (shipped as-is); `globals.css`
  only imports it. Global CSS goes in `@layer base`, or it beats every utility.
- **JSDoc on a prop is its public description**, and every own prop needs one
  (`site.md`, API docs).
- `<Toaster />`, `<Confirmer />` + `<MotionProvider>` are already mounted in
  `src/app/layout.tsx`.

## Floating panels

- `useAnchor()` from `@/lib/use-anchor` (side, align, flip + clamp), mark the
  panel `data-floating`; hover-opened ones use `useHoverOpen()` from
  `@/lib/use-hover-open`.
- Outside-click close: `useDismiss(open, [panel, trigger], onDismiss)` from
  `@/lib/use-dismiss` (nested `data-floating` panels count as inside).
- Modals: `useModal()` from `dialog.tsx`.
- First/last Tab stop in a panel: `tabbables(root)` from `@/lib/focus`, never a
  selector string (it would count FormValue helpers).
- Media/platform: `useMediaQuery`, `useIsMac`, `useMounted` (gate portals) from
  `@/lib/platform`.
- Sliding pills: `useIndicator(itemsMap, active)` from `@/lib/use-indicator`.
- Latest callback inside an effect: `useEffectEvent`, never a ref written during
  render.

## Lists and shortcuts

- Arrow/Home/End movement via
  `listKeyTarget(items, index, e, { orientation, loop?, homeEnd? })` and keeping
  the active option in view via `scrollIntoList(box, el)`, both from
  `@/lib/list`.
- Window shortcuts (`"mod+k"`, `"/"`) via
  `useHotkey(shortcut, handler, { skipInFields? })` from `@/lib/use-hotkey`
  (return false to leave the key to the browser).
- `clamp` from `@/lib/utils`.

## State

Controlled/uncontrolled props (`value`/`defaultValue`/`onValueChange`,
`open`/`onOpenChange`):
`const [v, setV] = useControllableState(value, defaultValue, onChange)` from
`@/lib/use-controllable-state`; never hand-roll `prop ?? inner`.

## Form controls

- New form controls call `useFieldControl(props)` from `field.tsx` and set
  `data-slot` if InputGroup must find them.
- A fieldset control (no single input) takes its name from `useFieldLabel()` as
  `aria-labelledby`.
- A control without a native input submits through `<FormValue>` from
  `@/lib/form-value`, never `type="hidden"`: browsers skip hidden inputs in
  validation, so `required` would do nothing. Pass it `disabled` too, so a
  disabled control submits nothing.
- State the DOM doesn't hold goes back to `defaultValue` on the form's reset
  (`useFormReset(ref, onReset)`, same file): React resets a form after a
  `<form action>` succeeds.
- Test it on `/e2e/forms` (`forms.e2e.ts`): required blocks an empty submit, a
  value submits, disabled submits nothing, a reset restores the default.
- Validation: prefer native constraints (`required`, `type`, `pattern`, `min`):
  `fieldClass` styles `:user-invalid` (after interaction); use
  `aria-invalid`/Field `error` for server errors.

## Motion

- `import … from "motion/react"` only, full `motion.*` (not `m` + `LazyMotion`:
  Toast and Drawer drag need `domMax` app-wide, so it saves nothing unless
  loaded async, which hides SSR `initial` states until the chunk lands).
- Use `spring` from `@/lib/utils`
  (`{type:"spring",stiffness:400,damping:30}`); no duration tweens (except
  infinite loaders). `<MotionProvider>` (layout) sets default spring +
  reduced-motion.
- Animate named transforms (`x`, `y`, `scale`), not a `transform` string:
  reduced-motion only strips named ones.
- Per-frame callbacks (`onUpdate`, pointermove) write to the DOM/MotionValues,
  never `setState`, and allocate nothing.

## Tokens

- Tokens: `background` `foreground` `card` `popover` `primary` `secondary`
  `muted` `accent` `destructive` `success` `warning` `border` `input` `ring`
  (+`-foreground`), `window-close|minimize|maximize`, and control surfaces:
  `field` (inputs, unchecked boxes), `control` + `control-border` (outline
  button, pagination pill), `raised` + `raised-ring` (sliding tab/toggle
  pill), `track` (switch off).
- Components carry no `dark:` overrides: a difference between themes is a token
  in `labsui.css`. `.dark` sits on `<html>`; `setTheme()` in `@/lib/theme`.
- Text or icons on a `bg-success` fill use `text-success-foreground` (deep
  green: the fill is light in both themes).
- **Contrast (AA 4.5:1):** `primary`/`destructive`/`success`/`warning` are
  _fills_; text and icons in those colors on surfaces or tints use the `-ink`
  twin (`text-primary-ink`, `text-destructive-ink`, `text-success-ink`,
  `text-warning-ink`), never `text-primary` etc. Fill/ink lightness is solved
  per accent preset in `labsui.css`; re-run axe if you retune one.
- Palette: gray page, white `card`, hairline `border`. `primary` = the user's
  accent (`--accent-hue/-chroma/-l`, presets via `data-accent`); `accent` is
  only the subtle hover surface.
- Floating surfaces use `material` from `@/lib/utils`; menu/list selection =
  `bg-primary text-primary-foreground`.
- Radii `rounded-lg/xl/2xl`. Shadows `shadow-xs|sm|md`. No gradients/glows.

## Focus and WCAG

- Focus: `outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50`.
- The ring takes the shape of what it surrounds: same radius and box as the
  visible surface. A parent that clips gets `focus-visible:ring-inset` plus
  `rounded-b-[inherit]` at its edge. Children that fill it paint over its ring
  and outline, so draw the ring on an overlay sibling (`peer-focus-visible:`,
  see `CarouselContent`).
- WCAG 2.2 AA is checked with axe (both themes, 375 and 1280 px).
- Pointer targets are at least 24×24 px (wrap a smaller visual, e.g. a 6px dot,
  in a `size-6` button).
- A container that can scroll sideways gets `<OverflowFocus />` from
  `@/lib/overflow-focus` so keyboard users can reach it (it adds `tabIndex` only
  while it overflows, server components can use it).
- `touch-action` stops at the nearest scroll container, so swipe gestures repeat
  it on inner scrollers (see `DrawerBody`).
