import type { ReactNode } from "react";
import { StructuredData } from "@/components/seo/structured-data";
import {
	AccentPickerDemo,
	KbdDemo,
	SearchInputDemo,
	SeparatorDemo,
	SkeletonDemo,
	TabsDemo,
} from "@/components/showcase/basics-demos";
import {
	ChangelogDemo,
	ClipCardDemo,
	NewsletterDemo,
	PricingDemo,
	ProductCardDemo,
	StatsStripDemo,
	StatTileDemo,
	TestimonialDemo,
} from "@/components/showcase/block-demos";
import { ChatDemo } from "@/components/showcase/chat-demo";
import { CommandDemo, SiteCommand } from "@/components/showcase/command-demo";
import { ComponentNav } from "@/components/showcase/component-nav";
import { SliderDemo, ToggleGroupDemo } from "@/components/showcase/control-demos";
import {
	AspectRatioDemo,
	CarouselDemo,
	ChartDemo,
	CodeDemo,
	DataTableDemo,
	InputOTPDemo,
	MarkerDemo,
	SpinnerDemo,
	TableDemo,
	TerminalDemo,
	TimelineDemo,
} from "@/components/showcase/data-demos";
import {
	AccordionDemo,
	AvatarDemo,
	AvatarGroupDemo,
	BadgeDemo,
	BreadcrumbDemo,
	ButtonDemo,
	ButtonGroupDemo,
	CardDemo,
	CollapsibleDemo,
	CountToDemo,
	CursorDemo,
	FormDemo,
	PaginationDemo,
	QuoteDemo,
	RevealDemo,
	TextSwapDemo,
	ThemeDemo,
	TypewriterDemo,
} from "@/components/showcase/demos";
import {
	AlertDemo,
	ContextMenuDemo,
	EmptyDemo,
	ProgressDemo,
} from "@/components/showcase/feedback-demos";
import { HoverCardDemo, PopoverDemo, TooltipDemo } from "@/components/showcase/floating-demos";
import {
	AttachmentDemo,
	CheckboxDemo,
	FieldDemo,
	InputGroupDemo,
	RadioGroupDemo,
	StepperDemo,
} from "@/components/showcase/form-demos";
import {
	DrawerDemo,
	DropdownMenuDemo,
	MenubarDemo,
	SelectDemo,
} from "@/components/showcase/menu-demos";
import {
	MeterDemo,
	NativeSelectDemo,
	NumberInputDemo,
	RatingDemo,
	RelativeTimeDemo,
} from "@/components/showcase/native-demos";
import { ConfirmDemo, DialogDemo, ToastDemo } from "@/components/showcase/overlay-demos";
import {
	CalendarDemo,
	ComboboxDemo,
	DatePickerDemo,
	ResizableDemo,
	ScrollAreaDemo,
	TagInputDemo,
} from "@/components/showcase/picker-demos";
import { ShowcaseNoResults, ShowcaseSection } from "@/components/showcase/section";
import { SidebarDemo } from "@/components/showcase/sidebar-demo";
import { WindowDemo } from "@/components/showcase/window-demo";
import { AccentPicker } from "@/components/ui/accent-picker";
import { Badge } from "@/components/ui/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ButtonGroup } from "@/components/ui/button-group";
import { buttonVariants } from "@/components/ui/button-variants";
import { TextSwap } from "@/components/ui/text-swap";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { groups, registry } from "@/lib/registry";
import { ComponentFilterProvider } from "@/lib/showcase-context";
import { site } from "@/lib/site";
import { snippets } from "@/lib/snippets";

/**
 * Per-demo stage options. `replay`: entrance/one-shot animations only. `tabs`: tall demos get a
 * Preview / Code switch; the rest show code below.
 */
const demos: Record<
	string,
	{ node: ReactNode; preview?: string; replay?: boolean; tabs?: boolean }
