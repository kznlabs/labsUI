# CLAUDE.md

labsUI: clean React primitives, one smooth spring for every motion. Next 16 App
Router · React 19 · Tailwind v4 · motion 14 · lucide-react 1.x. Built with Bun:
repo scripts call `bun`, so use it here. Users can install components with any
package manager (npm, pnpm, yarn, Bun, Deno); docs recommend Bun, never require
it.

## Commands

- `bun dev` · `bun run build` · `bun run typecheck`
- `bun run lint` (Biome, then Oxlint for what Biome lacks: blank lines
  between statements, readable names; `.oxlintrc.json`) ·
  `bun run format` (both autofix)
- `bun run check-dead-code` (Knip) · `bun test` (`tests/`, pure helpers). lint +
  typecheck + knip + tests must pass (CI runs them). `typecheck` also
  compiles every registry example and `usage` line
  (`scripts/check-snippets.ts`).
- E2E (`tests/e2e/`, Playwright + axe): `bun run e2e:build`, then
  `bun run e2e [--project chromium-1280]`; `E2E_PAGES=dialog,select` limits
  pages, `bun run e2e:affected` lists those a diff reaches. Specs end in
  `.e2e.ts` (not `bun test`). No fixed waits: locators or `expect.poll`.
  Every page gets generic checks (`checks.ts`): controls a click can't reach,
  hairline scrollbars, dead wheel scrolling, `aria-expanded`/tab/slider
  contracts. A component that breaks one on purpose needs a reason, not an
  exemption list. Behavior the docs promise is tested on probe pages,
  `src/app/e2e/*/page.e2e.tsx`, built only by `e2e:build` (`E2E=1` adds the
  `e2e.tsx` page extension). Runs in CI only (`e2e.yml`); trigger it by
  hand for a page.
- `bunx markdownlint-cli2` lints Markdown (`.markdownlint-cli2.jsonc`): blank
  lines around blocks, `-` bullets, `1.` ordered items, prose under 80 columns,
  bare URLs in `<>`.
- `bun run registry` builds `public/r/*.json` (install registry, generated,
  gitignored; `dev`/`build` run it). Deps come from each file's imports:
  `@/components/*` and `@/lib/*` → registry deps, bare imports → npm deps (must
  be in `dependencies`), react/react-dom/next are peers. Library CSS lives in
  `src/styles/labsui.css` (shipped as-is); `globals.css` only imports it.
- Layout: installable code is `src/components/{ui,blocks}`,
  `components/motion-provider.tsx` and `src/lib` (shipped to users). Docs-site
  code lives in `src/site/` (`registry.ts`, `snippets.ts`, `api.ts`,
  `config.ts`, `catalog.tsx` (demo per entry, nav, `sectionProps`),
  `shell.tsx` (header + footer), `showcase/`, `seo/`). Installable code never
  imports `@/site/*` or `@/app/*`; Biome's `noRestrictedImports` fails lint if
  it does.
- Routes: `/` is the showcase (hero, curated live compositions from
  `showcase` in `catalog.tsx`, getting started, the grouped component index);
  `/components/[id]` is one static page per registry entry with its own title,
  description, canonical, JSON-LD (`ComponentStructuredData`) and sitemap
  entry, rendering `ShowcaseSection` from `sectionProps()` (code, API).
- CLI: `packages/cli` (`npx @kznlabs/labsui init|add|list`, command
  `labsui`), zero deps; the registry is bundled into it
  (`src/registry.json`, generated), so a CLI release is a component
  release. `bun run cli:build` (runs on Node 22+ or Deno).
  `src/index.ts` parses args;
  `commands/{init,add,list,search,view,diff,update,doctor}.ts` return data
  and print separately (`--json`, and `mcp.ts` + `tools.ts`, a stdio MCP
  server, reuse them; nothing in a command writes to stdout); `merge.ts`
  (three-way line
  merge for `update`), `rules.ts` (coding rules for agents, MCP
  instructions), `project.ts` (tsconfig, package.json, CSS, `labsui.json`
  with `installed` versions, the merge base `update` fetches from JSR),
  `registry.ts`, `install.ts`, `log.ts`, `version.ts`. Registry items carry
  `api` (from `api.generated.json`, lib included), `usage`, `examples`
  (snippets), `docs` and `mount` (registry `Entry.mount`, e.g.
  `"<Toaster />"`), validated against `/r/registry-item.schema.json`
  (`scripts/registry-schema.ts`). `bun run registry` also writes
  `public/components/<id>.md` (what `view` prints). Relative imports keep
  the `.ts` extension (JSR runs the source under Deno). Tests:
  `tests/cli*.test.ts`, `tests/registry.test.ts`.
