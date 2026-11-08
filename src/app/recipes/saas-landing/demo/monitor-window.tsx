"use client";

import { Pause, Play } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { AppWindow } from "@/components/ui/app-window";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, spring } from "@/lib/utils";
import { type Monitor, monitors, regions } from "./content";

const tick = 2; // seconds between checks
const bars = 20;
// Checkout slows down for a few checks, then recovers: an incident the window shows end to end.
const incident = { monitor: "checkout", from: 3, to: 9 };

// A small LCG: the same numbers on every load, so the server and the client agree.
function random(seed: number) {
	let state = seed;

	return () => {
		state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;

		return state / 2_147_483_648;
	};
}

function latency(monitor: Monitor, step: number, next: () => number) {
	const slow =
		monitor.id === incident.monitor && step % 30 >= incident.from && step % 30 < incident.to;

	return Math.round(monitor.base * (slow ? 3.4 + next() : 0.85 + next() * 0.35));
}

function seedState() {
	const next = random(90_417);
	const history = Object.fromEntries(
		monitors.map((monitor) => [
			monitor.id,
			Array.from({ length: bars }, (_, i) => latency(monitor, i - bars, next)),
		]),
	);

	return { next, step: 0, history };
}

const statusOf = (monitor: Monitor, value: number) =>
	value > monitor.base * 2.5 ? "degraded" : "up";

/** A Pingwell dashboard in a window: five monitors checked every two seconds, with a pause (WCAG 2.2.2). */
export function MonitorWindow() {
	const [state, setState] = useState(seedState);
	const [paused, setPaused] = useState(false);

	useEffect(() => {
		if (paused) return;

		const timer = setInterval(() => {
			setState((current) => {
				const step = current.step + 1;
				const history = Object.fromEntries(
					monitors.map((monitor) => [
						monitor.id,
						[...current.history[monitor.id].slice(1), latency(monitor, step, current.next)],
					]),
				);

				return { ...current, step, history };
			});
		}, tick * 1000);

		return () => clearInterval(timer);
	}, [paused]);

	const rows = monitors.map((monitor) => {
		const values = state.history[monitor.id];
		const now = values[values.length - 1];

		return { monitor, values, now, status: statusOf(monitor, now) };
	});
	const degraded = rows.filter((row) => row.status === "degraded");

	return (
		<AppWindow
			title="Harbourline · Monitors"
			className="shadow-xl"
			bodyClassName="p-0"
			actions={
				<Button
					size="sm"
					variant="ghost"
					aria-pressed={paused}
					onClick={() => setPaused(!paused)}
					className="h-7 px-2"
				>
					{paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}

					{paused ? "Resume" : "Pause"}
				</Button>
			}
		>
			<div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
				<p className="flex items-center gap-2 font-medium text-sm">
					<span aria-hidden="true" className="relative flex size-2">
						{!paused && (
							<span
								className={cn(
									"absolute inset-0 animate-ping rounded-full opacity-60 motion-reduce:hidden",
									degraded.length ? "bg-warning" : "bg-success",
								)}
							/>
						)}

						<span
							className={cn(
								"relative size-2 rounded-full",
								degraded.length ? "bg-warning" : "bg-success",
							)}
						/>
					</span>

					{degraded.length ? `${degraded[0].monitor.name} is slow` : "All systems operational"}
				</p>

				<p className="text-muted-foreground text-xs">
					{paused ? "Paused" : `Every ${tick} s from ${regions.length} regions`}
				</p>
			</div>

			<ul aria-label="Monitors">
				{rows.map(({ monitor, values, now, status }) => {
					const peak = Math.max(...values, monitor.base * 1.6);

					return (
						<li
							key={monitor.id}
							className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b px-4 py-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_7rem_auto]"
						>
							<div className="min-w-0">
								<p className="truncate font-medium text-sm">{monitor.name}</p>

								<p className="truncate text-muted-foreground text-xs">{monitor.url}</p>
							</div>

							<div aria-hidden="true" className="hidden h-7 items-end gap-px sm:flex">
								{values.map((value, i) => (
									<motion.span
										// Bars keep their slot, the values move left under them.
										// biome-ignore lint/suspicious/noArrayIndexKey: slots are fixed
										key={i}
										className={cn(
											"flex-1 rounded-t-[2px]",
											statusOf(monitor, value) === "degraded" ? "bg-warning" : "bg-chart-1/60",
										)}
										initial={false}
										animate={{ height: `${Math.max(12, (value / peak) * 100)}%` }}
										transition={spring}
									/>
								))}
							</div>

							<div className="flex items-center justify-end gap-2">
								<span className="w-16 text-right text-sm tabular-nums">{now} ms</span>

								<Badge
									variant={status === "up" ? "success" : "outline"}
									shape="pill"
									className={cn(
										"w-20 justify-center",
										// No warning variant: the outline badge takes the warning tint.
										status !== "up" && "border-transparent bg-warning/12 text-warning-ink",
									)}
								>
									{status === "up" ? "Up" : "Degraded"}
								</Badge>
							</div>
						</li>
					);
				})}
			</ul>
		</AppWindow>
	);
}
