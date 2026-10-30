"use client";

import {
	Bot,
	Camera,
	Copy,
	Film,
	Gamepad2,
	GitMerge,
	Headphones,
	Keyboard,
	Monitor,
	Mouse,
	Rocket,
	ShieldAlert,
	Tag,
	UserX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselDots,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { Chart } from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import { Code } from "@/components/ui/code";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Field } from "@/components/ui/field";
import { InputOTP } from "@/components/ui/input-otp";
import { Highlight, Marker } from "@/components/ui/marker";
import { SearchInput } from "@/components/ui/search-input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Terminal, type TerminalLine } from "@/components/ui/terminal";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { toast } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const members = [
	{ name: "Jane Cooper", role: "Admin", messages: 4210, joined: "2023-02-11" },
	{ name: "Wade Warren", role: "Moderator", messages: 1882, joined: "2023-08-29" },
	{ name: "Esther Howard", role: "Member", messages: 642, joined: "2024-01-04" },
	{ name: "Cameron Williamson", role: "Member", messages: 97, joined: "2024-06-17" },
	{ name: "Brooklyn Simmons", role: "Bot", messages: 12904, joined: "2022-11-30" },
];

type SortKey = "name" | "messages" | "joined";

export function TableDemo() {
	const [sort, setSort] = useState<{ key: SortKey; dir: "ascending" | "descending" }>({
		key: "messages",
		dir: "descending",
	});
	const [selected, setSelected] = useState<string[]>([]);

	const rows = [...members].sort((a, b) => {
		const order = a[sort.key] < b[sort.key] ? -1 : a[sort.key] > b[sort.key] ? 1 : 0;

		return sort.dir === "ascending" ? order : -order;
	});
	const head = (key: SortKey) => ({
		sort: sort.key === key ? sort.dir : ("none" as const),
		onSort: () =>
			setSort((current) => ({
				key,
				dir: current.key === key && current.dir === "ascending" ? "descending" : "ascending",
			})),
	});
	const all = selected.length === members.length;
	const total = members.reduce((sum, member) => sum + member.messages, 0);

	return (
		<Table striped containerClassName="max-w-2xl">
			<TableCaption>Guild members · {selected.length} selected</TableCaption>

			<TableHeader>
				<TableRow>
					<TableHead>
						<Checkbox
							aria-label="Select all members"
							checked={all}
							indeterminate={selected.length > 0 && !all}
							onCheckedChange={(on) => setSelected(on ? members.map((member) => member.name) : [])}
						/>
					</TableHead>

					<TableHead {...head("name")}>Member</TableHead>

					<TableHead>Role</TableHead>

					<TableHead {...head("messages")} className="text-right">
						Messages
					</TableHead>

					<TableHead {...head("joined")} className="hidden sm:table-cell">
						Joined
					</TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{rows.map((row) => {
					const on = selected.includes(row.name);

					return (
						<TableRow key={row.name} data-state={on ? "selected" : undefined}>
							<TableCell>
								<Checkbox
									aria-label={`Select ${row.name}`}
									checked={on}
									onCheckedChange={(checked) =>
										setSelected((selected) =>
											checked
												? [...selected, row.name]
												: selected.filter((name) => name !== row.name),
										)
									}
								/>
							</TableCell>

							<TableCell>
								<div className="flex items-center gap-2.5">
									<Avatar
										alt={row.name}
										size="sm"
										fallback={row.role === "Bot" ? <Bot /> : undefined}
									/>

									<span className="font-medium">{row.name}</span>
								</div>
							</TableCell>

							<TableCell>
								<Badge
									variant={
										row.role === "Admin" ? "default" : row.role === "Bot" ? "outline" : "secondary"
									}
								>
									{row.role}
								</Badge>
							</TableCell>

							<TableCell className="text-right tabular-nums">
								{row.messages.toLocaleString("en-US")}
							</TableCell>

							<TableCell className="hidden text-muted-foreground tabular-nums sm:table-cell">
								{row.joined}
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>

			<TableFooter>
				<TableRow>
					<TableCell colSpan={3}>Total</TableCell>

					<TableCell className="text-right tabular-nums">{total.toLocaleString("en-US")}</TableCell>

					<TableCell className="hidden sm:table-cell" />
				</TableRow>
			</TableFooter>
		</Table>
	);
}

const firstNames = ["Jane", "Wade", "Esther", "Cameron", "Brooklyn", "Leslie", "Guy", "Kristin"];
const lastNames = ["Cooper", "Warren", "Howard", "Williamson", "Simmons", "Alexander", "Hawkins"];
const roles = ["Member", "Member", "Moderator", "Member", "Admin", "Member", "Bot"] as const;

type GuildMember = { id: string; name: string; role: (typeof roles)[number]; messages: number };

// Deterministic so server and client render the same rows.
const guild: GuildMember[] = Array.from({ length: 27 }, (_, i) => ({
	id: `m${i + 1}`,
	name: `${firstNames[i % firstNames.length]} ${lastNames[(i * 3) % lastNames.length]}`,
	role: roles[i % roles.length],
	messages: (i * 7919) % 5000,
}));

const guildColumns: DataTableColumn<GuildMember>[] = [
	{
		id: "name",
		header: "Member",
		accessor: (member) => member.name,
		sortable: true,
		cell: (member) => (
			<div className="flex items-center gap-2.5">
				<Avatar
					alt={member.name}
					size="sm"
					fallback={member.role === "Bot" ? <Bot /> : undefined}
				/>

				<span className="max-w-28 truncate font-medium sm:max-w-none">{member.name}</span>
			</div>
		),
	},
	{
		id: "role",
		header: "Role",
		accessor: (member) => member.role,
		sortable: true,
		className: "hidden sm:table-cell",
		cell: (member) => (
			<Badge
				variant={
					member.role === "Admin" ? "default" : member.role === "Bot" ? "outline" : "secondary"
				}
			>
				{member.role}
			</Badge>
		),
	},
	{
		id: "messages",
		header: "Messages",
		accessor: (member) => member.messages,
		sortable: true,
		className: "text-right tabular-nums",
		cell: (member) => member.messages.toLocaleString("en-US"),
	},
];

export function DataTableDemo() {
	const [rows, setRows] = useState(guild);
	const [selection, setSelection] = useState<string[]>([]);

	const kick = (ids: string[]) => {
		setRows((rows) => rows.filter((member) => !ids.includes(member.id)));
		setSelection((selected) => selected.filter((id) => !ids.includes(id)));
		toast.success(ids.length === 1 ? "Member kicked" : `${ids.length} members kicked`, {
			action: { label: "Undo", onClick: () => setRows(guild) },
		});
	};

	return (
		<DataTable
			className="max-w-2xl"
			label="Members"
			rowLabel={(member) => member.name}
			data={rows}
			columns={guildColumns}
			getRowId={(member) => member.id}
			pageSize={6}
			defaultSort={{ id: "messages", dir: "descending" }}
			selectable
			selection={selection}
			onSelectionChange={setSelection}
			striped
			toolbar={(selected) =>
				selected.length > 0 && (
					<Button
						size="sm"
						variant="destructive"
						onClick={() => kick(selected.map((member) => member.id))}
					>
						Kick {selected.length}
					</Button>
				)
			}
			rowActions={(member) => (
				<>
					<DropdownMenuItem
						onSelect={() => {
							navigator.clipboard?.writeText(member.id);
							toast("Copied member ID", { description: member.id });
						}}
					>
						<Copy />
						Copy ID
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					<DropdownMenuItem variant="destructive" onSelect={() => kick([member.id])}>
						<UserX />
						Kick
					</DropdownMenuItem>
				</>
			)}
		/>
	);
}

const revenue = [
	{ month: "Jan", web: 4200, app: 2400, partners: 1100 },
	{ month: "Feb", web: 4600, app: 2900, partners: 1200 },
	{ month: "Mar", web: 5100, app: 3100, partners: 1500 },
	{ month: "Apr", web: 4800, app: 3600, partners: 1400 },
	{ month: "May", web: 5600, app: 4100, partners: 1900 },
	{ month: "Jun", web: 6200, app: 4300, partners: 2100 },
	{ month: "Jul", web: 5900, app: 4900, partners: 2300 },
	{ month: "Aug", web: 6500, app: 5400, partners: 2200 },
];

const channels = [
	{ key: "web", label: "Web" },
	{ key: "app", label: "App" },
	{ key: "partners", label: "Partners" },
];

export function ChartDemo() {
	const [type, setType] = useState("line");
	const [stacked, setStacked] = useState(true);

	return (
		<div className="grid w-full max-w-2xl grid-cols-1 gap-4">
			<div className="flex flex-wrap items-center gap-4">
				<ToggleGroup size="sm" aria-label="Chart type" value={type} onValueChange={setType}>
					<ToggleGroupItem value="line">Line</ToggleGroupItem>

					<ToggleGroupItem value="area">Area</ToggleGroupItem>

					<ToggleGroupItem value="bar">Bar</ToggleGroupItem>
				</ToggleGroup>

				{type === "bar" && (
					<Field label="Stacked" orientation="horizontal">
						<Switch checked={stacked} onCheckedChange={setStacked} />
					</Field>
				)}
			</div>

			<Chart
				type={type as "line" | "area" | "bar"}
				stacked={stacked}
				label="Revenue by channel"
				data={revenue}
				index="month"
				series={channels}
				format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
			/>
		</div>
	);
}

export function SpinnerDemo() {
	const [saving, setSaving] = useState(false);

	return (
		<div className="flex flex-col items-center gap-6">
			<div className="flex items-end gap-6">
				<Spinner size="sm" />

				<Spinner />

				<Spinner size="lg" />

				<Spinner size="lg" className="text-primary-ink" />
			</div>

			<div className="flex items-center gap-2 text-muted-foreground text-sm">
				<Spinner label="" />

				<span role="status">Syncing 3 servers…</span>
			</div>

			<Button
				variant="outline"
				loading={saving}
				onClick={() => {
					setSaving(true);
					setTimeout(() => setSaving(false), 1600);
				}}
			>
				Save draft
			</Button>
		</div>
	);
}

export function InputOTPDemo() {
	const [code, setCode] = useState("");
	const [error, setError] = useState<string>();
	const [verified, setVerified] = useState(false);

	return (
		<div className="grid w-full max-w-sm grid-cols-1 gap-8">
			<div className="grid justify-items-start gap-3">
				<Field
					label="Verification code"
					description={
						verified
							? "Two-factor authentication is on for jane@example.com."
							: "We sent a 6-digit code to jane@example.com. Try 424242."
					}
					error={error}
				>
					<InputOTP
						groups={[3, 3]}
						value={code}
						verified={verified}
						onValueChange={(value) => {
							setCode(value);
							setError(undefined);
						}}
						onComplete={(value) => {
							if (value === "424242") setVerified(true);
							else setError("That code is not right. Check it and try again.");
						}}
					/>
				</Field>

				{verified && (
					<Button
						size="sm"
						variant="outline"
						onClick={() => {
							setVerified(false);
							setCode("");
						}}
					>
						Use another code
					</Button>
				)}
			</div>

			<Field label="Gift card" description="Letters and digits, uppercased as you type.">
				<InputOTP charset="alphanumeric" length={8} groups={[4, 4]} />
			</Field>
		</div>
	);
}

const clipThumbs = [
	{ ratio: 16 / 9, label: "16:9", className: "w-56" },
	{ ratio: 1, label: "1:1", className: "w-32" },
	{ ratio: 9 / 16, label: "9:16", className: "w-24" },
];

export function AspectRatioDemo() {
	return (
		<div className="flex flex-wrap items-end justify-center gap-4">
			{clipThumbs.map((clipThumb) => (
				<figure key={clipThumb.label} className={clipThumb.className}>
					<AspectRatio
						ratio={clipThumb.ratio}
						className="grid place-items-center rounded-xl border bg-foreground/[0.06] text-muted-foreground"
					>
						<Film className="size-5" aria-hidden="true" />
					</AspectRatio>

					<figcaption className="mt-2 text-center text-muted-foreground text-xs tabular-nums">
						{clipThumb.label}
					</figcaption>
				</figure>
			))}
		</div>
	);
}

export function TimelineDemo() {
	return (
		<Timeline className="w-full max-w-md">
			<TimelineItem
				icon={<Rocket />}
				variant="active"
				time="Oct 21, 2026"
				dateTime="2026-10-21"
				title="v0.3 released"
			>
				Table, Input OTP, Timeline, Spinner and Aspect ratio.
			</TimelineItem>

			<TimelineItem
				icon={<GitMerge />}
				time="Oct 18, 2026"
				dateTime="2026-10-18"
				title="Merged #128"
			>
				Command palette keyword matching.
			</TimelineItem>

			<TimelineItem
				icon={<ShieldAlert />}
				variant="warning"
				time="Oct 12, 2026"
				dateTime="2026-10-12"
				title="Rate limit raised"
			/>

			<TimelineItem icon={<Tag />} variant="success" time="Sep 30, 2026" title="v0.2 tagged" />

			<TimelineItem time="Sep 2, 2026" title="Project started" />
		</Timeline>
	);
}

const products = [
	{
		name: "Studio mic",
		price: 129,
		tag: "New",
		icon: Headphones,
		tint: "bg-chart-1/12 text-chart-1",
	},
	{
		name: "Clip camera",
		price: 349,
		tag: "Popular",
		icon: Camera,
		tint: "bg-chart-2/12 text-chart-2",
	},
	{ name: "Low-profile keyboard", price: 159, icon: Keyboard, tint: "bg-chart-3/12 text-chart-3" },
	{
		name: "4K monitor",
		price: 499,
		tag: "−15%",
		icon: Monitor,
		tint: "bg-chart-7/12 text-chart-7",
	},
	{ name: "Silent mouse", price: 49, icon: Mouse, tint: "bg-chart-5/12 text-chart-5" },
	{ name: "Controller", price: 69, icon: Gamepad2, tint: "bg-chart-4/12 text-chart-4" },
];

export function CarouselDemo() {
	return (
		<Carousel label="Featured products" className="w-full max-w-xl">
			<CarouselContent className="sm:[--per-view:2]">
				{products.map((product) => (
					<CarouselItem key={product.name}>
						<article className="overflow-hidden rounded-xl border bg-card">
							<AspectRatio ratio={4 / 3} className={`grid place-items-center ${product.tint}`}>
								<product.icon className="size-10" aria-hidden="true" />
							</AspectRatio>

							<div className="flex items-center justify-between gap-2 p-3">
								<div className="min-w-0">
									<h3 className="truncate font-medium text-sm">{product.name}</h3>

									<p className="text-muted-foreground text-sm tabular-nums">${product.price}</p>
								</div>

								{product.tag && <Badge variant="secondary">{product.tag}</Badge>}
							</div>

							<div className="px-3 pb-3">
								<Button
									size="sm"
									variant="outline"
									className="w-full"
									onClick={() => toast.success(`${product.name} added to cart`)}
								>
									Add to cart
								</Button>
							</div>
						</article>
					</CarouselItem>
				))}
			</CarouselContent>

			<CarouselPrevious />

			<CarouselNext />

			<CarouselDots />
		</Carousel>
	);
}

const install: TerminalLine[] = [
	{ kind: "command", text: "bun create next-app clips --empty" },
	{ kind: "muted", text: "Creating a new Next.js app in ./clips" },
	{ kind: "success", text: "Created clips in 1.8s" },
	{ kind: "command", text: "cd clips && bun add motion lucide-react" },
	{ kind: "output", text: "installed motion@14.6.0" },
	{ kind: "output", text: "installed lucide-react@1.4.0" },
	{ kind: "success", text: "2 packages installed [612ms]" },
];

const events: Omit<TerminalLine, "id" | "time">[] = [
	{ kind: "output", text: "[gateway] heartbeat ack · 42ms" },
	{ kind: "success", text: "/clip saved for @jane in #highlights" },
	{ kind: "output", text: "[queue] 3 renders pending" },
	{ kind: "warn", text: "rate limit: 4/5 requests in #general" },
	{ kind: "success", text: "render 8f2c done · 12.4s" },
	{ kind: "error", text: "upload failed: 413 Payload Too Large (clip 91 MB)" },
	{ kind: "muted", text: "[gc] freed 18 MB" },
];

const clock = (seconds: number) =>
	`12:${String(4 + Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export function TerminalDemo() {
	const [lines, setLines] = useState<TerminalLine[]>([
		{ id: 0, time: clock(0), kind: "success", text: "Clipper#4021 connected to 12 servers" },
	]);
	const [running, setRunning] = useState(true);

	useEffect(() => {
		if (!running) return;

		const timer = setInterval(
			() =>
				setLines((lines) => {
					const next = (lines.at(-1)?.id as number) + 1;
					const sample = events[next % events.length] ?? events[0];

					// Keep the last 200 lines, a log view can't grow forever.
					return [
						...lines,
						{ ...sample, id: next, time: clock(next * 3), text: sample?.text ?? "" },
					].slice(-200);
				}),
			900,
		);

		return () => clearInterval(timer);
	}, [running]);

	return (
		<div className="grid w-full max-w-2xl gap-6">
			<Terminal title="zsh — clips" typing lines={install} />

			<div className="grid gap-2">
				<Terminal title="clipper.log" log lines={lines} copyText={false} bodyClassName="h-56" />

				<div className="flex gap-2">
					<Button size="sm" variant="outline" onClick={() => setRunning((current) => !current)}>
						{running ? "Pause" : "Resume"}
					</Button>

					<Button size="sm" variant="ghost" onClick={() => setLines((lines) => lines.slice(-1))}>
						Clear
					</Button>
				</div>
			</div>
		</div>
	);
}

const transcript = [
	{ t: "0:02", text: "Okay, the boss is at half health, swap to the long bow." },
	{ t: "0:07", text: "Jane, hold the left door, I will pull it toward the bridge." },
	{ t: "0:13", text: "Wait, the bridge is breaking. Jump, jump now!" },
	{ t: "0:18", text: "That was the cleanest boss fight we have ever had." },
	{ t: "0:24", text: "Somebody clip that before it is gone." },
];

export function MarkerDemo() {
	const [query, setQuery] = useState("boss");
	const needle = query.trim().toLowerCase();
	const count = needle
		? transcript.reduce((sum, line) => sum + line.text.toLowerCase().split(needle).length - 1, 0)
		: 0;

	return (
		<div className="grid w-full max-w-lg gap-8">
			<p className="text-lg leading-relaxed">
				A clip is worth sharing when it is{" "}
				<Marker draw color="yellow">
					short
				</Marker>
				, has a{" "}
				<Marker draw delay={0.3} color="green">
					clear moment
				</Marker>{" "}
				and ends{" "}
				<Marker draw delay={0.6} color="primary">
					before anyone asks why they are still watching
				</Marker>
				.
			</p>

			<div className="grid gap-3">
				<div className="flex items-center gap-3">
					<SearchInput
						label="Search transcript"
						placeholder="Search transcript…"
						value={query}
						onValueChange={setQuery}
						className="flex-1"
					/>

					<p aria-live="polite" className="shrink-0 text-muted-foreground text-sm tabular-nums">
						{needle ? `${count} match${count === 1 ? "" : "es"}` : ""}
					</p>
				</div>

				<ol className="grid gap-1.5 text-sm">
					{transcript.map((line) => {
						const hit = !needle || line.text.toLowerCase().includes(needle);

						return (
							<li
								key={line.t}
								className={`flex gap-3 transition-opacity ${hit ? "" : "opacity-40"}`}
							>
								<time className="w-8 shrink-0 text-muted-foreground tabular-nums">{line.t}</time>

								<span>
									<Highlight text={line.text} query={query} />
								</span>
							</li>
						);
					})}
				</ol>
			</div>
		</div>
	);
}

const server = `import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { db } from "./db";

const app = new Elysia()
  .use(cors())
  .get("/clips", () => db.clips.list())
  .post("/clips", ({ body }) => db.clips.create(body), {
    body: t.Object({
      title: t.String({ minLength: 1 }),
      url: t.String({ format: "uri" }),
    }),
  })
  .listen(3000);

console.log(\`Clips API on :\${app.server?.port}\`);`;

export function CodeDemo() {
	const [on, setOn] = useState(["numbers", "lines", "words", "notes"]);

	return (
		<div className="grid w-full max-w-xl gap-3">
			<ToggleGroup
				type="multiple"
				size="sm"
				aria-label="Annotations"
				value={on}
				onValueChange={setOn}
				className="justify-self-start"
			>
				<ToggleGroupItem value="numbers">Numbers</ToggleGroupItem>

				<ToggleGroupItem value="lines">Lines</ToggleGroupItem>

				<ToggleGroupItem value="words">Words</ToggleGroupItem>

				<ToggleGroupItem value="notes">Notes</ToggleGroupItem>
			</ToggleGroup>

			<Code
				code={server}
				language="ts"
				lineNumbers={on.includes("numbers")}
				highlight={on.includes("lines") ? [[8, 13]] : []}
				marks={
					on.includes("words") ? ["t.Object", "t.String", { line: 14, start: 2, end: 15 }] : []
				}
				notes={
					on.includes("notes")
						? {
								2: "Remember to add it: bun add @elysiajs/cors",
								8: "The schema validates the body and types it for the handler.",
							}
						: {}
				}
				className="my-0"
			/>
		</div>
	);
}
