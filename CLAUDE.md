# CLAUDE.md

labsUI: shadcn-style primitives + macOS polish. Next 16 App Router · React 19 · Tailwind v4 · motion 14 · lucide-react 1.x. **Bun only.**

## Commands

- `bun dev` · `bun run build` · `bun run typecheck`
- `bun run lint` (Biome) · `bun run format` (Biome autofix)
- `bun run check-dead-code` (Knip). lint + typecheck + knip must pass.

## Rules

- Compose from `@/components/ui/<file>`; never restyle primitives inline when a variant/prop exists. New primitive → `src/components/ui/<kebab>.tsx`, named export, add to `src/lib/registry.ts` (with a `group`) + this file. Composition of several primitives (pricing, stat tile…) → `src/components/blocks/<kebab>.tsx`, registry group `"Blocks"`, server-safe when it needs no state.
- Floating panels: `useAnchor()` from `@/lib/use-anchor` (side, align, flip + clamp), mark the panel `data-floating`; hover-opened ones use `useHoverOpen()` from `@/lib/use-hover-open`. Outside-click close: `useDismiss(open, [panel, trigger], onDismiss)` from `@/lib/use-dismiss` (nested `data-floating` panels count as inside). Modals: `useModal()` from `dialog.tsx`. Media/platform: `useMediaQuery`, `useIsMac`, `useMounted` (gate portals) from `@/lib/platform`. Sliding pills: `useIndicator(itemsMap, active)` from `@/lib/use-indicator`. Latest callback inside an effect: `useEffectEvent`, never a ref written during render.
- Controlled/uncontrolled props (`value`/`defaultValue`/`onValueChange`, `open`/`onOpenChange`): `const [v, setV] = useControllableState(value, defaultValue, onChange)` from `@/lib/use-controllable-state`; never hand-roll `prop ?? inner`.
- New form controls call `useFieldControl(props)` from `field.tsx` and set `data-slot` if InputGroup must find them.
- `cn()` from `@/lib/utils` for all class merging. Accept `className`, spread rest props.
- Motion: `import … from "motion/react"` only. Use `spring` from `@/lib/utils` (`{type:"spring",stiffness:400,damping:30}`); no duration tweens (except infinite loaders). `<MotionProvider>` (layout) sets default spring + reduced-motion. Animate named transforms (`x`, `y`, `scale`), not a `transform` string: reduced-motion only strips named ones. Per-frame callbacks (`onUpdate`, pointermove) write to the DOM/MotionValues, never `setState`, and allocate nothing.
- Tokens: `background foreground card popover primary secondary muted accent destructive success warning border input ring` (+`-foreground`), `mac-red|yellow|green`. **Contrast (AA 4.5:1):** `primary`/`destructive`/`success`/`warning` are _fills_; text and icons in those colors on surfaces or tints use the `-ink` twin (`text-primary-ink`, `text-destructive-ink`, `text-success-ink`, `text-warning-ink`), never `text-primary` etc. Fill/ink lightness is solved per accent preset in `globals.css`; re-run axe if you retune one. macOS palette: gray page, white `card`, hairline `border`. `primary` = the user's accent (`--accent-hue/-chroma/-l`, presets via `data-accent`); `accent` is only the subtle hover surface. Floating surfaces use `material` from `@/lib/utils`; menu/list selection = `bg-primary text-primary-foreground`. Radii `rounded-lg/xl/2xl`. Shadows `shadow-xs|sm|md`. No gradients/glows.
- Focus: `outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50`.
- Validation: prefer native constraints (`required`, `type`, `pattern`, `min`) — `fieldClass` styles `:user-invalid` (after interaction); use `aria-invalid`/Field `error` for server errors.
- Dark: `.dark` on `<html>` → `dark:`. `setTheme()` in `@/lib/theme`.
- Server pages: only pass serializable props to client components (icons as elements `<Mail />`). Server-callable helper: `buttonVariants` from `button-variants.ts`.
- Code examples (snippets, registry `usage`, playground strings) are shown through Prettier (`format` on CodePanel), so author them readable; they must parse as TSX.
- `<Toaster />`, `<Confirmer />` + `<MotionProvider>` are already mounted in `src/app/layout.tsx`.
- SEO/GEO: semantic tags, one `h1`, `section[aria-labelledby]`→`h2`; registry feeds JSON-LD (`<StructuredData />`) and `/llms.txt`.
- Knip fails on unused exports: don't export internals.

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
<Code code={s} language="tsx" variant="block|inline" format lineNumbers={true|42} highlight={[3, [5, 7]]} marks={["word", { text, line? }, { line, start, end }]} notes={{ 4: "Remember to add it" }} /> · <CodePanel files={[{ name: "a.tsx", code, ...sameAnnotations }]} format />   // format = Prettier defaults at display, lazy-loaded; line refs = shown numbers
<Dialog open? onOpenChange?><DialogTrigger variant="outline">Open</DialogTrigger><DialogContent alert? showClose?><DialogHeader><DialogTitle/><DialogDescription/></DialogHeader>…<DialogFooter><DialogClose>Cancel</DialogClose></DialogFooter></DialogContent></Dialog>
if (await confirm({ title, description?, confirmLabel?, cancelLabel?, destructive })) …   // <Confirmer /> mounted in layout; resolves false on cancel/Esc
const d = useDisclosure(); <Dialog|Drawer|Popover|DropdownMenu {...d.props}> · d.show() d.hide() d.toggle() d.open   // @/lib/use-disclosure
toast("Title", { description, action: { label, onClick }, duration }); toast.success|error|info|loading(…); toast.promise(p, { loading, success: (v) => …, error }); toast.dismiss(id?)
<MacWindow title="App" header={<nav/>} actions={<Button/>} onClose onMinimize onMaximize glass bodyClassName="p-5">…</MacWindow>
<ThemeToggle /> · <AccentPicker />                     // setAccent("blue|purple|pink|red|orange|yellow|green|graphite") in @/lib/theme
{enabled && <CustomCursor />}                             // opt-in; auto-off on touch/reduced-motion
<CountTo to={48290} prefix="$" />                       // springs up once in view
<Reveal delay={0.1}><Card>…</Card></Reveal>               // fades + rises on scroll
<AvatarGroup users={team} max={4} size="lg" />               // overlapping, +N chip, hover spring
<Quote variant="card" lang? author="Adam Mickiewicz" subtitle="Pan Tadeusz · tr. G. R. Noyes" avatar={<Avatar … />} typewriter textSwap={[…]}>…</Quote>   // sample quotes: famous Polish poetry in public-domain English translation, verified verbatim
<Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Page</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
<ButtonGroup orientation="horizontal|vertical" attached><Button>A</Button><Button>B</Button></ButtonGroup>
<Collapsible open? onOpenChange? defaultOpen><CollapsibleTrigger chevron?>More</CollapsibleTrigger><CollapsibleContent>…</CollapsibleContent></Collapsible>
<Pagination><PaginationContent><PaginationItem><PaginationPrevious href disabled={page === 1} /></PaginationItem>{pageRange(page, total).map((p, i) /* key by i */ => p === "…" ? <PaginationEllipsis /> : <PaginationLink href isActive>{p}</PaginationLink>)}<PaginationItem><PaginationNext href disabled={page === total} /></PaginationItem></PaginationContent></Pagination>   // server-safe; active pill slides, numbers swipe
<SidebarProvider defaultCollapsed? shortcut><Sidebar label="Admin"><SidebarHeader/><SidebarContent><SidebarGroup><SidebarGroupLabel>Server</SidebarGroupLabel><SidebarMenu><SidebarMenuItem><SidebarMenuButton href? icon={<Home />} isActive badge={12} onClick?>Home</SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarGroup></SidebarContent><SidebarFooter/></Sidebar><main><SidebarTrigger /></main></SidebarProvider>   // ⌘B toggles icon rail; below md it's a left Drawer
<Tabs defaultValue="a" value? onValueChange? variant="segmented|underline"><TabsList aria-label="Views"><TabsTrigger value="a" disabled?>A</TabsTrigger></TabsList><TabsContent value="a">…</TabsContent></Tabs>   // arrows/Home/End; panels stay in DOM
<SearchInput value={q} onValueChange={setQ} shortcut="/|mod+f" variant="default|ghost" label="Search members" />   // Esc clears; steps aside if hidden/focused
<CommandDialog open? onOpenChange? shortcut="mod+k"><CommandInput placeholder /><CommandList><CommandEmpty>No results.</CommandEmpty><CommandGroup heading="Pages"><CommandItem value? keywords={[…]} onSelect disabled keepOpen><Hash />Home</CommandItem></CommandGroup><CommandSeparator /></CommandList></CommandDialog>   // or inline <Command>
<Field label="Email" description? error={err} required? disabled? orientation="vertical|horizontal"><Input name="email" /></Field>   // controls auto-wire id/aria via useFieldControl()
<InputGroup><InputGroupAddon><AtSign /></InputGroupAddon><Input aria-label="User" /><InputGroupAddon align="end"><Button size="sm" variant="ghost">Copy</Button></InputGroupAddon></InputGroup>   // server-safe
<Checkbox id checked? defaultChecked onCheckedChange indeterminate disabled />
<RadioGroup legend="Plan" value? defaultValue onValueChange name orientation="vertical|horizontal"><RadioGroupItem value="pro" description? disabled>Pro</RadioGroupItem></RadioGroup>
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
<Rating value onValueChange max name label size="sm|default" readOnly />
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
<InputOTP length={6} groups={[3, 3]} charset="numeric|alphanumeric" value onValueChange onComplete name />   // one real input, autocomplete="one-time-code"
<AspectRatio ratio={16 / 9}><img … /></AspectRatio>       // server-safe; direct img/video child fills it
<FileDropzone name multiple accept=".pdf,image/*" maxSize onFiles={(files) => …} onReject={(r) => …} />   // real file input; drops land in it (forms/Server Actions)
<AttachmentList><Attachment key name size type src? progress? error? href? onRemove /></AttachmentList>   // also exports formatBytes()
<Stepper steps={[{ value, title, description? }]} value? onValueChange onSubmit|action><StepperList /><StepperStep value onNext={async () => ok}>…fields…</StepperStep><StepperFooter backLabel nextLabel submitLabel /></Stepper>   // a <form>; steps stay mounted; Continue checks the step's native constraints
<Calendar mode="single|range" value onValueChange defaultMonth? month? onMonthChange min max isDisabled={(d) => bool} weekStartsOn={1} locale />   // APG date grid; today marked client-only (hydration-safe)
<DatePicker mode="single|range" value onValueChange name presets={[{ label, value }]} min max isDisabled placeholder />   // Popover + Calendar; hidden input ISO "2026-10-21" or "from/to"; works in Field
<Combobox options={[{ value, label, icon?, keywords?, disabled? }]} value onValueChange placeholder emptyText name multiple? />   // typeable Select; multiple → value: string[], picks as tags
<TagInput value={tags} onValueChange max separators={[","]} validate={(t) => bool} name placeholder />   // also exports <Tag onRemove>, tagFieldClass
<ScrollArea aria-label="Log" orientation="vertical|horizontal|both" className="h-64" viewportClassName="p-4">…</ScrollArea>   // overlay thumbs, native scroll
<ResizablePanelGroup direction="horizontal|vertical" onLayout={(sizes) => …} keyboardStep={5}><ResizablePanel defaultSize={25} minSize={10} maxSize collapsible collapsedSize={0}>…</ResizablePanel><ResizableHandle withHandle aria-label="Resize nav" /><ResizablePanel>…</ResizablePanel></ResizablePanelGroup>   // panels/handles are direct children; sizes in %; APG splitter keys, Enter/dblclick collapses; groups nest
<StructuredData />                                         // @/components/seo/structured-data
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
<SiteHeader brand={<a href="/">Acme</a>} nav={[{ label, href } | { label, items: [{ title, href, description?, icon? }], columns? }]} current="/blog" actions={<ThemeToggle />} onNavigate?={(href, e) => …} />   // sticky; NavigationMenu md+, right Drawer below; hairline on scroll
```
