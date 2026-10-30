"use client";

import {
	BookOpen,
	Bot,
	Clapperboard,
	Copy,
	FilePlus,
	FolderOpen,
	Gauge,
	Globe,
	History,
	LogOut,
	MoreHorizontal,
	Pencil,
	Radio,
	Settings,
	Share,
	ShoppingBag,
	Trash2,
	User,
} from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerBody,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Menubar,
	MenubarCheckboxItem,
	MenubarContent,
	MenubarItem,
	MenubarLabel,
	MenubarMenu,
	MenubarRadioGroup,
	MenubarRadioItem,
	MenubarSeparator,
	MenubarTrigger,
} from "@/components/ui/menubar";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Select, type SelectGroup, type SelectOption } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";

const cart = [
	{ name: "Mechanical keyboard", price: 129 },
	{ name: "Desk mat", price: 29 },
	{ name: "USB-C cable", price: 15 },
];

export function DrawerDemo() {
	return (
		<div className="flex flex-wrap justify-center gap-2">
			<Drawer>
				<DrawerTrigger variant="outline">
					<ShoppingBag aria-hidden="true" />
					Cart
				</DrawerTrigger>
				<DrawerContent side="right">
					<DrawerHeader>
						<DrawerTitle>Your cart</DrawerTitle>
						<DrawerDescription>{cart.length} items · swipe right to close</DrawerDescription>
					</DrawerHeader>
					<DrawerBody>
						<ul className="grid gap-3">
							{cart.map((i) => (
								<li key={i.name} className="flex items-center justify-between text-sm">
									<span>{i.name}</span>
									<span className="text-muted-foreground tabular-nums">${i.price}</span>
								</li>
							))}
						</ul>
						<Separator className="my-4" />
						<p className="flex justify-between font-medium text-sm">
							Total
							<span className="tabular-nums">${cart.reduce((sum, i) => sum + i.price, 0)}</span>
						</p>
					</DrawerBody>
					<DrawerFooter>
						<DrawerClose>Keep shopping</DrawerClose>
						<DrawerClose variant="default" onClick={() => toast.success("Order placed")}>
							Checkout
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>

			<Drawer>
				<DrawerTrigger variant="outline">Edit clip</DrawerTrigger>
				<DrawerContent side="bottom" className="mx-auto max-w-lg">
					<DrawerHeader>
						<DrawerTitle>Edit clip</DrawerTitle>
						<DrawerDescription>Drag the handle down to dismiss.</DrawerDescription>
					</DrawerHeader>
					<DrawerBody className="grid gap-2">
						<Label htmlFor="clip-title">Title</Label>
						<Input id="clip-title" defaultValue="Insane 1v4 clutch" />
					</DrawerBody>
					<DrawerFooter>
						<DrawerClose>Cancel</DrawerClose>
						<DrawerClose variant="default" onClick={() => toast.success("Clip saved")}>
							Save
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</div>
	);
}

