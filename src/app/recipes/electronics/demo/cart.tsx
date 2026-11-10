"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
	/** Unique per configuration, e.g. "aero-14:16:m3:32:1tb". */
	key: string;
	slug: string;
	name: string;
	image: string;
	unitPrice: number;
	qty: number;
	details?: string;
};

type Cart = {
	items: CartItem[];
	count: number;
	total: number;
	add: (item: Omit<CartItem, "qty">) => void;
	setQty: (key: string, qty: number) => void;
	remove: (key: string) => void;
	clear: () => void;
};

const CartContext = createContext<Cart | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = useState<CartItem[]>([]);
	const [ready, setReady] = useState(false);

	// Read after the first render so server HTML and first client render match.
	useEffect(() => {
		try {
			setItems(JSON.parse(localStorage.getItem("labsui-demo-electronics-cart") ?? "[]"));
		} catch {}

		setReady(true);
	}, []);
	useEffect(() => {
		if (ready) localStorage.setItem("labsui-demo-electronics-cart", JSON.stringify(items));
	}, [items, ready]);

	const value = useMemo<Cart>(
		() => ({
			items,
			count: items.reduce((sum, item) => sum + item.qty, 0),
			total: items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0),
			add: (item) =>
				setItems((cur) =>
					cur.some((i) => i.key === item.key)
						? cur.map((i) => (i.key === item.key ? { ...i, qty: i.qty + 1 } : i))
						: [...cur, { ...item, qty: 1 }],
				),
			setQty: (key, qty) => setItems((cur) => cur.map((i) => (i.key === key ? { ...i, qty } : i))),
			remove: (key) => setItems((cur) => cur.filter((i) => i.key !== key)),
			clear: () => setItems([]),
		}),
		[items],
	);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
	const cart = useContext(CartContext);

	if (!cart) throw new Error("useCart needs CartProvider");

	return cart;
}
