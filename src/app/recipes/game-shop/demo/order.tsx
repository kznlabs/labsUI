"use client";

import type { LucideIcon } from "lucide-react";
import { CircleCheck, CircleHelp, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { createContext, type FormEvent, type ReactNode, use, useRef, useState } from "react";
import { CartLine, CartList, OrderSummary } from "@/components/blocks/cart";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/toast";
import { cn, spring } from "@/lib/utils";
import {
	currency,
	euro,
	goal,
	locale,
	type Payment,
	type Purchase,
	payments,
	players,
	recentPurchases,
} from "./store";

export type OrderLine = {
	id: string;
	name: string;
	detail: string;
	price: number;
	icon: LucideIcon;
	/** Tile classes, as in the cosmetics grid. */
	tint: string;
	/** Ranks replace each other: one per order. */
	rank?: boolean;
};

type Placed = { number: string; nickname: string; lines: OrderLine[]; total: number };

type Order = {
	lines: OrderLine[];
	total: number;
	has: (id: string) => boolean;
	add: (line: OrderLine) => void;
	remove: (id: string) => void;
	/** Raised towards the community goal, the demo's own orders included. */
	raised: number;
	purchases: Purchase[];
	placed: Placed | null;
	place: (nickname: string) => void;
	reset: () => void;
	/** Scrolls to the order panel and focuses its first field. */
	show: () => void;
};

const OrderContext = createContext<Order | null>(null);
const nicknamePattern = "[A-Za-z0-9_]{3,16}";

export function useOrder() {
	const order = use(OrderContext);

	if (!order) throw new Error("useOrder() needs <OrderProvider>");

	return order;
}

export function OrderProvider({ children }: { children: ReactNode }) {
	const [lines, setLines] = useState<OrderLine[]>([]);
	const [raised, setRaised] = useState(goal.raised);
	const [purchases, setPurchases] = useState(recentPurchases);
	const [placed, setPlaced] = useState<Placed | null>(null);
	const total = lines.reduce((sum, line) => sum + line.price, 0);

	const order: Order = {
		lines,
		total,
		has: (id) => lines.some((line) => line.id === id),
		add: (line) => {
			const replaced = line.rank ? lines.find((other) => other.rank) : undefined;

			setPlaced(null);
			setLines((current) => [
				...current.filter((other) => other.id !== line.id && !(line.rank && other.rank)),
				line,
			]);

			// Phones show the order bar instead, which a toast would cover.
			if (!matchMedia("(min-width: 64rem)").matches) return;

			toast.success(
				replaced && replaced.id !== line.id
					? `${line.name} replaced ${replaced.name} in your order`
					: `${line.name} added to your order`,
				{ action: { label: "View order", onClick: () => order.show() }, duration: 5000 },
			);
		},
		remove: (id) => setLines((current) => current.filter((line) => line.id !== id)),
		raised,
		purchases,
		placed,
		place: (nickname) => {
			const number = `EF-${String(48213 + purchases.length).padStart(6, "0")}`;

			setPlaced({ number, nickname, lines, total });
			setRaised((value) => value + total);
			setPurchases((current) => [
				...lines.map((line, index) => ({
					id: `${number}-${index}`,
					player: nickname,
					item: line.rank ? `${line.name} · ${line.detail}` : line.name,
					ago: "Just now",
				})),
				...current,
			]);
			setLines([]);
		},
		reset: () => setPlaced(null),
		show: () => {
			const panel = document.getElementById("order");
			const wide = matchMedia("(min-width: 64rem)").matches;

			// Wide, the panel is sticky beside the shop: scroll to where the shop starts.
			(wide ? panel?.parentElement : panel)?.scrollIntoView({ block: "start" });
			panel?.querySelector<HTMLElement>("input, button")?.focus({ preventScroll: true });
		},
	};

	return <OrderContext value={order}>{children}</OrderContext>;
}

export function ItemTile({
	icon: Icon,
	tint,
	small,
}: {
	icon: LucideIcon;
	tint: string;
	small?: boolean;
}) {
	return (
		<div className={cn("flex size-full items-center justify-center", tint)}>
			<Icon className={small ? "size-6" : "size-14"} strokeWidth={1.5} aria-hidden="true" />
		</div>
	);
}

/** What the nickname check says under the field. */
function NicknameHint({ nickname }: { nickname: string }) {
	const valid = new RegExp(`^${nicknamePattern}$`).test(nickname);
	const seen = players[nickname.toLowerCase()];

	if (!valid) return "3 to 16 letters, numbers or underscores, as it appears in game.";

	return (
		<span className="inline-flex items-center gap-1.5">
			{seen ? (
				<CircleCheck className="size-3.5 text-success-ink" aria-hidden="true" />
			) : (
				<CircleHelp className="size-3.5 text-warning-ink" aria-hidden="true" />
			)}

			{seen ? `Player found, ${seen}.` : "No one by that name has joined yet. Check the spelling."}
		</span>
	);
}

export function OrderPanel() {
	const order = useOrder();
	const [nickname, setNickname] = useState("");
	const [nicknameError, setNicknameError] = useState<string>();
	const [payment, setPayment] = useState<Payment>("card");
	const [paying, setPaying] = useState(false);
	const nicknameRef = useRef<HTMLInputElement>(null);

	async function pay(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (order.lines.length === 0) {
			toast.error("Your order is empty. Add a rank or a cosmetic first.");

			return;
		}

		if (!new RegExp(`^${nicknamePattern}$`).test(nickname)) {
			setNicknameError("Enter the nickname that receives the items.");
			nicknameRef.current?.focus();

			return;
		}

		if (!event.currentTarget.reportValidity()) return;

		setPaying(true);
		await new Promise((resolve) => setTimeout(resolve, 1100));
		setPaying(false);
		order.place(nickname);
		toast("Demo mode: no payment was taken and nothing is delivered.");
	}

	return (
		<Card
			id="order"
			className="scroll-mt-32 lg:sticky lg:top-32 lg:max-h-[calc(100dvh-9rem)] lg:overflow-y-auto lg:overscroll-contain"
		>
			<CardHeader>
				<CardTitle as="h2" className="flex items-center gap-2">
					<ShoppingBag className="size-4" aria-hidden="true" />
					Your order
				</CardTitle>

				<CardDescription>Delivered in game to the nickname below.</CardDescription>
			</CardHeader>

			<CardContent>
				<AnimatePresence mode="wait" initial={false}>
					{order.placed ? (
						<motion.div
							key="placed"
							initial={{ opacity: 0, scale: 0.97 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.97 }}
							transition={spring}
							className="flex flex-col gap-5"
						>
							<div className="flex flex-col items-center gap-3 rounded-xl bg-success/15 px-4 py-6 text-center">
								<CircleCheck className="size-8 text-success-ink" aria-hidden="true" />

								<div>
									<p className="font-semibold">Order placed</p>

									<p className="mt-1 text-muted-foreground text-sm">
										{order.placed.number} · {euro.format(order.placed.total)}
									</p>
								</div>
							</div>

							<p className="text-sm leading-relaxed">
								<span className="font-medium">{order.placed.nickname}</span> gets{" "}
								{order.placed.lines.map((line) => line.name).join(", ")} on their next login. Your
								order also went towards the community goal.
							</p>

							<Button variant="outline" onClick={order.reset}>
								Start a new order
							</Button>
						</motion.div>
					) : (
						<motion.form
							key="form"
							initial={{ opacity: 0, scale: 0.97 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.97 }}
							transition={spring}
							onSubmit={pay}
							noValidate
							className="flex flex-col gap-6"
						>
							{order.lines.length === 0 ? (
								<p className="rounded-lg border border-dashed px-3 py-6 text-center text-muted-foreground text-sm">
									Nothing here yet. Pick a rank or a cosmetic.
								</p>
							) : (
								<CartList aria-label="Items in your order">
									{order.lines.map((line) => (
										<CartLine
											key={line.id}
											name={line.name}
											details={line.detail}
											price={line.price}
											currency={currency}
											locale={locale}
											media={<ItemTile icon={line.icon} tint={line.tint} small />}
											onRemove={() => order.remove(line.id)}
										/>
									))}
								</CartList>
							)}

							<Field
								label="Nickname that receives the purchase"
								description={<NicknameHint nickname={nickname} />}
								error={nicknameError}
								required
							>
								<div className="flex items-center gap-3">
									<Avatar alt={nickname || "?"} size="sm" />

									<Input
										ref={nicknameRef}
										name="nickname"
										value={nickname}
										onChange={(event) => {
											setNickname(event.target.value.trim());
											setNicknameError(undefined);
										}}
										placeholder="e.g. NovaBlade"
										autoComplete="off"
										spellCheck={false}
										pattern={nicknamePattern}
										maxLength={16}
									/>
								</div>
							</Field>

							<RadioGroup
								legend="Payment"
								name="payment"
								variant="card"
								value={payment}
								onValueChange={(value) => setPayment(value as Payment)}
							>
								{payments.map((option) => (
									<RadioGroupItem
										key={option.value}
										value={option.value}
										description={option.description}
									>
										{option.label}
									</RadioGroupItem>
								))}
							</RadioGroup>

							{payment === "voucher" && (
								<Field label="Voucher code" description="16 digits, spaces are fine." required>
									<Input
										name="voucher"
										inputMode="numeric"
										autoComplete="off"
										pattern="[0-9 ]{16,19}"
										placeholder="0000 0000 0000 0000"
									/>
								</Field>
							)}

							<OrderSummary
								currency={currency}
								locale={locale}
								total={order.total}
								lines={[
									{ label: "Items", amount: order.total },
									{ label: "VAT", amount: "Included" },
								]}
								note="Sample prices. No real payment is taken."
								action={
									<Button type="submit" size="lg" className="w-full" loading={paying}>
										Pay {euro.format(order.total)}
									</Button>
								}
							/>
						</motion.form>
					)}
				</AnimatePresence>
			</CardContent>
		</Card>
	);
}

/** Phones: the order sits under the shop, so a bar keeps its count and total in reach. */
export function OrderBar() {
	const order = useOrder();

	return (
		<AnimatePresence>
			{order.lines.length > 0 && (
				<motion.aside
					aria-label="Order total"
					initial={{ y: 96 }}
					animate={{ y: 0 }}
					exit={{ y: 96 }}
					transition={spring}
					className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 px-4 py-3 backdrop-blur-xl lg:hidden"
				>
					<div className="mx-auto flex max-w-xl items-center justify-between gap-3">
						<p className="text-sm" aria-live="polite">
							<span className="font-medium tabular-nums">
								{order.lines.length} {order.lines.length === 1 ? "item" : "items"}
							</span>

							<span className="text-muted-foreground tabular-nums">
								{" "}
								· {euro.format(order.total)}
							</span>
						</p>

						<Button onClick={order.show}>Checkout</Button>
					</div>
				</motion.aside>
			)}
		</AnimatePresence>
	);
}
