"use client";

import { Camera, Headphones, Mic, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { CartLine, CartList, OrderSummary } from "@/components/blocks/cart";
import { ProductCard } from "@/components/blocks/product-card";
import { ProductGallery } from "@/components/blocks/product-gallery";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Empty } from "@/components/ui/empty";
import { toast } from "@/components/ui/toast";
import { useDisclosure } from "@/lib/use-disclosure";

const tile = (Icon: typeof Camera, tint: string) => (
	<div className={`grid size-full place-items-center ${tint}`}>
		<Icon className="size-1/3" aria-hidden="true" />
	</div>
);

const products = [
	{
		id: "camera",
		name: "Clip camera",
		price: 279,
		details: "Black",
		media: tile(Camera, "bg-chart-2/12 text-chart-2"),
	},
	{
		id: "headphones",
		name: "Studio headphones",
		price: 129.99,
		details: "Closed back",
		media: tile(Headphones, "bg-chart-5/12 text-chart-5"),
	},
];

const SHIPPING = 4.99;

export function CartDemo() {
	const cart = useDisclosure();
	const [quantities, setQuantities] = useState<Record<string, number>>({});
	const lines = products.flatMap((product) => {
		const quantity = quantities[product.id];

		return quantity ? [{ ...product, quantity }] : [];
	});
	const count = lines.reduce((sum, line) => sum + line.quantity, 0);
	const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

	const setQuantity = (id: string, quantity: number) =>
		setQuantities((current) => ({ ...current, [id]: quantity }));

	return (
		<div className="flex w-full max-w-xl flex-col items-end gap-4">
			<Button variant="outline" size="sm" onClick={cart.show}>
				<ShoppingCart aria-hidden="true" />
				Cart ({count})
			</Button>

			<div className="grid w-full gap-4 sm:grid-cols-2">
				{products.map((product) => (
					<ProductCard
						key={product.id}
						name={product.name}
						price={product.price}
						media={[product.media]}
						onAddToCart={() => {
							setQuantity(product.id, (quantities[product.id] ?? 0) + 1);
							cart.show();
						}}
					/>
				))}
			</div>

			<Drawer {...cart.props}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Your cart</DrawerTitle>

						<DrawerDescription>
							{count} {count === 1 ? "item" : "items"}
						</DrawerDescription>
					</DrawerHeader>

					<DrawerBody>
						{lines.length > 0 ? (
							<CartList>
								{lines.map((line) => (
									<CartLine
										key={line.id}
										name={line.name}
										details={line.details}
										price={line.price}
										quantity={line.quantity}
										max={5}
										media={line.media}
										onQuantityChange={(quantity) => setQuantity(line.id, quantity)}
										onRemove={() => setQuantity(line.id, 0)}
									/>
								))}
							</CartList>
						) : (
							<Empty
								icon={<ShoppingCart />}
								title="Your cart is empty"
								description="Add a product and it shows up here."
							/>
						)}
					</DrawerBody>

					{lines.length > 0 && (
						<DrawerFooter className="border-t">
							<OrderSummary
								className="w-full"
								lines={[
									{ label: "Subtotal", amount: subtotal },
									{ label: "Shipping", amount: SHIPPING },
								]}
								total={subtotal + SHIPPING}
								note="Taxes calculated at checkout."
								action={
									<Button
										className="w-full"
										onClick={() => toast("Demo mode: would go to checkout")}
									>
										Checkout
									</Button>
								}
							/>
						</DrawerFooter>
					)}
				</DrawerContent>
			</Drawer>
		</div>
	);
}

export function ProductGalleryDemo() {
	return (
		<ProductGallery
			className="w-full max-w-sm"
			label="Clip camera photos"
			ratio={4 / 3}
			media={[
				tile(Camera, "bg-chart-2/12 text-chart-2"),
				tile(Mic, "bg-chart-1/12 text-chart-1"),
				tile(Headphones, "bg-chart-3/12 text-chart-3"),
				tile(Camera, "bg-chart-5/12 text-chart-5"),
			]}
		/>
	);
}
