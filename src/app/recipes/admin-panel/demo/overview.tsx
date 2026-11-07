"use client";

import { ArrowRight, Clock, PackageOpen, Truck } from "lucide-react";
import type { ReactNode } from "react";
import { StatTile } from "@/components/blocks/stat-tile";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Meter } from "@/components/ui/meter";
import { StatusBadge, ViewHeading } from "./admin-shell";
import { useAdmin } from "./admin-store";
import {
	currency,
	customers,
	dateTime,
	euro,
	euroWhole,
	itemCount,
	now,
	type Order,
	orderTotal,
	shortDate,
} from "./data";

const day = 86_400_000;
const span = 14;
const counted = (order: Order) => order.status !== "cancelled" && order.status !== "refunded";

/** Revenue, orders, average order and items sold per day, oldest first, for the `span` days that end `offset` days ago. */
function daily(orders: Order[], offset: number) {
	return Array.from({ length: span }, (_, i) => {
		const end = now - (offset + span - 1 - i) * day;
		const start = end - day;
		const inDay = orders.filter((order) => order.placed > start && order.placed <= end);
		const revenue = inDay.filter(counted).reduce((sum, order) => sum + orderTotal(order), 0);

		return {
			x: shortDate(end),
			revenue: Math.round(revenue),
			orders: inDay.length,
			average: inDay.length ? Math.round(revenue / inDay.length) : 0,
			items: inDay.filter(counted).reduce((sum, order) => sum + itemCount(order), 0),
		};
	});
}

const sum = (rows: Record<string, number | string>[], key: string) =>
	rows.reduce((total, row) => total + Number(row[key]), 0);

const change = (current: number, previous: number) =>
	previous === 0 ? 0 : Math.round(((current - previous) / previous) * 1000) / 10;

function Task({
	icon,
	count,
	title,
	detail,
	action,
	onAction,
}: {
	icon: ReactNode;
	count: number;
	title: string;
	detail: string;
	action: string;
	onAction: () => void;
}) {
	return (
		<li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
			<span
				aria-hidden="true"
				className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-primary-ink [&_svg]:size-4"
			>
				{icon}
			</span>

			<div className="min-w-0 flex-1">
				<p className="font-medium text-sm">
					<span className="tabular-nums">{count}</span> {title}
				</p>

				<p className="text-muted-foreground text-xs">{detail}</p>
			</div>

			<Button size="sm" variant="outline" onClick={onAction} disabled={count === 0}>
				{action}

				<ArrowRight aria-hidden="true" />
			</Button>
		</li>
	);
}

export function Overview() {
	const { orders, products, settings, show, setOpenOrder } = useAdmin();
	const current = daily(orders, 0);
	const previous = daily(orders, span);
	const revenue = sum(current, "revenue");
	const count = sum(current, "orders");
	const average = count ? revenue / count : 0;
	const previousAverage = sum(previous, "orders")
		? sum(previous, "revenue") / sum(previous, "orders")
		: 0;
	const toFulfil = orders.filter((order) => order.status === "paid");
	const unpaid = orders.filter((order) => order.status === "pending" && now - order.placed > day);
	const low = products.filter((product) => product.active && product.stock <= settings.lowStock);
	const recent = orders.slice(0, 6);
	const sold = new Map<string, { name: string; quantity: number }>();

	for (const order of orders)
		if (counted(order) && order.placed > now - span * day)
			for (const line of order.lines) {
				const entry = sold.get(line.product) ?? { name: line.name, quantity: 0 };

				entry.quantity += line.quantity;
				sold.set(line.product, entry);
			}

	const top = [...sold.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
	const most = top[0]?.quantity ?? 1;

	return (
		<>
			<ViewHeading title="Overview">
				The last {span} days at {settings.storeName}, against the {span} before.
			</ViewHeading>

			<section
				aria-label="Key figures"
				className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
			>
				<StatTile
					label="Revenue"
					value={euroWhole(revenue)}
					delta={change(revenue, sum(previous, "revenue"))}
					period="vs the 14 days before"
					data={current}
					dataKey="revenue"
					format={{ style: "currency", currency, maximumFractionDigits: 0 }}
				/>

				<StatTile
					label="Orders"
					value={count}
					delta={change(count, sum(previous, "orders"))}
					period="vs the 14 days before"
					data={current}
					dataKey="orders"
				/>

				<StatTile
					label="Average order"
					value={euro(average)}
					delta={change(average, previousAverage)}
					period="vs the 14 days before"
					data={current}
					dataKey="average"
					format={{ style: "currency", currency, maximumFractionDigits: 0 }}
				/>

				<StatTile
					label="Items sold"
					value={sum(current, "items")}
					delta={change(sum(current, "items"), sum(previous, "items"))}
					period="vs the 14 days before"
					data={current}
					dataKey="items"
				/>
			</section>

			<div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
				<Card>
					<CardHeader className="flex flex-wrap items-center justify-between gap-2">
						<div>
							<CardTitle as="h2">Recent orders</CardTitle>

							<CardDescription>Open one to change its status.</CardDescription>
						</div>

						<Button
							size="sm"
							variant="ghost"
							onClick={() => show("orders", { status: "all", customer: null })}
						>
							All orders
							<ArrowRight aria-hidden="true" />
						</Button>
					</CardHeader>

					<CardContent>
						<ul className="-mx-2 flex flex-col">
							{recent.map((order) => {
								const customer = customers.find((person) => person.id === order.customer);

								return (
									<li key={order.id}>
										<button
											type="button"
											onClick={() => setOpenOrder(order.id)}
											className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
										>
											<Avatar alt={customer?.name ?? ""} size="sm" />

											<span className="min-w-0 flex-1">
												<span className="block truncate font-medium">{customer?.name}</span>

												<span className="block truncate text-muted-foreground text-xs">
													{order.id} · {dateTime(order.placed)}
												</span>
											</span>

											<StatusBadge status={order.status} className="hidden sm:inline-flex" />

											<span className="w-20 text-right font-medium tabular-nums">
												{euro(orderTotal(order))}
											</span>
										</button>
									</li>
								);
							})}
						</ul>
					</CardContent>
				</Card>

				<div className="flex flex-col gap-6">
					<Card>
						<CardHeader>
							<CardTitle as="h2">Needs attention</CardTitle>
						</CardHeader>

						<CardContent>
							<ul className="flex flex-col divide-y">
								<Task
									icon={<Truck />}
									count={toFulfil.length}
									title="to fulfil"
									detail="Paid and waiting to ship"
									action="Ship"
									onAction={() => show("orders", { status: "paid", customer: null })}
								/>

								<Task
									icon={<Clock />}
									count={unpaid.length}
									title="unpaid for a day"
									detail="Awaiting a bank transfer"
									action="Review"
									onAction={() => show("orders", { status: "pending", customer: null })}
								/>

								<Task
									icon={<PackageOpen />}
									count={low.length}
									title="low on stock"
									detail={`${settings.lowStock} or fewer left`}
									action="Restock"
									onAction={() => show("products")}
								/>
							</ul>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle as="h2">Best sellers</CardTitle>

							<CardDescription>Units sold in the last {span} days.</CardDescription>
						</CardHeader>

						<CardContent className="flex flex-col gap-4">
							{top.map((product) => (
								<Meter
									key={product.name}
									label={product.name}
									value={product.quantity}
									max={most}
									optimum={most}
									valueText={`${product.quantity} sold`}
								/>
							))}
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	);
}