- API docs: `scripts/build-api.ts` (part of `bun run registry`, run by Node
  22.18+ until oven-sh/bun#39747 ships) reads exported
  components' prop types with TS 7's API (`typescript/unstable/sync`, drives
  tsgo over `tsconfig.json`; unstable, so rerun it after bumping TypeScript)
  into `src/site/api.generated.json`, shown as each section's API reference and
  in `/llms.txt`. **JSDoc on a prop is its public description**; own props only
  (inherited DOM props are summarized, `className` omitted). Every own prop
  needs one: the script fails and lists the gaps otherwise. Types the docs
  print (`types`) must be exported, the script fails otherwise. In a
  discriminated union (`mode`, `multiple`, `type`), TS joins the docs of every
  branch, so document the first branch only, worded for both.
- Originality: every component is written here. Demo images are drawn for
  them or CC0, downloaded into `public/` with their license metadata kept
  (`public/avatar-demo.svg` is DiceBear Thumbs, CC0); no hotlinked images,
  no logos. Copy, docs, comments and names describe labsUI on its own terms,
  without comparisons to other projects. Browser support (README
  "Accessibility and browsers", the gallery's checks strip) names engines and
  browsers as plain facts, and only claims what the last automated sweep
  measured.
- Docs site: GitHub Pages (`.github/workflows/pages.yml`, static export to
  `out/` under `/labsUI`). Plain `<a href>`/`<img src>` to root paths use
  `withBase()` from `@/site/config`. The favicon and header mark are
  `public/icon.svg` and `public/logo.svg`; the link preview is
  `public/og.png`, rendered from `public/og.svg` (social sites need a
  raster). No icon/opengraph-image conventions: they miss basePath in the
  static export.
- Release CLI: `bun run release:cli` bumps `packages/cli/package.json`,
  `jsr.json` **and** `server.json` together (JSR never reuses a version, even
  a deleted one; the header badge reads it), tags `cli-v<version>` and
  pushes; `.github/workflows/release-cli.yml` publishes to npm, JSR
  (`@kznlabs/labsui`) and then the MCP registry
  (`io.github.kznlabs/labsui`, OIDC; it checks `mcpName` in the published
  npm package, so npm goes first), then creates the GitHub release that
  Glama's Auto-Release builds from (Glama installs the npm package). MCP
  tool definitions live in `tools.ts` (`mcp.ts` handles the protocol):
  every parameter has a `description`, and each tool description says what
  it returns and names the tool to use before or instead of it (a test
  fails otherwise). Glama scores these (TDQS); shared parameters and
  annotations are reused, not redefined.

## Rules

- Compose from `@/components/ui/<file>`; never restyle primitives inline when
  a variant/prop exists. New primitive → `src/components/ui/<kebab>.tsx`, named
  export, add to `src/site/registry.ts` (with a `group`), a demo in
  `src/site/showcase/` wired through `src/site/demo.tsx` (lazy, one chunk per
  demo module) and `src/site/catalog.tsx` (`<Demo name="…" />`), a snippet
  in `src/site/snippets.ts` + this file.
  Composition of several primitives (pricing, stat tile…) →
  `src/components/blocks/<kebab>.tsx`, registry group `"Blocks"`, server-safe
  when it needs no state.
- Floating panels: `useAnchor()` from `@/lib/use-anchor` (side, align, flip +
  clamp), mark the panel `data-floating`; hover-opened ones use
  `useHoverOpen()` from `@/lib/use-hover-open`. Outside-click close:
  `useDismiss(open, [panel, trigger], onDismiss)` from `@/lib/use-dismiss`
  (nested `data-floating` panels count as inside). Modals: `useModal()` from
  `dialog.tsx`. Media/platform: `useMediaQuery`, `useIsMac`, `useMounted` (gate
  portals) from `@/lib/platform`. Sliding pills:
  `useIndicator(itemsMap, active)` from `@/lib/use-indicator`. Latest callback
  inside an effect: `useEffectEvent`, never a ref written during render.
- Lists and shortcuts: arrow/Home/End movement via
  `listKeyTarget(items, index, e, { orientation, loop?, homeEnd? })` and
  keeping the active option in view via `scrollIntoList(box, el)`, both from
  `@/lib/list`; window shortcuts (`"mod+k"`, `"/"`) via
  `useHotkey(shortcut, handler, { skipInFields? })` from `@/lib/use-hotkey`
  (return false to leave the key to the browser); `clamp` from `@/lib/utils`.
  Extract a helper once logic repeats in three places, not before.
- Controlled/uncontrolled props (`value`/`defaultValue`/`onValueChange`,
  `open`/`onOpenChange`):
  `const [v, setV] = useControllableState(value, defaultValue, onChange)` from
  `@/lib/use-controllable-state`; never hand-roll `prop ?? inner`.
- New form controls call `useFieldControl(props)` from `field.tsx` and set
  `data-slot` if InputGroup must find them. A control without a native
  input submits through `<FormValue>` from `@/lib/form-value`, never
  `type="hidden"`: browsers skip hidden inputs in validation, so `required`
  would do nothing. Pass it `disabled` too, so a disabled control submits
  nothing. Test it on `/e2e/forms` (`forms.e2e.ts`): required blocks an
  empty submit, a value submits, disabled submits nothing.
- `cn()` from `@/lib/utils` for all class merging. Accept `className`, spread
  rest props.
- Style: readable names (`event`, `element`, `option`, not `e`, `el`, `o`;
  `i`/`j`, `x`/`y` and sort's `(a, b)` are fine), a blank line between
  steps, and short comments only where the why isn't obvious. Oxlint
  enforces the names and blank lines.
- Motion: `import … from "motion/react"` only, full `motion.*` (not `m` +
  `LazyMotion`: Toast and Drawer drag need `domMax` app-wide, so it saves
  nothing unless loaded async, which hides SSR `initial` states until the
  chunk lands). Use `spring` from `@/lib/utils`
  (`{type:"spring",stiffness:400,damping:30}`); no duration tweens (except
  infinite loaders). `<MotionProvider>` (layout) sets default spring +
  reduced-motion. Animate named transforms (`x`, `y`, `scale`), not a
  `transform` string: reduced-motion only strips named ones. Per-frame
  callbacks (`onUpdate`, pointermove) write to the DOM/MotionValues, never
  `setState`, and allocate nothing.
- Tokens: `background` `foreground` `card` `popover` `primary` `secondary`
  `muted` `accent` `destructive` `success` `warning` `border` `input` `ring`
  (+`-foreground`), `window-close|minimize|maximize`, and control surfaces:
  `field` (inputs, unchecked boxes), `control` + `control-border` (outline
  button, pagination pill), `raised` + `raised-ring` (sliding tab/toggle
  pill), `track` (switch off). Components carry no `dark:` overrides: a
  difference between themes is a token in `labsui.css`. Text or icons on a
  `bg-success` fill use `text-success-foreground` (deep green: the fill is light
  in both themes). **Contrast (AA 4.5:1):**
  `primary`/`destructive`/`success`/`warning` are _fills_; text and icons in
  those colors on surfaces or tints use the `-ink` twin (`text-primary-ink`,
  `text-destructive-ink`, `text-success-ink`, `text-warning-ink`), never
  `text-primary` etc. Fill/ink lightness is solved per accent preset in
  `globals.css`; re-run axe if you retune one. Palette: gray page, white
  `card`, hairline `border`. `primary` = the user's accent
  (`--accent-hue/-chroma/-l`, presets via `data-accent`); `accent` is only the
  subtle hover surface. Floating surfaces use `material` from `@/lib/utils`;
  menu/list selection = `bg-primary text-primary-foreground`. Radii
  `rounded-lg/xl/2xl`. Shadows `shadow-xs|sm|md`. No gradients/glows.
- Focus: `outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50`.
- WCAG 2.2 AA is checked with axe (both themes, 375 and 1280 px): pointer
  targets are at least 24×24 px (wrap a smaller visual, e.g. a 6px dot, in a
  `size-6` button); a container that can scroll sideways gets
  `<OverflowFocus />` from `@/lib/overflow-focus` so keyboard users can reach
  it (it adds `tabIndex` only while it overflows, server components can use
  it); `touch-action` stops at the nearest scroll container, so swipe gestures
  repeat it on inner scrollers (see `DrawerBody`). Global CSS goes in
  `@layer base`, or it beats every utility.
- Validation: prefer native constraints (`required`, `type`, `pattern`, `min`)
  — `fieldClass` styles `:user-invalid` (after interaction); use
  `aria-invalid`/Field `error` for server errors.
- Dark: `.dark` on `<html>` → `dark:`. `setTheme()` in `@/lib/theme`.
- Server pages: only pass serializable props to client components (icons as
  elements `<Mail />`). Server-callable helper: `buttonVariants` from
  `button-variants.ts`.
- Code examples (snippets, registry `usage`, playground strings) go through
  Prettier: `scripts/format-snippets.ts` formats snippets and `usage` at build
  time (`src/site/snippets.formatted.json`, generated), and only code a demo
  rewrites live formats in the browser. Author them readable; they must parse
  as TSX.
- `<Toaster />`, `<Confirmer />` + `<MotionProvider>` are already mounted in
  `src/app/layout.tsx`.
- SEO/GEO: semantic tags, one `h1`, `section[aria-labelledby]`→`h2`; registry
  feeds JSON-LD (`<StructuredData />`) and `/llms.txt`.
- Knip fails on unused exports: don't export internals. A type an exported
  signature uses is exported (users import it); Knip allows that.

## Registry (`@/components/ui/*`)

```tsx
<Button variant="default|secondary|outline|ghost|destructive" size="sm|default|lg|icon" loading status="idle|loading|success" successLabel="Created!" confirmLabel="Yes, delete" swap="up|down|left|right">Save</Button>
buttonVariants({ variant, size, className })            // button-variants.ts: style <a> etc.
<Badge variant="default|secondary|outline|destructive|success" shape="badge|pill" dot pulse>Live</Badge>
<Input id="e" type="email" aria-invalid={err} />         // input.tsx
<Textarea className="max-h-40" maxLength={280} showCount />   // auto-grows; counter warns near the limit
<Label htmlFor="e">Email</Label>
<Switch checked={on} onCheckedChange={setOn} />           // or defaultChecked
<Card glass?><CardHeader><CardTitle as="h2|h3|h4…"/><CardDescription/></CardHeader><CardContent/><CardFooter/></Card>
<Avatar src={url} alt="Jane Doe" fallback={<Bot />} status="online|away|busy|offline" size="sm|default|lg" />
<Accordion type="single|multiple" collapsible defaultValue="a" value? onValueChange?><AccordionItem value="a"><AccordionTrigger as="h3">Q</AccordionTrigger><AccordionContent>A</AccordionContent></AccordionItem></Accordion>
<MessageBubble from="user|assistant" avatar={<Avatar …/>} name time streaming><p>…</p><Code code={s} language="tsx" /></MessageBubble>
<Code code={s} language="tsx" variant="block|inline" format tokens={await highlightCode(s, "tsx")} lineNumbers={true|42} highlight={[3, [5, 7]]} marks={["word", { text, line? }, { line, start, end }]} notes={{ 4: "Remember to add it" }} /> · <CodePanel files={[{ name: "a.tsx", code, tokens?, ...sameAnnotations }]} format />   // format = Prettier defaults at display, lazy-loaded; tokens from highlightCode() (@/lib/highlight, server or build) = no Shiki in the browser; line refs = shown numbers
<Dialog open? onOpenChange?><DialogTrigger variant="outline">Open</DialogTrigger><DialogContent alert? showClose?><DialogHeader><DialogTitle/><DialogDescription/></DialogHeader>…<DialogFooter><DialogClose>Cancel</DialogClose></DialogFooter></DialogContent></Dialog>
if (await confirm({ title, description?, confirmLabel?, cancelLabel?, destructive })) …   // <Confirmer /> mounted in layout; resolves false on cancel/Esc
const d = useDisclosure(); <Dialog|Drawer|Popover|DropdownMenu {...d.props}> · d.show() d.hide() d.toggle() d.open   // @/lib/use-disclosure
toast("Title", { description, action: { label, onClick }, duration }); toast.success|error|info|loading(…); toast.promise(p, { loading, success: (v) => …, error }); toast.dismiss(id?)
<AppWindow title="App" header={<SegmentedTabs label="Views" items={views} value={view} onChange={setView} />} actions={<Button/>} onClose onMinimize onMaximize glass bodyClassName="p-5">…</AppWindow>   // SegmentedTabs: compact title-bar nav (aria-current), not a tablist
<ThemeToggle /> · <AccentPicker />                     // setAccent("red|orange|yellow|green|blue|purple|pink|slate") in @/lib/theme
{enabled && <CustomCursor />}                             // opt-in; auto-off on touch/reduced-motion
<CountTo to={48290} prefix="$" />                       // springs up once in view
<Reveal delay={0.1}><Card>…</Card></Reveal>               // fades + rises on scroll
<AvatarGroup users={team} max={4} size="lg" />               // overlapping, +N chip, hover spring
<Quote variant="card" lang? author="Adam Mickiewicz" subtitle="Pan Tadeusz · tr. G. R. Noyes" avatar={<Avatar … />} typewriter textSwap={[…]}>…</Quote>   // sample quotes: famous Polish poetry in public-domain English translation, verified verbatim
<Breadcrumb items={[{ label: "Home", href: "/", onClick? }, { label: "Page" }]} separator="/" />   // server-safe; last item is the current page
<ButtonGroup orientation="horizontal|vertical" attached><Button>A</Button><Button>B</Button></ButtonGroup>
<Collapsible open? onOpenChange? defaultOpen><CollapsibleTrigger chevron?>More</CollapsibleTrigger><CollapsibleContent>…</CollapsibleContent></Collapsible>
<Pagination page={3} total={12} href={(p) => `?page=${p}`} | onPageChange={setPage} siblings={1} labels={{ previous, next }} />   // server-safe as links; buttons with onPageChange; pill slides, numbers swipe; pageRange() exported
<SidebarLayout defaultCollapsed? collapsed? onCollapsedChange? shortcut><Sidebar label="Admin" header={<Brand />} groups={[{ label: "Server", collapsible?, defaultOpen?, items: [{ id?, label, icon, href?, badge? }] }]} footer={[items]} current={pathname} onSelect={(id) => …} /><main><SidebarTrigger /></main></SidebarLayout>   // ⌘B toggles icon rail; below md it's a left Drawer; id defaults to href, else label
<Tabs defaultValue="a" value? onValueChange? variant="segmented|underline"><TabsList aria-label="Views"><TabsTrigger value="a" disabled?>A</TabsTrigger></TabsList><TabsContent value="a">…</TabsContent></Tabs>   // arrows/Home/End; panels stay in DOM
<SearchInput value={q} onValueChange={setQ} shortcut="/|mod+f" variant="default|ghost" label="Search members" />   // Esc clears; steps aside if hidden/focused
<CommandDialog open? onOpenChange? shortcut="mod+k"><CommandInput placeholder /><CommandList><CommandEmpty>No results.</CommandEmpty><CommandGroup heading="Pages"><CommandItem value? keywords={[…]} onSelect disabled keepOpen><Hash />Home</CommandItem></CommandGroup><CommandSeparator /></CommandList></CommandDialog>   // or inline <Command>
<Field label="Email" description? error={err} required? disabled? orientation="vertical|horizontal"><Input name="email" /></Field>   // controls auto-wire id/aria via useFieldControl()
<InputGroup><InputGroupAddon><AtSign /></InputGroupAddon><Input aria-label="User" /><InputGroupAddon align="end"><Button size="sm" variant="ghost">Copy</Button></InputGroupAddon></InputGroup>   // server-safe
<Checkbox id checked? defaultChecked onCheckedChange indeterminate disabled />
<RadioGroup legend="Plan" value? defaultValue onValueChange name required orientation="vertical|horizontal"><RadioGroupItem value="pro" description? disabled>Pro</RadioGroupItem></RadioGroup>
<ContextMenu><ContextMenuTrigger aria-label="Clip">…</ContextMenuTrigger><ContextMenuContent>{/* same items as DropdownMenu */}<ContextMenuItem onSelect>Play</ContextMenuItem></ContextMenuContent></ContextMenu>   // opens at pointer; Shift+F10
<Alert variant="default|info|success|warning|destructive" icon? action={<Button size="sm" />}><AlertTitle/><AlertDescription/></Alert>   // server-safe
<Progress value? max label showValue size="sm|default" />   // no value = indeterminate
<Empty icon={<Film />} title description bordered><Button size="sm">Upload</Button></Empty>   // server-safe
<Popover open? onOpenChange?><PopoverTrigger variant="outline">Filters</PopoverTrigger><PopoverContent align="start|center|end" side="bottom|top">…</PopoverContent></Popover>
<Tooltip content="Bold ⌘B" side="top|bottom" align delay={500}><Button size="icon" aria-label="Bold"><Bold /></Button></Tooltip>   // one focusable child; wraps it in a span, so use ButtonGroup attached={false}
<HoverCard content={<Preview />} side align openDelay closeDelay><a href>@jane</a></HoverCard>
<Slider value={[v]} | {[lo, hi]} onValueChange min max step name labels={["Volume"]} disabled />   // native range underneath; two values = range
<ToggleGroup type="single|multiple" size="sm|default" aria-label="View" value onValueChange><ToggleGroupItem value="grid" aria-label?>…</ToggleGroupItem></ToggleGroup>
<NativeSelect name required><NativeSelectGroup label="Europe"><NativeSelectOption value>…</NativeSelectOption></NativeSelectGroup></NativeSelect>   // real <select>; base-select styling where supported
<NumberInput value onValueChange min max step name />
<Meter value max low high optimum label valueText segments={[{ label, value, className? }]} />   // server-safe
<Rating value onValueChange max name required disabled label size="sm|default" readOnly />
<RelativeTime date={d} locale? />   // self-updating, SSR shows absolute date
<Select id name options={[{ value, label, icon?, disabled? }] | [{ label, options }]} value? defaultValue? onValueChange placeholder disabled aria-invalid />
<DropdownMenu open? onOpenChange?><DropdownMenuTrigger variant="outline">Open</DropdownMenuTrigger><DropdownMenuContent align="start|end"><DropdownMenuLabel/><DropdownMenuItem onSelect shortcut="⌘E" variant="destructive" disabled><Pencil />Edit</DropdownMenuItem><DropdownMenuCheckboxItem checked onCheckedChange/><DropdownMenuRadioGroup value onValueChange><DropdownMenuRadioItem value/></DropdownMenuRadioGroup><DropdownMenuSeparator/></DropdownMenuContent></DropdownMenu>
<Menubar aria-label="Editor"><MenubarMenu value?><MenubarTrigger>File</MenubarTrigger><MenubarContent>{/* same items as DropdownMenu, Menubar* aliases */}<MenubarItem shortcut="⌘N" onSelect>New</MenubarItem></MenubarContent></MenubarMenu></Menubar>   // one open at a time, hover switches, ← → walk the bar
<NavigationMenu aria-label="Main" value? onValueChange?><NavigationMenuList><NavigationMenuItem><NavigationMenuTrigger>Products</NavigationMenuTrigger><NavigationMenuContent className="w-80"><NavigationMenuLink href icon={<Bot />} title description active /></NavigationMenuContent></NavigationMenuItem><NavigationMenuItem><NavigationMenuLink href active>Blog</NavigationMenuLink></NavigationMenuItem></NavigationMenuList></NavigationMenu>   // site nav (disclosure, not role=menu); one shared viewport morphs between panels; closed panels stay in HTML
<Drawer open? onOpenChange?><DrawerTrigger>Open</DrawerTrigger><DrawerContent side="left|right|top|bottom" showClose?><DrawerHeader><DrawerTitle/><DrawerDescription/></DrawerHeader><DrawerBody/><DrawerFooter><DrawerClose/></DrawerFooter></DrawerContent></Drawer>   // swipe to dismiss
<Kbd>⌘K</Kbd> · <KbdGroup keys={["⇧", "⌘", "P"]} />          // server-safe
<Separator orientation="horizontal|vertical" decorative label="or" />   // server-safe
<SkeletonGroup label="Loading"><Skeleton className="h-4 w-32" /></SkeletonGroup>   // server-safe
<Typewriter text={["Hello", "World"]} speed={40} deleteSpeed={24} loop cursor />
<TextSwap items={["Phrase 1", "Phrase 2"]} interval={3000} direction="up|down|fade" />
<Table striped containerClassName><TableCaption/><TableHeader><TableRow><TableHead sort="ascending|descending|none" onSort>Name</TableHead></TableRow></TableHeader><TableBody><TableRow data-state="selected"><TableCell/></TableRow></TableBody><TableFooter/></Table>   // server-safe; onSort only from client parents
<DataTable label="Members" data columns={[{ id, header, accessor?, cell?, sortable?, className? }]} getRowId rowLabel pageSize={10} defaultSort={{ id, dir }} searchable selectable selection? onSelectionChange rowActions={(row) => <DropdownMenuItem/>} toolbar={(selected) => …} striped />   // client-side search/sort/select/page; columns typed DataTableColumn<T>
<Chart type="line|area|bar" stacked label="Revenue" data={rows} index="month" series={[{ key, label, color?: 1-8 }]} format={{ style: "currency", currency: "USD" }} height={240} />   // tokens chart-1…8 (fixed order, CVD-validated; ≤8 series); legend hides series, crosshair tooltip, arrow keys, table view
<Carousel label="Projects"><CarouselContent className="sm:[--per-view:2] [--gap:1rem]"><CarouselItem>…</CarouselItem></CarouselContent><CarouselPrevious /><CarouselNext /><CarouselDots /></Carousel>   // native scroll-snap; spring buttons/dots/keys/mouse drag
<Marker color="yellow|primary|green|red" draw delay>text</Marker> · <Highlight text query={"term" | ["a", "b"]} color? />   // <mark>; draw sweeps on in view
<Terminal title lines={[{ id?, kind: "command|output|success|warn|error|muted", text, time? }]} typing log prompt="$" copyText?|false bodyClassName="h-64" />   // typing = install snippet; log = live, follows bottom
<Timeline><TimelineItem icon={<Rocket />} variant="default|active|success|warning|destructive" time="Oct 21" dateTime="2026-10-21" title="Released">body</TimelineItem></Timeline>   // server-safe
<Spinner size="sm|default|lg" label="Loading" />          // server-safe; label="" when a parent announces
<InputOTP length={6} groups={[3, 3]} charset="numeric|alphanumeric" value onValueChange onComplete name verified verifiedLabel="Verified" />   // one real input, autocomplete="one-time-code"; verified: chars → checks → one mark, read-only
<AspectRatio ratio={16 / 9}><img … /></AspectRatio>       // server-safe; direct img/video child fills it
<FileDropzone name multiple accept=".pdf,image/*" maxSize onFiles={(files) => …} onReject={(r) => …} />   // real file input; drops land in it (forms/Server Actions)
<AttachmentList><Attachment key name size type src? progress? error? href? onRemove /></AttachmentList>   // also exports formatBytes()
<Stepper steps={[{ value, title, description? }]} value? onValueChange onSubmit|action><StepperList /><StepperStep value onNext={async () => ok}>…fields…</StepperStep><StepperFooter backLabel nextLabel submitLabel /></Stepper>   // a <form>; steps stay mounted; Continue checks the step's native constraints
<Calendar mode="single|range" value onValueChange defaultMonth? month? onMonthChange min max isDisabled={(d) => bool} weekStartsOn={1} locale />   // APG date grid; today marked client-only (hydration-safe)
<DatePicker mode="single|range" value onValueChange name presets={[{ label, value }]} min max isDisabled placeholder />   // Popover + Calendar; submits ISO "2026-10-21" or "from/to"; works in Field
<Combobox options={[{ value, label, icon?, keywords?, disabled? }]} value onValueChange placeholder emptyText name multiple? />   // typeable Select; multiple → value: string[], picks as tags
<TagInput value={tags} onValueChange max separators={[","]} validate={(t) => bool} name required disabled placeholder />   // also exports <Tag onRemove>, tagFieldClass
<ScrollArea aria-label="Log" orientation="vertical|horizontal|both" className="h-64" viewportClassName="p-4">…</ScrollArea>   // overlay thumbs, native scroll; horizontal takes the mouse wheel
<ResizablePanelGroup direction="horizontal|vertical" onLayout={(sizes) => …} keyboardStep={5}><ResizablePanel defaultSize={25} minSize={10} maxSize collapsible collapsedSize={0}>…</ResizablePanel><ResizableHandle withHandle aria-label="Resize nav" /><ResizablePanel>…</ResizablePanel></ResizablePanelGroup>   // panels/handles are direct children; sizes in %; APG splitter keys, Enter/dblclick collapses; groups nest
<StructuredData />                                         // @/site/seo/structured-data
```

## Blocks (`@/components/blocks/*`)

```tsx
<Pricing plans={[{ name, description?, price: { monthly, yearly }, features, cta: <Button/>, featured?, badge? }]} currency="USD" defaultPeriod="monthly|yearly" yearlyNote="−20%" />
<Testimonial author subtitle? avatar? lang? others={users} othersLabel="and 2,400 others">Quote text</Testimonial>   // server-safe
<StatsStrip stats={[{ label, value, prefix?, suffix?, decimals?, hint? }]} />   // server-safe; Reveal + CountTo
<ProductCard name price compareAt? currency media={[<img/>…]} ratio={4 / 3} badge? href? onAddToCart addLabel? />   // 2+ media = Carousel
<ClipCard title duration="0:42" thumbnail={<img/>} ratio={9 / 16} watched={65} meta actions={<ContextMenuItem/>…} />
<StatTile label value="$48,290" delta={12.5} invert? period="vs last month" data={rows} index="month" dataKey="value" format />   // server-safe
<Changelog releases={[{ version, title, date, dateTime, changes: [{ type: "new|improved|fixed", text }], shortcut?: ["⌘", "K"] }]} />   // server-safe
<Newsletter onSubscribe={async (email) => …} title? description? submitLabel successMessage />   // rejection message → error toast
<SiteHeader brand={<a href="/">Acme</a>} nav={[{ label, href } | { label, items: [{ title, href, description?, icon? }], columns? }]} current="/blog" actions={<ThemeToggle />} label="Main" onNavigate?={(href, e) => …} />   // sticky; NavigationMenu md+, right Drawer below; hairline on scroll
```
