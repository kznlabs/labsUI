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
- [ ] Animation smoothness has only been checked in DOM and computed styles. Needs an eye pass in a real browser.
- [x] Run `bun run build` once the dev server is stopped, to confirm the production build. (Built successfully with Next.js Turbopack).

## Components backlog (shadcn-based, reworked for labsUI)

Reuse existing primitives inside new ones (AvatarGroup uses Avatar, and so on). Each gets a demo, a registry entry, snippets and a CLAUDE.md line.

### Navigation and layout

- [ ] Sidebar
- [x] Breadcrumb (`src/components/ui/breadcrumb.tsx`)
- [ ] Menu bar
- [ ] Pagination
- [x] Button group (`src/components/ui/button-group.tsx`)
- [ ] Collapsible

### Typography and motion

- [x] Typewriter (`src/components/ui/typewriter.tsx`): character-by-character typing with multi-phrase cycling, cursor, SEO, no-JS fallback.
- [x] Text swap (`src/components/ui/text-swap.tsx`): spring-powered ticker and morphing text with direction and blur transitions.
- [x] Quote typewriter & textSwap integration (`src/components/ui/quote.tsx`).

### Forms and inputs

- [ ] Checkbox
- [ ] Radio
- [ ] Input group (addons, prefix/suffix inside the input)
- [ ] OTP (one-time code, segmented)
- [ ] Combobox
- [ ] Date picker
- [ ] Field (label, control, description, error as one unit)
- [ ] Questionnaire (multi-step form with progress)

### Overlays and feedback

- [ ] Context menu
- [ ] Dropdown menu
- [ ] Drawer
- [ ] Hover card (tooltip)
- [ ] Command (⌘K palette)
- [ ] KBD (keyboard keys)
- [ ] Empty state

### Data and media

- [ ] Data table
- [ ] Calendar
- [ ] Carousel
- [ ] Chart (uses the `dataviz` palette)
- [ ] Attachment (file chip with preview and remove)
- [ ] Terminal (prompt, streamed output, copy)
- [ ] Marker (highlighted text span)

### Code (extend `Code` / `CodePanel`)

- [ ] Line numbers
- [ ] Highlight whole lines (with a color bar)
- [ ] Highlight words or ranges inside a line
- [ ] Line tooltips on hover (e.g. "remember to add it")
- [ ] Snippet library entries for Elysia.js

### Fixes and polish

- [ ] Avatar group: check the sizes and ring weight in both themes after the reduction.

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

### Compositions to build on top

- **Pricing card:** Card + Badge + Toggle group (monthly/yearly) + Button.
- **Testimonial:** Quote + AvatarGroup.
- **Stats strip:** CountTo + Card + Reveal.
- **Product card:** Aspect ratio + Carousel + Badge + Button.
- **Clip card:** Aspect ratio + Badge (duration) + Progress + Context menu.
- **Admin stat tile:** Card + Chart + Badge (delta).
- **Changelog entry:** Timeline + Badge + Kbd.
- **Newsletter:** Input group + Button + Toast.
