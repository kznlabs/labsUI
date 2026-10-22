import type { ReactNode } from "react";
import { StructuredData } from "@/components/seo/structured-data";
import { ChatDemo } from "@/components/showcase/chat-demo";
import {
	AccordionDemo,
	AvatarDemo,
	AvatarGroupDemo,
	BadgeDemo,
	ButtonDemo,
	CardDemo,
	CountToDemo,
	CursorDemo,
	FormDemo,
	QuoteDemo,
	RevealDemo,
	ThemeDemo,
} from "@/components/showcase/demos";
import { DialogDemo, ToastDemo } from "@/components/showcase/overlay-demos";
import { ShowcaseSection } from "@/components/showcase/section";
import { WindowDemo } from "@/components/showcase/window-demo";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { registry } from "@/lib/registry";
import { site } from "@/lib/site";
import { snippets } from "@/lib/snippets";

type Id = (typeof registry)[number]["id"];

const demos: Record<Id, { node: ReactNode; preview?: string }> = {
	button: { node: <ButtonDemo /> },
	badge: { node: <BadgeDemo /> },
	forms: { node: <FormDemo /> },
	card: { node: <CardDemo /> },
	avatar: { node: <AvatarDemo /> },
	accordion: { node: <AccordionDemo />, preview: "items-start" },
	chat: { node: <ChatDemo />, preview: "p-3 sm:p-8" },
	dialog: { node: <DialogDemo /> },
	toast: { node: <ToastDemo /> },
	"mac-window": { node: <WindowDemo />, preview: "p-3 sm:p-8" },
	"theme-toggle": { node: <ThemeDemo /> },
	cursor: { node: <CursorDemo /> },
	"count-to": { node: <CountToDemo /> },
	"avatar-group": { node: <AvatarGroupDemo /> },
	quote: { node: <QuoteDemo /> },
	reveal: { node: <RevealDemo /> },
};

export default function Home() {
	return (
		<>
			<StructuredData />

			<header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl backdrop-saturate-150">
				<nav
					aria-label="Primary"
					className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6"
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
					<div className="ml-auto flex items-center gap-1">
						<a href="/llms.txt" className={buttonVariants({ variant: "ghost", size: "sm" })}>
							llms.txt
						</a>
						<ThemeToggle />
					</div>
				</nav>
			</header>

			<div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[180px_minmax(0,1fr)]">
				<aside className="hidden lg:block">
					<nav aria-label="Components" className="sticky top-24">
						<p className="mb-2 px-2 font-medium text-muted-foreground text-xs">Components</p>
						<ul className="flex flex-col">
							{registry.map((c) => (
								<li key={c.id}>
									<a
										href={`#${c.id}`}
										className="block rounded-md px-2 py-1.5 text-muted-foreground text-sm transition-colors duration-400 ease-in-out hover:bg-accent hover:text-foreground"
									>
										{c.name}
									</a>
								</li>
							))}
						</ul>
					</nav>
				</aside>

				<main className="flex min-w-0 flex-col gap-16">
					<header className="flex flex-col gap-4">
						<h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">{site.name}</h1>
						<p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
							{site.description}
						</p>
						<ul className="flex flex-wrap gap-2" aria-label="Tech stack">
							{["Next.js 16", "React 19", "Tailwind CSS 4", "motion 14", "lucide-react", "Bun"].map(
								(t) => (
									<li key={t}>
										<Badge variant="outline" shape="pill">
											{t}
										</Badge>
									</li>
								),
							)}
						</ul>
					</header>

					{registry.map((c) => (
						<ShowcaseSection
							key={c.id}
							{...c}
							files={snippets[c.id] ?? [{ name: c.file, code: c.usage }]}
							previewClassName={demos[c.id].preview}
						>
							{demos[c.id].node}
						</ShowcaseSection>
					))}
				</main>
			</div>

			<footer className="border-t">
				<p className="mx-auto max-w-6xl px-4 py-6 text-muted-foreground text-xs sm:px-6">
					{site.name} · shadcn/ui structure, macOS refinement, one spring.
				</p>
			</footer>
		</>
	);
}