> = {
	button: { node: <ButtonDemo />, tabs: true },
	badge: { node: <BadgeDemo /> },
	forms: { node: <FormDemo />, tabs: true },
	card: { node: <CardDemo /> },
	avatar: { node: <AvatarDemo /> },
	accordion: { node: <AccordionDemo />, preview: "items-start" },
	chat: { node: <ChatDemo />, preview: "p-3 sm:p-8", replay: true, tabs: true },
	dialog: { node: <DialogDemo /> },
	toast: { node: <ToastDemo /> },
	"mac-window": { node: <WindowDemo />, preview: "p-3 sm:p-8" },
	"theme-toggle": { node: <ThemeDemo /> },
	cursor: { node: <CursorDemo /> },
	"count-to": { node: <CountToDemo />, replay: true },
	"avatar-group": { node: <AvatarGroupDemo /> },
	quote: { node: <QuoteDemo />, replay: true, tabs: true },
	reveal: { node: <RevealDemo />, replay: true },
	menubar: { node: <MenubarDemo />, preview: "items-start" },
	breadcrumb: { node: <BreadcrumbDemo /> },
	"button-group": { node: <ButtonGroupDemo /> },
	collapsible: { node: <CollapsibleDemo /> },
	pagination: { node: <PaginationDemo /> },
	sidebar: { node: <SidebarDemo />, preview: "p-3 sm:p-8", tabs: true },
	"accent-picker": { node: <AccentPickerDemo /> },
	"search-input": { node: <SearchInputDemo />, preview: "items-start", tabs: true },
	field: { node: <FieldDemo />, preview: "items-start", tabs: true },
	"input-group": { node: <InputGroupDemo /> },
	checkbox: { node: <CheckboxDemo /> },
	"radio-group": { node: <RadioGroupDemo /> },
	slider: { node: <SliderDemo /> },
	"toggle-group": { node: <ToggleGroupDemo /> },
	"native-select": { node: <NativeSelectDemo />, tabs: true },
	"number-input": { node: <NumberInputDemo /> },
	meter: { node: <MeterDemo />, tabs: true },
	rating: { node: <RatingDemo /> },
	"relative-time": { node: <RelativeTimeDemo /> },
	select: { node: <SelectDemo /> },
	popover: { node: <PopoverDemo /> },
	tooltip: { node: <TooltipDemo /> },
	"hover-card": { node: <HoverCardDemo /> },
	"context-menu": { node: <ContextMenuDemo /> },
	alert: { node: <AlertDemo /> },
	progress: { node: <ProgressDemo /> },
	empty: { node: <EmptyDemo /> },
	"dropdown-menu": { node: <DropdownMenuDemo /> },
	drawer: { node: <DrawerDemo /> },
	command: { node: <CommandDemo />, preview: "items-start", tabs: true },
	tabs: { node: <TabsDemo />, preview: "items-start" },
	kbd: { node: <KbdDemo /> },
	separator: { node: <SeparatorDemo /> },
	skeleton: { node: <SkeletonDemo /> },
	typewriter: { node: <TypewriterDemo />, replay: true },
	"text-swap": { node: <TextSwapDemo /> },
	table: { node: <TableDemo />, tabs: true },
	"data-table": { node: <DataTableDemo />, preview: "items-start", tabs: true },
	confirm: { node: <ConfirmDemo /> },
	chart: { node: <ChartDemo />, preview: "items-start", tabs: true },
	carousel: { node: <CarouselDemo /> },
	marker: { node: <MarkerDemo />, preview: "items-start" },
	code: { node: <CodeDemo />, preview: "items-start" },
	terminal: { node: <TerminalDemo />, preview: "items-start", tabs: true },
	timeline: { node: <TimelineDemo />, preview: "items-start", tabs: true },
	spinner: { node: <SpinnerDemo /> },
	"input-otp": { node: <InputOTPDemo />, preview: "items-start", tabs: true },
	"aspect-ratio": { node: <AspectRatioDemo /> },
	combobox: { node: <ComboboxDemo />, preview: "items-start" },
	attachment: { node: <AttachmentDemo />, preview: "items-start" },
	stepper: { node: <StepperDemo />, preview: "items-start" },
	calendar: { node: <CalendarDemo />, preview: "items-start" },
	"date-picker": { node: <DatePickerDemo />, preview: "items-start" },
	"tag-input": { node: <TagInputDemo />, preview: "items-start" },
	"scroll-area": { node: <ScrollAreaDemo />, tabs: true },
	resizable: { node: <ResizableDemo />, tabs: true },
	pricing: { node: <PricingDemo />, preview: "items-start" },
	testimonial: { node: <TestimonialDemo /> },
	"stats-strip": { node: <StatsStripDemo /> },
	"product-card": { node: <ProductCardDemo /> },
	"clip-card": { node: <ClipCardDemo /> },
	"stat-tile": { node: <StatTileDemo /> },
	changelog: { node: <ChangelogDemo />, preview: "items-start" },
	newsletter: { node: <NewsletterDemo /> },
};

