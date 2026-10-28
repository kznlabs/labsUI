"use client";

import dynamic from "next/dynamic";

// One chunk per demo module, a component page only downloads its own demo (still server-rendered).
const demos = {
	AccentPickerDemo: dynamic(() =>
		import("@/site/showcase/basics-demos").then((module) => module.AccentPickerDemo),
	),
	AccordionDemo: dynamic(() =>
		import("@/site/showcase/demos").then((module) => module.AccordionDemo),
	),
	AlertDemo: dynamic(() =>
		import("@/site/showcase/feedback-demos").then((module) => module.AlertDemo),
	),
	AspectRatioDemo: dynamic(() =>
		import("@/site/showcase/data-demos").then((module) => module.AspectRatioDemo),
	),
	AttachmentDemo: dynamic(() =>
		import("@/site/showcase/form-demos").then((module) => module.AttachmentDemo),
	),
	AvatarDemo: dynamic(() => import("@/site/showcase/demos").then((module) => module.AvatarDemo)),
	AvatarGroupDemo: dynamic(() =>
		import("@/site/showcase/demos").then((module) => module.AvatarGroupDemo),
	),
	BadgeDemo: dynamic(() => import("@/site/showcase/demos").then((module) => module.BadgeDemo)),
	BreadcrumbDemo: dynamic(() =>
		import("@/site/showcase/demos").then((module) => module.BreadcrumbDemo),
	),
	ButtonDemo: dynamic(() => import("@/site/showcase/demos").then((module) => module.ButtonDemo)),
	ButtonGroupDemo: dynamic(() =>
		import("@/site/showcase/demos").then((module) => module.ButtonGroupDemo),
	),
	CalendarDemo: dynamic(() =>
		import("@/site/showcase/picker-demos").then((module) => module.CalendarDemo),
	),
	CardDemo: dynamic(() => import("@/site/showcase/demos").then((module) => module.CardDemo)),
	CarouselDemo: dynamic(() =>
		import("@/site/showcase/data-demos").then((module) => module.CarouselDemo),
	),
	ChangelogDemo: dynamic(() =>
		import("@/site/showcase/block-demos").then((module) => module.ChangelogDemo),
	),
	ChartDemo: dynamic(() => import("@/site/showcase/data-demos").then((module) => module.ChartDemo)),
	ChatDemo: dynamic(() => import("@/site/showcase/chat-demo").then((module) => module.ChatDemo)),
	CheckboxDemo: dynamic(() =>
		import("@/site/showcase/form-demos").then((module) => module.CheckboxDemo),
	),
	ClipCardDemo: dynamic(() =>
		import("@/site/showcase/block-demos").then((module) => module.ClipCardDemo),
	),
	CodeDemo: dynamic(() => import("@/site/showcase/data-demos").then((module) => module.CodeDemo)),
	CollapsibleDemo: dynamic(() =>
		import("@/site/showcase/demos").then((module) => module.CollapsibleDemo),
	),
	ComboboxDemo: dynamic(() =>
		import("@/site/showcase/picker-demos").then((module) => module.ComboboxDemo),
	),
	CommandDemo: dynamic(() =>
		import("@/site/showcase/command-demo").then((module) => module.CommandDemo),
	),
	ConfirmDemo: dynamic(() =>
		import("@/site/showcase/overlay-demos").then((module) => module.ConfirmDemo),
	),
	ContextMenuDemo: dynamic(() =>
		import("@/site/showcase/feedback-demos").then((module) => module.ContextMenuDemo),
	),
	CountToDemo: dynamic(() => import("@/site/showcase/demos").then((module) => module.CountToDemo)),
	CursorDemo: dynamic(() => import("@/site/showcase/demos").then((module) => module.CursorDemo)),
	DataTableDemo: dynamic(() =>
		import("@/site/showcase/data-demos").then((module) => module.DataTableDemo),
	),
	DatePickerDemo: dynamic(() =>
		import("@/site/showcase/picker-demos").then((module) => module.DatePickerDemo),
	),
	DialogDemo: dynamic(() =>
		import("@/site/showcase/overlay-demos").then((module) => module.DialogDemo),
	),
	DrawerDemo: dynamic(() =>
		import("@/site/showcase/menu-demos").then((module) => module.DrawerDemo),
	),
	DropdownMenuDemo: dynamic(() =>
		import("@/site/showcase/menu-demos").then((module) => module.DropdownMenuDemo),
	),
	EmptyDemo: dynamic(() =>
		import("@/site/showcase/feedback-demos").then((module) => module.EmptyDemo),
	),
	FieldDemo: dynamic(() => import("@/site/showcase/form-demos").then((module) => module.FieldDemo)),
	FormDemo: dynamic(() => import("@/site/showcase/demos").then((module) => module.FormDemo)),
	HoverCardDemo: dynamic(() =>
		import("@/site/showcase/floating-demos").then((module) => module.HoverCardDemo),
	),
	InputGroupDemo: dynamic(() =>
		import("@/site/showcase/form-demos").then((module) => module.InputGroupDemo),
	),
	InputOTPDemo: dynamic(() =>
		import("@/site/showcase/data-demos").then((module) => module.InputOTPDemo),
	),
	KbdDemo: dynamic(() => import("@/site/showcase/basics-demos").then((module) => module.KbdDemo)),
	MarkerDemo: dynamic(() =>
		import("@/site/showcase/data-demos").then((module) => module.MarkerDemo),
	),
	MenubarDemo: dynamic(() =>
		import("@/site/showcase/menu-demos").then((module) => module.MenubarDemo),
	),
	MeterDemo: dynamic(() =>
		import("@/site/showcase/native-demos").then((module) => module.MeterDemo),
	),
	NativeSelectDemo: dynamic(() =>
		import("@/site/showcase/native-demos").then((module) => module.NativeSelectDemo),
	),
	NavigationMenuDemo: dynamic(() =>
		import("@/site/showcase/menu-demos").then((module) => module.NavigationMenuDemo),
	),
	NewsletterDemo: dynamic(() =>
		import("@/site/showcase/block-demos").then((module) => module.NewsletterDemo),
	),
	NumberInputDemo: dynamic(() =>
		import("@/site/showcase/native-demos").then((module) => module.NumberInputDemo),
	),
	PaginationDemo: dynamic(() =>
		import("@/site/showcase/demos").then((module) => module.PaginationDemo),
	),
	PopoverDemo: dynamic(() =>
		import("@/site/showcase/floating-demos").then((module) => module.PopoverDemo),
	),
	PricingDemo: dynamic(() =>
		import("@/site/showcase/block-demos").then((module) => module.PricingDemo),
	),
	ProductCardDemo: dynamic(() =>
		import("@/site/showcase/block-demos").then((module) => module.ProductCardDemo),
	),
	ProgressDemo: dynamic(() =>
		import("@/site/showcase/feedback-demos").then((module) => module.ProgressDemo),
	),
	QuoteDemo: dynamic(() => import("@/site/showcase/demos").then((module) => module.QuoteDemo)),
	RadioGroupDemo: dynamic(() =>
		import("@/site/showcase/form-demos").then((module) => module.RadioGroupDemo),
	),
	RatingDemo: dynamic(() =>
		import("@/site/showcase/native-demos").then((module) => module.RatingDemo),
	),
	RelativeTimeDemo: dynamic(() =>
		import("@/site/showcase/native-demos").then((module) => module.RelativeTimeDemo),
	),
	ResizableDemo: dynamic(() =>
		import("@/site/showcase/picker-demos").then((module) => module.ResizableDemo),
	),
	RevealDemo: dynamic(() => import("@/site/showcase/demos").then((module) => module.RevealDemo)),
	ScrollAreaDemo: dynamic(() =>
		import("@/site/showcase/picker-demos").then((module) => module.ScrollAreaDemo),
	),
	SearchInputDemo: dynamic(() =>
		import("@/site/showcase/basics-demos").then((module) => module.SearchInputDemo),
	),
	SelectDemo: dynamic(() =>
		import("@/site/showcase/menu-demos").then((module) => module.SelectDemo),
	),
	SeparatorDemo: dynamic(() =>
		import("@/site/showcase/basics-demos").then((module) => module.SeparatorDemo),
	),
	SidebarDemo: dynamic(() =>
		import("@/site/showcase/sidebar-demo").then((module) => module.SidebarDemo),
	),
	SiteHeaderDemo: dynamic(() =>
		import("@/site/showcase/block-demos").then((module) => module.SiteHeaderDemo),
	),
	SkeletonDemo: dynamic(() =>
		import("@/site/showcase/basics-demos").then((module) => module.SkeletonDemo),
	),
	SliderDemo: dynamic(() =>
		import("@/site/showcase/control-demos").then((module) => module.SliderDemo),
	),
	SpinnerDemo: dynamic(() =>
		import("@/site/showcase/data-demos").then((module) => module.SpinnerDemo),
	),
	StatsStripDemo: dynamic(() =>
		import("@/site/showcase/block-demos").then((module) => module.StatsStripDemo),
	),
	StatTileDemo: dynamic(() =>
		import("@/site/showcase/block-demos").then((module) => module.StatTileDemo),
	),
	StepperDemo: dynamic(() =>
		import("@/site/showcase/form-demos").then((module) => module.StepperDemo),
	),
	TableDemo: dynamic(() => import("@/site/showcase/data-demos").then((module) => module.TableDemo)),
	TabsDemo: dynamic(() => import("@/site/showcase/basics-demos").then((module) => module.TabsDemo)),
	TagInputDemo: dynamic(() =>
		import("@/site/showcase/picker-demos").then((module) => module.TagInputDemo),
	),
	TerminalDemo: dynamic(() =>
		import("@/site/showcase/data-demos").then((module) => module.TerminalDemo),
	),
	TestimonialDemo: dynamic(() =>
		import("@/site/showcase/block-demos").then((module) => module.TestimonialDemo),
	),
	TextSwapDemo: dynamic(() =>
		import("@/site/showcase/demos").then((module) => module.TextSwapDemo),
	),
	ThemeDemo: dynamic(() => import("@/site/showcase/demos").then((module) => module.ThemeDemo)),
	TimelineDemo: dynamic(() =>
		import("@/site/showcase/data-demos").then((module) => module.TimelineDemo),
	),
	ToastDemo: dynamic(() =>
		import("@/site/showcase/overlay-demos").then((module) => module.ToastDemo),
	),
	ToggleGroupDemo: dynamic(() =>
		import("@/site/showcase/control-demos").then((module) => module.ToggleGroupDemo),
	),
	TooltipDemo: dynamic(() =>
		import("@/site/showcase/floating-demos").then((module) => module.TooltipDemo),
	),
	TypewriterDemo: dynamic(() =>
		import("@/site/showcase/demos").then((module) => module.TypewriterDemo),
	),
	WindowDemo: dynamic(() =>
		import("@/site/showcase/window-demo").then((module) => module.WindowDemo),
	),
};

export function Demo({ name }: { name: keyof typeof demos }) {
	const Component = demos[name];

	return <Component />;
}
