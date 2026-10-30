"use client";

import { Bot, Hash, Shield, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, type DateRange } from "@/components/ui/calendar";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { Field } from "@/components/ui/field";
import { RelativeTime } from "@/components/ui/relative-time";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { TagInput } from "@/components/ui/tag-input";
import { toast } from "@/components/ui/toast";

const channels: ComboboxOption[] = [
	"general",
	"announcements",
	"clips",
	"memes",
	"off-topic",
	"bot-commands",
	"mod-log",
	"voice-chat",
	"introductions",
	"feedback",
].map((channel) => ({ value: channel, label: channel, icon: <Hash /> }));

const roles: ComboboxOption[] = [
	{ value: "admin", label: "Admin", icon: <Shield />, keywords: ["owner", "manage"] },
	{ value: "moderator", label: "Moderator", icon: <Shield />, keywords: ["mod"] },
	{ value: "member", label: "Member", icon: <User /> },
	{ value: "bot", label: "Bot", icon: <Bot />, keywords: ["integration"] },
	{ value: "muted", label: "Muted", icon: <User />, disabled: true },
];

export function ComboboxDemo() {
	const [channel, setChannel] = useState("");
	const [picked, setPicked] = useState(["moderator", "bot"]);

	return (
		<form
			className="grid w-full max-w-sm gap-6"
			onSubmit={(event) => {
				event.preventDefault();
				toast.success("Saved", { description: `#${channel} · ${picked.join(", ")}` });
			}}
		>
			<Field label="Post clips to" description="Type to filter 10 channels." required>
				<Combobox
					options={channels}
					value={channel}
					onValueChange={setChannel}
					placeholder="Pick a channel…"
					emptyText="No channel with that name."
				/>
			</Field>
			<Field label="Roles that can run /ban" description="Try “mod” or “owner”.">
				<Combobox
					multiple
					options={roles}
					value={picked}
					onValueChange={setPicked}
					placeholder="Add roles…"
				/>
			</Field>
			<Button type="submit" className="justify-self-start">
				Save
			</Button>
		</form>
	);
}

export function TagInputDemo() {
	const [tags, setTags] = useState(["clutch", "valorant"]);

	return (
		<div className="grid w-full max-w-sm gap-6">
			<Field
				label="Clip tags"
				description="Enter or comma to add, Backspace to remove. Paste “a, b, c” to add several."
			>
				<TagInput value={tags} onValueChange={setTags} placeholder="Add a tag…" />
			</Field>
			<Field label="Allowed domains" description="Up to 3, must contain a dot.">
				<TagInput
					max={3}
					separators={[",", " "]}
					validate={(time) => time.includes(".")}
					defaultValue={["labsui.dev"]}
					placeholder="example.com"
				/>
			</Field>
		</div>
	);
}

const log = [
	"Wade muted Cameron for 10 minutes",
	"Bot deployed v2.4.1",
	"Jane changed the server icon",
	"Esther joined the server",
	"Slow mode on #general set to 5s",
	"Brooklyn pinned a message in #clips",
	"Wade removed 12 spam messages",
	"Jane created the role Event host",
	"Cameron left the server",
	"Bot restarted after an update",
	"Esther boosted the server",
	"Jane renamed #memes to #fun",
];
// Fixed base so server and client render the same times.
const base = Date.UTC(2026, 9, 22, 12);

export function ScrollAreaDemo() {
	return (
		<div className="grid w-full max-w-xl gap-6">
			<ScrollArea aria-label="Moderation log" className="h-64 rounded-xl border bg-card">
				<ol className="px-4 py-2">
					{log.map((entry, i) => (
						<li key={entry}>
							{i > 0 && <Separator />}
							<div className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
								<span>{entry}</span>
								<RelativeTime
									date={new Date(base - i * 47 * 60_000)}
									className="shrink-0 text-muted-foreground text-xs"
								/>
							</div>
						</li>
					))}
				</ol>
			</ScrollArea>
			<ScrollArea orientation="horizontal" aria-label="Clips" className="rounded-xl border bg-card">
				<ul className="flex w-max gap-3 p-4">
					{Array.from({ length: 12 }, (_, i) => (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: static placeholder tiles
							key={i}
							className="grid aspect-video w-36 place-items-center rounded-lg bg-foreground/[0.06] text-muted-foreground text-xs tabular-nums"
						>
							Clip {i + 1}
						</li>
					))}
				</ul>
			</ScrollArea>
		</div>
	);
}

