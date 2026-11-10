"use client";

import { useState } from "react";
import { CartLine, CartList, OrderSummary } from "@/components/blocks/cart";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/toast";
import { AppLink } from "@/lib/link";
import { useCart } from "./cart";
import { bySlug, eur, FREE_SHIPPING_FROM, SHIPPING, storeHref } from "./catalog";
import { Header } from "./header";
import { Photo } from "./photo";

const heading = "shop-display text-2xl sm:text-3xl";

export function CheckoutForm() {
	const cart = useCart();
	const [shipping, setShipping] = useState("standard");
	const [payment, setPayment] = useState("card");
	const [busy, setBusy] = useState(false);
	const [order, setOrder] = useState<string>();

	const free = cart.subtotal >= FREE_SHIPPING_FROM;
	const method = SHIPPING.find((option) => option.id === shipping) ?? SHIPPING[0];
	const shippingCost = free ? 0 : method.price;
	const total = cart.subtotal + shippingCost;

	async function place(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setBusy(true);
		// Sample store: a pretend wait stands in for the payment provider. Nothing is charged or sent.
		await new Promise((resolve) => setTimeout(resolve, 900));
		setOrder(`AN-${Math.floor(Math.random() * 90000 + 10000)}`);
		cart.clear();
		setBusy(false);
		toast.success("Demo mode: order placed, no payment taken");
	}

	if (order) {
		return (
			<main className="px-4 pt-44 pb-24 sm:px-6">
				<Header />

				<div className="mx-auto max-w-xl">
					<h1 className={heading}>Thank you.</h1>

					<p className="mt-4 text-sm text-muted-foreground">
						Order {order} is a sample: nothing was charged and nothing will arrive.
					</p>

					<AppLink
						href={storeHref("#collection")}
						className="shop-caps mt-8 inline-block underline underline-offset-8"
					>
						Back to the collection
					</AppLink>
				</div>
			</main>
		);
	}

	if (cart.lines.length === 0) {
		return (
			<main className="px-4 pt-44 pb-24 sm:px-6">
				<Header />

				<div className="mx-auto max-w-xl">
					<h1 className={heading}>Your bag is empty.</h1>

					<AppLink
						href={storeHref("#collection")}
						className="shop-caps mt-8 inline-block underline underline-offset-8"
					>
						See the collection
					</AppLink>
				</div>
			</main>
		);
	}

	return (
		<main className="px-4 pt-40 pb-24 sm:px-6">
			<Header />

			<form onSubmit={place} className="mx-auto flex max-w-xl flex-col gap-14">
				<h1 className="shop-display text-5xl">Checkout</h1>

				<section aria-label="Bag">
					<CartList>
						{cart.lines.map((line) => {
							const product = bySlug(line.slug);

							if (!product) return null;

							return (
								<CartLine
									key={line.slug + line.size}
									name={product.name}
									price={product.price}
									currency="EUR"
									locale="en-IE"
									details={`Size ${line.size}`}
									quantity={line.quantity}
									media={<Photo photo={product.photos[0]} alt="" />}
								/>
							);
						})}
					</CartList>
				</section>

				<section className="flex flex-col gap-5">
					<h2 className={heading}>Delivery</h2>

					<Field label="Email" required>
						<Input type="email" name="email" autoComplete="email" required />
					</Field>

					<Field label="Full name" required>
						<Input name="name" autoComplete="name" required />
					</Field>

					<Field label="Address" required>
						<Input name="address" autoComplete="street-address" required />
					</Field>

					<div className="grid grid-cols-[8rem_1fr] gap-4">
						<Field label="Postcode" required>
							<Input name="postcode" autoComplete="postal-code" required />
						</Field>

						<Field label="City" required>
							<Input name="city" autoComplete="address-level2" required />
						</Field>
					</div>

					<Field label="Country" required>
						<NativeSelect name="country" defaultValue="Ireland" autoComplete="country-name">
							{["Austria", "France", "Germany", "Ireland", "Netherlands", "Poland", "Sweden"].map(
								(country) => (
									<NativeSelectOption key={country}>{country}</NativeSelectOption>
								),
							)}
						</NativeSelect>
					</Field>
				</section>

				<section>
					<h2 className={heading}>Shipping</h2>

					<RadioGroup
						aria-label="Shipping method"
						variant="card"
						value={shipping}
						onValueChange={setShipping}
						className="mt-5"
					>
						{SHIPPING.map((option) => (
							<RadioGroupItem
								key={option.id}
								value={option.id}
								description={option.note}
								end={free ? "Free" : eur(option.price)}
							>
								{option.label}
							</RadioGroupItem>
						))}
					</RadioGroup>

					<p className="mt-3 text-sm text-muted-foreground">
						{free
							? "Shipping is free on this order."
							: `Free shipping from ${eur(FREE_SHIPPING_FROM)}.`}
					</p>
				</section>

				<section>
					<h2 className={heading}>Payment</h2>

					<RadioGroup
						aria-label="Payment method"
						variant="card"
						value={payment}
						onValueChange={setPayment}
						className="mt-5"
					>
						<RadioGroupItem value="card" description="Debit or credit card">
							Card
						</RadioGroupItem>

						<RadioGroupItem value="sepa" description="Pay by SEPA transfer within 7 days">
							Bank transfer
						</RadioGroupItem>

						<RadioGroupItem value="invoice" description="Pay 14 days after delivery">
							Invoice
						</RadioGroupItem>
					</RadioGroup>

					{payment === "card" && (
						<div className="mt-5 flex flex-col gap-5">
							<Field label="Card number">
								<Input
									inputMode="numeric"
									autoComplete="cc-number"
									placeholder="0000 0000 0000 0000"
								/>
							</Field>

							<div className="grid grid-cols-2 gap-4">
								<Field label="Expiry">
									<Input autoComplete="cc-exp" placeholder="MM / YY" />
								</Field>

								<Field label="Security code">
									<Input inputMode="numeric" autoComplete="cc-csc" placeholder="123" />
								</Field>
							</div>

							<p className="text-xs text-muted-foreground">
								Sample form: these fields are never read or sent.
							</p>
						</div>
					)}
				</section>

				<section>
					<OrderSummary
						currency="EUR"
						locale="en-IE"
						lines={[
							{ label: "Subtotal", amount: cart.subtotal },
							{
								label: `Shipping, ${method.label.toLowerCase()}`,
								amount: shippingCost === 0 ? "Free" : shippingCost,
							},
						]}
						total={total}
						note="Returns are free for 30 days. Prices include VAT."
						action={
							<Button
								type="submit"
								size="lg"
								className="w-full"
								loading={busy}
								loadingLabel="Placing order"
							>
								Place order · {eur(total)}
							</Button>
						}
					/>
				</section>
			</form>
		</main>
	);
}
