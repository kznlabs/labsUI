"use client";

import {
	BookOpen,
	Bot,
	Camera,
	Clapperboard,
	Copy,
	Gauge,
	Headphones,
	History,
	Play,
	ShoppingBag,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { Changelog } from "@/components/blocks/changelog";
import { ClipCard } from "@/components/blocks/clip-card";
import { Newsletter } from "@/components/blocks/newsletter";
import { Pricing } from "@/components/blocks/pricing";
import { ProductCard } from "@/components/blocks/product-card";
import { SiteHeader } from "@/components/blocks/site-header";
import { StatTile } from "@/components/blocks/stat-tile";
import { StatsStrip } from "@/components/blocks/stats-strip";
import { Testimonial } from "@/components/blocks/testimonial";
import { Button } from "@/components/ui/button";
import { ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu";
import { MacWindow } from "@/components/ui/mac-window";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";

export function PricingDemo() {
	return (
		<Pricing
			className="w-full max-w-3xl"
			yearlyNote="−20%"
			plans={[
				{
					name: "Hobby",
					description: "One server, the essentials.",
					price: { monthly: 0, yearly: 0 },
					features: ["1 server", "Slash commands", "7-day logs"],
					cta: (
						<Button
							variant="outline"
							className="w-full"
							onClick={() => toast("Demo mode: would open Discord's bot invite")}
						>
							Add to Discord
						</Button>
					),
				},
				{
					name: "Pro",
					description: "For growing communities.",
					price: { monthly: 9, yearly: 7 },
					features: ["10 servers", "Custom commands", "90-day logs", "Clip uploads"],
					featured: true,
					badge: "Popular",
					cta: (
						<Button className="w-full" onClick={() => toast.success("Trial started")}>
							Start free trial
						</Button>
					),
				},
				{
					name: "Network",
					description: "Many servers, one dashboard.",
					price: { monthly: 29, yearly: 23 },
					features: ["Unlimited servers", "Role sync", "Audit export", "Priority support"],
					cta: (
						<Button
							variant="outline"
							className="w-full"
							onClick={() => toast.success("Thanks! Sales will reply within a day.")}
						>
							Contact us
						</Button>
					),
				},
			]}
		/>
	);
}

const fans = [
	"Jane Cooper",
	"Wade Warren",
	"Esther Howard",
	"Cameron Williamson",
	"Leslie Alexander",
	"Guy Hawkins",
	"Robert Fox",
].map((alt) => ({ alt }));

export function TestimonialDemo() {
	return (
		<Testimonial
			className="w-full max-w-xl"
			author="Jane Cooper"
			subtitle="Runs a 40k-member speedrunning server"
			others={fans}
			othersLabel="and 2,400 other moderators"
		>
			We replaced three bots with one dashboard. Mod log, clips and roles finally live in the same
			place.
		</Testimonial>
	);
}

export function StatsStripDemo() {
	return (
		<StatsStrip
			className="w-full max-w-2xl"
			stats={[
				{ label: "Servers", value: 1284, hint: "+32 this week" },
				{ label: "Commands run", value: 2.4, suffix: "M", decimals: 1 },
				{ label: "Uptime", value: 99.98, suffix: "%", decimals: 2, hint: "last 90 days" },
				{ label: "Revenue", value: 48290, prefix: "$" },
			]}
		/>
	);
}

const tile = (Icon: typeof Camera, tint: string) => (
	<div className={`grid size-full place-items-center ${tint}`}>
		<Icon className="size-10" aria-hidden="true" />
	</div>
);

export function ProductCardDemo() {
	return (
		<div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
			<ProductCard
				name="Clip camera"
				price={279}
				compareAt={349}
				badge="−20%"
				href="#product-card"
				media={[
					tile(Camera, "bg-chart-2/12 text-chart-2"),
					tile(Camera, "bg-chart-1/12 text-chart-1"),
					tile(Camera, "bg-chart-3/12 text-chart-3"),
				]}
				onAddToCart={() => toast.success("Clip camera added to cart")}
			/>
			<ProductCard
				name="Studio headphones"
				price={129}
				badge="New"
				media={[tile(Headphones, "bg-chart-5/12 text-chart-5")]}
				onAddToCart={() => toast.success("Studio headphones added to cart")}
			/>
		</div>
	);
}

const clipActions = (title: string) => (
	<>
		<ContextMenuItem onSelect={() => toast(`Playing “${title}”`)}>
			<Play aria-hidden="true" />
			Play
		</ContextMenuItem>
		<ContextMenuItem shortcut="⌘C" onSelect={() => toast.success("Link copied")}>
			<Copy aria-hidden="true" />
			Copy link
		</ContextMenuItem>
		<ContextMenuSeparator />
		<ContextMenuItem variant="destructive" onSelect={() => toast.error("Clip deleted")}>
			<Trash2 aria-hidden="true" />
			Delete
		</ContextMenuItem>
	</>
);

export function ClipCardDemo() {
	return (
		<div className="flex flex-wrap items-start justify-center gap-3">
			<ClipCard
				className="w-48"
				title="Insane 1v4 clutch"
				duration="0:42"
				watched={65}
				meta="12.4K views · 2 days ago"
				actions={clipActions("Insane 1v4 clutch")}
			/>
			<ClipCard
				className="w-48"
				title="Boss fight, no hits"
				duration="3:10"
				meta="3.1K views · last week"
				actions={clipActions("Boss fight, no hits")}
			/>
			<ClipCard
				className="w-28"
				ratio={9 / 16}
				title="Funniest fail"
				duration="0:18"
				watched={100}
				actions={clipActions("Funniest fail")}
			/>
		</div>
	);
}

const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];

export function StatTileDemo() {
	return (
		<div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
			<StatTile
				label="Revenue"
				value="$48,290"
				delta={12.5}
				period="vs last month"
				index="month"
				data={[31200, 33800, 36100, 39400, 42900, 48290].map((value, i) => ({
					month: months[i],
					value,
				}))}
				format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
			/>
			<StatTile
				label="Failed commands"
				value="0.42%"
				delta={-18}
				invert
				period="vs last month"
				index="month"
				data={[0.009, 0.0081, 0.0066, 0.0061, 0.0051, 0.0042].map((value, i) => ({
					month: months[i],
					value,
				}))}
				format={{ style: "percent", maximumFractionDigits: 2 }}
			/>
		</div>
	);
}

export function ChangelogDemo() {
	return (
		<Changelog
			className="max-w-lg"
			releases={[
				{
					version: "v0.4",
					title: "Resizable and blocks",
					date: "Oct 24, 2026",
					dateTime: "2026-10-24",
					changes: [
						{ type: "new", text: "Resizable split panes with collapsible panels." },
						{ type: "new", text: "Blocks: pricing, testimonial, stat tile and more." },
						{ type: "improved", text: "Command palette groups follow the sidebar order." },
					],
					shortcut: ["⌘", "K"],
				},
				{
					version: "v0.3",
					title: "Data and media",
					date: "Oct 21, 2026",
					dateTime: "2026-10-21",
					changes: [
						{ type: "new", text: "Table, Data table, Chart and Carousel." },
						{ type: "fixed", text: "Tooltip no longer flickers at viewport edges." },
					],
				},
			]}
		/>
	);
}

export function NewsletterDemo() {
	return (
		<Newsletter
			className="w-full max-w-md"
			title="Release notes in your inbox"
			description="One email per release. No tracking pixels."
			onSubscribe={(email) =>
				new Promise((resolve, reject) =>
					setTimeout(
						() =>
							email.endsWith("@example.com")
								? reject(new Error("That address is a placeholder"))
								: resolve(email),
						900,
					),
				)
			}
		/>
	);
}

export function SiteHeaderDemo() {
	const [page, setPage] = useState("/pricing");
	return (
		<MacWindow
			title="acme.gg"
			className="w-full max-w-3xl"
			bodyClassName="h-96 flex-none overflow-y-auto p-0"
		>
			<SiteHeader
				brand={
					<a
						href="#site-header"
						className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
					>
						<Bot className="size-5 text-primary-ink" aria-hidden="true" />
						Acme
					</a>
				}
				current={page}
				onNavigate={(href, e) => {
					e.preventDefault();
					setPage(href);
					toast(`Demo mode: would open ${href}`);
				}}
				nav={[
					{
						label: "Products",
						items: [
							{
								title: "Discord bot",
								href: "/bot",
								icon: <Bot />,
								description: "Moderation, logs and slash commands",
							},
							{
								title: "Clips",
								href: "/clips",
								icon: <Clapperboard />,
								description: "Record, trim and share highlights",
							},
							{
								title: "Shop",
								href: "/shop",
								icon: <ShoppingBag />,
								description: "Merch, boosts and gift cards",
							},
							{
								title: "Dashboard",
								href: "/dashboard",
								icon: <Gauge />,
								description: "Usage and revenue at a glance",
							},
						],
					},
					{
						label: "Resources",
						items: [
							{
								title: "Docs",
								href: "/docs",
								icon: <BookOpen />,
								description: "Guides and API reference",
							},
							{
								title: "Changelog",
								href: "/changelog",
								icon: <History />,
								description: "What shipped this week",
							},
						],
					},
					{ label: "Blog", href: "/blog" },
					{ label: "Pricing", href: "/pricing" },
				]}
				actions={
					<Button size="sm" onClick={() => toast("Demo mode: sign-in is turned off")}>
						Sign in
					</Button>
				}
			/>
			<div className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-10" aria-hidden="true">
				<Skeleton className="h-8 w-2/3" />
				{Array.from({ length: 12 }, (_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static filler rows
					<Skeleton key={i} className="h-4" style={{ width: `${70 + ((i * 37) % 30)}%` }} />
				))}
			</div>
		</MacWindow>
	);
}
