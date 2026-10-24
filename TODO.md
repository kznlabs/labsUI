# labsUI backlog

Components and fixes to build. Order is rough priority.

## Components

- [x] **AvatarGroup**: stacked avatars from a list. Pass 10 users, show 4 and a `+6` overflow chip.
  - Overlapping avatars with a ring in the background color.
  - Hover enlarges the hovered avatar and its neighbors slightly, on `spring`.
  - `max` prop, `size` (sm / default / lg), optional tooltip with the name.
  - Built on `Avatar`.
- [x] **Quote**: semantic quote block.
  - `<figure>` / `<blockquote>` / `<figcaption>`, with optional author, role and `Avatar`.
  - Variants: plain, card (`Card` surface), large (display text with an accent mark).

## Done

- [x] AvatarGroup (`src/components/ui/avatar-group.tsx`) and Quote (`src/components/ui/quote.tsx`).
- [x] Theme toggle: outline variant, circular, concentric inside the pill.
- [x] Custom scrollbars: thin, token-colored, webkit fallback (`src/app/globals.css`).
- [x] **Code**: Shiki highlighting (dual theme via CSS variables), `block` and `inline` variants, copy button with in-place "Copied" feedback. Showcase footers and chat `CodeBlock` use it.
- [x] Window tabs indicator: one spring-animated pill behind the labels, replacing the `layoutId` pill that jumped above the old tab.

## Known gaps

- [x] `Reveal` and `CountTo` render invisible or `$0` without JS. Added `<noscript>` and `@media (scripting: none)` fallback styles (`data-reveal`, `data-count-to-animated`, `data-count-to-fallback`).
- [ ] Animation smoothness: Resizable (drag, keys, collapse), Pricing price roll and AvatarGroup hover checked in headless Chromium, with no errors on a full scroll in both themes. Frame-level smoothness (Carousel, Pagination, Menubar, Tabs pill) still needs a human eye on real hardware.
- [x] Run `bun run build` once the dev server is stopped, to confirm the production build. (Built successfully with Next.js Turbopack).

## Components backlog (shadcn-based, reworked for labsUI)

Reuse existing primitives inside new ones (AvatarGroup uses Avatar, and so on). Each gets a demo, a registry entry, snippets and a CLAUDE.md line.

### Navigation and layout

- [x] Sidebar (`src/components/ui/sidebar.tsx`): icon-rail collapse, ⌘B. Below md it renders as a left Drawer.
- [x] Breadcrumb (`src/components/ui/breadcrumb.tsx`)
- [x] Menu bar (`src/components/ui/menubar.tsx`): menubar pattern, hover-switch, ← →, sliding highlight, DropdownMenu items
- [x] Pagination (`src/components/ui/pagination.tsx`): sliding active pill, numbers swipe by direction (`pagination-motion.tsx`)
- [x] Button group (`src/components/ui/button-group.tsx`)
- [x] Collapsible (`src/components/ui/collapsible.tsx`)

- [x] Tabs (`src/components/ui/tabs.tsx`): real tablist semantics; supersedes SegmentedTabs for content switching.
- [x] Separator (`src/components/ui/separator.tsx`), Skeleton (`src/components/ui/skeleton.tsx`)

### Typography and motion

- [x] Typewriter (`src/components/ui/typewriter.tsx`): character-by-character typing with multi-phrase cycling, cursor, SEO, no-JS fallback.
- [x] Text swap (`src/components/ui/text-swap.tsx`): spring-powered ticker and morphing text with direction and blur transitions.
- [x] Quote typewriter & textSwap integration (`src/components/ui/quote.tsx`).

### Forms and inputs

- [x] Select (`src/components/ui/select.tsx`)
- [x] Native select + optgroup, Number input, Textarea showCount, `:user-invalid` validation styles
- [x] Meter, Rating, Relative time (non-shadcn)
- [x] Slider (`slider.tsx`, single or range) and Toggle group (`toggle-group.tsx`, segmented single/multiple)
- [x] Checkbox (`src/components/ui/checkbox.tsx`)
- [x] Radio group (`src/components/ui/radio-group.tsx`)
- [x] Search input (`src/components/ui/search-input.tsx`): icon, clear, Esc, focus shortcut.
- [x] Input group (`src/components/ui/input-group.tsx`)
- [x] OTP (`src/components/ui/input-otp.tsx`): one real input under the slots, paste + SMS autofill
- [x] Combobox (`src/components/ui/combobox.tsx`): single or multiple (tags)
- [x] Date picker (`src/components/ui/date-picker.tsx`): single/range, presets, ISO form value, Field-aware
- [x] Field (`src/components/ui/field.tsx`): auto-wires ids/ARIA into controls
- [x] Questionnaire → Stepper (`src/components/ui/stepper.tsx`): per-step native validation, async guards, progress header, Server Action ready

