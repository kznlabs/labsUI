"use client";

import { CircleCheck, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { OrderSummary } from "@/components/blocks/cart";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { CartLines, FreeShipping, useCart } from "./cart";
import {
	currency,
	euro,
	locale,
	type ShippingId,
	shipping,
	shippingPrice,
	shopPath,
} from "./catalog";

const countries = [
	"Austria",
	"Belgium",
	"France",
	"Germany",
	"Ireland",
	"Italy",
	"Netherlands",
	"Poland",
	"Spain",
];

const payments = [
	{
		id: "card",
		name: "Card",
		description: "You enter card details with the payment provider on the next step.",
	},
	{
		id: "transfer",
		name: "Bank transfer",
		description: "SEPA transfer; we ship once the money arrives.",
	},
	{
		id: "delivery",
		name: "Pay on delivery",
		description: "Pay the courier by card or cash.",
		fee: 2,
	},
];

function Section({
	id,
	title,
	children,
}: {
	id: string;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section aria-labelledby={id} className="flex flex-col gap-4">
			<h2 id={id} className="font-semibold text-lg">
				{title}
			</h2>

			{children}
		</section>
	);
}

export function CheckoutForm() {
	const router = useRouter();
	const cart = useCart();
	const [method, setMethod] = useState<ShippingId>("standard");
	const [payment, setPayment] = useState("card");
	const [placing, setPlacing] = useState(false);
	const [order, setOrder] = useState<{ id: string; total: number } | null>(null);
	const shippingCost = shippingPrice(method, cart.subtotal);
	const fee = payments.find((option) => option.id === payment)?.fee ?? 0;
	const total = cart.subtotal + shippingCost + fee;

	if (order)
		return (
			<Empty
				icon={<CircleCheck />}
				title="Order placed"
				description={`Order ${order.id}, ${euro.format(order.total)}. In this demo nothing was charged and no email is sent.`}
			>
				<Button onClick={() => router.push(shopPath())}>Keep shopping</Button>
			</Empty>
		);

	if (!cart.ready) return <Skeleton className="h-96 w-full" />;

	if (cart.items.length === 0)
		return (
			<Empty
				icon={<ShoppingBag />}
				title="Your cart is empty"
				description="Add something from the shop, or fill the cart with two sample items to try the checkout."
			>
				<div className="flex flex-wrap justify-center gap-2">
					<Button
						onClick={() => {
							cart.add("ridge-leather-boot", "42");
							cart.add("merino-rib-beanie", "S/M");
						}}
					>
						Add sample items
					</Button>

					<Button variant="outline" onClick={() => router.push(shopPath())}>
						Browse the shop
					</Button>
				</div>
			</Empty>
		);

	function place(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setPlacing(true);

		// Where a real shop creates the payment, from its own prices, and redirects to it.
		setTimeout(() => {
			setOrder({ id: `FW-${Math.floor(100000 + Math.random() * 900000)}`, total });
			cart.clear();
			setPlacing(false);
			toast.success("Demo mode: order placed, no payment taken");
			window.scrollTo({ top: 0 });
		}, 1200);
	}

	return (
		<form onSubmit={place} className="grid items-start gap-10 lg:grid-cols-[1fr_24rem]">
			<div className="flex flex-col gap-10">
				<Section id="contact" title="Contact">
					<Field label="Email" required>
						<Input name="email" type="email" autoComplete="email" placeholder="you@example.com" />
					</Field>
				</Section>

				<Section id="address" title="Delivery address">
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="First name" required>
							<Input name="given-name" autoComplete="given-name" />
						</Field>

						<Field label="Last name" required>
							<Input name="family-name" autoComplete="family-name" />
						</Field>
					</div>

					<Field label="Street and number" required>
						<Input name="address" autoComplete="address-line1" />
					</Field>

					<div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
						<Field label="Postal code" required>
							<Input name="postal-code" autoComplete="postal-code" />
						</Field>

						<Field label="City" required>
							<Input name="city" autoComplete="address-level2" />
						</Field>
					</div>

					<Field label="Country" required>
						<NativeSelect name="country" defaultValue="Ireland" autoComplete="country-name">
							{countries.map((country) => (
								<NativeSelectOption key={country} value={country}>
									{country}
								</NativeSelectOption>
							))}
						</NativeSelect>
					</Field>
				</Section>

				<Section id="delivery" title="Delivery">
					<RadioGroup
						legend={<span className="sr-only">Delivery</span>}
						name="shipping"
						variant="card"
						value={method}
						onValueChange={(value) => setMethod(value as ShippingId)}
					>
						{shipping.map((option) => {
							const price = shippingPrice(option.id, cart.subtotal);

							return (
								<RadioGroupItem
									key={option.id}
									value={option.id}
									description={option.description}
									end={price === 0 ? "Free" : euro.format(price)}
								>
									{option.name}
								</RadioGroupItem>
							);
						})}
					</RadioGroup>
				</Section>

				<Section id="payment" title="Payment">
					<RadioGroup
						legend={<span className="sr-only">Payment</span>}
						name="payment"
						variant="card"
						value={payment}
						onValueChange={setPayment}
					>
						{payments.map((option) => (
							<RadioGroupItem
								key={option.id}
								value={option.id}
								description={option.description}
								end={option.fee ? `+${euro.format(option.fee)}` : undefined}
							>
								{option.name}
							</RadioGroupItem>
						))}
					</RadioGroup>
				</Section>
			</div>

			<aside
				aria-labelledby="summary"
				className="flex flex-col gap-5 rounded-xl border bg-card p-5 shadow-xs lg:sticky lg:top-32"
			>
				<h2 id="summary" className="font-semibold text-lg">
					Order summary
				</h2>

				<FreeShipping subtotal={cart.subtotal} />

				<CartLines />

				<OrderSummary
					currency={currency}
					locale={locale}
					lines={[
						{ label: "Subtotal", amount: cart.subtotal },
						{ label: "Delivery", amount: shippingCost === 0 ? "Free" : shippingCost },
						...(fee ? [{ label: "Pay on delivery", amount: fee }] : []),
					]}
					total={total}
					note="Including VAT."
					action={
						<Button
							type="submit"
							size="lg"
							className="w-full"
							status={placing ? "loading" : "idle"}
							loadingLabel="Placing order…"
						>
							Place order
						</Button>
					}
				/>

				<p className="text-muted-foreground text-xs">
					Demo shop: any details work, nothing is charged or sent.
				</p>
			</aside>
		</form>
	);
}
