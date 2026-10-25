"use client";

import { Menu } from "lucide-react";
import { type MouseEvent, type ReactNode, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useDisclosure } from "@/lib/use-disclosure";
import { cn } from "@/lib/utils";

type SiteLink = { label: string; href: string };
type SiteGroup = {
	label: string;
	items: { title: string; href: string; description?: ReactNode; icon?: ReactNode }[];
	/** Panel columns; defaults to 2 when there are more than three items. */
	columns?: 1 | 2;
};

type SiteHeaderProps = {
	/** Logo link, e.g. `<a href="/">Acme</a>`. */
	brand: ReactNode;
	nav: (SiteLink | SiteGroup)[];
	/** Href of the current page: marks the matching link `aria-current="page"`. */
	current?: string;
	/** Right-hand controls (search, theme, sign in). Shown at every width. */
	actions?: ReactNode;
	/** `onClick` for every nav link, e.g. to close over client routing or stub links in a demo. */
	onNavigate?: (href: string, e: MouseEvent<HTMLAnchorElement>) => void;
	className?: string;
};

const isGroup = (n: SiteLink | SiteGroup): n is SiteGroup => "items" in n;

/**
 * Sticky site header: brand, NavigationMenu from md up, a right Drawer with the same links
 * below it. The hairline under it appears only once the page scrolls under the header.
 */
export function SiteHeader({
	brand,
	nav,
	current,
	actions,
	onNavigate,
	className,
}: SiteHeaderProps) {
	const header = useRef<HTMLElement>(null);
	const sentinel = useRef<HTMLSpanElement>(null);
	const drawer = useDisclosure();

	// Flips an attribute, no re-render: the sentinel above the header leaves view on scroll.
	useEffect(() => {
		const el = sentinel.current;
		if (!el) return;
		const io = new IntersectionObserver(([entry]) => {
			header.current?.toggleAttribute("data-scrolled", !entry?.isIntersecting);
		});
		io.observe(el);
		return () => io.disconnect();
	}, []);

	const click = (href: string) => (e: MouseEvent<HTMLAnchorElement>) => onNavigate?.(href, e);

	return (
		<>
			<span ref={sentinel} aria-hidden="true" className="block h-px" />
			<header
				ref={header}
				className={cn(
					"-mt-px sticky top-0 z-40 border-transparent border-b bg-background/80 backdrop-blur-xl backdrop-saturate-150 transition-colors duration-300 data-scrolled:border-border",
					className,
				)}
			>
				<div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
					<div className="flex shrink-0 items-center gap-2 font-semibold text-sm">{brand}</div>

					<NavigationMenu aria-label="Main" className="hidden md:block">
						<NavigationMenuList>
							{nav.map((n) =>
								isGroup(n) ? (
									<NavigationMenuItem key={n.label}>
										<NavigationMenuTrigger>{n.label}</NavigationMenuTrigger>
										<NavigationMenuContent>
											<ul
												className={cn(
													"grid gap-0.5",
													(n.columns ?? (n.items.length > 3 ? 2 : 1)) === 2
														? "w-[34rem] grid-cols-2"
														: "w-80",
												)}
											>
												{n.items.map((i) => (
													<li key={i.href}>
														<NavigationMenuLink
															href={i.href}
															icon={i.icon}
															title={i.title}
															description={i.description}
															active={current === i.href}
															onClick={click(i.href)}
														/>
													</li>
												))}
											</ul>
										</NavigationMenuContent>
									</NavigationMenuItem>
								) : (
									<NavigationMenuItem key={n.href}>
										<NavigationMenuLink
											href={n.href}
											active={current === n.href}
											onClick={click(n.href)}
										>
											{n.label}
										</NavigationMenuLink>
									</NavigationMenuItem>
								),
							)}
						</NavigationMenuList>
					</NavigationMenu>

					<div className="ml-auto flex items-center gap-2">
						{actions}
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden"
							aria-label="Open menu"
							aria-expanded={drawer.open}
							onClick={drawer.show}
						>
							<Menu aria-hidden="true" />
						</Button>
					</div>
				</div>
			</header>

			<Drawer {...drawer.props}>
				<DrawerContent side="right">
					<DrawerHeader>
						<DrawerTitle>Menu</DrawerTitle>
					</DrawerHeader>
					<DrawerBody>
						<nav aria-label="Main" className="flex flex-col gap-5">
							{nav.map((n) =>
								isGroup(n) ? (
									<section key={n.label} className="flex flex-col gap-1">
										<h2 className="px-2.5 font-medium text-muted-foreground text-xs">{n.label}</h2>
										<ul className="flex flex-col">
											{n.items.map((i) => (
												<li key={i.href}>
													<MobileLink
														href={i.href}
														icon={i.icon}
														active={current === i.href}
														onClick={(e) => {
															click(i.href)(e);
															drawer.hide();
														}}
													>
														{i.title}
													</MobileLink>
												</li>
											))}
										</ul>
									</section>
								) : (
									<MobileLink
										key={n.href}
										href={n.href}
										active={current === n.href}
										onClick={(e) => {
											click(n.href)(e);
											drawer.hide();
										}}
									>
										{n.label}
									</MobileLink>
								),
							)}
						</nav>
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</>
	);
}

function MobileLink({
	href,
	icon,
	active,
	onClick,
	children,
}: {
	href: string;
	icon?: ReactNode;
	active?: boolean;
	onClick: (e: MouseEvent<HTMLAnchorElement>) => void;
	children: ReactNode;
}) {
	return (
		<a
			href={href}
			aria-current={active ? "page" : undefined}
			onClick={onClick}
			className="flex h-10 items-center gap-3 rounded-lg px-2.5 font-medium text-sm outline-none transition-colors duration-200 hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[current=page]:bg-foreground/[0.08] [&_svg]:size-4 [&_svg]:text-primary-ink"
		>
			{icon && <span aria-hidden="true">{icon}</span>}
			{children}
		</a>
	);
}
