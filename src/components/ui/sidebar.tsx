"use client";

import { PanelLeft } from "lucide-react";
import { motion } from "motion/react";
import { type ComponentProps, createContext, type ReactNode, use, useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/lib/platform";
import { useControllableState } from "@/lib/use-controllable-state";
import { useHotkey } from "@/lib/use-hotkey";
import { cn, spring } from "@/lib/utils";

type SidebarCtx = {
	collapsed: boolean;
	setCollapsed: (collapsed: boolean) => void;
	/** Below md the sidebar is a drawer; `collapsed` is then always false. */
	mobile: boolean;
	openMobile: boolean;
	setOpenMobile: (open: boolean) => void;
};

const SidebarContext = createContext<SidebarCtx | null>(null);

function useSidebar() {
	const ctx = use(SidebarContext);

	if (!ctx) throw new Error("Sidebar and SidebarTrigger must be used inside <SidebarLayout>");

	return ctx;
}

type SidebarLayoutProps = ComponentProps<"div"> & {
	/** Controlled rail state; pair with `onCollapsedChange`. */
	collapsed?: boolean;
	/** Start as the icon rail (uncontrolled). */
	defaultCollapsed?: boolean;
	/** Called from the trigger or the shortcut. */
	onCollapsedChange?: (collapsed: boolean) => void;
	/** Toggle with ⌘B / Ctrl+B (default: true). Ignored while typing in a field. */
	shortcut?: boolean;
};

/** Lays the sidebar and the page side by side and holds the rail state. Below md, the sidebar is a left drawer. */
export function SidebarLayout({
	collapsed: collapsedProp,
	defaultCollapsed = false,
	onCollapsedChange,
	shortcut = true,
	className,
	children,
	...props
}: SidebarLayoutProps) {
	const mobile = useMediaQuery("(max-width: 767px)");
	const [openMobile, setOpenMobile] = useState(false);
	const [stored, setStored] = useControllableState(
		collapsedProp,
		defaultCollapsed,
		onCollapsedChange,
	);
	// Below md it's a drawer: the toggle opens it instead of collapsing the rail.
	const collapsed = !mobile && stored;
	const setCollapsed = (next: boolean) => (mobile ? setOpenMobile(!openMobile) : setStored(next));

	useHotkey(shortcut && "mod+b", () => setCollapsed(!collapsed), { skipInFields: true });

	return (
		<SidebarContext value={{ collapsed, setCollapsed, mobile, openMobile, setOpenMobile }}>
			<div className={cn("flex min-h-0 w-full", className)} {...props}>
				{children}
			</div>
		</SidebarContext>
	);
}

type SidebarItem = {
	/** What `current` and `onSelect` refer to. Default: `href`, else `label`. */
	id?: string;
	/** Visible text; the rail shows it as a tooltip. */
	label: string;
	/** Leading icon; the only thing shown in the rail. */
	icon?: ReactNode;
	/** A link when set, otherwise a button that calls `onSelect`. */
	href?: string;
	/** Right-aligned count or status, hidden in the rail. */
	badge?: ReactNode;
};

type SidebarGroup = {
	/** Heading above the items; fades out in the rail. */
	label?: string;
	/** The group's entries. */
	items: SidebarItem[];
	/** The heading folds the group (open at first unless `defaultOpen` is false). */
	collapsible?: boolean;
	/** With `collapsible`: start folded when false. */
	defaultOpen?: boolean;
};

type SidebarProps = {
	/** Accessible name for the navigation landmark. */
	label?: string;
	/** Top slot, e.g. the workspace name. */
	header?: ReactNode;
	/** The navigation, top to bottom. */
	groups: SidebarGroup[];
	/** Entries pinned to the bottom, e.g. settings. */
	footer?: SidebarItem[];
	/** Id of the current item: highlighted, `aria-current="page"` on links. */
	current?: string;
	/** Called with an item's id when it is picked (links too, e.g. for client routing). */
	onSelect?: (id: string) => void;
	className?: string;
};

const itemId = (item: SidebarItem) => item.id ?? item.href ?? item.label;
const fade = "transition-opacity group-data-[state=collapsed]/sidebar:opacity-0";

/** Navigation sidebar from data. Collapses to an icon rail on a spring; labels clip but stay in the a11y tree. */
export function Sidebar({
	label = "Sidebar",
	header,
	groups,
	footer,
	current,
	onSelect,
	className,
}: SidebarProps) {
	const { collapsed, mobile, openMobile, setOpenMobile } = useSidebar();

	const select = (id: string) => {
		onSelect?.(id);
		if (mobile) setOpenMobile(false);
	};

	const list = (items: SidebarItem[]) => (
		<ul className="flex flex-col gap-0.5">
			{items.map((item) => (
				<li key={itemId(item)}>
					<Entry
						item={item}
						active={current === itemId(item)}
						collapsed={collapsed}
						onSelect={select}
					/>
				</li>
			))}
		</ul>
	);
	const body = (
		<nav aria-label={label} className="flex min-h-0 flex-1 flex-col">
			{header && <div className="border-b p-2">{header}</div>}
			<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden p-2">
				{groups.map((group, i) =>
					group.collapsible && group.label ? (
						// biome-ignore lint/suspicious/noArrayIndexKey: groups are positional and have no ids
						<Collapsible key={i} defaultOpen={group.defaultOpen ?? true}>
							<CollapsibleTrigger className={cn("px-2.5 pb-1 text-muted-foreground text-xs", fade)}>
								{group.label}
							</CollapsibleTrigger>
							<CollapsibleContent>{list(group.items)}</CollapsibleContent>
						</Collapsible>
					) : (
						// biome-ignore lint/suspicious/noArrayIndexKey: groups are positional and have no ids
						<div key={i}>
							{group.label && (
								<p
									className={cn(
										"truncate px-2.5 pb-1 font-medium text-muted-foreground text-xs",
										fade,
									)}
								>
									{group.label}
								</p>
							)}
							{list(group.items)}
						</div>
					),
				)}
			</div>
			{footer?.length ? <div className="border-t p-2">{list(footer)}</div> : null}
		</nav>
	);

	if (mobile)
		return (
			<Drawer open={openMobile} onOpenChange={setOpenMobile}>
				<DrawerContent side="left" className={cn("bg-background pt-12 text-sm", className)}>
					<DrawerTitle className="sr-only">{label}</DrawerTitle>
					{body}
				</DrawerContent>
			</Drawer>
		);

	return (
		<motion.aside
			data-state={collapsed ? "collapsed" : "expanded"}
			initial={false}
			animate={{ width: collapsed ? "3.25rem" : "15rem" }}
			transition={spring}
			className={cn(
				"group/sidebar flex shrink-0 flex-col overflow-hidden border-r bg-background/60 text-sm backdrop-blur-2xl backdrop-saturate-[1.8]",
				className,
			)}
		>
			{body}
		</motion.aside>
	);
}

function Entry({
	item,
	active,
	collapsed,
	onSelect,
}: {
	item: SidebarItem;
	active: boolean;
	collapsed: boolean;
	onSelect: (id: string) => void;
}) {
	const cls = cn(
		"flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-primary-ink",
		active
			? "bg-foreground/[0.08] font-medium text-foreground"
			: "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
	);
	const body = (
		<>
			{item.icon}
			<span className="min-w-0 flex-1 truncate">{item.label}</span>
			{item.badge != null && (
				<span className="ml-auto text-muted-foreground text-xs tabular-nums">{item.badge}</span>
			)}
		</>
	);
	// Rail shows only the icon, `title` gives the label back on hover.
	const title = collapsed ? item.label : undefined;
	const pick = () => onSelect(itemId(item));

	return item.href ? (
		<a
			href={item.href}
			aria-current={active ? "page" : undefined}
			title={title}
			onClick={pick}
			className={cls}
		>
			{body}
		</a>
	) : (
		<button type="button" aria-pressed={active} title={title} onClick={pick} className={cls}>
			{body}
		</button>
	);
}

export function SidebarTrigger({ className }: { className?: string }) {
	const { collapsed, setCollapsed, mobile, openMobile } = useSidebar();
	const expanded = mobile ? openMobile : !collapsed;

	return (
		<Button
			variant="ghost"
			size="icon"
			aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
			aria-expanded={expanded}
			onClick={() => setCollapsed(!collapsed)}
			className={cn("size-8", className)}
		>
			<PanelLeft aria-hidden="true" />
		</Button>
	);
}