/** Registry entries in group order: the nav and the page read top to bottom the same way. */
const nav = groups.map((label) => ({
	label,
	items: registry
		.filter((c) => c.group === label)
		.map(({ id, name, description }) => ({ id, name, description })),
}));
const ordered = groups.flatMap((g) => registry.filter((c) => c.group === g));

export default function Home() {
	return (
		<>
			<StructuredData />

			<header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl backdrop-saturate-150">
				<nav
					aria-label="Primary"
					className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6"
				>
					<a href="/" className="flex items-center gap-2 font-semibold text-sm">
						<span className="flex gap-1" aria-hidden="true">
							<span className="size-2.5 rounded-full bg-mac-red" />
							<span className="size-2.5 rounded-full bg-mac-yellow" />
							<span className="size-2.5 rounded-full bg-mac-green" />
						</span>
						{site.name}
					</a>
					<Badge variant="secondary" shape="pill" className="hidden sm:inline-flex">
						v0.1
					</Badge>
					<div className="ml-auto flex items-center gap-2">
						<AccentPicker className="hidden md:flex" />
						<SiteCommand />
						<ButtonGroup attached className="hidden sm:flex">
							<a href="/llms.txt" className={buttonVariants({ variant: "outline", size: "sm" })}>
								llms.txt
							</a>
						</ButtonGroup>
						<ThemeToggle />
					</div>
				</nav>
			</header>

			<ComponentFilterProvider groups={nav}>
				<div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
					<aside className="hidden lg:block">
						<div className="sticky top-24">
							<ComponentNav />
						</div>
					</aside>

					<main className="flex min-w-0 flex-col">
						<header className="flex flex-col gap-4 pt-2 pb-12 lg:pt-6">
							<Breadcrumb>
								<BreadcrumbList>
									<BreadcrumbItem>
										<BreadcrumbLink href="/">Home</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator />
									<BreadcrumbItem>
										<BreadcrumbLink href="#breadcrumb">Design System</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator />
									<BreadcrumbItem>
										<BreadcrumbPage>Components</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
							<h1 className="font-semibold text-4xl tracking-tight sm:text-6xl">{site.name}</h1>
							<p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
								{site.description}
							</p>
							<div className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
								<span>Featuring</span>
								<span className="font-semibold text-foreground">
									<TextSwap
										items={[
											"one spring physics system",
											"macOS window chrome with glassmorphism",
											"Shiki dual-theme syntax highlighting",
											"typewriter and spring text swap effects",
											"shadcn-style modular primitives",
										]}
										interval={3200}
										direction="up"
									/>
								</span>
							</div>
							<ul className="flex flex-wrap gap-2" aria-label="Tech stack">
								{[
									"Next.js 16",
									"React 19",
									"Tailwind CSS 4",
									"motion 14",
									"lucide-react",
									"Bun",
								].map((t) => (
									<li key={t}>
										<Badge variant="outline" shape="pill">
											{t}
										</Badge>
									</li>
								))}
							</ul>
						</header>

						{ordered.map((c) => (
							<ShowcaseSection
								key={c.id}
								{...c}
								files={snippets[c.id] ?? [{ name: c.file, code: c.usage }]}
								previewClassName={demos[c.id].preview}
								replay={demos[c.id].replay}
								layout={demos[c.id].tabs ? "tabs" : "stacked"}
							>
								{demos[c.id].node}
							</ShowcaseSection>
						))}
						<ShowcaseNoResults />
					</main>
				</div>
			</ComponentFilterProvider>

			<footer className="border-t">
				<p className="mx-auto max-w-7xl px-4 py-6 text-muted-foreground text-xs sm:px-6">
					{site.name} · shadcn/ui structure, macOS refinement, one spring.
				</p>
			</footer>
		</>
	);
}
