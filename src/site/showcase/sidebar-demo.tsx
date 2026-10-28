"use client";

import { Bot, Hash, Inbox, LayoutDashboard, ScrollText, Settings, Shield } from "lucide-react";
import { useState } from "react";
import { AppWindow } from "@/components/ui/app-window";
import { Avatar } from "@/components/ui/avatar";
import { Kbd } from "@/components/ui/kbd";
import { Sidebar, SidebarLayout, SidebarTrigger } from "@/components/ui/sidebar";

const groups = [
	{
		label: "Server",
		items: [
			{ label: "Overview", icon: <LayoutDashboard /> },
			{ label: "Inbox", icon: <Inbox />, badge: 12 },
			{ label: "Commands", icon: <Bot /> },
			{ label: "Mod log", icon: <ScrollText /> },
		],
	},
	{
		label: "Channels",
		collapsible: true,
		items: ["general", "announcements", "clips", "off-topic"].map((channel) => ({
			label: channel,
			icon: <Hash />,
		})),
	},
];

const footer = [
	{ label: "Roles", icon: <Shield /> },
	{ label: "Settings", icon: <Settings /> },
];

export function SidebarDemo() {
	const [active, setActive] = useState("Overview");

	return (
		<AppWindow title="Guild admin" className="w-full max-w-2xl" bodyClassName="flex h-96">
			<SidebarLayout>
				<Sidebar
					label="Admin"
					header={
						<div className="flex h-8 items-center gap-2.5 px-0.5">
							<Avatar size="sm" alt="Labs Guild" className="size-7 shrink-0 text-[10px]" />
							<span className="truncate font-semibold">Labs Guild</span>
						</div>
					}
					groups={groups}
					footer={footer}
					current={active}
					onSelect={setActive}
				/>
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
			</SidebarLayout>
		</AppWindow>
	);
}
