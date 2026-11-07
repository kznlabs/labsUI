"use client";

import { Pause, Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, spring } from "@/lib/utils";
import { Counter } from "./counter";
import { products, store, towns } from "./data";

const tick = 3; // seconds between updates
const euro = new Intl.NumberFormat(store.locale, { style: "currency", currency: store.currency });

type LiveOrder = { id: number; product: string; town: string; total: number; at: number };

// A small LCG: the feed is the same on every load, so the server and the client agree.
function feed(seed: number) {
	let state = seed;

	return () => {
		state = (state * 1_103_515_245 + 12_345) % 2_147_483_648;

		return state / 2_147_483_648;
	};
}

function makeOrder(next: () => number, id: number, at: number): LiveOrder {
	const product = products[Math.floor(next() * products.length)];
	const quantity = 1 + Math.floor(next() * (product.price > 40 ? 1 : 3));

	return {
		id,
		product: quantity > 1 ? `${quantity} × ${product.name}` : product.name,
		town: towns[Math.floor(next() * towns.length)],
		total: Math.round((quantity * product.price + (next() > 0.6 ? 4.9 : 0)) * 100) / 100,
		at,
	};
}

function seedState() {
	const next = feed(48_213);
	const orders = Array.from({ length: 5 }, (_, i) => makeOrder(next, 4_820 - i, -(i + 1) * 17));
	const visitors = Array.from({ length: 24 }, (_, i) =>
		Math.round(26 + Math.sin(i / 3) * 6 + next() * 5),
	);

	return { next, step: 0, orders, visitors, today: { revenue: 1_284.6, orders: 31 } };
}

const ago = (seconds: number) =>
	seconds < 5
		? "just now"
		: seconds < 60
			? `${seconds} s ago`
			: `${Math.floor(seconds / 60)} min ago`;

/** Visitors on the site right now and orders as they land. Moves on its own, so it has a pause (WCAG 2.2.2). */
export function Live() {
	const [state, setState] = useState(seedState);
	const [paused, setPaused] = useState(false);

	useEffect(() => {
		if (paused) return;

		const timer = setInterval(() => {
			setState((current) => {
				const step = current.step + 1;
				const last = current.visitors[current.visitors.length - 1];
				const drift = Math.round((current.next() - 0.48) * 7);
				const visitors = [...current.visitors.slice(1), Math.min(58, Math.max(12, last + drift))];

				if (step % 2) return { ...current, step, visitors };

				const order = makeOrder(current.next, current.orders[0].id + 1, step * tick);

				return {
					...current,
					step,
					visitors,
					orders: [order, ...current.orders].slice(0, 5),
					today: {
						revenue: Math.round((current.today.revenue + order.total) * 100) / 100,
						orders: current.today.orders + 1,
					},
				};
			});
		}, tick * 1000);

		return () => clearInterval(timer);
	}, [paused]);

	const now = state.step * tick;
	const visitors = state.visitors[state.visitors.length - 1];
	const peak = Math.max(...state.visitors);

	return (
		<Card className="h-full">
			<CardHeader className="flex items-start justify-between gap-2">
				<div>
					<CardTitle as="h2" className="flex items-center gap-2">
						<span aria-hidden="true" className="relative flex size-2">
							{!paused && (
								<span className="absolute inset-0 animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />
							)}

							<span
								className={cn(
									"relative size-2 rounded-full",
									paused ? "bg-muted-foreground" : "bg-success",
								)}
							/>
						</span>
						Live
					</CardTitle>

					<CardDescription>{paused ? "Paused" : `Updates every ${tick} seconds`}</CardDescription>
				</div>

				<Button
					size="sm"
					variant="outline"
					aria-pressed={paused}
					onClick={() => setPaused(!paused)}
				>
					{paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}

					{paused ? "Resume" : "Pause"}
				</Button>
			</CardHeader>

			<CardContent className="grid gap-5">
				<div className="grid grid-cols-3 gap-3">
					<div>
						<p className="text-muted-foreground text-xs">On the site</p>

						<p className="font-semibold text-2xl tabular-nums">
							<Counter to={visitors} />
						</p>
					</div>

					<div>
						<p className="text-muted-foreground text-xs">Orders today</p>

						<p className="font-semibold text-2xl tabular-nums">
							<Counter to={state.today.orders} />
						</p>
					</div>

					<div>
						<p className="text-muted-foreground text-xs">Sales today</p>

						<p className="font-semibold text-2xl tabular-nums">
							<Counter to={Math.round(state.today.revenue)} prefix="€" />
						</p>
					</div>
				</div>

				<div aria-hidden="true" className="flex h-12 items-end gap-0.5">
					{state.visitors.map((value, i) => (
						<motion.span
							// Bars keep their slot, the values move left under them.
							// biome-ignore lint/suspicious/noArrayIndexKey: slots are fixed
							key={i}
							className={cn(
								"flex-1 rounded-t-sm",
								i === state.visitors.length - 1 ? "bg-chart-1" : "bg-chart-1/35",
							)}
							initial={false}
							animate={{ height: `${(value / peak) * 100}%` }}
							transition={spring}
						/>
					))}
				</div>

				<div>
					<h3 className="mb-2 font-medium text-sm">Latest orders</h3>

					<ul className="grid">
						<AnimatePresence initial={false} mode="popLayout">
							{state.orders.map((order) => (
								<motion.li
									key={order.id}
									layout
									initial={{ opacity: 0, y: -8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0 }}
									transition={spring}
									className="flex items-center justify-between gap-3 border-b py-2 text-sm last:border-b-0"
								>
									<div className="min-w-0">
										<p className="truncate font-medium">{order.product}</p>

										<p className="text-muted-foreground text-xs">
											#{order.id} · {order.town} · {ago(Math.max(0, now - order.at))}
										</p>
									</div>

									<span className="shrink-0 tabular-nums">{euro.format(order.total)}</span>
								</motion.li>
							))}
						</AnimatePresence>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}
