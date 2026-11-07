"use client";

import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { createContext, type ReactNode, use, useEffect, useState } from "react";
import { CartLine, CartList, OrderSummary } from "@/components/blocks/cart";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Empty } from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { useDisclosure } from "@/lib/use-disclosure";
import { bySlug, currency, euro, freeShippingFrom, locale, shopHref, shopPath } from "./catalog";

export type CartItem = { slug: string; size: string; quantity: number };

type Cart = {
	items: CartItem[];
	/** False until the saved cart is read. */
	ready: boolean;
	count: number;
	subtotal: number;
	add: (slug: string, size: string) => void;
	setQuantity: (slug: string, size: string, quantity: number) => void;
	remove: (slug: string, size: string) => void;
	clear: () => void;
	open: () => void;
};

const CartContext = createContext<Cart | null>(null);
const key = "labsui-demo-shop-cart";

const same = (item: CartItem, slug: string, size: string) =>
	item.slug === slug && item.size === size;
const left = (slug: string, size: string) => bySlug(slug)?.stock[size] ?? 0;

export function useCart() {
	const cart = use(CartContext);

	if (!cart) throw new Error("useCart() needs <CartProvider>");

	return cart;
}

/** Cart lines in `localStorage`, read after the first render so server and client HTML match. */
export function CartProvider({ children }: { children: ReactNode }) {
	const [items, setItems] = useState<CartItem[]>([]);
	const [ready, setReady] = useState(false);
	const drawer = useDisclosure();

	useEffect(() => {
		try {
			const saved: CartItem[] = JSON.parse(localStorage.getItem(key) ?? "[]");

			setItems(saved.filter((item) => left(item.slug, item.size) > 0));
		} catch {}

		setReady(true);
	}, []);

	useEffect(() => {
		if (!ready) return;

		try {
			localStorage.setItem(key, JSON.stringify(items));
		} catch {}
	}, [items, ready]);

	const cart: Cart = {
		items,
		ready,
		count: items.reduce((sum, item) => sum + item.quantity, 0),
		subtotal: items.reduce((sum, item) => sum + (bySlug(item.slug)?.price ?? 0) * item.quantity, 0),
		add: (slug, size) =>
			setItems((current) => {
				const found = current.find((item) => same(item, slug, size));

				if (!found) return [...current, { slug, size, quantity: 1 }];

				return current.map((item) =>
					item === found
						? { ...item, quantity: Math.min(left(slug, size), item.quantity + 1) }
						: item,
				);
			}),
		setQuantity: (slug, size, quantity) =>
			setItems((current) =>
				current.map((item) => (same(item, slug, size) ? { ...item, quantity } : item)),
			),
		remove: (slug, size) =>
			setItems((current) => current.filter((item) => !same(item, slug, size))),
		clear: () => setItems([]),
		open: drawer.show,
	};

	return (
		<CartContext value={cart}>
			{children}

			<CartDrawer cart={cart} drawer={drawer} />
		</CartContext>
	);
}

/** How far the cart is from free standard delivery. */
export function FreeShipping({ subtotal }: { subtotal: number }) {
	const missing = freeShippingFrom - subtotal;

	return (
		<Progress
			value={Math.min(subtotal, freeShippingFrom)}
			max={freeShippingFrom}
			label={
				missing > 0
					? `${euro.format(missing)} away from free standard delivery`
					: "Free standard delivery unlocked"
			}
		/>
	);
}

/** The lines of a cart, with quantity fields and remove buttons unless `readOnly`. */
export function CartLines({ readOnly }: { readOnly?: boolean }) {
	const cart = useCart();

	return (
		<CartList>
			{cart.items.map((item) => {
				const product = bySlug(item.slug);

				if (!product) return null;

				return (
					<CartLine
						key={`${item.slug}-${item.size}`}
						name={product.name}
						href={readOnly ? undefined : shopHref(`/products/${product.slug}`)}
						price={product.price}
						currency={currency}
						locale={locale}
						details={`${product.sizeLabel} ${item.size}`}
						quantity={item.quantity}
						max={product.stock[item.size]}
						media={
							// biome-ignore lint/performance/noImgElement: the static export has no image optimizer
							<img src={product.photos[0].src} alt="" width={960} height={640} />
						}
						onQuantityChange={
							readOnly ? undefined : (quantity) => cart.setQuantity(item.slug, item.size, quantity)
						}
						onRemove={readOnly ? undefined : () => cart.remove(item.slug, item.size)}
					/>
				);
			})}
		</CartList>
	);
}

function CartDrawer({ cart, drawer }: { cart: Cart; drawer: ReturnType<typeof useDisclosure> }) {
	const router = useRouter();

	return (
		<Drawer {...drawer.props}>
			<DrawerContent side="right">
				<DrawerHeader>
					<DrawerTitle>Your cart{cart.count > 0 && ` (${cart.count})`}</DrawerTitle>
				</DrawerHeader>

				{cart.items.length === 0 ? (
					<DrawerBody>
						<Empty
							icon={<ShoppingBag />}
							title="Your cart is empty"
							description="Boots, knits and a good bag are a tap away."
						>
							<Button variant="outline" onClick={drawer.hide}>
								Keep shopping
							</Button>
						</Empty>
					</DrawerBody>
				) : (
					<>
						<DrawerBody className="flex flex-col gap-6">
							<FreeShipping subtotal={cart.subtotal} />

							<CartLines />
						</DrawerBody>

						<DrawerFooter>
							<OrderSummary
								currency={currency}
								locale={locale}
								lines={[{ label: "Subtotal", amount: cart.subtotal }]}
								total={cart.subtotal}
								note="Including VAT. Shipping is chosen at checkout."
								action={
									<Button
										size="lg"
										className="w-full"
										onClick={() => {
											drawer.hide();
											router.push(shopPath("/checkout"));
										}}
									>
										Go to checkout
									</Button>
								}
							/>
						</DrawerFooter>
					</>
				)}
			</DrawerContent>
		</Drawer>
	);
}
