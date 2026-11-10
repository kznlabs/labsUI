"use client";

import { CartLine, CartList, OrderSummary } from "@/components/blocks/cart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Empty } from "@/components/ui/empty";
import { toast } from "@/components/ui/toast";
import { AppLink } from "@/lib/link";
import { useCart } from "../cart";
import { storeHref } from "../catalog";
import { Delivery } from "../delivery";

export default function CartPage() {
	const { items, total, setQty, remove, clear } = useCart();

	return (
		<>
			<h1 className="mb-3 text-2xl font-semibold tracking-tight">Cart</h1>

			{items.length === 0 ? (
				<Empty
					title="Your cart is empty"
					description="Add something from a category and compare it first."
				>
					<AppLink href={storeHref("/c/laptops")} className={buttonVariants()}>
						Browse laptops
					</AppLink>
				</Empty>
			) : (
				<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
					<CartList>
						{items.map((item) => (
							<CartLine
								key={item.key}
								name={item.name}
								price={item.unitPrice}
								currency="EUR"
								locale="en-IE"
								href={storeHref(`/p/${item.slug}`)}
								details={item.details}
								media={
									<>
										{/* biome-ignore lint/performance/noImgElement: the static export has no image optimizer */}
										<img src={item.image} alt="" />
									</>
								}
								quantity={item.qty}
								onQuantityChange={(quantity) => setQty(item.key, quantity)}
								onRemove={() => remove(item.key)}
							/>
						))}
					</CartList>

					<div className="space-y-3">
						<OrderSummary
							currency="EUR"
							locale="en-IE"
							lines={[{ label: "Delivery", amount: "Free" }]}
							total={total}
							note="VAT included. Sample store: no payment is taken."
							action={
								<Button
									className="w-full"
									onClick={() => {
										toast.success("Demo mode: order placed, no payment taken");
										clear();
									}}
								>
									Place sample order
								</Button>
							}
						/>

						<Delivery />

						<Alert>
							<AlertTitle>No real payments</AlertTitle>

							<AlertDescription>
								This is a demo. Nothing is charged and nothing ships.
							</AlertDescription>
						</Alert>
					</div>
				</div>
			)}
		</>
	);
}
