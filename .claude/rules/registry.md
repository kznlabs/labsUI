---
paths:
  - "src/components/**"
  - "src/site/**"
  - "src/app/**"
---

# Component index

Import from `@/components/ui/<file>` or `@/components/blocks/<file>`. This index
says what exists and what the props don't tell you. Exact props, types and
examples are in `public/components/<id>.md` (written by `bun run registry`) or
`labsui view <id>`; each entry starts with its `id`.

## Actions and inputs

- `button`: Button. `buttonVariants()` styles an `<a>`, also on the server.
- `button-group`: ButtonGroup.
- `forms`: Input, Textarea, Label, Switch. Textarea grows by itself, so cap it
  with `max-h-*`; its counter warns near the limit.
- `field`: Field. Controls wire `id` and `aria-*` through `useFieldControl()`.
- `input-group`: InputGroup, InputGroupAddon. Server-safe.
- `search-input`: SearchInput. Esc clears; its shortcut steps aside if the input
  is hidden or focused.
- `checkbox`: Checkbox.
- `radio-group`: RadioGroup, RadioGroupItem.
- `slider`: Slider. Native range underneath; two values make a range.
- `toggle-group`: ToggleGroup, ToggleGroupItem.
- `native-select`: NativeSelect, NativeSelectGroup, NativeSelectOption. A real
  `<select>`, with base-select styling where supported.
- `number-input`: NumberInput.
- `select`: Select. Takes `options`, not children.
- `combobox`: Combobox. A typeable Select; `multiple` makes the value `string[]`
  and shows picks as tags.
- `tag-input`: TagInput. ← walks the tags, Delete removes. Also exports Tag,
  `tagFieldClass`, `useTagKeys()`.
- `input-otp`: InputOTP. One real input with `autocomplete="one-time-code"`;
  `verified` turns the characters into checks, then one mark, read-only.
- `attachment`: FileDropzone, AttachmentList, Attachment, `formatBytes()`. A real
  file input: drops land in it, so forms and Server Actions work.
- `stepper`: Stepper, StepperList, StepperStep, StepperFooter. A `<form>`; steps
  stay mounted and Continue checks the step's native constraints.
- `calendar`: Calendar. APG date grid; today is marked client-only, so hydration
  stays safe.
- `date-picker`: DatePicker. Popover + Calendar; submits ISO `2026-10-21` or
  `from/to`; works in Field.
- `theme-toggle`: ThemeToggle.
- `accent-picker`: AccentPicker. `setAccent()` is in `@/lib/theme`.

## Navigation

- `menubar`: Menubar, MenubarMenu, MenubarTrigger, MenubarContent. Same items as
  DropdownMenu as `Menubar*` aliases; one open at a time, hover switches, ← →
  walk the bar.
- `navigation-menu`: NavigationMenu and its parts. Site nav (disclosure, not
  `role="menu"`); one shared viewport morphs between panels; closed panels stay
  in the HTML.
- `breadcrumb`: Breadcrumb. Server-safe; the last item is the current page.
- `pagination`: Pagination, `pageRange()`. Server-safe as links with `href`,
  buttons with `onPageChange`.
- `sidebar`: SidebarLayout, Sidebar, SidebarTrigger. ⌘B toggles the icon rail;
  below `md` it is a left Drawer; an item's `id` defaults to `href`, else label.
- `tabs`: Tabs, TabsList, TabsTrigger, TabsContent. Panels stay in the DOM.

## Layout

- `card`: Card and its parts. `CardTitle as` sets the heading level.
- `accordion`: Accordion, AccordionItem, AccordionTrigger, AccordionContent.
- `app-window`: AppWindow, SegmentedTabs. SegmentedTabs is compact title-bar nav
  (`aria-current`), not a tablist.
- `collapsible`: Collapsible, CollapsibleTrigger, CollapsibleContent.
- `separator`: Separator. Server-safe.
- `prose`: Prose. Server-safe; styles direct-child tags only, so embedded
  components keep their look. Wide `pre` and `table` scroll by keyboard too.
- `aspect-ratio`: AspectRatio. Server-safe; a direct img/video child fills it.
- `scroll-area`: ScrollArea. Overlay thumbs over native scroll; horizontal takes
  the mouse wheel.
- `resizable`: ResizablePanelGroup, ResizablePanel, ResizableHandle. Panels and
  handles are direct children; sizes in %; APG splitter keys, Enter or double
  click collapses; groups nest.