export function ResizableDemo() {
	const [channel, setChannel] = useState("general");

	return (
		<div className="grid w-full max-w-2xl gap-3">
			<div className="h-80 overflow-hidden rounded-xl border bg-card">
				<ResizablePanelGroup>
					<ResizablePanel defaultSize={28} minSize={18} maxSize={45} collapsible>
						<nav aria-label="Channels" className="flex flex-col gap-0.5 p-2 text-sm">
							{channels.slice(0, 6).map((item) => (
								<a
									key={item.value}
									href={`#${item.value}`}
									aria-current={channel === item.value ? "page" : undefined}
									onClick={(event) => {
										event.preventDefault();
										setChannel(item.value);
									}}
									className="flex items-center gap-1.5 rounded-md px-2 py-1 text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[current=page]:bg-accent aria-[current=page]:text-foreground [&_svg]:size-3.5 [&_svg]:shrink-0"
								>
									{item.icon}
									<span className="truncate">{item.label}</span>
								</a>
							))}
						</nav>
					</ResizablePanel>
					<ResizableHandle aria-label="Resize channels" withHandle />
					<ResizablePanel>
						<ResizablePanelGroup direction="vertical">
							<ResizablePanel defaultSize={60} minSize={25}>
								<div className="grid h-full place-content-center gap-1 p-4 text-center text-sm">
									<p className="font-medium">#{channel}</p>
									<p className="text-muted-foreground text-xs">No messages yet.</p>
								</div>
							</ResizablePanel>
							<ResizableHandle aria-label="Resize log" />
							<ResizablePanel minSize={15} collapsible>
								<ScrollArea aria-label="Recent activity" className="h-full">
									<ol className="px-4 py-2 font-mono text-muted-foreground text-xs">
										{log.map((entry) => (
											<li key={entry} className="py-1">
												{entry}
											</li>
										))}
									</ol>
								</ScrollArea>
							</ResizablePanel>
						</ResizablePanelGroup>
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
			<p className="text-muted-foreground text-xs">
				Drag a divider, or focus it and use the arrow keys. Enter or double-click collapses.
			</p>
		</div>
	);
}

const weekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

// Fixed dates, the grid is prerendered so nothing here can depend on "now".
export function CalendarDemo() {
	const [date, setDate] = useState<Date>(new Date(2026, 9, 21));
	const [trip, setTrip] = useState<DateRange>({
		from: new Date(2026, 9, 12),
		to: new Date(2026, 9, 16),
	});

	return (
		<div className="flex flex-wrap items-start justify-center gap-8">
			<Calendar value={date} onValueChange={setDate} />
			<Calendar
				mode="range"
				value={trip}
				onValueChange={setTrip}
				defaultMonth={new Date(2026, 9, 1)}
				isDisabled={weekend}
			/>
		</div>
	);
}

const ago = (days: number) => {
	const now = new Date();

	now.setDate(now.getDate() - days);

	return now;
};

export function DatePickerDemo() {
	// Popover content only renders in the browser, so "today" is fine here.
	const today = new Date();

	return (
		<form
			className="grid w-full max-w-xs gap-5"
			onSubmit={(event) => {
				event.preventDefault();

				const data = new FormData(event.currentTarget);

				toast.success("Submitted", {
					description: `delivery=${data.get("delivery") || "—"} · period=${data.get("period") || "—"}`,
				});
			}}
		>
			<Field label="Delivery date" description="Weekdays from today." required>
				<DatePicker name="delivery" min={today} isDisabled={weekend} />
			</Field>
			<Field label="Report period">
				<DatePicker
					mode="range"
					name="period"
					max={today}
					presets={[
						{ label: "Last 7 days", value: { from: ago(6), to: today } },
						{ label: "Last 30 days", value: { from: ago(29), to: today } },
						{ label: "Last 90 days", value: { from: ago(89), to: today } },
					]}
				/>
			</Field>
			<Button type="submit" className="justify-self-start">
				Submit
			</Button>
		</form>
	);
}
