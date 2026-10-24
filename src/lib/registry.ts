/** Sidebar and page order of component groups. */
export const groups = [
	"Actions & inputs",
	"Navigation",
	"Layout",
	"Data display",
	"Overlays & feedback",
	"Motion",
	"Blocks",
] as const;

type Entry = {
	id: string;
	name: string;
	group: (typeof groups)[number];
	file: string;
	description: string;
	usage: string;
};

/** Component index: drives gallery nav/sections, JSON-LD and /llms.txt. Keep in sync with CLAUDE.md. */
export const registry: Entry[] = [
	{
		id: "button",
		group: "Actions & inputs",
		name: "Button",
		file: "button.tsx",
		description:
			"Five variants, four sizes, spring press feedback, an animated loading spinner and in-place success state, a two-step confirm that swaps the label on first click, and a configurable swap direction. Width stays fixed to the longest label.",
		usage: `<Button variant="destructive" confirmLabel="Yes, delete my account" onClick={remove}>Delete account</Button>`,
	},
	{
		id: "badge",
		group: "Data display",
		name: "Badge & Pill",
		file: "badge.tsx",
		description:
			"Minimal status tags. Rounded badge or fully rounded pill, with optional dot. pulse adds an expanding live-status ring.",
		usage: `<Badge variant="success" shape="pill" dot pulse>Live</Badge>`,
	},
	{
		id: "forms",
		group: "Actions & inputs",
		name: "Forms",
		file: "input.tsx · textarea.tsx · label.tsx · switch.tsx",
		description:
			"Input, Textarea, Label and Switch: smooth focus rings, native :user-invalid validation (red only after interaction), aria-invalid, auto-growing textarea with an optional character count, and a spring switch.",
		usage: `<Label htmlFor="email">Email</Label><Input id="email" type="email" aria-invalid={err} />`,
	},
	{
		id: "card",
		group: "Layout",
		name: "Card",
		file: "card.tsx",
		description:
			"Composable surface: header, title, description, content and footer. Optional glass.",
		usage: `<Card><CardHeader><CardTitle>Revenue</CardTitle></CardHeader><CardContent>…</CardContent></Card>`,
	},
	{
		id: "avatar",
		group: "Data display",
		name: "Avatar",
		file: "avatar.tsx",
		description:
			"Image with initials fallback on error, three sizes and online/away/busy/offline dots.",
		usage: `<Avatar src={url} alt="Jane Doe" status="online" size="lg" />`,
	},
	{
		id: "accordion",
		group: "Layout",
		name: "Accordion",
		file: "accordion.tsx",
		description:
			"Single or multiple panels with spring height animation. Closed content stays in the DOM for SEO.",
		usage: `<Accordion type="single" defaultValue="a"><AccordionItem value="a"><AccordionTrigger>Q</AccordionTrigger><AccordionContent>A</AccordionContent></AccordionItem></Accordion>`,
	},
	{
		id: "chat",
		group: "Data display",
		name: "Message Bubble",
		file: "message-bubble.tsx",
		description:
			"User/assistant chat bubbles with avatar slot, streaming dots and copyable code blocks.",
		usage: `<MessageBubble from="assistant" avatar={<Avatar … />} streaming>…<Code code={src} language="tsx" /></MessageBubble>`,
	},
	{
		id: "dialog",
		group: "Overlays & feedback",
		name: "Dialog",
		file: "dialog.tsx",
		description:
			"Portal modal with blurred backdrop, spring scale-in, focus trap, Esc and scroll lock.",
		usage: `<Dialog><DialogTrigger>Open</DialogTrigger><DialogContent><DialogHeader><DialogTitle>…</DialogTitle></DialogHeader></DialogContent></Dialog>`,
	},
	{
		id: "toast",
		group: "Overlays & feedback",
		name: "Toast",
		file: "toast.tsx",
		description:
			"Sonner-style stacked notifications. Hover to expand, swipe to dismiss, timers pause on hover.",
		usage: `toast.success("Saved", { description: "All changes synced", action: { label: "Undo", onClick } })`,
	},
	{
		id: "mac-window",
		group: "Layout",
		name: "MacWindow",
		file: "mac-window.tsx",
		description:
			"Window container with traffic-light controls, title, custom header slot and actions.",
		usage: `<MacWindow title="Preview" header={<Tabs />} actions={<Button size="sm" />} onClose={close}>…</MacWindow>`,
	},
	{
		id: "theme-toggle",
		group: "Actions & inputs",
		name: "Theme Toggle",
		file: "theme-toggle.tsx",
		description: "Light/dark icon switch with spring rotate-swap; follows the OS until first use.",
		usage: `<ThemeToggle />`,
	},
	{
		id: "cursor",
		group: "Motion",
		name: "Custom Cursor",
		file: "custom-cursor.tsx",
		description:
			"Optional spring cursor that expands over interactive elements. Off on touch and reduced motion.",
		usage: `{enabled && <CustomCursor />}`,
	},
	{
		id: "count-to",
		group: "Motion",
		name: "CountTo",
		file: "count-to.tsx",
		description:
			"Springs a number up from a start value once it scrolls into view. Prefix, suffix, decimals and locale.",
		usage: `<CountTo to={48290} prefix="$" />`,
	},
	{
		id: "reveal",
		group: "Motion",
		name: "Reveal",
		file: "reveal.tsx",
		description:
			"Scroll reveal: content fades and rises on a spring the first time it enters the viewport.",
		usage: `<Reveal delay={0.1}><Card>…</Card></Reveal>`,
	},
	{
		id: "avatar-group",
		group: "Data display",
		name: "AvatarGroup",
		file: "avatar-group.tsx",
		description:
			"Overlapping avatars with a +N overflow chip. Hover gently enlarges the avatar on a spring, keeping stack order.",
		usage: `<AvatarGroup users={team} max={4} size="lg" />`,
	},
	{
		id: "quote",
		group: "Data display",
		name: "Quote",
		file: "quote.tsx",
		description:
			"Semantic figure, blockquote and figcaption. Plain, card and large variants, with author, subtitle, avatar, lang, typewriter and textSwap.",
		usage: `<Quote variant="card" author="Adam Mickiewicz" subtitle="Pan Tadeusz · tr. G. R. Noyes">Lithuania, my country, thou art like health; how much thou shouldst be prized only he can learn who has lost thee.</Quote>`,
	},
	{
		id: "menubar",
		group: "Navigation",
		name: "Menubar",
		file: "menubar.tsx",
		description:
			"macOS-style menu bar on the WAI-ARIA menubar pattern: one menu open at a time, hovering the next title while one is open switches to it, ← → walk the bar with or without a menu open, one Tab stop. A single highlight springs between titles; menus reuse every DropdownMenu item.",
		usage: `<Menubar aria-label="Editor"><MenubarMenu><MenubarTrigger>File</MenubarTrigger><MenubarContent><MenubarItem shortcut="⌘N" onSelect={create}>New</MenubarItem></MenubarContent></MenubarMenu></Menubar>`,
	},
	{
		id: "breadcrumb",
		group: "Navigation",
		name: "Breadcrumb",
		file: "breadcrumb.tsx",
		description:
			"Semantic navigation trail with items, links, separators, collapsed ellipsis and current page status.",
		usage: `<Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Components</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>`,
	},
	{
		id: "button-group",
		group: "Actions & inputs",
		name: "Button Group",
		file: "button-group.tsx",
		description:
			"Fuses multiple buttons into a seamless connected strip, sharing borders, corners and active states. Horizontal or vertical.",
		usage: `<ButtonGroup><Button variant="outline">Years</Button><Button variant="default">Months</Button></ButtonGroup>`,
	},
	{
		id: "collapsible",
		group: "Layout",
		name: "Collapsible",
		file: "collapsible.tsx",
		description:
			"A single show/hide region with a spring height animation and rotating chevron. Controlled or uncontrolled; closed content stays in the DOM for SEO.",
		usage: `<Collapsible><CollapsibleTrigger>Show more</CollapsibleTrigger><CollapsibleContent>…</CollapsibleContent></Collapsible>`,
	},
	{
		id: "pagination",
		group: "Navigation",
		name: "Pagination",
		file: "pagination.tsx",
		description:
			"Server-safe page links with previous/next, ellipsis gaps and an active page. pageRange() returns a fixed-width page list so the bar never jumps.",
		usage: `<Pagination><PaginationContent><PaginationItem><PaginationLink href="?page=2" isActive>2</PaginationLink></PaginationItem></PaginationContent></Pagination>`,
	},
	{
		id: "sidebar",
		group: "Navigation",
		name: "Sidebar",
		file: "sidebar.tsx",
		description:
			"macOS source-list navigation with header, groups, badges and footer. Collapses to an icon rail on a spring (⌘B / Ctrl+B); labels clip but stay accessible. Pairs with Collapsible for nested groups.",
		usage: `<SidebarProvider><Sidebar><SidebarContent><SidebarMenu><SidebarMenuItem><SidebarMenuButton href="/" icon={<Home />} isActive>Home</SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarContent></Sidebar><main>…</main></SidebarProvider>`,
	},
	{
		id: "accent-picker",
		name: "Accent Picker",
		group: "Actions & inputs",
		file: "accent-picker.tsx",
		description:
			"macOS accent color row: eight swatches (blue to graphite) that retint primary, focus rings, selection, switches and checkboxes app-wide. Persisted, applied before paint, or set your own hue with --accent-hue.",
		usage: `<AccentPicker />`,
	},
	{
		id: "search-input",
		group: "Actions & inputs",
		name: "Search Input",
		file: "search-input.tsx",
		description:
			'Search field built on Input: leading icon, spring-in clear button, Esc to clear, and an optional focus shortcut ("/" or mod+k) with a Kbd hint.',
		usage: `<SearchInput value={q} onValueChange={setQ} shortcut="/" placeholder="Search…" />`,
	},
	{
		id: "field",
		name: "Field",
		group: "Actions & inputs",
		file: "field.tsx",
		description:
			"Label, control, description and error as one unit. Controls inside (Input, Textarea, Select, Checkbox, Switch, RadioGroup) get id, aria-describedby, aria-invalid and required automatically; errors spring in and are announced.",
		usage: `<Field label="Email" description="We never share it." error={errors.email} required><Input name="email" type="email" /></Field>`,
	},
	{
		id: "input-group",
		name: "Input Group",
		group: "Actions & inputs",
		file: "input-group.tsx",
		description:
			"Server-safe wrapper that fuses an Input with icons, text (https://, USD) or buttons into one field with a shared border and focus ring. Clicking an addon focuses the input.",
		usage: `<InputGroup><InputGroupAddon>https://</InputGroupAddon><Input aria-label="Site" /><InputGroupAddon align="end">.dev</InputGroupAddon></InputGroup>`,
	},
	{
		id: "checkbox",
		name: "Checkbox",
		group: "Actions & inputs",
		file: "checkbox.tsx",
		description:
			"Native checkbox with a spring-drawn check mark and an indeterminate state for select-all rows. Controlled or uncontrolled; submits with forms.",
		usage: `<Checkbox id="all" checked={all} indeterminate={some} onCheckedChange={toggleAll} />`,
	},
	{
		id: "radio-group",
		name: "Radio Group",
		group: "Actions & inputs",
		file: "radio-group.tsx",
		description:
			"Native radios in a fieldset with a legend: browser arrow keys and form submit, a dot that springs in, optional per-option descriptions, vertical or horizontal.",
		usage: `<RadioGroup legend="Plan" defaultValue="pro" name="plan"><RadioGroupItem value="free">Free</RadioGroupItem><RadioGroupItem value="pro" description="Unlimited clips">Pro</RadioGroupItem></RadioGroup>`,
	},
	{
		id: "slider",
		name: "Slider",
		group: "Actions & inputs",
		file: "slider.tsx",
		description:
			"macOS slider over native range inputs: thin accent track, white knob that lifts while held. One value or two for a range; keyboard, forms, touch and Field wiring come from the platform.",
		usage: `<Slider value={price} onValueChange={setPrice} min={0} max={250} step={5} />`,
	},
	{
		id: "toggle-group",
		name: "Toggle Group",
		group: "Actions & inputs",
		file: "toggle-group.tsx",
		description:
			"macOS segmented control of toggle buttons. Single mode slides one pill to the pressed item (view mode, billing period); multiple mode toggles items independently (bold, italic). Arrow keys move between items.",
		usage: `<ToggleGroup aria-label="View" value={view} onValueChange={setView}><ToggleGroupItem value="grid">Grid</ToggleGroupItem><ToggleGroupItem value="list">List</ToggleGroupItem></ToggleGroup>`,
	},
	{
		id: "native-select",
		name: "Native Select",
		group: "Actions & inputs",
		file: "native-select.tsx",
		description:
			"A real <select> with option groups: native picker on phones, no-JS forms, native required validation. Where customizable select is supported (appearance: base-select), the open list gets the macOS menu look.",
		usage: `<NativeSelect name="zone" required><NativeSelectGroup label="Europe"><NativeSelectOption value="Europe/Warsaw">Warsaw</NativeSelectOption></NativeSelectGroup></NativeSelect>`,
	},
	{
		id: "number-input",
		name: "Number Input",
		group: "Actions & inputs",
		file: "number-input.tsx",
		description:
			"Native number field with −/+ buttons: arrow keys, min/max/step validation and form submit from the platform; clamps on blur, rounds to the step's precision.",
		usage: `<NumberInput value={qty} onValueChange={setQty} min={1} max={10} name="qty" />`,
	},
	{
		id: "select",
		name: "Select",
		group: "Actions & inputs",
		file: "select.tsx",
		description:
			"Single-choice listbox styled like Input, with groups, icons and disabled options. Native-select keyboard (arrows, typeahead even while closed), flips above the trigger near the viewport edge, submits via a hidden input.",
		usage: `<Select id="role" name="role" options={[{ value: "admin", label: "Admin" }]} value={v} onValueChange={setV} placeholder="Pick a role" />`,
	},
	{
		id: "popover",
		name: "Popover",
		group: "Overlays & feedback",
		file: "popover.tsx",
		description:
			"Non-modal panel anchored to a Button for filters, pickers and quick edits. Focus moves in, Esc returns it, outside clicks close; Selects and menus opened inside don't count as outside.",
		usage: `<Popover><PopoverTrigger variant="outline">Filters</PopoverTrigger><PopoverContent align="start">…</PopoverContent></Popover>`,
	},
	{
		id: "tooltip",
		name: "Tooltip",
		group: "Overlays & feedback",
		file: "tooltip.tsx",
		description:
			"Short label on hover or keyboard focus, also wired as the trigger's aria-describedby. Warm-up: once one opens, neighbors open instantly. Hoverable, Esc dismisses, ignores touch.",
		usage: `<Tooltip content="Bold ⌘B"><Button variant="ghost" size="icon" aria-label="Bold"><Bold /></Button></Tooltip>`,
	},
	{
		id: "hover-card",
		name: "Hover Card",
		group: "Overlays & feedback",
		file: "hover-card.tsx",
		description:
			"Rich preview (profile, product, clip) that opens after a hover delay or keyboard focus. The pointer can move into the card; supplementary only.",
		usage: `<HoverCard content={<ProfilePreview />}><a href="/u/jane">@jane</a></HoverCard>`,
	},
	{
		id: "context-menu",
		name: "Context Menu",
		group: "Overlays & feedback",
		file: "context-menu.tsx",
		description:
			"Right-click menu for an area, opening at the pointer and flipping at screen edges. Shares Dropdown Menu's items, checkbox and radio items, keyboard and typeahead; Menu key or Shift+F10 opens it from the keyboard.",
		usage: `<ContextMenu><ContextMenuTrigger>…</ContextMenuTrigger><ContextMenuContent><ContextMenuItem onSelect={play}>Play</ContextMenuItem></ContextMenuContent></ContextMenu>`,
	},
	{
		id: "alert",
		name: "Alert",
		group: "Overlays & feedback",
		file: "alert.tsx",
		description:
			"Server-safe inline banner: tinted surface, colored icon, title, description and an optional action. Info, success, warning and destructive tones follow the accent and status tokens.",
		usage: `<Alert variant="warning" action={<Button size="sm" variant="outline">Renew</Button>}><AlertTitle>Token expires soon</AlertTitle><AlertDescription>Renew it to keep syncing.</AlertDescription></Alert>`,
	},
	{
		id: "progress",
		name: "Progress",
		group: "Overlays & feedback",
		file: "progress.tsx",
		description:
			"Accent bar that springs to each new value, with an optional label and percentage. Leave out value for an indeterminate sweep (static under reduced motion).",
		usage: `<Progress label="Uploading clip.mp4" value={progress} showValue />`,
	},
	{
		id: "dropdown-menu",
		name: "Dropdown Menu",
		group: "Overlays & feedback",
		file: "dropdown-menu.tsx",
		description:
			"Action menu anchored to a Button: items with icons and shortcuts, checkbox and radio items, labels, separators, destructive variant. Arrow keys, typeahead, focus follows the pointer, Esc returns focus.",
		usage: `<DropdownMenu><DropdownMenuTrigger variant="outline">Open</DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={edit} shortcut="⌘E">Edit</DropdownMenuItem></DropdownMenuContent></DropdownMenu>`,
	},
	{
		id: "drawer",
		name: "Drawer",
		group: "Overlays & feedback",
		file: "drawer.tsx",
		description:
			"Edge panel (left, right, top, bottom) that springs in and swipes away. Shares Dialog's focus trap, scroll lock and Esc handling. Sidebar uses it below md.",
		usage: `<Drawer><DrawerTrigger>Cart</DrawerTrigger><DrawerContent side="right"><DrawerHeader><DrawerTitle>Cart</DrawerTitle></DrawerHeader><DrawerBody>…</DrawerBody></DrawerContent></Drawer>`,
	},
	{
		id: "command",
		name: "Command",
		group: "Overlays & feedback",
		file: "command.tsx",
		description:
			"⌘K palette: filterable groups, arrow-key highlight, Enter to run, keyword matching. Inline or as CommandDialog with a global shortcut; the first Esc clears, the second closes.",
		usage: `<CommandDialog shortcut="mod+k"><CommandInput /><CommandList><CommandEmpty /><CommandGroup heading="Pages"><CommandItem onSelect={go}>Home</CommandItem></CommandGroup></CommandList></CommandDialog>`,
	},
	{
		id: "tabs",
		group: "Navigation",
		name: "Tabs",
		file: "tabs.tsx",
		description:
			"WAI-ARIA tabs with arrow, Home and End keys. One indicator springs between tabs, segmented or underline. Inactive panels stay in the DOM for SEO; the active one fades in.",
		usage: `<Tabs defaultValue="a"><TabsList aria-label="Views"><TabsTrigger value="a">A</TabsTrigger><TabsTrigger value="b">B</TabsTrigger></TabsList><TabsContent value="a">…</TabsContent><TabsContent value="b">…</TabsContent></Tabs>`,
	},
	{
		id: "kbd",
		group: "Data display",
		name: "Kbd",
		file: "kbd.tsx",
		description: "Server-safe key caps for shortcut hints. KbdGroup nests keys per the HTML spec.",
		usage: `<KbdGroup keys={["⌘", "K"]} />`,
	},
	{
		id: "separator",
		group: "Layout",
		name: "Separator",
		file: "separator.tsx",
		description:
			'Server-safe hairline, horizontal or vertical, decorative by default, with an optional centered label like "or".',
		usage: `<Separator label="or" />`,
	},
	{
		id: "meter",
		name: "Meter",
		group: "Data display",
		file: "meter.tsx",
		description:
			"Server-safe gauge for a value in a known range (storage, quota, server load, password strength). Colors by <meter> thresholds, or stacked segments with a legend like macOS storage.",
		usage: `<Meter label="Storage" valueText="71 GB of 100 GB" segments={[{ label: "Clips", value: 48 }, { label: "Backups", value: 14 }]} />`,
	},
	{
		id: "rating",
		name: "Rating",
		group: "Data display",
		file: "rating.tsx",
		description:
			"Star rating on native radios (arrow keys, forms) with hover preview, or readOnly display with fractional stars for averages.",
		usage: `<Rating value={stars} onValueChange={setStars} name="stars" /> · <Rating readOnly value={4.6} size="sm" />`,
	},
	{
		id: "relative-time",
		name: "Relative Time",
		group: "Data display",
		file: "relative-time.tsx",
		description:
			"Self-updating “5 minutes ago” in a semantic <time> with the full date as its title. Server renders the absolute date (no hydration mismatch); one shared ticker for the whole page.",
		usage: `<RelativeTime date={clip.createdAt} />`,
	},
	{
		id: "empty",
		name: "Empty",
		group: "Data display",
		file: "empty.tsx",
		description:
			"Server-safe empty state: icon tile, title, one helpful sentence and the next action. Bordered variant for empty lists and drop zones.",
		usage: `<Empty icon={<Film />} title="No clips yet" description="Upload your first clip."><Button size="sm">Upload</Button></Empty>`,
	},
	{
		id: "skeleton",
		group: "Data display",
		name: "Skeleton",
		file: "skeleton.tsx",
		description:
			'Server-safe loading placeholders that pulse (static under reduced motion). SkeletonGroup announces one "Loading" to screen readers.',
		usage: `<SkeletonGroup><Skeleton className="size-10 rounded-full" /><Skeleton className="h-4 w-32" /></SkeletonGroup>`,
	},
	{
		id: "typewriter",
		group: "Motion",
		name: "Typewriter",
		file: "typewriter.tsx",
		description:
			"Types out text character-by-character with optional phrase cycling and pulsing cursor. Full copy stays in the DOM for SEO.",
		usage: `<Typewriter text={["macOS precision.", "Delightful springs."]} speed={40} />`,
	},
	{
		id: "text-swap",
		group: "Motion",
		name: "TextSwap",
		file: "text-swap.tsx",
		description:
			"Spring-powered text morphing and ticker. Auto-cycles phrases or animates whenever children change with blur and slide transitions.",
		usage: `<TextSwap items={["Next.js 16", "Tailwind CSS 4", "motion 14"]} direction="up" />`,
	},
	{
		id: "table",
		group: "Data display",
		name: "Table",
		file: "table.tsx",
		description:
			"Server-safe semantic <table> in a scrolling card: header, body, footer and caption, Finder-style stripes, tinted selected rows, and sortable headers that set aria-sort and flip their arrow.",
		usage: `<Table striped><TableHeader><TableRow><TableHead sort="ascending" onSort={toggle}>Member</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>Jane</TableCell></TableRow></TableBody></Table>`,
	},
	{
		id: "data-table",
		group: "Data display",
		name: "Data Table",
		file: "data-table.tsx",
		description:
			"Table with columns as data: search across every column, sortable headers, checkbox selection that survives paging, a ⋯ menu per row, bulk actions in the toolbar and pagination. Built from Table, SearchInput, Checkbox, DropdownMenu, Pagination and Empty.",
		usage: `<DataTable label="Members" data={members} columns={[{ id: "name", header: "Member", accessor: (m) => m.name, sortable: true }]} getRowId={(m) => m.id} rowLabel={(m) => m.name} selectable rowActions={(m) => <DropdownMenuItem onSelect={() => kick(m)}>Kick</DropdownMenuItem>} />`,
	},
	{
		id: "attachment",
		group: "Actions & inputs",
		name: "Attachment & Dropzone",
		file: "attachment.tsx",
		description:
			"File chips with image thumbnails or type icons, size, a springing upload bar, error state and remove; the list springs chips in and closes the gap. FileDropzone wraps a real file input: click, keyboard and the native picker work, drop and paste are checked against accept and maxSize, and dropped files land in the input so forms and Server Actions receive them.",
		usage: `<FileDropzone name="clips" multiple accept="video/*" maxSize={50 * 1024 * 1024} onFiles={add} onReject={warn} /><AttachmentList>{files.map((f) => <Attachment key={f.id} name={f.name} size={f.size} type={f.type} progress={f.progress} onRemove={() => remove(f.id)} />)}</AttachmentList>`,
	},
	{
		id: "stepper",
		group: "Actions & inputs",
		name: "Stepper",
		file: "stepper.tsx",
		description:
			"Multi-step form (questionnaire, checkout, setup wizard). Steps stay mounted so values survive Back and submit together; Continue checks only the current step's native constraints, plus an optional async onNext guard with a spinner. Progress header with springing connectors; works with onSubmit or a Server Action.",
		usage: `<Stepper steps={[{ value: "server", title: "Server" }, { value: "bot", title: "Bot" }]} action={createBot}><StepperList /><StepperStep value="server"><Input name="serverId" required /></StepperStep><StepperStep value="bot">…</StepperStep><StepperFooter submitLabel="Create bot" /></Stepper>`,
	},
	{
		id: "calendar",
		group: "Actions & inputs",
		name: "Calendar",
		file: "calendar.tsx",
		description:
			"Month grid on the WAI-ARIA date-grid pattern: single date or range with a hover preview, min/max and custom disabled days, months that slide in from the direction of travel. Arrows, Home/End and PageUp/PageDown (+Shift for years). Hydration-safe: today is only marked in the browser.",
		usage: `<Calendar mode="range" value={range} onValueChange={setRange} min={today} isDisabled={(d) => d.getDay() === 0} />`,
	},
	{
		id: "date-picker",
		group: "Actions & inputs",
		name: "Date Picker",
		file: "date-picker.tsx",
		description:
			"Field-styled button that opens a Calendar in a Popover, focused on the picked day. Single or range, presets such as Last 7 days, closes once the pick is complete, and submits ISO dates through a hidden input. Works inside Field.",
		usage: `<Field label="Report period"><DatePicker mode="range" name="period" presets={[{ label: "Last 7 days", value: { from, to } }]} /></Field>`,
	},
	{
		id: "confirm",
		group: "Overlays & feedback",
		name: "Confirm",
		file: "confirm.tsx",
		description:
			"Promise-based confirm dialog called like toast: await confirm({ title, description, destructive }) resolves true or false. Built on Dialog's alert mode, Cancel takes the first focus, Esc cancels, one host mounted in the layout.",
		usage: `if (await confirm({ title: "Delete project?", description: "This cannot be undone.", destructive: true })) remove();`,
	},
	{
		id: "chart",
		group: "Data display",
		name: "Chart",
		file: "chart.tsx",
		description:
			"Line, area and bar (grouped or stacked) charts in SVG with a colorblind-validated eight-color palette that keeps each series' color. Crosshair tooltip listing every series, arrow-key readout, legend that hides series, direct end labels, a table view, and spring transitions between data.",
		usage: `<Chart type="line" label="Revenue by channel" data={rows} index="month" series={[{ key: "web", label: "Web" }, { key: "app", label: "App" }]} format={{ style: "currency", currency: "USD" }} />`,
	},
	{
		id: "carousel",
		group: "Data display",
		name: "Carousel",
		file: "carousel.tsx",
		description:
			"Native scroll-snap row, so touch, trackpad and no-JS scrolling just work, with spring-driven arrows, page dots, arrow keys and mouse drag that throws to the next snap point. APG carousel semantics: a labeled region of slides announced as 3 of 8.",
		usage: `<Carousel label="Projects"><CarouselContent className="sm:[--per-view:2]"><CarouselItem>…</CarouselItem></CarouselContent><CarouselPrevious /><CarouselNext /><CarouselDots /></Carousel>`,
	},
	{
		id: "marker",
		group: "Data display",
		name: "Marker",
		file: "marker.tsx",
		description:
			"Highlighter-pen <mark> in four tints that wraps cleanly across lines and can draw itself on, left to right, when it scrolls into view. Highlight marks every match of a search in a string, for transcripts and search results.",
		usage: `<p>Ship it <Marker draw color="green">today</Marker>.</p> · <Highlight text={line.text} query={search} />`,
	},
	{
		id: "code",
		group: "Data display",
		name: "Code",
		file: "code.tsx",
		description:
			"Shiki-highlighted code that follows light and dark through light-dark() token colors, as a block, an inline one-liner or a tabbed file panel. Line numbers (from any start line), tinted lines with an accent bar, <mark>ed words or column ranges, and per-line notes in a tooltip that keyboard users can tab to. Optional Prettier at display time; copy hands out exactly what is shown.",
		usage: `<Code code={src} language="ts" lineNumbers highlight={[[8, 13]]} marks={["t.Object"]} notes={{ 2: "Remember to add it: bun add @elysiajs/cors" }} />`,
	},
	{
		id: "terminal",
		group: "Data display",
		name: "Terminal",
		file: "terminal.tsx",
		description:
			"macOS terminal window. Snippet mode types install commands once scrolled into view, with the full transcript kept in the DOM for SEO and no-JS; log mode streams lines into a live region that follows the bottom unless you scroll up, then offers a jump back. Status lines carry glyphs, copy grabs the commands.",
		usage: `<Terminal typing lines={[{ kind: "command", text: "bun add motion" }, { kind: "success", text: "1 package installed" }]} />`,
	},
	{
		id: "timeline",
		group: "Data display",
		name: "Timeline",
		file: "timeline.tsx",
		description:
			"Server-safe ordered list of events on a rail: icon or dot markers with status colors, machine-readable <time>, title and an optional body. For changelogs, experience and mod logs.",
		usage: `<Timeline><TimelineItem icon={<Rocket />} variant="active" time="Oct 21" dateTime="2026-10-21" title="v0.3 released">Notes</TimelineItem></Timeline>`,
	},
	{
		id: "spinner",
		group: "Overlays & feedback",
		name: "Spinner",
		file: "spinner.tsx",
		description:
			"Server-safe macOS activity indicator: eight spokes in currentColor, three sizes, its own status label (or silent inside a parent that announces). Holds still under reduced motion.",
		usage: `<Spinner size="sm" label="Loading members" />`,
	},
	{
		id: "input-otp",
		group: "Actions & inputs",
		name: "Input OTP",
		file: "input-otp.tsx",
		description:
			"One-time code in separate slots, backed by one real input: paste and SMS autofill work, screen readers hear one field. Grouped slots, numeric or alphanumeric, characters spring in, onComplete to submit.",
		usage: `<InputOTP groups={[3, 3]} value={code} onValueChange={setCode} onComplete={verify} />`,
	},
	{
		id: "aspect-ratio",
		group: "Layout",
		name: "Aspect Ratio",
		file: "aspect-ratio.tsx",
		description:
			"Server-safe box locked to a ratio (16:9 thumbnails, 9:16 clips). A direct image or video child fills it with object-cover.",
		usage: `<AspectRatio ratio={9 / 16} className="rounded-xl"><img src={clip.thumb} alt={clip.title} /></AspectRatio>`,
	},
	{
		id: "combobox",
		group: "Actions & inputs",
		name: "Combobox",
		file: "combobox.tsx",
		description:
			"A Select you can type into: the query filters by label and keywords (prefix matches first), arrows move, Enter picks. multiple keeps the list open and shows picks as removable tags. Submits through hidden inputs.",
		usage: `<Combobox options={channels} value={channel} onValueChange={setChannel} placeholder="Pick a channel…" />`,
	},
	{
		id: "tag-input",
		group: "Actions & inputs",
		name: "Tag Input",
		file: "tag-input.tsx",
		description:
			"Free-form tags: Enter or a separator adds, Backspace removes the last, pasting a list adds them all. Duplicates, a max and a validate function keep bad tags in the input. One hidden input per tag.",
		usage: `<TagInput value={tags} onValueChange={setTags} max={5} validate={(t) => t.length <= 24} />`,
	},
	{
		id: "scroll-area",
		group: "Layout",
		name: "Scroll Area",
		file: "scroll-area.tsx",
		description:
			"macOS overlay scrollbars: thin thumbs that fade in while scrolling or on hover, widen under the pointer and drag. Scrolling stays native; the labeled region is keyboard-focusable.",
		usage: `<ScrollArea aria-label="Moderation log" className="h-64 rounded-xl border">…</ScrollArea>`,
	},
	{
		id: "resizable",
		group: "Layout",
		name: "Resizable",
		file: "resizable.tsx",
		description:
			"Split panes for admin layouts, docs and editors. Hairline dividers with a wide grab area follow the pointer; collapsible panels snap shut past half their minimum. Dividers are APG window splitters: arrows step, Home/End jump to the limits, Enter or double-click collapses with a spring. Groups nest.",
		usage: `<ResizablePanelGroup direction="horizontal"><ResizablePanel defaultSize={25} minSize={15} collapsible>…</ResizablePanel><ResizableHandle withHandle /><ResizablePanel>…</ResizablePanel></ResizablePanelGroup>`,
	},
	{
		id: "pricing",
		group: "Blocks",
		name: "Pricing",
		file: "blocks/pricing.tsx",
		description:
			"Plan cards with a monthly / yearly segmented switch. Prices roll on a spring in the direction they moved; the featured plan is outlined in the accent. Card, Badge, ToggleGroup, Button.",
		usage: `<Pricing yearlyNote="−20%" plans={[{ name: "Pro", price: { monthly: 9, yearly: 7 }, features: ["10 servers"], featured: true, badge: "Popular", cta: <Button className="w-full">Start trial</Button> }]} />`,
	},
	{
		id: "testimonial",
		group: "Blocks",
		name: "Testimonial",
		file: "blocks/testimonial.tsx",
		description:
			"A large Quote with its author, and everyone else who agrees as an overlapping AvatarGroup. Server-safe.",
		usage: `<Testimonial author="Jane Cooper" subtitle="Moderator" others={fans} othersLabel="and 2,400 others">We replaced three bots with one dashboard.</Testimonial>`,
	},
	{
		id: "stats-strip",
		group: "Blocks",
		name: "Stats Strip",
		file: "blocks/stats-strip.tsx",
		description:
			"Headline numbers, each card a <dl>: cards rise in turn with Reveal, then each number springs up with CountTo. Final values are in the HTML.",
		usage: `<StatsStrip stats={[{ label: "Servers", value: 1284, hint: "+32 this week" }, { label: "Revenue", value: 48290, prefix: "$" }]} />`,
	},
	{
		id: "product-card",
		group: "Blocks",
		name: "Product Card",
		file: "blocks/product-card.tsx",
		description:
			"Shop tile: photos in an AspectRatio (a swipeable Carousel with dots when there are several), sale price, Badge and add-to-cart Button.",
		usage: `<ProductCard name="Clip camera" price={279} compareAt={349} badge="−20%" media={[<img … />, <img … />]} onAddToCart={add} />`,
	},
	{
		id: "clip-card",
		group: "Blocks",
		name: "Clip Card",
		file: "blocks/clip-card.tsx",
		description:
			"Video tile: AspectRatio thumbnail (16:9 or 9:16), duration Badge, watched Progress along the bottom, and a ContextMenu of actions.",
		usage: `<ClipCard title="Insane 1v4 clutch" duration="0:42" watched={65} meta="12.4K views" actions={<ContextMenuItem onSelect={play}>Play</ContextMenuItem>} />`,
	},
	{
		id: "stat-tile",
		group: "Blocks",
		name: "Stat Tile",
		file: "blocks/stat-tile.tsx",
		description:
			"Admin dashboard metric: value, a delta Badge that is green when the change is good news (invert for errors and latency), and an area Chart of the trend. Server-safe.",
		usage: `<StatTile label="Revenue" value="$48,290" delta={12.5} period="vs last month" data={rows} index="month" format={{ style: "currency", currency: "USD" }} />`,
	},
	{
		id: "changelog",
		group: "Blocks",
		name: "Changelog",
		file: "blocks/changelog.tsx",
		description:
			"Release notes on a Timeline: newest release highlighted, changes typed New / Improved / Fixed with Badges, and a Kbd shortcut to try the headline feature. Server-safe.",
		usage: `<Changelog releases={[{ version: "v0.4", title: "Resizable", date: "Oct 24, 2026", dateTime: "2026-10-24", changes: [{ type: "new", text: "Split panes" }], shortcut: ["⌘", "K"] }]} />`,
	},
	{
		id: "newsletter",
		group: "Blocks",
		name: "Newsletter",
		file: "blocks/newsletter.tsx",
		description:
			"Email signup: InputGroup with the submit Button inside, native email validation, a loading → success toast and an in-place success state on the button.",
		usage: `<Newsletter title="Release notes" onSubscribe={(email) => subscribe(email)} />`,
	},
] as const;
