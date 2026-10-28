import { Compass, Layers, LayoutGrid, MousePointerClick, Sparkles, Table2 } from "lucide-react";
import type { ReactNode } from "react";
import { componentPath, groupPath, withBase } from "@/site/config";
import { Demo } from "@/site/demo";
import { sectionFiles, tokensFor } from "@/site/prebuilt";
import { type Entry, groups, registry } from "@/site/registry";
import { ApiReference } from "@/site/showcase/api-reference";
import { installCommand } from "@/site/static-code";

/**
 * Per-demo stage options. `replay`: entrance/one-shot animations only. `tabs`: tall demos get a
 * Preview / Code switch, the rest show code below.
 */
const demos: Record<
	string,
	{ node: ReactNode; preview?: string; replay?: boolean; tabs?: boolean }
> = {
	button: { node: <Demo name="ButtonDemo" />, tabs: true },
	badge: { node: <Demo name="BadgeDemo" /> },
	forms: { node: <Demo name="FormDemo" />, tabs: true },
	card: { node: <Demo name="CardDemo" /> },
	avatar: { node: <Demo name="AvatarDemo" /> },
	accordion: { node: <Demo name="AccordionDemo" />, preview: "items-start" },
	chat: { node: <Demo name="ChatDemo" />, preview: "p-3 sm:p-8", replay: true, tabs: true },
	dialog: { node: <Demo name="DialogDemo" /> },
	toast: { node: <Demo name="ToastDemo" /> },
	"app-window": { node: <Demo name="WindowDemo" />, preview: "p-3 sm:p-8" },
	"theme-toggle": { node: <Demo name="ThemeDemo" /> },
	cursor: { node: <Demo name="CursorDemo" /> },
	"count-to": { node: <Demo name="CountToDemo" />, replay: true },
	"avatar-group": { node: <Demo name="AvatarGroupDemo" /> },
	quote: { node: <Demo name="QuoteDemo" />, replay: true, tabs: true },
	reveal: { node: <Demo name="RevealDemo" />, replay: true },
	menubar: { node: <Demo name="MenubarDemo" />, preview: "items-start" },
	"navigation-menu": {
		node: <Demo name="NavigationMenuDemo" />,
		preview: "items-start",
		tabs: true,
	},
	breadcrumb: { node: <Demo name="BreadcrumbDemo" /> },
	"button-group": { node: <Demo name="ButtonGroupDemo" /> },
	collapsible: { node: <Demo name="CollapsibleDemo" /> },
	pagination: { node: <Demo name="PaginationDemo" /> },
	sidebar: { node: <Demo name="SidebarDemo" />, preview: "p-3 sm:p-8", tabs: true },
	"accent-picker": { node: <Demo name="AccentPickerDemo" /> },
	"search-input": { node: <Demo name="SearchInputDemo" />, preview: "items-start", tabs: true },
	field: { node: <Demo name="FieldDemo" />, preview: "items-start", tabs: true },
	"input-group": { node: <Demo name="InputGroupDemo" /> },
	checkbox: { node: <Demo name="CheckboxDemo" /> },
	"radio-group": { node: <Demo name="RadioGroupDemo" /> },
	slider: { node: <Demo name="SliderDemo" /> },
	"toggle-group": { node: <Demo name="ToggleGroupDemo" /> },
	"native-select": { node: <Demo name="NativeSelectDemo" />, tabs: true },
	"number-input": { node: <Demo name="NumberInputDemo" /> },
	meter: { node: <Demo name="MeterDemo" />, tabs: true },
	rating: { node: <Demo name="RatingDemo" /> },
	"relative-time": { node: <Demo name="RelativeTimeDemo" /> },
	select: { node: <Demo name="SelectDemo" /> },
	popover: { node: <Demo name="PopoverDemo" /> },
	tooltip: { node: <Demo name="TooltipDemo" /> },
	"hover-card": { node: <Demo name="HoverCardDemo" /> },
	"context-menu": { node: <Demo name="ContextMenuDemo" /> },
	alert: { node: <Demo name="AlertDemo" /> },
	progress: { node: <Demo name="ProgressDemo" /> },
	empty: { node: <Demo name="EmptyDemo" /> },
	"dropdown-menu": { node: <Demo name="DropdownMenuDemo" /> },
	drawer: { node: <Demo name="DrawerDemo" /> },
	command: { node: <Demo name="CommandDemo" />, preview: "items-start", tabs: true },
	tabs: { node: <Demo name="TabsDemo" />, preview: "items-start" },
	kbd: { node: <Demo name="KbdDemo" /> },
	separator: { node: <Demo name="SeparatorDemo" /> },
	skeleton: { node: <Demo name="SkeletonDemo" /> },
	typewriter: { node: <Demo name="TypewriterDemo" />, replay: true },
	"text-swap": { node: <Demo name="TextSwapDemo" /> },
	table: { node: <Demo name="TableDemo" />, tabs: true },
	"data-table": { node: <Demo name="DataTableDemo" />, preview: "items-start", tabs: true },
	confirm: { node: <Demo name="ConfirmDemo" /> },
	chart: { node: <Demo name="ChartDemo" />, preview: "items-start", tabs: true },
	carousel: { node: <Demo name="CarouselDemo" /> },
	marker: { node: <Demo name="MarkerDemo" />, preview: "items-start" },
	code: { node: <Demo name="CodeDemo" />, preview: "items-start" },
	terminal: { node: <Demo name="TerminalDemo" />, preview: "items-start", tabs: true },
	timeline: { node: <Demo name="TimelineDemo" />, preview: "items-start", tabs: true },
	spinner: { node: <Demo name="SpinnerDemo" /> },
	"input-otp": { node: <Demo name="InputOTPDemo" />, preview: "items-start", tabs: true },
	"aspect-ratio": { node: <Demo name="AspectRatioDemo" /> },
	combobox: { node: <Demo name="ComboboxDemo" />, preview: "items-start" },
	attachment: { node: <Demo name="AttachmentDemo" />, preview: "items-start" },
	stepper: { node: <Demo name="StepperDemo" />, preview: "items-start" },
	calendar: { node: <Demo name="CalendarDemo" />, preview: "items-start" },
	"date-picker": { node: <Demo name="DatePickerDemo" />, preview: "items-start" },
	"tag-input": { node: <Demo name="TagInputDemo" />, preview: "items-start" },
	"scroll-area": { node: <Demo name="ScrollAreaDemo" />, tabs: true },
	resizable: { node: <Demo name="ResizableDemo" />, tabs: true },
	pricing: { node: <Demo name="PricingDemo" />, preview: "items-start" },
	testimonial: { node: <Demo name="TestimonialDemo" /> },
	"stats-strip": { node: <Demo name="StatsStripDemo" /> },
	"product-card": { node: <Demo name="ProductCardDemo" /> },
	"clip-card": { node: <Demo name="ClipCardDemo" /> },
	"stat-tile": { node: <Demo name="StatTileDemo" /> },
	changelog: { node: <Demo name="ChangelogDemo" />, preview: "items-start" },
	newsletter: { node: <Demo name="NewsletterDemo" /> },
	"site-header": { node: <Demo name="SiteHeaderDemo" />, preview: "p-3 sm:p-8", tabs: true },
};

