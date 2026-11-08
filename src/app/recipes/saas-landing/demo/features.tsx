import {
	BellRing,
	CheckCircle2,
	Clock,
	Globe,
	HeartPulse,
	KeyRound,
	LockKeyhole,
	PhoneCall,
	Search,
	TriangleAlert,
	Webhook,
} from "lucide-react";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { cn } from "@/lib/utils";

const more = [
	{
		icon: <Search />,
		title: "Keyword checks",
		body: "Fail a check when the page loads but says “Error” or loses its “Add to cart”.",
	},
	{
		icon: <LockKeyhole />,
		title: "SSL and domain expiry",
		body: "A heads-up 30, 14 and 3 days before a certificate or domain runs out.",
	},
	{
		icon: <HeartPulse />,
		title: "Cron heartbeats",
		body: "Your nightly backup pings us when it's done; silence pages whoever is on call.",
	},
	{
		icon: <Webhook />,
		title: "Webhooks and Slack",
		body: "Every alert and recovery as JSON to your endpoint, or a thread per incident.",
	},
	{
		icon: <KeyRound />,
		title: "SSO and audit log",
		body: "Sign in through your identity provider and see who changed which monitor.",
	},
	{
		icon: <Globe />,
		title: "Eight regions",
		body: "Checks from three continents, so a slow route in one region shows up as one.",
	},
];

// 90 days of uptime for the status page: a few slow days and one short outage.
const days = Array.from({ length: 90 }, (_, i) =>
	i === 61 ? "down" : [17, 18, 44, 79].includes(i) ? "slow" : "up",
);

const rotation = [
	{ name: "Maren Holt", shift: "Mon – Wed", now: true },
	{ name: "Ji-woo Park", shift: "Wed – Fri" },
	{ name: "Tomás Ferreira", shift: "Weekend" },
	{ name: "Ola Brennan", shift: "Next Monday" },
];

function Panel({
	title,
	body,
	points,
	children,
}: {
	title: string;
	body: string;
	points: string[];
	children: ReactNode;
}) {
	return (
		<div className="grid items-center gap-8 pt-8 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
			<div>
				<h3 className="font-semibold text-xl tracking-tight">{title}</h3>

				<p className="mt-2 text-muted-foreground leading-relaxed">{body}</p>

				<ul className="mt-5 grid gap-2 text-sm">
					{points.map((point) => (
						<li key={point} className="flex gap-2">
							<CheckCircle2
								aria-hidden="true"
								className="mt-0.5 size-4 shrink-0 text-primary-ink"
							/>

							{point}
						</li>
					))}
				</ul>
			</div>

			<Card className="gap-0 p-5 sm:p-6">{children}</Card>
		</div>
	);
}

function IncidentMock() {
	return (
		<>
			<div className="mb-5 flex flex-wrap items-center justify-between gap-2">
				<p className="font-medium text-sm">Incident #214 · Checkout</p>

				<Badge variant="success" shape="pill">
					Resolved in 7 min
				</Badge>
			</div>

			<Timeline aria-label="Incident #214">
				<TimelineItem
					icon={<TriangleAlert />}
					variant="warning"
					time="14:02:11"
					title="Checkout responds in 3.1 s"
				>
					Confirmed from Virginia, Dublin and Frankfurt.
				</TimelineItem>

				<TimelineItem
					icon={<PhoneCall />}
					variant="active"
					time="14:02:34"
					title="Maren Holt paged"
				>
					Push, then SMS. A phone call follows after 5 minutes.
				</TimelineItem>

				<TimelineItem icon={<BellRing />} time="14:03:02" title="Acknowledged from the app" />

				<TimelineItem
					icon={<CheckCircle2 />}
					variant="success"
					time="14:09:40"
					title="Back under 300 ms"
				>
					Status page updated, subscribers told.
				</TimelineItem>
			</Timeline>
		</>
	);
}

