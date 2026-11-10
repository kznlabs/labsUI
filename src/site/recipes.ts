import type { Recipe } from "../../packages/cli/src/types";

/** A recipe as the site keeps it; `demo` means a reference build lives at `demoPath(id)`. */
type SiteRecipe = Omit<Recipe, "docs" | "demo"> & { demo?: boolean };

/** One command that adds every item a recipe uses. */
export const recipeInstall = (items: string[]) => `npx @kznlabs/labsui add ${items.join(" ")}`;

/**
 * Prompts for a whole app, each checked on a fresh Next 16 app (Cache Components on) with the
 * published CLI over MCP: the agent's build passed and its pages had no axe violations from
 * labsUI. The site's /recipes pages, the CLI's `search` and `view` and the MCP prompts all
 * read this list. `items` are what the checked run imported; `notes` cover what no single
 * item's docs say.
 */
export const recipes: SiteRecipe[] = [
	{
		id: "blog",
		title: "Blog",
		description:
			"A blog with a post list, long posts with highlighted code and a list of sections, and an about page.",
		prompt:
			'Using labsUI, build a security and engineering publication, all text in English. The home page has two speeds: a narrow "in brief" column of short dated news items (one or two lines each, a severity badge where it fits) next to the long reads, which are a typographic list (date, title, one-line summary), not a grid of cards. Long reads use a serif display font from `next/font` and a narrow reading column: reading time, a list of sections that follows the scroll on wide screens, code samples, a callout for "what to do now", footnotes in the margin on wide screens, a "part 2 of 3" series box and next/previous links at the end. An about page introduces the three authors. Warm off-white background, light first, sample data. Pick one accent preset that fits, not the default blue. Avoid a small label above every heading, a centered hero with two equal buttons, three equal feature cards and round numbers like 10,000+.',
		items: [
			"alert",
			"avatar",
			"badge",
			"button",
			"code",
			"dialog",
			"drawer",
			"navigation-menu",
			"pager",
			"prose",
			"site-footer",
			"site-header",
			"table-of-contents",
			"tabs",
			"theme-toggle",
			"tooltip",
		],
		notes: [
			{
				title: "Mark the current page in the header",
				body: "SiteHeader takes `current`; read it with `usePathname()` in a small client component in the root layout. Its links, like every block's, route on the client once the root layout wraps the app in `<LinkProvider component={Link}>`. On a dynamic route, list every slug in `generateStaticParams` and set `dynamicParams = false`: with Cache Components, Next 16.4 otherwise reports `usePathname()` outside `<Suspense>` for the unknown-slug shell, even with a boundary around the header.",
				code: `"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/blocks/site-header";

export function Header() {
  const pathname = usePathname();

  return (
    <SiteHeader
      brand={<Link href="/">Field Notes</Link>}
      nav={[
        { label: "Posts", href: "/" },
        { label: "About", href: "/about" },
      ]}
      current={pathname.startsWith("/posts") ? "/" : pathname}
    />
  );
}

// app/posts/[slug]/page.tsx
export const dynamicParams = false;`,
			},
			{
				title: "Highlight code on the server",
				body: 'Call `highlightCode()` from a `"use cache"` function and pass the result to Code as `tokens`, so the browser never loads Shiki. Under Cache Components a plain call fails the prerender.',
				code: `import { Code } from "@/components/ui/code";
import { highlightCode } from "@/lib/highlight";

async function highlight(code: string, language: string) {
  "use cache";
  return highlightCode(code, language);
}

export async function CodeBlock({ code, language }: { code: string; language: string }) {
  const tokens = await highlight(code, language);

  return <Code code={code} language={language} tokens={tokens ?? undefined} />;
}`,
			},
		],
		checked: { version: "0.2.3", model: "Claude Sonnet", date: "2026-11-09" },
		demo: true,
	},
	{
		id: "docs-site",
		title: "Documentation site",
		description:
			"Docs with side navigation, code samples, a list of sections per page, previous and next links and a table of a function's options.",
		prompt:
			'Using labsUI, build documentation for a small HTTP framework, all text in English, made for keyboard users. Top tabs split the product into Guide, API and Plugins; the side navigation has collapsible groups, each with its own small coloured icon. ⌘K searches every page. Pages have code samples with a TypeScript / JavaScript switch that changes every sample on the site and is remembered, and under the main example a mock browser pane showing what the request returns. A table lists a function\'s options; the list of sections sits on the right; previous and next links close the page, and a "copy page as Markdown" button sits by the title. Dense spacing, a monospace face for API headings, dark first, sample data. Pick one accent preset that fits, not the default blue. Avoid a small label above every heading, a centered hero with two equal buttons, three equal feature cards and round numbers like 10,000+.',
		items: [
			"app-window",
			"badge",
			"breadcrumb",
			"button",
			"code",
			"collapsible",
			"command",
			"dialog",
			"drawer",
			"field",
			"input",
			"label",
			"pager",
			"props-table",
			"prose",
			"search-input",
			"separator",
			"sidebar",
			"table",
			"table-of-contents",
			"tabs",
			"theme-toggle",
			"toast",
			"toggle-group",
			"tooltip",
			"kbd",
		],
		notes: [
			{
				title: "Current page from the route, not the URL",
				body: "Each page knows its own slug, so pass it to Sidebar's `current` from the server and skip `usePathname()`. Sidebar's links route on the client through the root's `LinkProvider`, so it needs no `onSelect`.",
				code: `"use client";

import { Sidebar, SidebarLayout } from "@/components/ui/sidebar";

export function DocsShell({ current, children }: { current: string; children: React.ReactNode }) {
  return (
    <SidebarLayout>
      <Sidebar groups={groups} current={current} />
      <main>{children}</main>
    </SidebarLayout>
  );
}`,
			},
			{
				title: "Highlight code on the server",
				body: 'Same as any page under Cache Components: `highlightCode()` inside a `"use cache"` function, its tokens passed to Code.',
			},
			{
				title: "A function's options",
				body: "PropsTable lists options as well as props: rename its first column with `labels`.",
				code: `<PropsTable label="createClient options" labels={{ name: "Option" }} rows={rows} />`,
			},
		],
		checked: { version: "0.2.3", model: "Claude Sonnet", date: "2026-11-09" },
		demo: true,
	},
	{
		id: "shop",
		title: "Shop",
		description:
			"A shop in euros with a product grid, a product page with photos and sizes, a cart and a checkout with shipping and payment options.",
		prompt:
			'Using labsUI, build a fashion store selling in EUR, all text in English. Make it read like a printed lookbook, not a template: one full-bleed campaign photo under a header that sits transparent over it and turns solid on scroll, small uppercase navigation with the sale link in red, generous white space, square corners (set `--radius` to 0) and no shadows. Above the product grid, a sticky row of filter chips (size, colour, price) and a switch between 2 and 4 columns. The grid runs edge to edge with tight gaps: 3:4 photos, name and price small underneath, the second photo on hover, colour dots. One item is on sale with the old price struck through, one is sold out. The product page stacks its photos in a tall scrolling column beside a sticky panel: sizes as a row of boxes with unavailable ones crossed out, a fit hint ("most buyers say it runs small"), "only 2 left" on low stock, a size guide in a drawer, add to bag (sticky at the bottom on phones) and a row of pieces that go with it. The bag slides in from the right; checkout is one quiet column with shipping and payment choices and free returns stated once. Use real CC0 product photos downloaded into `public/`, no brands or logos, sample data, no real payments. Pick one accent preset that fits, not the default blue. Avoid a small label above every heading, a centered hero with two equal buttons, three equal feature cards and round numbers like 10,000+.',
		items: [
			"aspect-ratio",
			"badge",
			"carousel",
			"cart",
			"checkbox",
			"dialog",
			"drawer",
			"field",
			"input",
			"input-group",
			"label",
			"native-select",
			"navigation-menu",
			"number-input",
			"popover",
			"radio-group",
			"rating",
			"toast",
			"toggle-group",
			"button",
		],
		demo: true,
		notes: [
			{
				title: "Cart state",
				body: "One client provider in the root layout holds the lines, and CartLine, CartList and OrderSummary render them in a Drawer and on the checkout. Save to `localStorage` after the first render, behind a `ready` flag, so the server HTML and the first client render match.",
				code: `"use client";

const CartContext = createContext<Cart | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem("cart") ?? "[]"));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem("cart", JSON.stringify(items));
  }, [items, ready]);

  // add, setQuantity, remove, clear …
}`,
			},
			{
				title: "Card headings follow the page",
				body: "ProductCard's name is an `h3` by default. Right under the page's `h1`, pass `as=\"h2\"` (or add an `h2` over the grid), or the outline skips a level.",
				code: `<ProductCard as="h2" name={product.name} price={product.price} media={photos} />`,
			},
			{
				title: "Photos",
				body: "Realistic photos need network access: the agent asks for it, or you put the files in `public/` yourself. Keep each photo's licence and source next to it, and check for logos before it ships.",
			},
			{
				title: "Where payment plugs in",
				body: "The checkout form's submit is the one place that talks to a payment provider. Swap the sample's pretend wait for a Server Action that recomputes the total from your own prices (never the client's), creates the payment and redirects to it.",
			},
			{
				title: "Prices in euros",
				body: 'Format with `Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" })`, or pass `currency="EUR"` and a `locale` to ProductCard, CartLine and OrderSummary.',
			},
		],
		checked: { version: "0.2.3", model: "Claude Sonnet", date: "2026-11-09" },
	},
	{
		id: "game-shop",
		title: "Game item shop",
		description:
			"A game server's store in euros: ranks for 30 days, 90 days or forever, cosmetics by category, the nickname that receives the order, payment options, server status, a community goal and top buyers.",
		prompt:
			'Using labsUI, build the store for a block-building game server, prices in EUR, all text in English. It should feel loud and playful like a game launcher, not a SaaS page: dark first, flat saturated colour blocks, square corners (set `--radius` to 0), a chunky display font from `next/font` for headings and uppercase navigation. Up top: the server address with a copy button as the main action, the live player count and a row of game-mode tiles (Survival, SkyBlock, BoxPvP); picking a mode scopes the shop. Below, category tabs: bundles, ranks for 30 days, 90 days or forever, coins and boosters. Products are big colour tiles with the item art filling them, a sale badge like −25% and the old price struck through. Coins are bought with a quantity slider that updates the price live. Before paying, a field for the in-game nickname that receives the order, then payment options, with a "send as a gift" switch that asks for a friend\'s nickname instead. Add a community goal bar, this week\'s top buyers and a feed of recent purchases ("Mira bought Knight · 2 min ago"). Draw item art as inline SVG pixel icons, no game logos or ripped textures; sample data, no real payments. Pick one accent preset that fits, not the default blue. Avoid a small label above every heading, a centered hero with two equal buttons, three equal feature cards and round numbers like 10,000+.',
		items: [
			"button",
			"field",
			"input",
			"label",
			"progress",
			"radio-group",
			"slider",
			"switch",
			"tabs",
			"toast",
		],
		demo: true,
		notes: [
			{
				title: "Ranks are periods",
				body: "Pricing takes any `periods`, so 30 days, 90 days and forever work like monthly and yearly. `cta` gets the picked period, so Buy adds the right price. Keep one rank per order: a new one replaces the old.",
				code: `<Pricing
  label="Rank duration"
  currency="EUR"
  locale="en-IE"
  periods={[
    { value: "30", label: "30 days", priceNote: "for 30 days" },
    { value: "90", label: "90 days", note: "Save 15%", priceNote: "for 90 days" },
    { value: "forever", label: "Forever", priceNote: "one payment" },
  ]}
  plans={ranks.map((rank) => ({
    ...rank,
    cta: (period) => <Button onClick={() => add(rank, period)}>Add {rank.name}</Button>,
  }))}
/>`,
			},
			{
				title: "Previews without game art",
				body: "Cosmetics have no photos you may use, so ProductCard's `media` takes a tinted tile with an icon instead of an `<img>`. Tint by rarity and the grid reads at a glance.",
			},
			{
				title: "The nickname is the address",
				body: 'Check it before payment: `pattern="[A-Za-z0-9_]{3,16}"` on the Input and an error on the Field when it fails. Look the name up on your server if you can, and warn (not block) when no one by that name has played.',
			},
			{
				title: "Where payment plugs in",
				body: "The order form's submit is the one place that talks to a payment provider. Recompute the total on the server from your own prices, and deliver the items from the provider's webhook, not from the browser.",
			},
		],
		checked: { version: "0.2.3", model: "Claude Sonnet", date: "2026-11-09" },
	},
	{
		id: "electronics",
		title: "Electronics store",
		description:
			"A store in euros for people who compare specs: prices shown against their 30-day low, a filtered category page, a compare drawer, a delivery promise and a step-by-step configure page.",
		prompt:
			'Using labsUI, build an electronics store selling in EUR, all text in English, for people who compare specs before they buy. A wide search bar with a category picker leads the header. Every price is honest: each product shows a small price history chart and its lowest price of the last 30 days, and a discount is only shown against that. The category page has a filter column (brand checkboxes with counts, a price range slider, in stock only) and products as rows with three key specs, rating, price, monthly instalments and add to cart; a compare checkbox collects up to four products into a side-by-side table that can show only the differences. Delivery is a promise with a time: "order in the next 2 h 14 min, arrives tomorrow". One laptop has a configure page that asks one question per step (size, chip, memory, storage) with the price and delivery date updating in a sticky summary. Light first, tight spacing, real CC0 photos downloaded into `public/`, no brands or logos, sample data, no real payments. Pick one accent preset that fits, not the default blue. Avoid a small label above every heading, a centered hero with two equal buttons, three equal feature cards and round numbers like 10,000+.',
		items: [
			"alert",
			"aspect-ratio",
			"badge",
			"breadcrumb",
			"button",
			"cart",
			"chart",
			"checkbox",
			"comparison-table",
			"confirm",
			"dialog",
			"drawer",
			"empty",
			"field",
			"input",
			"input-group",
			"label",
			"native-select",
			"navigation-menu",
			"number-input",
			"radio-group",
			"rating",
			"search-input",
			"select",
			"site-footer",
			"slider",
			"stepper",
			"switch",
			"table",
			"toast",
		],
		demo: true,
		notes: [
			{
				title: "Compare in a drawer",
				body: "ComparisonTable groups rows, pins the header and feature names, swaps to two pickers on a phone and has the differences switch built in. Keep the picked products in the page's state, show a tray while there are any, and open the table in a Drawer; `featured` tints one column.",
			},
			{
				title: "A discount is against the 30-day low",
				body: "Compute the lowest price of the 30 days before today from the same history rows the Chart draws, show a discount only when today's price is under it, and strike through that low, not a list price. A product whose price was raised and cut back then correctly shows none.",
			},
			{
				title: "One question per step",
				body: "Stepper keeps every step mounted and checks the step's native constraints on Continue, so the configure page is the steps plus a sticky summary that reads the same state: price, instalments and delivery date.",
			},
			{
				title: "A delivery promise has a clock",
				body: "Derive “order in the next 2 h 14 min” from a cut-off time and the visitor's clock after hydration, and skip days nothing ships; before the first client render show the cut-off, so the server HTML and the first render match.",
			},
		],
		checked: { version: "0.2.3", model: "Claude Sonnet", date: "2026-11-09" },
	},
	{
		id: "portfolio",
		title: "Portfolio",
		description:
			"A portfolio with an intro, a grid of projects, a page per project and a contact form.",
		prompt:
			"Using labsUI, build the portfolio of one freelance product designer and engineer, all text in English, prices in EUR. On wide screens a sticky left column holds the name set very large in an expressive display font from `next/font`, one sentence on what they do and a section nav that follows the scroll; the right column scrolls: a short about, experience as dated rows that highlight on hover with tags, and projects as rows with the client, the year and one outcome number, each with its own page. End with a contact form (topic, budget as choice cards, message). One strong accent, real CC0 photos downloaded into `public/`, sample data. Pick one accent preset that fits, not the default blue. Avoid a small label above every heading, a centered hero with two equal buttons, three equal feature cards and round numbers like 10,000+.",
		items: [
			"aspect-ratio",
			"badge",
			"breadcrumb",
			"button",
			"field",
			"input",
			"label",
			"native-select",
			"pager",
			"radio-group",
			"textarea",
			"toast",
		],
		demo: true,
		notes: [
			{
				title: "Projects as cards",
				body: "PostCard fits a project as well as a post: cover, meta line, title, summary and tags, the whole card one link.",
			},
			{
				title: "A contact form without a backend",
				body: "Field wraps each control with its label and error; native `required` and `type=email` validate. The sample answers with `toast.success()`; point the submit at a Server Action or your form service to send for real.",
			},
		],
		checked: { version: "0.2.3", model: "Claude Sonnet", date: "2026-11-09" },
	},
	{
		id: "admin-panel",
		title: "Admin panel",
		description:
			"A store admin in euros: a sidebar, orders with search, a status filter and row selection, a drawer that edits one order, a confirmation before deleting and a message after each change.",
		prompt:
			"Using labsUI, build an admin panel for a small online store, prices in EUR, all text in English: a sidebar for navigation, a table of orders with search, a status filter and row selection, a drawer that opens one order and edits it, a confirmation before deleting, and a message after each change. Use sample data.",
		items: [
			"sidebar",
			"data-table",
			"drawer",
			"dropdown-menu",
			"field",
			"input",
			"select",
			"badge",
			"button",
			"confirm",
			"toast",
		],
		demo: true,
		notes: [
			{
				title: "Open a row from its first cell",
				body: "DataTable rows don't take a click, so the order number's `cell` is a button that opens the drawer, and the ⋯ menu (`rowActions`) holds the rest. Search, sort, paging and selection keep working around it.",
				code: `const columns: DataTableColumn<Order>[] = [
  {
    id: "id",
    header: "Order",
    accessor: (order) => order.id,
    cell: (order) => (
      <button type="button" onClick={() => setOpen(order.id)}>
        {order.id}
      </button>
    ),
  },
  // …
];`,
			},
			{
				title: "Filter before the table",
				body: "DataTable's search covers every column; a status filter narrows `data` before it goes in. A ToggleGroup with a count per status shows what each filter holds, and the same state lets other screens open the list pre-filtered.",
			},
			{
				title: "Confirm, then offer Undo",
				body: "`await confirm({ destructive: true })` before deleting, then a toast whose `action` puts the rows back. Keep the removed rows, not a copy of the whole list, so changes made since stay.",
				code: `if (!(await confirm({ title: \`Delete \${ids.length} orders?\`, destructive: true }))) return;

const removed = orders.filter((order) => ids.includes(order.id));

setOrders((current) => current.filter((order) => !ids.includes(order.id)));
toast.success("Orders deleted", {
  action: { label: "Undo", onClick: () => setOrders((current) => [...current, ...removed]) },
});`,
			},
			{
				title: "A sidebar under a sticky bar",
				body: "Without `href`, Sidebar items are buttons and `onSelect` gets their `id`, so one page can switch views. Under a sticky top bar, give the Sidebar `sticky top-12 h-[calc(100dvh-3rem)]` and the layout `items-start`; below `md` it is a drawer that SidebarTrigger opens.",
			},
			{
				title: "Where saving plugs in",
				body: "The drawer's form submit is the one place that writes. Point it at a Server Action, check the fields on the server again (a tracking number needs the carrier's format), and refresh the list from what it returns.",
			},
		],
		checked: { version: "0.2.1", model: "Claude Sonnet", date: "2026-11-07" },
	},
	{
		id: "analytics",
		title: "Analytics dashboard",
		description:
			"A store dashboard in euros: key figures that count up with their change, revenue over time, a date range with day, week and month, and a table of top products.",
		prompt:
			"Using labsUI, build an analytics dashboard for a small online store, amounts in EUR, all text in English: key figures that count up with their change since the last period, a chart of revenue over time, a date range picker and a switch between day, week and month, and a table of top products. Use sample data.",
		items: ["card", "count-to", "badge", "chart", "date-picker", "field", "toggle-group", "table"],
		demo: true,
		notes: [
			{
				title: "A counting figure in a StatTile",
				body: "StatTile's `value` takes a node, so a CountTo goes straight in, and the tile adds the change Badge and a trend chart from the same rows as the big chart. To spring from the last number when the range changes, not from zero, keep the shown number and pass it as `from`.",
				code: `function Counter({ to }: { to: number }) {
  const [shown, setShown] = useState({ from: 0, to });

  if (shown.to !== to) setShown({ from: shown.to, to });

  return <CountTo from={shown.from} to={to} prefix="€" locale="en-IE" />;
}

<StatTile
  label="Revenue"
  value={<Counter to={revenue} />}
  delta={change(revenue, previousRevenue)}
  period="vs the 30 days before"
  data={rows}
  dataKey="revenue"
  format={{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }}
/>`,
			},
			{
				title: "Compare with the period before",
				body: "Take the same number of days right before the range, and put each bucket's earlier twin on the same row as a second series: Chart's tooltip then lists both, and its legend can hide either. Keep every figure's change on that one rule, so tiles, channels and products agree.",
			},
			{
				title: "Day, week and month that fit the range",
				body: "Disable a ToggleGroupItem that doesn't fit (day bars past three months, one month bar), and when a new range rules out the current one, switch to the nearest that fits. DatePicker `presets` cover the common ranges; `min` and `max` keep it to days that have data.",
			},
			{
				title: "Dates without time zones",
				body: "DatePicker hands out local midnights. Turn them into a day key with `Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())` and format labels with `timeZone: \"UTC\"`, so a visitor west of the data's zone doesn't see every bucket a day early.",
			},
			{
				title: "Where real data plugs in",
				body: "Fetch totals per day for the range and the period before in a Server Component or a route handler, and bucket on the server for long ranges. A live panel that updates by itself needs a pause (WCAG 2.2.2).",
			},
		],
		checked: { version: "0.2.1", model: "Claude Sonnet", date: "2026-11-07" },
	},
	{
		id: "saas-landing",
		title: "SaaS landing",
		description:
			"A landing page for a software product in euros: hero, features, customer quotes, plans with monthly and yearly billing, an FAQ, a newsletter and a footer.",
		prompt:
			'Using labsUI, build a landing page for an uptime monitor for small web agencies, prices in EUR, all text in English. The page is the product: the hero is a working mini demo, a status board of five client sites with response-time charts, and a "simulate an outage" button that turns one site red, raises an alert toast and writes the incident onto a public status page beside it. The headline says exactly what it does, set large in a serif display font from `next/font`; one primary button and a text link. Then tell one story in three alternating rows (the outage at 3 a.m., the alert, the page the client reads), pricing with a monthly and yearly switch and a slider for the number of monitors that shows the exact bill, a short "not for you if" list, one quote from a named customer, the last three changelog entries with dates, an FAQ and a footer with a wide brand column. Light first, sample data. Pick one accent preset that fits, not the default blue. Avoid a small label above every heading, a centered hero with two equal buttons, three equal feature cards and round numbers like 10,000+.',
		items: [
			"accordion",
			"badge",
			"button",
			"changelog",
			"chart",
			"field",
			"label",
			"quote",
			"slider",
			"table",
			"theme-toggle",
			"timeline",
			"toast",
			"toggle-group",
		],
		demo: true,
		notes: [
			{
				title: "Hero brings its own room",
				body: "Hero centers itself at `max-w-7xl` with its own padding, so a wrapper with more padding doubles the gap above the title (the checked run had about 160 px of empty space under the header). Pass `className` to Hero instead, and let `media` hold the product: a screenshot, or a live window that moves needs a pause (WCAG 2.2.2).",
			},
			{
				title: "One period for every plan",
				body: "Pricing keeps one period for all its plans and rolls each price when it changes. Keep `priceNote` to “/ month” in both periods (a free plan shares it, and “€0 billed yearly” reads oddly), let the period's `note` say what it gives in words that hold for every plan (“2 months free”), and show the yearly total beside the plans. `cta` can be a function of the period, so a trial button knows what was picked.",
				code: `<Pricing
  currency="EUR"
  locale="en-IE"
  periods={[
    { value: "monthly", label: "Monthly", priceNote: "/ month" },
    { value: "yearly", label: "Yearly", note: "2 months free", priceNote: "/ month" },
  ]}
  plans={plans.map((plan) => ({
    ...plan,
    cta: (period) => <Button onClick={() => startTrial(plan.id, period)}>Start 14-day trial</Button>,
  }))}
/>`,
			},
			{
				title: "A plan that follows the visitor",
				body: "`featured` and `badge` are plain props, so they can come from state: a Slider for how many seats or monitors someone needs can mark the smallest plan that fits as “Best fit”, and a ComparisonTable under a Collapsible holds every feature without making the page longer.",
			},
			{
				title: "Signup and newsletter without a backend",
				body: "A plan's button can open a Dialog with Field-wrapped email and name inputs; the sample answers with a toast. Newsletter's `onSubscribe` returns a promise: a rejection's message becomes the error toast, so a Server Action that throws “Already subscribed” needs no extra UI.",
			},
		],
		checked: { version: "0.2.3", model: "Claude Sonnet", date: "2026-11-09" },
	},
];
