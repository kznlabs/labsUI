"use client";

import { CartLine, CartList, OrderSummary } from "@/components/blocks/cart";
import { buttonVariants } from "@/components/ui/button-variants";
import {
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { AppLink } from "@/lib/link";
import { useCart } from "./cart";
import { bySlug, storeHref } from "./catalog";
import { Photo } from "./photo";

export function BagDrawer() {
	const cart = useCart();

	return (
		<Drawer open={cart.open} onOpenChange={cart.setOpen}>
			<DrawerContent side="right" className="sm:max-w-md">
				<DrawerHeader>
					<DrawerTitle className="shop-display text-2xl">Your bag</DrawerTitle>

					<DrawerDescription>
						{cart.count === 0
							? "Nothing in it yet."
							: `${cart.count} ${cart.count === 1 ? "piece" : "pieces"}`}
					</DrawerDescription>
				</DrawerHeader>

				<DrawerBody>
					{cart.lines.length === 0 ? (
						<p className="text-muted-foreground text-sm">
							Pick a size on any piece and it will wait for you here.
						</p>
					) : (
						<CartList>
							{cart.lines.map((line) => {
								const product = bySlug(line.slug);

								if (!product) return null;

								return (
									<CartLine
										key={line.slug + line.size}
										name={product.name}
										href={storeHref(`/products/${product.slug}`)}
										price={product.price}
										currency="EUR"
										locale="en-IE"
										details={`Size ${line.size}`}
										quantity={line.quantity}
										max={product.stock[line.size]}
										media={<Photo photo={product.photos[0]} alt="" />}
										onQuantityChange={(quantity) =>
											cart.setQuantity(line.slug, line.size, quantity)
										}
										onRemove={() => cart.remove(line.slug, line.size)}
									/>
								);
							})}
						</CartList>
					)}
				</DrawerBody>

				{cart.lines.length > 0 && (
					<DrawerFooter className="border-t">
						<OrderSummary
							className="w-full"
							currency="EUR"
							locale="en-IE"
							lines={[{ label: "Subtotal", amount: cart.subtotal }]}
							total={cart.subtotal}
							note="Shipping is chosen at checkout."
							action={
								<AppLink
									href={storeHref("/checkout")}
									onClick={() => cart.setOpen(false)}
									className={buttonVariants({ className: "w-full" })}
								>
									Checkout
								</AppLink>
							}
						/>
					</DrawerFooter>
				)}
			</DrawerContent>
		</Drawer>
	);
}
