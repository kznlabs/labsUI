"use client";

import { Bot, Hash, Inbox, LayoutDashboard, ScrollText, Settings, Shield } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Kbd } from "@/components/ui/kbd";
import { MacWindow } from "@/components/ui/mac-window";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";

const main = [
	{ label: "Overview", icon: <LayoutDashboard /> },
	{ label: "Inbox", icon: <Inbox />, badge: 12 },
	{ label: "Commands", icon: <Bot /> },
	{ label: "Mod log", icon: <ScrollText /> },
];

const channels = ["general", "announcements", "clips", "off-topic"];

export function SidebarDemo() {
	const [active, setActive] = useState("Overview");
	const item = (label: string, icon: ReactNode, badge?: number) => (
		<SidebarMenuItem key={label}>
			<SidebarMenuButton
				icon={icon}
				badge={badge}
				isActive={active === label}
				onClick={() => setActive(label)}
			>
				{label}
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
	return (
		<MacWindow title="Guild admin" className="w-full max-w-2xl" bodyClassName="flex h-96">
			<SidebarProvider>
				<Sidebar label="Admin">
					<SidebarHeader className="border-b">
						<div className="flex h-8 items-center gap-2.5 px-0.5">
							<Avatar size="sm" alt="Labs Guild" className="size-7 shrink-0 text-[10px]" />
							<span className="truncate font-semibold">Labs Guild</span>
						</div>
					</SidebarHeader>
					<SidebarContent>
						<SidebarGroup>
							<SidebarGroupLabel>Server</SidebarGroupLabel>
							<SidebarMenu>{main.map((m) => item(m.label, m.icon, m.badge))}</SidebarMenu>
						</SidebarGroup>
						<Collapsible defaultOpen>
							<SidebarGroup>
								<CollapsibleTrigger className="px-2.5 pb-1 text-muted-foreground text-xs transition-opacity duration-400 ease-in-out group-data-[state=collapsed]/sidebar:opacity-0">
									Channels
								</CollapsibleTrigger>
								<CollapsibleContent>
									<SidebarMenu>{channels.map((c) => item(c, <Hash />))}</SidebarMenu>
								</CollapsibleContent>
							</SidebarGroup>
						</Collapsible>
					</SidebarContent>
					<SidebarFooter>
						<SidebarMenu>
							{item("Roles", <Shield />)}
							{item("Settings", <Settings />)}
						</SidebarMenu>
					</SidebarFooter>
				</Sidebar>
				<section aria-label={active} className="flex min-w-0 flex-1 flex-col">
					<div className="flex h-11 items-center gap-2 border-b px-2">
						<SidebarTrigger />
						<p className="truncate font-medium text-sm">{active}</p>
						<Avatar
							size="sm"
							alt="Jane Doe"
							status="online"
							className="ml-auto size-6 text-[10px]"
						/>
					</div>
					<div className="grid flex-1 place-items-center p-6 text-center text-muted-foreground text-sm">
						<p>
							Press <Kbd>⌘B</Kbd> or the panel button to collapse the sidebar to an icon rail.
						</p>
					</div>
				</section>
			</SidebarProvider>
		</MacWindow>
	);
}
