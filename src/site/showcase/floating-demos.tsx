"use client";

import {
	Bold,
	CalendarDays,
	Code2,
	Italic,
	Link2,
	ListFilter,
	Strikethrough,
	Underline,
} from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { HoverCard } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";

const tags = ["Clutch", "Funny", "Tutorial", "Highlight"];

export function PopoverDemo() {
	const [open, setOpen] = useState(false);
	const [picked, setPicked] = useState<string[]>(["Clutch"]);
	const [sort, setSort] = useState("newest");

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger variant="outline">
				<ListFilter aria-hidden="true" />
				Filters
				{picked.length > 0 && (
					<Badge variant="secondary" shape="pill" className="-mr-1">
						{picked.length}
					</Badge>
				)}
			</PopoverTrigger>
			<PopoverContent align="start" className="grid gap-4">
				<p className="font-medium text-sm">Filter clips</p>
				<div className="grid gap-2.5">
					{tags.map((tag) => (
						<Field key={tag} orientation="horizontal" label={tag}>
							<Checkbox
								checked={picked.includes(tag)}
								onCheckedChange={(checked) =>
									setPicked(checked ? [...picked, tag] : picked.filter((x) => x !== tag))
								}
							/>
						</Field>
					))}
				</div>
				<Separator />
				<Field label="Sort by">
					<Select
						value={sort}
						onValueChange={setSort}
						options={[
							{ value: "newest", label: "Newest" },
							{ value: "views", label: "Most viewed" },
						]}
					/>
				</Field>
				<div className="flex justify-between">
					<Button variant="ghost" size="sm" onClick={() => setPicked([])}>
						Clear
					</Button>
					<Button size="sm" onClick={() => setOpen(false)}>
						Apply
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}

const tools = [
	{ label: "Bold", keys: "⌘B", icon: <Bold aria-hidden="true" /> },
	{ label: "Italic", keys: "⌘I", icon: <Italic aria-hidden="true" /> },
	{ label: "Underline", keys: "⌘U", icon: <Underline aria-hidden="true" /> },
	{ label: "Strikethrough", keys: "⇧⌘X", icon: <Strikethrough aria-hidden="true" /> },
	{ label: "Inline code", keys: "⌘E", icon: <Code2 aria-hidden="true" /> },
	{ label: "Link", keys: "⌘K", icon: <Link2 aria-hidden="true" /> },
];

export function TooltipDemo() {
	const [on, setOn] = useState<string[]>([]);

	return (
		<div className="flex flex-col items-center gap-3">
			<ButtonGroup aria-label="Formatting" attached={false} className="flex-wrap justify-center">
				{tools.map((tool) => (
					<Tooltip
						key={tool.label}
						content={
							<span className="flex items-center gap-2">
								{tool.label}
								<span className="opacity-60">{tool.keys}</span>
							</span>
						}
					>
						<Button
							variant={on.includes(tool.label) ? "secondary" : "outline"}
							size="icon"
							aria-label={tool.label}
							aria-pressed={on.includes(tool.label)}
							onClick={() =>
								setOn((value) =>
									value.includes(tool.label)
										? value.filter((x) => x !== tool.label)
										: [...value, tool.label],
								)
							}
						>
							{tool.icon}
						</Button>
					</Tooltip>
				))}
			</ButtonGroup>
			<p className="text-muted-foreground text-xs">
				Hover one, then slide across: the rest open instantly.
			</p>
		</div>
	);
}

export function HoverCardDemo() {
	return (
		<p className="max-w-sm text-center text-muted-foreground text-sm leading-relaxed">
			Springs tuned by{" "}
			<HoverCard
				content={
					<div className="grid gap-3">
						<div className="flex items-center gap-3">
							<Avatar alt="Jane Doe" status="online" />
							<div className="grid">
								<span className="font-semibold text-sm">Jane Doe</span>
								<span className="text-muted-foreground text-xs">@jane</span>
							</div>
						</div>
						<p className="text-sm">
							Design lead. Ships interfaces that feel native on every platform.
						</p>
						<p className="flex items-center gap-1.5 text-muted-foreground text-xs">
							<CalendarDays className="size-3.5" aria-hidden="true" />
							Joined March 2024 · 128 clips
						</p>
						<Button
							size="sm"
							variant="outline"
							onClick={() => toast("Demo mode: would open @jane's profile")}
						>
							View profile
						</Button>
					</div>
				}
			>
				<button
					type="button"
					onClick={() => toast("Demo mode: would open @jane's profile")}
					className="cursor-pointer rounded-sm font-medium text-foreground underline decoration-border underline-offset-4 outline-none hover:decoration-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
				>
					@jane
				</button>
			</HoverCard>{" "}
			and reviewed by the whole team.
		</p>
	);
}
