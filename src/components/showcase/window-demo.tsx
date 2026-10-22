"use client";

import { RotateCcw, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MacWindow } from "@/components/ui/mac-window";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { toast } from "@/components/ui/toast";
import { useSpringConfig } from "@/lib/spring-config";

const tabs = ["Overview", "Activity", "Settings"] as const;

const rows = [
	{ name: "Deploy web@4f2a1c", status: "Ready", time: "2m ago" },
	{ name: "Deploy api@9b77e0", status: "Building", time: "5m ago" },
	{ name: "Deploy web@1c09d3", status: "Failed", time: "1h ago" },
];

export function WindowDemo() {
	const spring = useSpringConfig();
	const [open, setOpen] = useState(true);
	const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");

	return (
		<div className="flex w-full max-w-2xl flex-col items-center gap-4">
			<AnimatePresence mode="popLayout" initial={false}>
				{open ? (
					<motion.div
						key="win"
						className="w-full"
						initial={{ opacity: 0, scale: 0.9, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.9, y: 20 }}
						transition={spring}
					>
						<MacWindow
							onClose={() => setOpen(false)}
							onMinimize={() => toast("Minimized", { description: "Pretend it went to the Dock." })}
							onMaximize={() => toast("Zoom", { description: "Hook this up to fullscreen." })}
							header={
								<SegmentedTabs
									label="Window tabs"
									items={tabs}
									value={tab}
									onChange={(t) => setTab(t as (typeof tabs)[number])}
								/>
							}
							actions={
								<Avatar size="sm" alt="Jane Doe" status="online" className="size-6 text-[10px]" />
							}
							bodyClassName="p-5"
						>
							<div className="mb-4 flex items-center gap-2">
								<div className="relative flex-1">
									<Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
									<Input
										placeholder={`Search ${tab.toLowerCase()}…`}
										aria-label="Search"
										className="pl-9"
									/>
								</div>
								<Button variant="outline">Filter</Button>
							</div>
							<ul className="divide-y rounded-lg border">
								{rows.map((r) => (
									<li
										key={r.name}
										className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
									>
										<span className="truncate font-mono text-xs">{r.name}</span>
										<span className="flex shrink-0 items-center gap-3">
											<Badge
												shape="pill"
												dot
												variant={
													r.status === "Ready"
														? "success"
														: r.status === "Failed"
															? "destructive"
															: "secondary"
												}
											>
												{r.status}
											</Badge>
											<span className="hidden text-muted-foreground text-xs sm:inline">
												{r.time}
											</span>
										</span>
									</li>
								))}
							</ul>
						</MacWindow>
					</motion.div>
				) : (
					<motion.div
						key="reopen"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						transition={spring}
					>
						<Button variant="outline" onClick={() => setOpen(true)}>
							<RotateCcw /> Reopen window
						</Button>
					</motion.div>
				)}
			</AnimatePresence>
			<p className="text-muted-foreground text-xs">
				Traffic lights are buttons: try close, minimize, zoom.
			</p>
		</div>
	);
}