/** Registry entries in group order: the nav and the page read top to bottom the same way. */
export const nav = groups.map((label) => ({
	label,
	items: registry
		.filter((entry) => entry.group === label)
		.map(({ id, name, description }) => ({ id, name, description })),
}));
export const ordered = groups.flatMap((label) => registry.filter((entry) => entry.group === label));

const groupIcons: Record<(typeof groups)[number], ReactNode> = {
	"Actions & inputs": <MousePointerClick />,
	Navigation: <Compass />,
	Layout: <LayoutGrid />,
	"Data display": <Table2 />,
	"Overlays & feedback": <Layers />,
	Motion: <Sparkles />,
	Blocks: null,
};

/** Everything ShowcaseSection needs for one registry entry, in the gallery or on its own page. */
export const sectionProps = (entry: Entry, page = false) => ({
	id: entry.id,
	name: entry.name,
	description: entry.description,
	// Formatted and highlighted at build time (scripts/format-snippets.ts), no Prettier or Shiki in
	// the browser.
	files: sectionFiles(entry.id),
	install: installCommand(entry.file),
	installTokens: tokensFor(installCommand(entry.file), "bash"),
	api: (
		<ApiReference
			files={entry.file.split("·").map((file) => file.trim())}
			label={entry.name}
			page={page}
		/>
	),
	previewClassName: demos[entry.id].preview,
	replay: demos[entry.id].replay,
	layout: demos[entry.id].tabs ? ("tabs" as const) : ("stacked" as const),
	children: demos[entry.id].node,
});

/** Header nav: groups jump to their place in the gallery, blocks open their own pages. */
export const headerNav = [
	{ label: "Get started", href: withBase("/#getting-started") },
	{
		label: "Components",
		items: nav
			.filter((group) => group.label !== "Blocks")
			.map((group) => ({
				title: group.label,
				href: withBase(groupPath(group.label)),
				icon: groupIcons[group.label],
				description: `${group.items.length} components`,
			})),
	},
	{
		label: "Blocks",
		items: registry
			.filter((entry) => entry.group === "Blocks")
			.map((entry) => ({
				title: entry.name,
				href: withBase(componentPath(entry.id)),
				description: entry.description,
			})),
	},
	{ label: "llms.txt", href: withBase("/llms.txt") },
];

/**
 * The homepage's showcase: compositions where several components work together, each linking to
 * its own page. `wide` takes both columns.
 */
export const showcase = (
	[
		["newsletter"],
		["forms"],
		["pricing", true],
		["data-table", true],
		["command"],
		["stat-tile"],
		["date-picker"],
		["stepper"],
	] as const
).flatMap(([id, wide]) => {
	const entry = registry.find((entry) => entry.id === id);
	const demo = demos[id];

	return entry && demo ? [{ entry, demo, wide: wide === true }] : [];
});