### Overlays and feedback

- [x] Context menu (`src/components/ui/context-menu.tsx`): reuses Dropdown items
- [x] Dropdown menu (`src/components/ui/dropdown-menu.tsx`)
- [x] Drawer (`src/components/ui/drawer.tsx`); Sidebar uses it below md.
- [x] Hover card, Tooltip, Popover (`hover-card.tsx`, `tooltip.tsx`, `popover.tsx`)
- [x] Command (`src/components/ui/command.tsx`): inline + CommandDialog; site header palette.
- [x] KBD (`src/components/ui/kbd.tsx`)
- [x] Empty state (`src/components/ui/empty.tsx`), Alert (`alert.tsx`), Progress (`progress.tsx`)

### Data and media

- [x] Table (`src/components/ui/table.tsx`): server-safe, striped, sortable headers, selected rows
- [x] Tag input (`tag-input.tsx`), Scroll area (`scroll-area.tsx`)
- [x] Timeline (`src/components/ui/timeline.tsx`), Spinner (`spinner.tsx`), Aspect ratio (`aspect-ratio.tsx`)
- [x] Data table (`src/components/ui/data-table.tsx`): search, sort, selection across pages, row ⋯ menu, bulk toolbar, pagination
- [x] Calendar (`src/components/ui/calendar.tsx`): APG grid, range + hover preview, min/max/isDisabled, sliding months
- [x] Carousel (`src/components/ui/carousel.tsx`): native scroll-snap + spring buttons/dots/keys/mouse drag, APG semantics
- [x] Chart (`src/components/ui/chart.tsx`): line/area/bar (grouped, stacked), `--chart-1…8` validated palette, tooltip, legend toggle, table view
- [x] Attachment + FileDropzone (`src/components/ui/attachment.tsx`): previews, progress, errors, accept/maxSize, form-ready drops
- [x] Terminal (`src/components/ui/terminal.tsx`): typed snippets, streamed log that follows the bottom, glyph statuses, copy
- [x] Marker (`src/components/ui/marker.tsx`): highlighter <mark>, draw-on sweep, Highlight for search hits
- [x] Resizable (`src/components/ui/resizable.tsx`): split panes, APG window splitter, collapsible panels, nested groups, `onLayout` for persistence

### Code (extend `Code` / `CodePanel`)

- [x] Line numbers (`lineNumbers`, or a start number for excerpts)
- [x] Highlight whole lines (`highlight`, tint + primary bar)
- [x] Highlight words or ranges inside a line (`marks`, real `<mark>`)
- [x] Line tooltips on hover (`notes`, Tooltip, keyboard-focusable)
- [x] Snippet library entries for Elysia.js (Code demo + `code` snippets)

### Fixes and polish

- [x] Avatar group: checked in both themes (Playwright). Cut-out ring now `ring-card`, overlap scales with size, `+N` chip matches the avatars, hovered avatar lifts above its neighbors.
- [x] Accessibility (axe-core, all 8 accents × light/dark): WCAG AA contrast via fill + `*-ink` tokens, Rating stars no longer focusable-but-hidden, Progress `aria-label`, Chart off-screen table not a scroller, GitHub AA code themes. Remaining axe notes are gallery-only (duplicate Breadcrumb/Pagination landmarks, Sidebar `<aside>` inside `main`).
- [x] Favicon (`src/app/icon.tsx`): traffic lights on a card tile, generated like the OG image; `/favicon.ico` no longer 404s.
- [x] Chart: y-axis ticks use as many decimals as they need (0.25% read "0.3%").
- [x] Resizable: panels register through the DOM instead of `child.type` checks (broke under Fast Refresh and Server Component parents); float slack on collapse.

## Build order by use case

Legend: **P** portfolio, **B** blog, **S** shop, **A** Discord bot site + admin panel, **C** clips list, **D** usage-example docs.
Components that appear in several projects go first.