export function DropdownMenuDemo() {
	const [status, setStatus] = useState(true);
	const [sort, setSort] = useState("newest");

	return (
		<div className="flex flex-wrap items-center justify-center gap-3">
			<DropdownMenu>
				<DropdownMenuTrigger variant="outline">
					<Avatar alt="Jane Doe" size="sm" className="-ml-1.5 size-6 text-[10px]" />
					Jane Doe
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuLabel>My account</DropdownMenuLabel>
					<DropdownMenuItem shortcut="⇧⌘P" onSelect={() => toast("Profile")}>
						<User aria-hidden="true" />
						Profile
					</DropdownMenuItem>
					<DropdownMenuItem shortcut="⌘," onSelect={() => toast("Settings")}>
						<Settings aria-hidden="true" />
						Settings
					</DropdownMenuItem>
					<DropdownMenuCheckboxItem checked={status} onCheckedChange={setStatus}>
						Show online status
					</DropdownMenuCheckboxItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem variant="destructive" onSelect={() => toast("Signed out")}>
						<LogOut aria-hidden="true" />
						Sign out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<DropdownMenu>
				<DropdownMenuTrigger variant="ghost" size="icon" aria-label="Clip actions">
					<MoreHorizontal aria-hidden="true" />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onSelect={() => toast("Renaming")}>
						<Pencil aria-hidden="true" />
						Rename
					</DropdownMenuItem>
					<DropdownMenuItem shortcut="⌘C" onSelect={() => toast.success("Link copied")}>
						<Copy aria-hidden="true" />
						Copy link
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuLabel>Sort by</DropdownMenuLabel>
					<DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
						<DropdownMenuRadioItem value="newest">Newest</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="views">Most viewed</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="length" disabled>
							Length
						</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem variant="destructive" onSelect={() => toast.error("Clip deleted")}>
						<Trash2 aria-hidden="true" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

const zones: SelectGroup[] = [
	{
		label: "Europe",
		options: [
			{ value: "Europe/Warsaw", label: "Warsaw (CET)" },
			{ value: "Europe/London", label: "London (GMT)" },
			{ value: "Europe/Berlin", label: "Berlin (CET)" },
		],
	},
	{
		label: "Americas",
		options: [
			{ value: "America/New_York", label: "New York (ET)" },
			{ value: "America/Los_Angeles", label: "Los Angeles (PT)" },
			{ value: "America/Sao_Paulo", label: "São Paulo (BRT)", disabled: true },
		],
	},
];

const roles: SelectOption[] = [
	{ value: "admin", label: "Admin" },
	{ value: "moderator", label: "Moderator" },
	{ value: "member", label: "Member" },
];

export function SelectDemo() {
	const [zone, setZone] = useState("Europe/Warsaw");

	return (
		<form
			className="grid w-full max-w-xs gap-4"
			onSubmit={(event) => {
				event.preventDefault();

				const data = new FormData(event.currentTarget);

				toast.success("Saved", { description: `${data.get("role")} · ${data.get("zone")}` });
			}}
		>
			<div className="grid gap-2">
				<Label htmlFor="sel-zone">
					<Globe className="size-4 text-muted-foreground" aria-hidden="true" />
					Timezone
				</Label>
				<Select id="sel-zone" name="zone" options={zones} value={zone} onValueChange={setZone} />
			</div>
			<div className="grid gap-2">
				<Label htmlFor="sel-role">Role</Label>
				<Select id="sel-role" name="role" options={roles} placeholder="Pick a role" />
			</div>
			<div className="flex items-center justify-between">
				<Badge variant="secondary" shape="pill">
					{zone}
				</Badge>
				<Button type="submit" size="sm">
					Save
				</Button>
			</div>
		</form>
	);
}

export function MenubarDemo() {
	const [sidebar, setSidebar] = useState(true);
	const [ruler, setRuler] = useState(false);
	const [sort, setSort] = useState("date");
	const run = (what: string) => () => toast(what);

	return (
		<Menubar aria-label="Editor">
			<MenubarMenu>
				<MenubarTrigger>File</MenubarTrigger>
				<MenubarContent>
					<MenubarItem shortcut="⌘N" onSelect={run("New clip")}>
						<FilePlus />
						New clip
					</MenubarItem>
					<MenubarItem shortcut="⌘O" onSelect={run("Open…")}>
						<FolderOpen />
						Open…
					</MenubarItem>
					<MenubarSeparator />
					<MenubarItem shortcut="⌘E" onSelect={run("Exporting…")}>
						<Share />
						Export
					</MenubarItem>
					<MenubarItem disabled>Print…</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger>Edit</MenubarTrigger>
				<MenubarContent>
					<MenubarItem shortcut="⌘Z" onSelect={run("Undo")}>
						Undo
					</MenubarItem>
					<MenubarItem shortcut="⇧⌘Z" onSelect={run("Redo")}>
						Redo
					</MenubarItem>
					<MenubarSeparator />
					<MenubarItem shortcut="⌘X" onSelect={run("Cut")}>
						Cut
					</MenubarItem>
					<MenubarItem shortcut="⌘C" onSelect={run("Copied")}>
						Copy
					</MenubarItem>
					<MenubarItem shortcut="⌘V" onSelect={run("Pasted")}>
						Paste
					</MenubarItem>
					<MenubarSeparator />
					<MenubarItem variant="destructive" shortcut="⌫" onSelect={run("Deleted")}>
						Delete
					</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger>View</MenubarTrigger>
				<MenubarContent>
					<MenubarCheckboxItem checked={sidebar} onCheckedChange={setSidebar}>
						Show sidebar
					</MenubarCheckboxItem>
					<MenubarCheckboxItem checked={ruler} onCheckedChange={setRuler}>
						Show ruler
					</MenubarCheckboxItem>
					<MenubarSeparator />
					<MenubarLabel>Sort clips by</MenubarLabel>
					<MenubarRadioGroup value={sort} onValueChange={setSort}>
						<MenubarRadioItem value="date">Date</MenubarRadioItem>
						<MenubarRadioItem value="name">Name</MenubarRadioItem>
						<MenubarRadioItem value="length">Length</MenubarRadioItem>
					</MenubarRadioGroup>
				</MenubarContent>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger>Help</MenubarTrigger>
				<MenubarContent>
					<MenubarItem onSelect={run("Opening docs…")}>
						<BookOpen />
						Documentation
					</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	);
}

const products = [
	{
		href: "#bot",
		icon: <Bot />,
		title: "Discord bot",
		description: "Moderation, logs and slash commands",
	},
	{
		href: "#clips",
		icon: <Clapperboard />,
		title: "Clips",
		description: "Record, trim and share highlights",
	},
	{
		href: "#shop",
		icon: <ShoppingBag />,
		title: "Shop",
		description: "Merch, boosts and gift cards",
	},
	{
		href: "#dashboard",
		icon: <Gauge />,
		title: "Dashboard",
		description: "Usage and revenue at a glance",
	},
];

const resources = [
	{ href: "#docs", icon: <BookOpen />, title: "Docs", description: "Guides and API reference" },
	{
		href: "#changelog",
		icon: <History />,
		title: "Changelog",
		description: "What shipped this week",
	},
	{ href: "#status", icon: <Radio />, title: "Status", description: "Uptime for every region" },
];

export function NavigationMenuDemo() {
	const [page, setPage] = useState("#pricing");

	// Demo links stay on this page: mark the pick as current and say where it would go.
	const go = (href: string) => (event: React.MouseEvent) => {
		event.preventDefault();
		setPage(href);
		toast(`Demo mode: would open ${href.slice(1)}`);
	};

	return (
		<div className="flex min-h-80 w-full justify-center">
			<NavigationMenu aria-label="Demo site">
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuTrigger>Products</NavigationMenuTrigger>
						<NavigationMenuContent>
							<ul className="grid w-[min(32rem,calc(100vw-5rem))] gap-0.5 sm:grid-cols-2">
								{products.map((product) => (
									<li key={product.href}>
										<NavigationMenuLink
											{...product}
											active={page === product.href}
											onClick={go(product.href)}
										/>
									</li>
								))}
							</ul>
						</NavigationMenuContent>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuTrigger>Resources</NavigationMenuTrigger>
						<NavigationMenuContent>
							<div className="grid w-[min(30rem,calc(100vw-5rem))] gap-2 sm:grid-cols-[11rem_1fr]">
								<NavigationMenuLink
									href="#release"
									active={page === "#release"}
									onClick={go("#release")}
									className="flex-col justify-end gap-1 bg-muted p-4"
								>
									<span className="font-semibold text-foreground">labsUI 0.1</span>
									<span className="text-muted-foreground text-xs leading-snug">
										Every component, one spring. Read the release notes.
									</span>
								</NavigationMenuLink>
								<ul className="flex flex-col gap-0.5">
									{resources.map((resource) => (
										<li key={resource.href}>
											<NavigationMenuLink
												{...resource}
												active={page === resource.href}
												onClick={go(resource.href)}
											/>
										</li>
									))}
								</ul>
							</div>
						</NavigationMenuContent>
					</NavigationMenuItem>
					<NavigationMenuItem className="max-sm:hidden">
						<NavigationMenuLink href="#blog" active={page === "#blog"} onClick={go("#blog")}>
							Blog
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink
							href="#pricing"
							active={page === "#pricing"}
							onClick={go("#pricing")}
						>
							Pricing
						</NavigationMenuLink>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>
		</div>
	);
}
