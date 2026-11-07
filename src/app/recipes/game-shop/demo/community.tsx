"use client";

import { Check, Copy, Trophy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Meter } from "@/components/ui/meter";
import { Progress } from "@/components/ui/progress";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn, spring } from "@/lib/utils";
import { useOrder } from "./order";
import { euro, goal, server, topBuyers } from "./store";

const whole = new Intl.NumberFormat("en-IE", {
	style: "currency",
	currency: "EUR",
	maximumFractionDigits: 0,
});

export function ServerStatus() {
	const [players, setPlayers] = useState(server.players);

	// Sample data that moves: a few players join or leave every few seconds.
	useEffect(() => {
		const timer = setInterval(() => {
			setPlayers((count) =>
				Math.min(server.maxPlayers, Math.max(120, count + Math.round(Math.random() * 6 - 3))),
			);
		}, 4000);

		return () => clearInterval(timer);
	}, []);

	async function copy() {
		try {
			await navigator.clipboard.writeText(server.address);
			toast.success("Server address copied");
		} catch {
			toast(`Copy this address: ${server.address}`);
		}
	}

	return (
		<Card>
			<CardHeader className="flex-row items-start justify-between gap-3">
				<div className="grid gap-1.5">
					<CardTitle as="h2">Server status</CardTitle>

					<CardDescription>
						Version {server.version} · {server.region}
					</CardDescription>
				</div>

				<Badge variant="success" dot pulse>
					Online
				</Badge>
			</CardHeader>

			<CardContent className="flex flex-col gap-5">
				<Meter
					label="Players online"
					value={players}
					max={server.maxPlayers}
					valueText={`${players} of ${server.maxPlayers}`}
					low={server.maxPlayers * 0.5}
					high={server.maxPlayers * 0.9}
					optimum={server.maxPlayers * 0.7}
				/>

				<dl className="grid grid-cols-2 gap-2">
					{[
						["Ping", `${server.ping} ms`],
						["Up for", server.uptime],
					].map(([term, value]) => (
						<div key={term} className="rounded-lg bg-muted px-3 py-2">
							<dt className="text-muted-foreground text-xs">{term}</dt>

							<dd className="font-medium text-sm tabular-nums">{value}</dd>
						</div>
					))}
				</dl>

				<div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
					<code className="min-w-0 flex-1 truncate font-mono text-sm">{server.address}</code>

					<Button variant="ghost" size="sm" onClick={copy} className="-mr-2">
						<Copy aria-hidden="true" />
						Copy
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

export function CommunityGoal() {
	const { raised } = useOrder();
	const percent = Math.min(100, Math.round((raised / goal.target) * 100));

	return (
		<Card>
			<CardHeader>
				<CardTitle as="h3">{goal.title}</CardTitle>

				<CardDescription>{goal.description}</CardDescription>
			</CardHeader>

			<CardContent className="flex flex-col gap-5">
				<div className="flex flex-col gap-3">
					<p className="flex flex-wrap items-baseline gap-x-2">
						<span className="font-semibold text-3xl tabular-nums tracking-tight">
							{whole.format(raised)}
						</span>

						<span className="text-muted-foreground text-sm tabular-nums">
							of {whole.format(goal.target)} · {goal.backers} backers · ends in {goal.endsIn}
						</span>
					</p>

					<Progress aria-label={`${goal.title}: ${percent}% funded`} value={percent} />
				</div>

				<ol className="grid gap-2 sm:grid-cols-2">
					{goal.milestones.map((milestone) => {
						const reached = raised >= milestone.at;

						return (
							<li
								key={milestone.at}
								className={cn(
									"flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
									reached && "border-success/40 bg-success/10",
								)}
							>
								<span
									className={cn(
										"flex size-6 shrink-0 items-center justify-center rounded-full border",
										reached && "border-transparent bg-success text-success-foreground",
									)}
								>
									{reached && <Check className="size-3.5" aria-hidden="true" />}
								</span>

								<span className="min-w-0 flex-1">
									{milestone.label}

									<span className="sr-only">{reached ? ", reached" : ", not reached yet"}</span>
								</span>

								<span className="text-muted-foreground text-xs tabular-nums">
									{whole.format(milestone.at)}
								</span>
							</li>
						);
					})}
				</ol>
			</CardContent>
		</Card>
	);
}

export function TopBuyers() {
	const [range, setRange] = useState<"month" | "all">("month");

	return (
		<Card>
			<CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
				<CardTitle as="h3" className="flex items-center gap-2">
					<Trophy className="size-4 text-warning-ink" aria-hidden="true" />
					Top buyers
				</CardTitle>

				<ToggleGroup
					aria-label="Top buyers over"
					size="sm"
					value={range}
					onValueChange={(value) => value && setRange(value as "month" | "all")}
				>
					<ToggleGroupItem value="month">This month</ToggleGroupItem>

					<ToggleGroupItem value="all">All time</ToggleGroupItem>
				</ToggleGroup>
			</CardHeader>

			<CardContent>
				<Table containerClassName="border-0 shadow-none">
					<TableHeader>
						<TableRow>
							<TableHead className="w-10">#</TableHead>

							<TableHead>Player</TableHead>

							<TableHead className="hidden text-right sm:table-cell">Orders</TableHead>

							<TableHead className="text-right">Spent</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{topBuyers[range].map((buyer, index) => (
							<TableRow key={`${range}-${buyer.name}`}>
								<TableCell className="text-muted-foreground tabular-nums">{index + 1}</TableCell>

								<TableCell>
									<span className="flex items-center gap-3">
										<Avatar alt={buyer.name} size="sm" />

										<span className="font-medium">{buyer.name}</span>
									</span>
								</TableCell>

								<TableCell className="hidden text-right tabular-nums sm:table-cell">
									{buyer.purchases}
								</TableCell>

								<TableCell className="text-right tabular-nums">
									{euro.format(buyer.total)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}

export function RecentPurchases() {
	const { purchases } = useOrder();

	return (
		<Card>
			<CardHeader>
				<CardTitle as="h3">Just bought</CardTitle>

				<CardDescription>The latest orders on the server.</CardDescription>
			</CardHeader>

			<CardContent>
				<ul className="flex flex-col gap-3" aria-live="polite">
					<AnimatePresence initial={false}>
						{purchases.slice(0, 6).map((purchase) => (
							<motion.li
								key={purchase.id}
								layout
								initial={{ opacity: 0, y: -8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0 }}
								transition={spring}
								className="flex items-center gap-3"
							>
								<Avatar alt={purchase.player} size="sm" />

								<p className="min-w-0 flex-1 text-sm">
									<span className="font-medium">{purchase.player}</span>{" "}
									<span className="text-muted-foreground">bought</span> {purchase.item}
								</p>

								<span className="shrink-0 text-muted-foreground text-xs">{purchase.ago}</span>
							</motion.li>
						))}
					</AnimatePresence>
				</ul>
			</CardContent>
		</Card>
	);
}

/** The goal in one line for the top of the page, with a link down to the full card. */
export function GoalTeaser() {
	const { raised } = useOrder();
	const percent = Math.min(100, Math.round((raised / goal.target) * 100));

	return (
		<a
			href="#community"
			className="group mt-10 flex max-w-md flex-col gap-2.5 rounded-xl border bg-card p-4 shadow-xs outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
		>
			<span className="flex items-baseline justify-between gap-3 text-sm">
				<span className="font-medium">Season goal: {goal.title.toLowerCase()}</span>

				<span className="text-muted-foreground tabular-nums">{percent}%</span>
			</span>

			<Progress aria-label="Season goal funded" size="sm" value={percent} />

			<span className="text-muted-foreground text-xs tabular-nums">
				{whole.format(raised)} of {whole.format(goal.target)} from {goal.backers} players · ends in{" "}
				{goal.endsIn}
			</span>
		</a>
	);
}
