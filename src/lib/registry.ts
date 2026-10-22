/** Component index: drives gallery nav/sections, JSON-LD and /llms.txt. Keep in sync with CLAUDE.md. */
export const registry = [
	{
		id: "button",
		name: "Button",
		file: "button.tsx",
		description:
			"Five variants, four sizes, spring press feedback, an animated loading spinner and in-place success state, a two-step confirm that swaps the label on first click, and a configurable swap direction. Width stays fixed to the longest label.",
		usage: `<Button variant="destructive" confirmLabel="Yes, delete my account" onClick={remove}>Delete account</Button>`,
	},
	{
		id: "badge",
		name: "Badge & Pill",
		file: "badge.tsx",
		description:
			"Minimal status tags. Rounded badge or fully rounded pill, with optional dot. pulse adds an expanding live-status ring.",
		usage: `<Badge variant="success" shape="pill" dot pulse>Live</Badge>`,
	},
	{
		id: "forms",
		name: "Forms",
		file: "input.tsx · textarea.tsx · label.tsx · switch.tsx",
		description:
			"Input, Textarea, Label and Switch: form controls with smooth focus rings, aria-invalid states, auto-growing textarea and a spring switch.",
		usage: `<Label htmlFor="email">Email</Label><Input id="email" type="email" aria-invalid={err} />`,
	},
	{
		id: "card",
		name: "Card",
		file: "card.tsx",
		description:
			"Composable surface: header, title, description, content and footer. Optional glass.",
		usage: `<Card><CardHeader><CardTitle>Revenue</CardTitle></CardHeader><CardContent>…</CardContent></Card>`,
	},
	{
		id: "avatar",
		name: "Avatar",
		file: "avatar.tsx",
		description:
			"Image with initials fallback on error, three sizes and online/away/busy/offline dots.",
		usage: `<Avatar src={url} alt="Jane Doe" status="online" size="lg" />`,
	},
	{
		id: "accordion",
		name: "Accordion",
		file: "accordion.tsx",
		description:
			"Single or multiple panels with spring height animation. Closed content stays in the DOM for SEO.",
		usage: `<Accordion type="single" defaultValue="a"><AccordionItem value="a"><AccordionTrigger>Q</AccordionTrigger><AccordionContent>A</AccordionContent></AccordionItem></Accordion>`,
	},
	{
		id: "chat",
		name: "Message Bubble",
		file: "message-bubble.tsx",
		description:
			"User/assistant chat bubbles with avatar slot, streaming dots and copyable code blocks.",
		usage: `<MessageBubble from="assistant" avatar={<Avatar … />} streaming>…<Code code={src} language="tsx" /></MessageBubble>`,
	},
	{
		id: "dialog",
		name: "Dialog",
		file: "dialog.tsx",
		description:
			"Portal modal with blurred backdrop, spring scale-in, focus trap, Esc and scroll lock.",
		usage: `<Dialog><DialogTrigger>Open</DialogTrigger><DialogContent><DialogHeader><DialogTitle>…</DialogTitle></DialogHeader></DialogContent></Dialog>`,
	},
	{
		id: "toast",
		name: "Toast",
		file: "toast.tsx",
		description:
			"Sonner-style stacked notifications. Hover to expand, swipe to dismiss, timers pause on hover.",
		usage: `toast.success("Saved", { description: "All changes synced", action: { label: "Undo", onClick } })`,
	},
	{
		id: "mac-window",
		name: "MacWindow",
		file: "mac-window.tsx",
		description:
			"Window container with traffic-light controls, title, custom header slot and actions.",
		usage: `<MacWindow title="Preview" header={<Tabs />} actions={<Button size="sm" />} onClose={close}>…</MacWindow>`,
	},
	{
		id: "theme-toggle",
		name: "Theme Toggle",
		file: "theme-toggle.tsx",
		description: "Light/dark icon switch with spring rotate-swap; follows the OS until first use.",
		usage: `<ThemeToggle />`,
	},
	{
		id: "cursor",
		name: "Custom Cursor",
		file: "custom-cursor.tsx",
		description:
			"Optional spring cursor that expands over interactive elements. Off on touch and reduced motion.",
		usage: `{enabled && <CustomCursor />}`,
	},
	{
		id: "count-to",
		name: "CountTo",
		file: "count-to.tsx",
		description:
			"Springs a number up from a start value once it scrolls into view. Prefix, suffix, decimals and locale.",
		usage: `<CountTo to={48290} prefix="$" />`,
	},
	{
		id: "reveal",
		name: "Reveal",
		file: "reveal.tsx",
		description:
			"Scroll reveal: content fades and rises on a spring the first time it enters the viewport.",
		usage: `<Reveal delay={0.1}><Card>…</Card></Reveal>`,
	},
	{
		id: "avatar-group",
		name: "AvatarGroup",
		file: "avatar-group.tsx",
		description:
			"Overlapping avatars with a +N overflow chip. Hover gently enlarges the avatar on a spring, keeping stack order.",
		usage: `<AvatarGroup users={team} max={4} size="lg" />`,
	},
	{
		id: "quote",
		name: "Quote",
		file: "quote.tsx",
		description:
			"Semantic figure, blockquote and figcaption. Plain, card and large variants, with author, subtitle, avatar, typewriter and textSwap.",
		usage: `<Quote variant="card" author="Jane Doe" subtitle="Design lead" avatar={<Avatar … />}>…</Quote>`,
	},
	{
		id: "breadcrumb",
		name: "Breadcrumb",
		file: "breadcrumb.tsx",
		description:
			"Semantic navigation trail with items, links, separators, collapsed ellipsis and current page status.",
		usage: `<Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Components</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>`,
	},
	{
		id: "button-group",
		name: "Button Group",
		file: "button-group.tsx",
		description:
			"Fuses multiple buttons into a seamless connected strip, sharing borders, corners and active states. Horizontal or vertical.",
		usage: `<ButtonGroup><Button variant="outline">Years</Button><Button variant="default">Months</Button></ButtonGroup>`,
	},
	{
		id: "typewriter",
		name: "Typewriter",
		file: "typewriter.tsx",
		description:
			"Types out text character-by-character with optional phrase cycling and pulsing cursor. Full copy stays in the DOM for SEO.",
		usage: `<Typewriter text={["macOS precision.", "Delightful springs."]} speed={40} />`,
	},
	{
		id: "text-swap",
		name: "TextSwap",
		file: "text-swap.tsx",
		description:
			"Spring-powered text morphing and ticker. Auto-cycles phrases or animates whenever children change with blur and slide transitions.",
		usage: `<TextSwap items={["Next.js 16", "Tailwind CSS 4", "motion 14"]} direction="up" />`,
	},
] as const;
