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
			"Using labsUI, build a blog: a home page listing posts, a post page with long text, code samples and a list of its sections, and an about page. Use sample data.",
		items: [
			"site-header",
			"site-footer",
			"post-card",
			"prose",
			"code",
			"table-of-contents",
			"pager",
			"breadcrumb",
			"badge",
			"avatar",
			"timeline",
			"theme-toggle",
		],
		notes: [
			{
				title: "Mark the current page in the header",
				body: "SiteHeader takes `current`; read it with `usePathname()` in a small client component in the root layout, and route its plain links with `onNavigate`. On a dynamic route, list every slug in `generateStaticParams` and set `dynamicParams = false`: with Cache Components, Next 16.4 otherwise reports `usePathname()` outside `<Suspense>` for the unknown-slug shell, even with a boundary around the header.",
				code: `"use client";

import { usePathname, useRouter } from "next/navigation";
import { SiteHeader } from "@/components/blocks/site-header";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SiteHeader
      brand={<a href="/">Field Notes</a>}
      nav={[
        { label: "Posts", href: "/" },
        { label: "About", href: "/about" },
      ]}
      current={pathname.startsWith("/posts") ? "/" : pathname}
      onNavigate={(href, event) => {
        event.preventDefault();
        router.push(href);
      }}
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
		checked: { version: "0.2.1", model: "Claude Opus", date: "2026-11-07" },
	},
	{
		id: "docs-site",
		title: "Documentation site",
		description:
			"Docs with side navigation, code samples, a list of sections per page, previous and next links and a table of a function's options.",
		prompt:
			"Using labsUI, build a documentation site: side navigation, pages with code samples, a list of sections on each page, previous and next links, and a table of a function's options. Use sample data.",
		items: [
			"sidebar",
			"prose",
			"code",
			"table-of-contents",
			"pager",
			"props-table",
			"breadcrumb",
			"theme-toggle",
		],
		notes: [
			{
				title: "Current page from the route, not the URL",
				body: "Each page knows its own slug, so pass it to Sidebar's `current` from the server and skip `usePathname()`. Sidebar's links are plain; `onSelect` gets a link's href as its id and hands it to the router.",
				code: `"use client";

import { useRouter } from "next/navigation";
import { Sidebar, SidebarLayout } from "@/components/ui/sidebar";

export function DocsShell({ current, children }: { current: string; children: React.ReactNode }) {
  const router = useRouter();

  return (
    <SidebarLayout>
      <Sidebar
        groups={groups}
        current={current}
        onSelect={(id, event) => {
          event.preventDefault();
          router.push(id);
        }}
      />
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
		checked: { version: "0.2.1", model: "Claude Opus", date: "2026-11-07" },
	},
	{
		id: "shop",
		title: "Shop",
		description:
			"A shop in euros with a product grid, a product page with photos and sizes, a cart and a checkout with shipping and payment options.",
		prompt:
			"Using labsUI, build a shop selling in EUR, all text in English: a product grid with one item on sale and one sold out, a product page with several realistic product photos (no brand logos) and a size choice, a cart, and a checkout with shipping and payment options. Use sample data, no real payments.",
		items: [
			"site-header",
			"site-footer",
			"product-card",
			"product-gallery",
			"cart",
			"radio-group",
			"field",
			"input",
			"native-select",
			"alert",
			"badge",
			"breadcrumb",
			"empty",
			"rating",
			"separator",
			"skeleton",
			"toast",
			"theme-toggle",
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
		checked: { version: "0.2.1", model: "Claude Sonnet", date: "2026-11-07" },
	},
	{
		id: "laptop-comparison",
		title: "Product comparison",
		description:
			"Four laptops compared feature by feature in groups, with pickers on a phone and a switch that shows only the differences.",
		prompt:
			"Using labsUI, build a page comparing four laptops feature by feature, grouped by category, that also works on a phone and can show only the differences. Use sample data.",
		items: ["comparison-table", "button"],
		demo: true,
		notes: [
			{
				title: "One block does it",
				body: "ComparisonTable groups rows, pins the header and feature names, swaps to two pickers on a phone and has the differences switch built in. The page only passes items and groups; `featured` tints one column.",
			},
		],
		checked: { version: "0.2.1", model: "Claude Sonnet", date: "2026-11-07" },
	},
	{
		id: "portfolio",
		title: "Portfolio",
		description:
			"A portfolio with an intro, a grid of projects, a page per project and a contact form.",
		prompt:
			"Using labsUI, build a portfolio: an intro, a grid of projects, a project page and a contact form. Use sample data.",
		items: [
			"hero",
			"post-card",
			"site-header",
			"site-footer",
			"field",
			"input",
			"textarea",
			"native-select",
			"button",
			"toast",
			"breadcrumb",
			"pager",
			"badge",
			"aspect-ratio",
			"theme-toggle",
		],
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
		checked: { version: "0.2.1", model: "Claude Sonnet", date: "2026-11-07" },
	},
];