| Component                  | P   | B   | S   | A   | C   | D   | Notes                                                |
| -------------------------- | --- | --- | --- | --- | --- | --- | ---------------------------------------------------- |
| Tabs                       | ✓   |     | ✓   | ✓   |     | ✓   | Project filters, admin sections, code/preview switch |
| Sidebar                    |     | ✓   |     | ✓   |     | ✓   | Admin navigation, docs navigation                    |
| Breadcrumb                 |     | ✓   | ✓   | ✓   |     | ✓   | Path trails                                          |
| Table                      |     |     | ✓   | ✓   |     |     | Orders, guild members, moderation log                |
| Data table                 |     |     | ✓   | ✓   | ✓   |     | Sort, filter, pagination, row actions                |
| Pagination                 |     | ✓   | ✓   | ✓   | ✓   |     |
| Command (⌘K)               | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | Search across posts, products, commands, clips       |
| Dropdown menu              |     |     | ✓   | ✓   | ✓   |     | Row and account actions                              |
| Context menu               |     |     |     | ✓   | ✓   |     | Right-click on clips and messages                    |
| Sheet / Drawer             |     | ✓   | ✓   | ✓   |     |     | Mobile nav, cart, edit panels                        |
| Dialog / Alert dialog      | ✓   |     | ✓   | ✓   | ✓   |     | Quick view, confirm destructive actions              |
| Select                     |     |     | ✓   | ✓   | ✓   |     | Sort, role pickers                                   |
| Combobox                   |     |     | ✓   | ✓   | ✓   |     | Tag and user search                                  |
| Input group                |     | ✓   | ✓   | ✓   | ✓   |     | Search fields with icons, quantity, URL prefix       |
| Form / Field               | ✓   | ✓   | ✓   | ✓   |     |     | Labels, descriptions and errors for every form       |
| Input OTP                  |     |     | ✓   | ✓   |     |     | Checkout codes, admin 2FA                            |
| Checkbox / Radio group     |     |     | ✓   | ✓   | ✓   | ✓   | Filters, permission sets, multi-select clips         |
| Slider                     |     |     | ✓   | ✓   | ✓   |     | Price range, volume and scrub                        |
| Toggle / Toggle group      | ✓   |     | ✓   |     | ✓   | ✓   | Filters, view mode, playback speed                   |
| Calendar / Date picker     |     |     | ✓   | ✓   |     |     | Delivery date, scheduled announcements               |
| Progress                   |     |     |     | ✓   | ✓   |     | Upload and seek progress                             |
| Skeleton                   | ✓   | ✓   | ✓   | ✓   | ✓   |     | Loading states for every list                        |
| Spinner                    |     |     |     | ✓   |     |     | Inline and button loading                            |
| Empty                      |     |     | ✓   | ✓   | ✓   |     | Empty cart, no clips, no logs                        |
| Alert                      |     | ✓   | ✓   | ✓   |     | ✓   | Banners and warnings                                 |
| Toast (have)               | ✓   | ✓   | ✓   | ✓   | ✓   |     | Already in place                                     |
| Tooltip / Hover card       | ✓   |     | ✓   | ✓   | ✓   |     | Tech badges, product and user previews               |
| Popover                    |     |     | ✓   | ✓   |     |     | Filter panels, emoji and user pickers                |
| Carousel                   | ✓   |     | ✓   |     | ✓   |     | Project and product galleries, clip previews         |
| Aspect ratio               | ✓   | ✓   | ✓   |     | ✓   |     | Thumbnails, 9:16 clips                               |
| Scroll area                |     | ✓   |     | ✓   |     | ✓   | Bot logs, code blocks, long lists                    |
| Separator                  | ✓   | ✓   | ✓   | ✓   |     | ✓   |                                                      |
| Kbd                        |     |     |     | ✓   | ✓   | ✓   | Shortcut hints                                       |
| Chart                      | ✓   |     | ✓   | ✓   | ✓   |     | Revenue, command usage, clip views                   |
| Resizable                  |     |     |     | ✓   |     | ✓   | Admin split panes, docs layout                       |
| Collapsible                |     | ✓   |     | ✓   |     | ✓   | Channel groups, FAQ                                  |
| Stepper (Questionnaire)    |     |     | ✓   | ✓   |     |     | Checkout, bot setup wizard                           |
| Timeline                   | ✓   | ✓   |     | ✓   |     |     | Experience, changelog, mod log                       |
| Rating                     |     | ✓   | ✓   |     |     |     | Reviews                                              |
| Tag input                  |     | ✓   | ✓   | ✓   | ✓   |     | Post tags, product tags, clip tags                   |
| File dropzone / Attachment |     | ✓   | ✓   | ✓   | ✓   |     | Uploads, clip files                                  |
| Menubar / Navigation menu  | ✓   | ✓   | ✓   |     |     | ✓   | Top navigation                                       |
| Terminal                   |     |     |     | ✓   |     | ✓   | Bot logs, install snippets                           |
| Marker                     |     | ✓   |     |     | ✓   |     | Transcript and text highlight                        |

### Compositions (`src/components/blocks/`, registry group "Blocks")

- [x] **Pricing card:** Card + Badge + Toggle group (monthly/yearly) + Button.
- [x] **Testimonial:** Quote + AvatarGroup.
- [x] **Stats strip:** CountTo + Card + Reveal.
- [x] **Product card:** Aspect ratio + Carousel + Badge + Button.
- [x] **Clip card:** Aspect ratio + Badge (duration) + Progress + Context menu.
- [x] **Admin stat tile:** Card + Chart + Badge (delta).
- [x] **Changelog entry:** Timeline + Badge + Kbd.
- [x] **Newsletter:** Input group + Button + Toast.