function StatusMock() {
	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="font-medium text-sm">status.harbourline.example</p>

				<Badge variant="success" shape="pill" dot>
					All systems operational
				</Badge>
			</div>

			<div className="mt-6 flex items-baseline justify-between text-sm">
				<p className="font-medium">Checkout</p>

				<p className="text-muted-foreground tabular-nums">99.96% in 90 days</p>
			</div>

			<div
				role="img"
				aria-label="Uptime per day for 90 days: 85 days up, 4 slow, 1 with an outage"
				className="mt-2 flex h-9 gap-[2px]"
			>
				{days.map((day, i) => (
					<span
						// biome-ignore lint/suspicious/noArrayIndexKey: one bar per day, never reordered
						key={i}
						className={cn(
							"flex-1 rounded-[2px]",
							day === "up" && "bg-success/70",
							day === "slow" && "bg-warning",
							day === "down" && "bg-destructive",
						)}
					/>
				))}
			</div>

			<div className="mt-1.5 flex justify-between text-muted-foreground text-xs">
				<span>90 days ago</span>

				<span>Today</span>
			</div>

			<div className="mt-6 grid gap-2 border-t pt-4 text-sm">
				<p className="font-medium">Past incidents</p>

				<p className="text-muted-foreground">
					<span className="text-foreground">Payments delayed</span> · 29 days ago · 18 min
				</p>
			</div>
		</>
	);
}

function OnCallMock() {
	return (
		<>
			<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
				<p className="font-medium text-sm">Platform rotation</p>

				<p className="flex items-center gap-1.5 text-muted-foreground text-xs">
					<Clock aria-hidden="true" className="size-3.5" />
					Hands over at 09:00 CET
				</p>
			</div>

			<ul className="grid gap-2">
				{rotation.map((person) => (
					<li
						key={person.name}
						className={cn(
							"flex items-center gap-3 rounded-xl border px-3 py-2.5",
							person.now && "border-primary/40 bg-primary/5",
						)}
					>
						<Avatar alt={person.name} size="sm" status={person.now ? "online" : undefined} />

						<div className="min-w-0 flex-1">
							<p className="truncate font-medium text-sm">{person.name}</p>

							<p className="text-muted-foreground text-xs">{person.shift}</p>
						</div>

						{person.now && (
							<Badge shape="pill" className="shrink-0">
								On call
							</Badge>
						)}
					</li>
				))}
			</ul>
		</>
	);
}

export function Features() {
	return (
		<>
			<Tabs defaultValue="alerts" variant="underline">
				<TabsList aria-label="What Pingwell does" className="max-w-full overflow-x-auto">
					<TabsTrigger value="alerts">Alerts</TabsTrigger>

					<TabsTrigger value="status">Status pages</TabsTrigger>

					<TabsTrigger value="on-call">On call</TabsTrigger>
				</TabsList>

				<TabsContent value="alerts">
					<Panel
						title="Alerts you can trust at 3 a.m."
						body="A check fails, two more regions confirm it, and the person on call hears about it in under half a minute, with the response, the headers and a screenshot attached."
						points={[
							"Confirmed from three regions, never one",
							"Push, SMS, phone call, Slack or a webhook",
							"Escalates if nobody acknowledges",
						]}
					>
						<IncidentMock />
					</Panel>
				</TabsContent>

				<TabsContent value="status">
					<Panel
						title="A status page that updates itself"
						body="Every monitor can feed a public page on your own domain. When an incident opens, the page says so before anyone writes a word, and subscribers get an email."
						points={[
							"Your domain, your colours",
							"Subscribers by email and RSS",
							"In 12 languages",
						]}
					>
						<StatusMock />
					</Panel>
				</TabsContent>

				<TabsContent value="on-call">
					<Panel
						title="On call without the spreadsheet"
						body="Weekly rotations, swaps from the app and overrides for holidays. The alert finds whoever is on call now, and the next person if they don't answer."
						points={[
							"Rotations and overrides",
							"Quiet hours for low-priority monitors",
							"A calendar feed per person",
						]}
					>
						<OnCallMock />
					</Panel>
				</TabsContent>
			</Tabs>

			<ul className="mt-16 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
				{more.map((feature) => (
					<li key={feature.title} className="flex gap-4">
						<span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-ink [&_svg]:size-5">
							{feature.icon}
						</span>

						<div>
							<h3 className="font-semibold">{feature.title}</h3>

							<p className="mt-1 text-muted-foreground text-sm leading-relaxed">{feature.body}</p>
						</div>
					</li>
				))}
			</ul>
		</>
	);
}
