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
	/** Trigger text for the panel. */
	label: string;
	/** Links in the panel, each with an optional description and icon. */
	items: { title: string; href: string; description?: ReactNode; icon?: ReactNode }[];
	/** Panel columns; defaults to 2 when there are more than three items. */
	columns?: 1 | 2;
};

type SiteHeaderProps = {
	/** Logo link, e.g. `<a href="/">Acme</a>`. */
	brand: ReactNode;
	/** Top-level links and panels, left to right. */
	nav: (SiteLink | SiteGroup)[];
	/** Href of the current page: marks the matching link `aria-current="page"`. */
	current?: string;
	/** Right-hand controls (search, theme, sign in). Shown at every width. */
	actions?: ReactNode;
	/** Accessible name of the navigation, desktop and drawer alike. */
	label?: string;
	/** `onClick` for every nav link, e.g. to close over client routing or stub links in a demo. */
	onNavigate?: (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
	className?: string;
};

const isGroup = (link: SiteLink | SiteGroup): link is SiteGroup => "items" in link;

/**
 * Sticky site header: brand, NavigationMenu from md up, a right Drawer with the same links
 * below it. The hairline under it appears only once the page scrolls under the header.
 */
export function SiteHeader({
	brand,
	nav,
	current,
	actions,
	label = "Main",
	onNavigate,
	className,
}: SiteHeaderProps) {
	const header = useRef<HTMLElement>(null);
	const sentinel = useRef<HTMLSpanElement>(null);
	const drawer = useDisclosure();

	// Flips an attribute, no re-render: the sentinel above the header leaves view on scroll.
	useEffect(() => {
		const element = sentinel.current;

		if (!element) return;

		const observer = new IntersectionObserver(([entry]) => {
			header.current?.toggleAttribute("data-scrolled", !entry?.isIntersecting);
		});

		observer.observe(element);

		return () => observer.disconnect();
	}, []);

	const click = (href: string) => (event: MouseEvent<HTMLAnchorElement>) =>
		onNavigate?.(href, event);

	return (
		<>
			<span ref={sentinel} aria-hidden="true" className="block h-px" />
			<header
				ref={header}
				className={cn(
					"-mt-px sticky top-0 z-40 border-transparent border-b bg-background/80 backdrop-blur-xl backdrop-saturate-150 transition-colors data-scrolled:border-border",
					className,
				)}
			>
				<div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
					<div className="flex shrink-0 items-center gap-2 font-semibold text-sm">{brand}</div>

					<NavigationMenu aria-label={label} className="hidden md:block">
						<NavigationMenuList>
							{nav.map((link) =>
								isGroup(link) ? (
									<NavigationMenuItem key={link.label}>
										<NavigationMenuTrigger>{link.label}</NavigationMenuTrigger>
										<NavigationMenuContent>
											<ul
												className={cn(
													"grid gap-0.5",
													(link.columns ?? (link.items.length > 3 ? 2 : 1)) === 2
														? "w-[34rem] grid-cols-2"
														: "w-80",
												)}
											>
												{link.items.map((i) => (
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
									<NavigationMenuItem key={link.href}>
										<NavigationMenuLink
											href={link.href}
											active={current === link.href}
											onClick={click(link.href)}
										>
											{link.label}
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
						<nav aria-label={label} className="flex flex-col gap-5">
							{nav.map((link) =>
								isGroup(link) ? (
									<section key={link.label} className="flex flex-col gap-1">
										<h2 className="px-2.5 font-medium text-muted-foreground text-xs">
											{link.label}
										</h2>
										<ul className="flex flex-col">
											{link.items.map((i) => (
												<li key={i.href}>
													<MobileLink
														href={i.href}
														icon={i.icon}
														active={current === i.href}
														onClick={(event) => {
															click(i.href)(event);
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
										key={link.href}
										href={link.href}
										active={current === link.href}
										onClick={(event) => {
											click(link.href)(event);
											drawer.hide();
										}}
									>
										{link.label}
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
	onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
	children: ReactNode;
}) {
	return (
		<a
			href={href}
			aria-current={active ? "page" : undefined}
			onClick={onClick}
			className="flex h-10 items-center gap-3 rounded-lg px-2.5 font-medium text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[current=page]:bg-foreground/[0.08] [&_svg]:size-4 [&_svg]:text-primary-ink"
		>
			{icon && <span aria-hidden="true">{icon}</span>}
			{children}
		</a>
	);
}
