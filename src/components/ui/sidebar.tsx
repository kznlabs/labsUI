"use client";

import { PanelLeft } from "lucide-react";
import { motion } from "motion/react";
import {
	type ComponentProps,
	createContext,
	type ReactNode,
	use,
	useEffect,
	useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/lib/platform";
import { useControllableState } from "@/lib/use-controllable-state";
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
	if (!ctx) throw new Error("Sidebar parts must be used inside <SidebarProvider>");
	return ctx;
}

type SidebarProviderProps = ComponentProps<"div"> & {
	collapsed?: boolean;
	defaultCollapsed?: boolean;
	onCollapsedChange?: (collapsed: boolean) => void;
	/** Toggle with ⌘B / Ctrl+B (default: true). Ignored while typing in a field. */
	shortcut?: boolean;
};

/** Holds the collapsed state and lays the sidebar and its content out side by side. Below md, the sidebar becomes a left drawer. */
export function SidebarProvider({
	collapsed: collapsedProp,
	defaultCollapsed = false,
	onCollapsedChange,
	shortcut = true,
	className,
	children,
	...props
}: SidebarProviderProps) {
	const mobile = useMediaQuery("(max-width: 767px)");
	const [openMobile, setOpenMobile] = useState(false);
	const [stored, setStored] = useControllableState(
		collapsedProp,
		defaultCollapsed,
		onCollapsedChange,
	);
	// Below md the sidebar is a drawer: the toggle opens it instead of collapsing the rail.
	const collapsed = !mobile && stored;
	const setCollapsed = (next: boolean) => (mobile ? setOpenMobile(!openMobile) : setStored(next));

	useEffect(() => {
		if (!shortcut) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key.toLowerCase() !== "b" || !(e.metaKey || e.ctrlKey)) return;
			const t = e.target as HTMLElement | null;
			if (t?.closest("input, textarea, select, [contenteditable='true']")) return;
			e.preventDefault();
			setCollapsed(!collapsed);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	});

	return (
		<SidebarContext value={{ collapsed, setCollapsed, mobile, openMobile, setOpenMobile }}>
			<div className={cn("flex min-h-0 w-full", className)} {...props}>
				{children}
			</div>
		</SidebarContext>
	);
}

/** Source-list sidebar. Collapses to an icon rail on a spring; labels clip, stay in the a11y tree. */
export function Sidebar({
	label = "Sidebar",
	className,
	children,
}: {
	/** Accessible name for the navigation landmark. */
	label?: string;
	className?: string;
	children: ReactNode;
}) {
	const { collapsed, mobile, openMobile, setOpenMobile } = useSidebar();
	if (mobile)
		return (
			<Drawer open={openMobile} onOpenChange={setOpenMobile}>
				<DrawerContent side="left" className={cn("bg-background pt-12 text-sm", className)}>
					<DrawerTitle className="sr-only">{label}</DrawerTitle>
					<nav aria-label={label} className="flex min-h-0 flex-1 flex-col">
						{children}
					</nav>
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
			<nav aria-label={label} className="flex min-h-0 flex-1 flex-col">
				{children}
			</nav>
		</motion.aside>
	);
}

export function SidebarHeader({ className, ...props }: ComponentProps<"div">) {
	return <div className={cn("flex flex-col gap-2 p-2", className)} {...props} />;
}

export function SidebarContent({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden p-2",
				className,
			)}
			{...props}
		/>
	);
}

export function SidebarFooter({ className, ...props }: ComponentProps<"div">) {
	return <div className={cn("mt-auto flex flex-col gap-2 border-t p-2", className)} {...props} />;
}

export function SidebarGroup({ className, ...props }: ComponentProps<"div">) {
	return <div className={cn("flex flex-col gap-0.5", className)} {...props} />;
}

export function SidebarGroupLabel({ className, ...props }: ComponentProps<"p">) {
	return (
		<p
			className={cn(
				"truncate px-2.5 pb-1 font-medium text-muted-foreground text-xs transition-opacity duration-400 ease-in-out group-data-[state=collapsed]/sidebar:opacity-0",
				className,
			)}
			{...props}
		/>
	);
}

export function SidebarMenu({ className, ...props }: ComponentProps<"ul">) {
	return <ul className={cn("flex flex-col gap-0.5", className)} {...props} />;
}

export function SidebarMenuItem({ className, ...props }: ComponentProps<"li">) {
	return <li className={cn("relative", className)} {...props} />;
}

type SidebarMenuButtonProps = {
	/** Renders an `<a>` when set, otherwise a `<button>`. */
	href?: string;
	icon?: ReactNode;
	isActive?: boolean;
	/** Right-aligned count or status, hidden in the rail. */
	badge?: ReactNode;
	onClick?: () => void;
	className?: string;
	children: ReactNode;
};

export function SidebarMenuButton({
	href,
	icon,
	isActive,
	badge,
	onClick,
	className,
	children,
}: SidebarMenuButtonProps) {
	const { collapsed, mobile, setOpenMobile } = useSidebar();
	// In the mobile drawer, picking an item also closes the drawer.
	const select = () => {
		onClick?.();
		if (mobile) setOpenMobile(false);
	};
	const cls = cn(
		"flex h-8 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-left outline-none transition-colors duration-400 ease-in-out focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-primary-ink",
		isActive
			? "bg-foreground/[0.08] font-medium text-foreground"
			: "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
		className,
	);
	const body = (
		<>
			{icon}
			<span className="min-w-0 flex-1 truncate">{children}</span>
			{badge != null && (
				<span className="ml-auto text-muted-foreground text-xs tabular-nums">{badge}</span>
			)}
		</>
	);
	// In the rail only the icon shows; `title` gives sighted users the label back on hover.
	const title = collapsed && typeof children === "string" ? children : undefined;
	return href ? (
		<a
			href={href}
			aria-current={isActive ? "page" : undefined}
			title={title}
			onClick={select}
			className={cls}
		>
			{body}
		</a>
	) : (
		<button type="button" aria-pressed={isActive} title={title} onClick={select} className={cls}>
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
