"use client";

import { Copy, Trash2 } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { confirm } from "@/components/ui/confirm";
import {
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { toast } from "@/components/ui/toast";
import { StatusBadge } from "./admin-shell";
import { useAdmin } from "./admin-store";
import {
	countryNames,
	customers,
	dateTime,
	euro,
	isoDate,
	type Order,
	orderTotal,
	type Status,
	statuses,
	subtotal,
	trackingPattern,
} from "./data";

const shipped = (status: Status) => status === "shipped" || status === "delivered";

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="flex flex-col gap-3">
			<h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">{title}</h3>

			{children}
		</section>
	);
}

function OrderForm({ order }: { order: Order }) {
	const { saveOrder, deleteOrders, setOpenOrder } = useAdmin();
	const [status, setStatus] = useState(order.status);
	const [tracking, setTracking] = useState(order.tracking);
	const [note, setNote] = useState(order.note);
	const [trackingError, setTrackingError] = useState<string>();
	const customer = customers.find((person) => person.id === order.customer);
	const total = orderTotal(order);
	const changed = status !== order.status || tracking !== order.tracking || note !== order.note;

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (status !== order.status && (status === "refunded" || status === "cancelled")) {
			const refund = status === "refunded";
			const ok = await confirm({
				title: refund ? `Refund ${euro(total)}?` : `Cancel order ${order.id}?`,
				description: refund
					? `${customer?.name} gets the full amount back by ${order.payment.toLowerCase()}. It can't be taken back from here.`
					: "The customer gets an email that the order won't ship.",
				confirmLabel: refund ? `Refund ${euro(total)}` : "Cancel order",
				cancelLabel: "Keep order",
				destructive: true,
			});

			if (!ok) return;
		}

		saveOrder(order.id, { status, tracking: tracking.trim(), note: note.trim() });
		setOpenOrder(null);
	}

	async function copyEmail() {
		if (!customer) return;

		try {
			await navigator.clipboard.writeText(customer.email);
			toast.success("Email copied", { description: customer.email });
		} catch {
			toast.error("Couldn't copy", { description: customer.email });
		}
	}

	return (
		<form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
			<DrawerHeader>
				<div className="flex flex-wrap items-center gap-2 pr-8">
					<DrawerTitle>Order {order.id}</DrawerTitle>

					<StatusBadge status={order.status} />
				</div>

				<DrawerDescription>
					Placed {dateTime(order.placed)} · {order.payment}
				</DrawerDescription>
			</DrawerHeader>

			<DrawerBody className="flex flex-col gap-7">
				<Section title="Items">
					<ul className="flex flex-col divide-y rounded-xl border bg-card text-sm">
						{order.lines.map((line) => (
							<li key={line.product} className="flex items-baseline gap-3 px-3.5 py-2.5">
								<span className="min-w-0 flex-1">
									{line.name}

									<span className="block text-muted-foreground text-xs">
										{line.quantity} × {euro(line.price)}
									</span>
								</span>

								<span className="tabular-nums">{euro(line.quantity * line.price)}</span>
							</li>
						))}

						<li className="flex flex-col gap-1 px-3.5 py-2.5 text-muted-foreground">
							<span className="flex justify-between">
								Subtotal <span className="tabular-nums">{euro(subtotal(order))}</span>
							</span>

							<span className="flex justify-between">
								Delivery
								<span className="tabular-nums">
									{order.shipping ? euro(order.shipping) : "Free"}
								</span>
							</span>

							<span className="flex justify-between font-medium text-foreground">
								Total, VAT included <span className="tabular-nums">{euro(total)}</span>
							</span>
						</li>
					</ul>
				</Section>

				{customer && (
					<Section title="Customer">
						<div className="flex items-start gap-3 text-sm">
							<Avatar alt={customer.name} />

							<div className="min-w-0 flex-1">
								<p className="font-medium">{customer.name}</p>

								<p className="truncate text-muted-foreground">{customer.email}</p>

								<p className="mt-1 text-muted-foreground">
									{customer.address}, {customer.city}, {countryNames[customer.country]}
								</p>
							</div>

							<Button
								type="button"
								size="icon"
								variant="ghost"
								aria-label="Copy email"
								onClick={copyEmail}
							>
								<Copy />
							</Button>
						</div>
					</Section>
				)}

				<Section title="Fulfilment">
					<Field label="Status">
						<Select
							options={statuses}
							value={status}
							onValueChange={(value) => {
								setStatus(value as Status);
								setTrackingError(undefined);
							}}
						/>
					</Field>

					<Field
						label="Tracking number"
						required={shipped(status)}
						description={
							shipped(status)
								? "Sent to the customer with the shipping email."
								: "Needed once it ships."
						}
						error={trackingError}
					>
						<Input
							value={tracking}
							onChange={(event) => {
								setTracking(event.target.value.toUpperCase());
								setTrackingError(undefined);
							}}
							onInvalid={() => setTrackingError("Use the carrier's format, like FH123456789IE.")}
							pattern={trackingPattern}
							placeholder="FH123456789IE"
							autoComplete="off"
							spellCheck={false}
						/>
					</Field>

					<Field label="Internal note" description="Only the team sees this.">
						<Textarea
							value={note}
							onChange={(event) => setNote(event.target.value)}
							maxLength={200}
							showCount
							className="max-h-40"
						/>
					</Field>
				</Section>

				<Section title="Activity">
					<Timeline>
						{[...order.events].reverse().map((event, i) => (
							<TimelineItem
								key={`${event.time}-${event.title}`}
								variant={i === 0 ? "active" : "default"}
								time={dateTime(event.time)}
								dateTime={isoDate(event.time)}
								title={event.title}
							>
								{[event.detail, event.by && `by ${event.by}`].filter(Boolean).join(" · ")}
							</TimelineItem>
						))}
					</Timeline>
				</Section>
			</DrawerBody>

			<DrawerFooter className="flex-row">
				<Button
					type="button"
					variant="outline"
					className="mr-auto"
					onClick={() => deleteOrders([order.id])}
				>
					<Trash2 aria-hidden="true" />
					Delete
				</Button>

				<Button type="submit" disabled={!changed}>
					Save changes
				</Button>
			</DrawerFooter>
		</form>
	);
}

export function OrderDrawer() {
	const { openOrder, setOpenOrder } = useAdmin();
	// Keeps the last order on screen while the drawer slides out.
	const [shown, setShown] = useState(openOrder);

	if (openOrder && openOrder !== shown) setShown(openOrder);

	return (
		<Drawer open={openOrder !== null} onOpenChange={(open) => !open && setOpenOrder(null)}>
			<DrawerContent side="right" className="sm:max-w-md">
				{shown && <OrderForm key={shown.id} order={shown} />}
			</DrawerContent>
		</Drawer>
	);
}
