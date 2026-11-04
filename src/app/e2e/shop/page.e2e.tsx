"use client";

import { useState } from "react";
import { CartLine, CartList, OrderSummary } from "@/components/blocks/cart";
import { PlanCard } from "@/components/blocks/plan-card";
import { Pricing } from "@/components/blocks/pricing";
import { ProductCard } from "@/components/blocks/product-card";
import { ProductGallery } from "@/components/blocks/product-gallery";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useDisclosure } from "@/lib/use-disclosure";

const slide = (name: string) => <div className="size-full bg-muted">{name}</div>;

const periods = [
	{ value: "30", label: "30 days", priceNote: "for 30 days" },
	{ value: "90", label: "90 days", note: "−10%" },
	{ value: "forever", label: "Forever", priceNote: "forever" },
];

function ControlledPricing() {
	const [period, setPeriod] = useState("90");

	return (
		<section data-probe="pricing-controlled">
			<output>{period}</output>

			<Pricing
				label="Rank duration"
				periods={periods}
				value={period}
				onValueChange={setPeriod}
				plans={[{ name: "Controlled", price: { 30: 1, 90: 2, forever: 3 } }]}
			/>
		</section>
	);
}

function CartProbe() {
	const drawer = useDisclosure();
	const [lines, setLines] = useState([
		{ id: "a", name: "Line A", price: 10, quantity: 1 },
		{ id: "b", name: "Line B", price: 19.99, quantity: 2 },
		{ id: "c", name: "Line C", price: 5, quantity: 1 },
	]);
	const update = (id: string, quantity: number) =>
		setLines(lines.map((line) => (line.id === id ? { ...line, quantity } : line)));

	return (
		<section data-probe="cart">
			<ProductCard name="Opens cart" price={1} media={[slide("x")]} onAddToCart={drawer.show} />

			<Drawer {...drawer.props}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Cart</DrawerTitle>
					</DrawerHeader>

					<DrawerBody>
						<CartList>
							{lines.map((line) => (
								<CartLine
									key={line.id}
									name={line.name}
									price={line.price}
									quantity={line.quantity}
									max={3}
									onQuantityChange={(quantity) => update(line.id, quantity)}
									onRemove={() => setLines(lines.filter((other) => other.id !== line.id))}
								/>
							))}
						</CartList>

						<OrderSummary
							lines={[{ label: "Shipping", amount: "Free" }]}
							total={lines.reduce((sum, line) => sum + line.price * line.quantity, 0)}
						/>
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</section>
	);
}

export default function ShopProbe() {
	const [added, setAdded] = useState(0);

	return (
		<main className="mx-auto grid max-w-3xl gap-8 p-4">
			<h1>Shop probes</h1>

			<section data-probe="pricing">
				<Pricing
					label="Rank duration"
					periods={periods}
					defaultValue="30"
					plans={[
						{
							name: "Gold",
							price: { 30: 49.99, 90: 49, forever: 129 },
							compareAt: { forever: 149 },
							lowestPrice: { forever: 139 },
							cta: (period) => <Button>Buy for {period}</Button>,
						},
						{ name: "Forever only", price: { forever: 500 } },
					]}
				/>
			</section>

			<ControlledPricing />

			<section data-probe="plan-card">
				<PlanCard name="Plain" price={9.99} />

				<PlanCard name="No reduction" price={10} compareAt={10} />
			</section>

			<section data-probe="product">
				<ProductCard
					name="Sold out with add"
					price={49.99}
					badge="New"
					soldOut
					media={[slide("a")]}
					onAddToCart={() => setAdded(added + 1)}
				/>

				<ProductCard
					name="Sold out with action"
					price={10}
					soldOut
					media={[slide("b")]}
					onAddToCart={() => setAdded(added + 1)}
					action={<Button>Notify me</Button>}
				/>

				<ProductCard
					name="Reduced"
					price={10}
					compareAt={20}
					lowestPrice={15}
					rating={4.5}
					ratingNote="3 reviews"
					media={[slide("c")]}
				/>

				<output>{added}</output>
			</section>

			<form
				data-probe="radio-cards"
				aria-label="Shipping"
				onSubmit={(event) => event.preventDefault()}
			>
				<RadioGroup legend="Shipping" name="shipping" variant="card">
					<RadioGroupItem value="locker" description="Parcel locker." end="Free">
						Locker
					</RadioGroupItem>

					<RadioGroupItem value="courier" description="To your door." end="$5">
						Courier
					</RadioGroupItem>

					<RadioGroupItem value="pickup" description="Closed." end="Free" disabled>
						Pickup
					</RadioGroupItem>
				</RadioGroup>
			</form>

			<CartProbe />

			<section data-probe="gallery">
				<ProductGallery
					label="Probe photos"
					ratio={2}
					media={[slide("one"), slide("two"), slide("three")]}
				/>
			</section>

			<section data-probe="gallery-single">
				<ProductGallery label="Single photo" media={[slide("only")]} />
			</section>
		</main>
	);
}
