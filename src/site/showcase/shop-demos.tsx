"use client";

import { Camera, Headphones, Mic, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { CartLine, CartList, OrderSummary } from "@/components/blocks/cart";
import { ComparisonTable, type ComparisonValue } from "@/components/blocks/comparison-table";
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
import { ScrollArea } from "@/components/ui/scroll-area";
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

const buyLaptop = (name: string) => () => toast(`Demo mode: would buy ${name}`);

const laptop = (id: string, name: string, price: string, featured = false) => ({
	id,
	name,
	details: price,
	featured,
	badge: featured ? "Popular" : undefined,
	action: (
		<Button size="sm" variant={featured ? "default" : "outline"} onClick={buyLaptop(name)}>
			Buy<span className="sr-only"> {name}</span>
		</Button>
	),
});

const laptops = [
	laptop("lumen", "Lumen 13", "$899"),
	laptop("quill", "Quill 14", "$1,149"),
	laptop("harbor", "Harbor 15", "$1,399", true),
	laptop("anvil", "Anvil 16", "$1,899"),
];

const row = (
	label: string,
	lumen: ComparisonValue,
	quill: ComparisonValue,
	harbor: ComparisonValue,
	anvil: ComparisonValue,
) => ({
	label,
	values: { lumen, quill, harbor, anvil },
});

const laptopGroups = [
	{
		label: "Display",
		rows: [
			row("Size", "13.3 in", "14 in", "15.6 in", "16 in"),
			row("Refresh rate", "60 Hz", "120 Hz", "120 Hz", "165 Hz"),
			row("Touch screen", false, true, true, false),
			row("Matte finish", true, true, true, true),
		],
	},
	{
		label: "Performance",
		rows: [
			row("Memory", "16 GB", "16 GB", "32 GB", "64 GB"),
			row("Storage", "512 GB", "1 TB", "1 TB", "2 TB"),
			row("Dedicated graphics", false, false, true, true),
		],
	},
	{
		label: "Ports",
		rows: [
			row("USB-C", 2, 2, 2, 2),
			row("HDMI", false, true, true, true),
			row("Card reader", false, false, true, true),
			row("Headphone jack", true, true, true, true),
		],
	},
	{
		label: "Build",
		rows: [
			row("Weight", "1.1 kg", "1.4 kg", "1.8 kg", "2.3 kg"),
			row("Battery", "14 h", "12 h", "10 h", "7 h"),
			row("Backlit keyboard", true, true, true, true),
		],
	},
];

export function ComparisonTableDemo() {
	return (
		<ScrollArea className="h-[30rem] w-full max-w-4xl rounded-xl">
			<ComparisonTable label="Laptops compared" items={laptops} groups={laptopGroups} />
		</ScrollArea>
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
