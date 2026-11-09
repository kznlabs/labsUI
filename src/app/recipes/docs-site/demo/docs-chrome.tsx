"use client";

import {
	ArrowDownUp,
	BookOpen,
	CircleAlert,
	Database,
	Download,
	FileText,
	FlaskConical,
	History,
	Layers,
	OctagonX,
	RefreshCw,
	Rocket,
	Search,
	Send,
	SquareFunction,
	ThumbsDown,
	ThumbsUp,
	Waypoints,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { KbdGroup } from "@/components/ui/kbd";
import { Pager } from "@/components/ui/pager";
import { Sidebar, SidebarLayout, SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "@/components/ui/toast";
import { AppLink } from "@/lib/link";
import { useIsMac } from "@/lib/platform";
import { docsHref, docsPath, groups, pageBySlug, product } from "./docs";

const icons: Record<string, ReactNode> = {
	introduction: <BookOpen />,
	installation: <Download />,
	"quick-start": <Rocket />,
	requests: <ArrowDownUp />,
	interceptors: <Waypoints />,
	cancellation: <OctagonX />,
	"create-client": <SquareFunction />,
	retry: <RefreshCw />,
	cache: <Database />,
	"tempo-error": <CircleAlert />,
	"error-handling": <Layers />,
	testing: <FlaskConical />,
	migrating: <Send />,
	changelog: <History />,
};

const sidebarGroups = groups.map((group) => ({
	label: group.label,
	items: group.pages.map((page) => ({
		label: page.title,
		href: docsHref(page.slug),
		icon: icons[page.slug] ?? <FileText />,
		badge: page.badge && (
			<Badge variant="secondary" className="px-1.5 py-0 text-[0.625rem]">
				{page.badge}
			</Badge>
		),
	})),
}));

/** The slug of the page on screen, "" on the docs home. */
function useSlug() {
	const pathname = usePathname().replace(/\/$/, "");

	return pathname.startsWith(docsPath()) ? pathname.slice(docsPath().length + 1) : "";
}

function SearchDocs() {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const mac = useIsMac();

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				aria-keyshortcuts={mac ? "Meta+K" : "Control+K"}
				onClick={() => setOpen(true)}
				className="w-9 justify-start px-0 text-muted-foreground max-sm:justify-center sm:w-56 sm:px-3"
			>
				<Search aria-hidden="true" />

				<span className="flex-1 text-left max-sm:sr-only">Search docs…</span>

				<KbdGroup keys={[mac ? "⌘" : "Ctrl", "K"]} className="hidden sm:inline-flex" />
			</Button>

			<CommandDialog open={open} onOpenChange={setOpen} title="Search docs">
				<CommandInput label="Search docs" placeholder="Search pages and sections…" />

				<CommandList label="Pages">
					<CommandEmpty>No page matches.</CommandEmpty>

					{groups.map((group) => (
						<CommandGroup key={group.label} heading={group.label}>
							{group.pages.map((page) => (
								<CommandItem
									key={page.slug}
									value={page.title}
									keywords={[page.description, ...page.sections.map((section) => section.title)]}
									onSelect={() => router.push(docsPath(page.slug))}
								>
									{icons[page.slug]}

									<span className="min-w-0 flex-1 truncate">{page.title}</span>

									<span className="hidden truncate text-muted-foreground text-xs sm:inline">
										{page.description}
									</span>
								</CommandItem>
							))}
						</CommandGroup>
					))}
				</CommandList>
			</CommandDialog>
		</>
	);
}

export function DocsShell({ children }: { children: ReactNode }) {
	const slug = useSlug();
	const found = pageBySlug(slug);

	return (
		<SidebarLayout>
			<Sidebar
				label="Documentation"
				className="md:sticky md:top-12 md:h-[calc(100dvh-3rem)] md:self-start"
				header={
					<AppLink
						href={docsHref()}
						className="flex h-8 items-center gap-2 rounded-lg px-2 font-semibold tracking-tight outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
					>
						<span
							aria-hidden="true"
							className="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground text-xs"
						>
							T
						</span>

						{product.name}

						<span className="font-normal text-muted-foreground text-xs">v{product.version}</span>
					</AppLink>
				}
				groups={sidebarGroups}
				current={found ? docsHref(slug) : undefined}
			/>

			<div className="min-w-0 flex-1">
				<div className="sticky top-12 z-40 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl backdrop-saturate-150 sm:px-6">
					<SidebarTrigger />

					<Breadcrumb
						// The group crumb waits for room, so the trail stays one line on a phone.
						className="min-w-0 flex-1 max-sm:[&_li:nth-child(2):not(:last-child)]:hidden"
						items={[
							{
								label: "Docs",
								href: docsHref(),
							},
							...(found ? [{ label: found.group?.label }, { label: found.page.title }] : []),
						]}
					/>

					<SearchDocs />
				</div>

				{children}
			</div>
		</SidebarLayout>
	);
}

export function DocsPager({ slug }: { slug: string }) {
	const found = pageBySlug(slug);
	const link = (page?: { title: string; slug: string }) =>
		page && { title: page.title, href: docsHref(page.slug) };

	return <Pager previous={link(found?.previous)} next={link(found?.next)} />;
}

/** A link inside the docs that routes on the client. */
export function DocsLink({
	slug,
	className,
	children,
}: {
	slug: string;
	className?: string;
	children: ReactNode;
}) {
	return (
		<AppLink href={docsHref(slug)} className={className}>
			{children}
		</AppLink>
	);
}

export function Feedback() {
	const [answer, setAnswer] = useState<"yes" | "no">();

	const pick = (value: "yes" | "no") => {
		setAnswer(value);
		toast.success("Thanks for the feedback", {
			description: "Demo mode: nothing was sent.",
		});
	};

	return (
		<div className="flex flex-wrap items-center gap-3 text-sm">
			<p className="text-muted-foreground">Was this page helpful?</p>

			<div className="flex gap-2">
				<Button
					variant={answer === "yes" ? "secondary" : "outline"}
					size="sm"
					aria-pressed={answer === "yes"}
					onClick={() => pick("yes")}
				>
					<ThumbsUp aria-hidden="true" />
					Yes
				</Button>

				<Button
					variant={answer === "no" ? "secondary" : "outline"}
					size="sm"
					aria-pressed={answer === "no"}
					onClick={() => pick("no")}
				>
					<ThumbsDown aria-hidden="true" />
					No
				</Button>
			</div>
		</div>
	);
}

export function EditPage() {
	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={() => toast.info("Demo mode: these docs have no repository to edit")}
		>
			<FileText aria-hidden="true" />
			Edit this page
		</Button>
	);
}