## Data display

- `badge`: Badge.
- `avatar`: Avatar.
- `avatar-group`: AvatarGroup.
- `chat`: MessageBubble.
- `quote`: Quote. Sample quotes are famous Polish poetry in public-domain English
  translation, verified verbatim.
- `kbd`: Kbd, KbdGroup. Server-safe.
- `meter`: Meter. Server-safe.
- `rating`: Rating.
- `relative-time`: RelativeTime. Updates itself; SSR shows the absolute date.
- `empty`: Empty. Server-safe.
- `skeleton`: SkeletonGroup, Skeleton. Server-safe.
- `table`: Table and its parts. Server-safe; `onSort` only from client parents.
- `data-table`: DataTable. Client-side search, sort, select and paging; columns
  typed `DataTableColumn<T>`.
- `chart`: Chart. Tokens `chart-1…8` (fixed order, CVD-validated, at most 8
  series); legend hides series, crosshair tooltip, arrow keys, table view.
- `carousel`: Carousel and its parts. Native scroll-snap.
- `marker`: Marker, Highlight. Render `<mark>`; `draw` sweeps on in view.
- `code`: Code, CodePanel. `format` = Prettier defaults at display, lazy-loaded;
  `tokens` from `highlightCode()` (`@/lib/highlight`, server or build) keep Shiki
  out of the browser; line refs are the shown numbers.
- `terminal`: Terminal. `typing` = install snippet; `log` = live, follows bottom.
- `timeline`: Timeline, TimelineItem. Server-safe.

## Overlays and feedback

- `useDisclosure()` from `@/lib/use-disclosure` spreads onto Dialog, Drawer,
  Popover or DropdownMenu: `{...d.props}`, plus `d.show()`, `d.hide()`,
  `d.toggle()`, `d.open`.
- `dialog`: Dialog and its parts.
- `confirm`: `await confirm({ … })`, Confirmer. Resolves false on cancel or Esc;
  `<Confirmer />` is mounted in the layout.
- `toast`: `toast()`, `.success|error|info|loading`, `.promise`, `.dismiss`,
  Toaster (mounted). Action toasts wait for the user; F8 focuses the newest with
  an action, else the newest.
- `popover`: Popover, PopoverTrigger, PopoverContent.
- `tooltip`: Tooltip. One focusable child, wrapped in a span, so use ButtonGroup
  `attached={false}`.
- `hover-card`: HoverCard.
- `context-menu`: ContextMenu and its parts. Same items as DropdownMenu; opens at
  the pointer, Shift+F10 from the keyboard.
- `alert`: Alert, AlertTitle, AlertDescription. Server-safe.
- `progress`: Progress. No `value` = indeterminate.
- `dropdown-menu`: DropdownMenu and its parts.
- `drawer`: Drawer and its parts. Swipe to dismiss.
- `command`: CommandDialog, or inline Command, and their parts.
- `spinner`: Spinner. Server-safe; `label=""` when a parent announces.

## Motion

- `cursor`: CustomCursor. Opt-in; off on touch and reduced motion.
- `count-to`: CountTo. Springs up once in view.
- `reveal`: Reveal. Fades and rises on scroll.
- `typewriter`: Typewriter.
- `text-swap`: TextSwap. `controls` make the text a pause button (WCAG 2.2.2)
  that takes no room and hides with reduced motion.

## Blocks

- `pricing`: Pricing. PlanCards plus a switcher over any `periods`; `cta` can be
  a function of the period; a plan without a price for a period hides.
- `plan-card`: PlanCard, PlanGrid. Server-safe, no state. `lowestPrice` shows
  only when passed, never a computed percentage.
- `testimonial`: Testimonial. Server-safe.
- `stats-strip`: StatsStrip. Server-safe; Reveal + CountTo.
- `product-card`: ProductCard. 2+ media become a Carousel.
- `clip-card`: ClipCard.
- `stat-tile`: StatTile. Server-safe.
- `changelog`: Changelog. Server-safe.
- `newsletter`: Newsletter. A rejection's message becomes an error toast.
- `site-header`: SiteHeader. Sticky; NavigationMenu from `md`, right Drawer below,
  hairline on scroll.
- `site-footer`: SiteFooter. Server-safe; `onNavigate` only from client parents.
  Layout follows its container.
- `hero`: Hero. Server-safe, no entrance motion; `as="h2"` when the page already
  has an `h1`. Layout follows its container.
