"use client";

import { Copy, Film, Pencil, Play, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	ContextMenu,
	ContextMenuCheckboxItem,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuRadioGroup,
	ContextMenuRadioItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Empty } from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/toast";

const clips = [
	{ title: "Insane 1v4 clutch", length: "0:42" },
	{ title: "Boss fight, no hits", length: "3:10" },
	{ title: "Funniest fail", length: "0:18" },
];

function ClipCard({ title, length }: { title: string; length: string }) {
	const [pinned, setPinned] = useState(false);
	const [speed, setSpeed] = useState("1");

	return (
		<ContextMenu>
			<ContextMenuTrigger
				aria-label={`${title}, ${length}. Right-click or press Shift+F10 for actions.`}
				className="grid w-40 gap-2 rounded-xl p-1.5 transition-colors hover:bg-accent"
			>
				<div className="relative grid aspect-video place-items-center rounded-lg bg-foreground/[0.06] text-muted-foreground">
					<Film className="size-5" aria-hidden="true" />
					<Badge variant="secondary" className="absolute right-1.5 bottom-1.5 tabular-nums">
						{length}
					</Badge>
				</div>
				<p className="truncate px-0.5 text-left font-medium text-sm">
					{pinned && "📌 "}
					{title}
				</p>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem onSelect={() => toast(`Playing “${title}”`)}>
					<Play aria-hidden="true" />
					Play
				</ContextMenuItem>
				<ContextMenuItem shortcut="⌘C" onSelect={() => toast.success("Link copied")}>
					<Copy aria-hidden="true" />
					Copy link
				</ContextMenuItem>
				<ContextMenuItem onSelect={() => toast("Renaming")}>
					<Pencil aria-hidden="true" />
					Rename
				</ContextMenuItem>
				<ContextMenuCheckboxItem checked={pinned} onCheckedChange={setPinned}>
					Pin to profile
				</ContextMenuCheckboxItem>
				<ContextMenuSeparator />
				<ContextMenuLabel>Playback speed</ContextMenuLabel>
				<ContextMenuRadioGroup value={speed} onValueChange={setSpeed}>
					{["0.5", "1", "1.5", "2"].map((option) => (
						<ContextMenuRadioItem key={option} value={option}>
							{option}×
						</ContextMenuRadioItem>
					))}
				</ContextMenuRadioGroup>
				<ContextMenuSeparator />
				<ContextMenuItem variant="destructive" onSelect={() => toast.error("Clip deleted")}>
					<Trash2 aria-hidden="true" />
					Delete
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	);
}

export function ContextMenuDemo() {
	return (
		<div className="flex flex-col items-center gap-4">
			<div className="flex flex-wrap justify-center gap-3">
				{clips.map((clip) => (
					<ClipCard key={clip.title} {...clip} />
				))}
			</div>
			<p className="text-muted-foreground text-xs">
				Right-click a clip, or focus one and press Shift+F10.
			</p>
		</div>
	);
}

export function AlertDemo() {
	return (
		<div className="grid w-full max-w-lg gap-3">
			<Alert variant="info">
				<AlertTitle>New version available</AlertTitle>
				<AlertDescription>
					labsUI 0.2 adds Context menu, Alert, Progress and Empty.
				</AlertDescription>
			</Alert>
			<Alert variant="success">
				<AlertTitle>Bot connected</AlertTitle>
				<AlertDescription>Slash commands are live in 3 servers.</AlertDescription>
			</Alert>
			<Alert
				variant="warning"
				action={
					<Button
						size="sm"
						variant="outline"
						onClick={() => toast.info("Demo mode: tokens can't be renewed here")}
					>
						Renew
					</Button>
				}
			>
				<AlertTitle>Token expires in 2 days</AlertTitle>
				<AlertDescription>Renew it to keep the dashboard in sync.</AlertDescription>
			</Alert>
			<Alert variant="destructive">
				<AlertTitle>Payment failed</AlertTitle>
				<AlertDescription>Your card was declined. Update it in Billing.</AlertDescription>
			</Alert>
		</div>
	);
}

export function ProgressDemo() {
	const [value, setValue] = useState(0);
	const [running, setRunning] = useState(false);

	useEffect(() => {
		if (!running) return;

		const timer = setInterval(() => {
			setValue((value) => {
				const next = Math.min(value + 7 + Math.random() * 12, 100);

				if (next >= 100) setRunning(false);

				return next;
			});
		}, 400);

		return () => clearInterval(timer);
	}, [running]);

	return (
		<div className="grid w-full max-w-sm gap-6">
			<Progress label="Uploading clip.mp4" value={value} showValue />
			<Progress label="Processing" />
			<Progress value={64} size="sm" aria-label="Storage used" />
			<Button
				variant="outline"
				onClick={() => {
					setValue(0);
					setRunning(true);
				}}
				disabled={running}
			>
				<Upload aria-hidden="true" />
				{value >= 100 ? "Upload again" : "Start upload"}
			</Button>
		</div>
	);
}

export function EmptyDemo() {
	return (
		<div className="grid w-full max-w-md gap-4">
			<Empty
				bordered
				icon={<Film />}
				title="No clips yet"
				description="Record a moment in-game with Alt+F10, or upload a video from your computer."
			>
				<Button size="sm" onClick={() => toast("Demo mode: uploads are turned off")}>
					<Upload aria-hidden="true" />
					Upload clip
				</Button>
				<Button size="sm" variant="ghost" onClick={() => toast("Clips are kept for 30 days.")}>
					Learn more
				</Button>
			</Empty>
		</div>
	);
}
