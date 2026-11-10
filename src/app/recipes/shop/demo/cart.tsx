"use client";

import { createContext, use, useEffect, useMemo, useState } from "react";
import { bySlug } from "./catalog";

export type Line = { slug: string; size: string; quantity: number };

type Cart = {
	lines: Line[];
	count: number;
	subtotal: number;
	open: boolean;
	setOpen: (open: boolean) => void;
	add: (slug: string, size: string) => void;
	setQuantity: (slug: string, size: string, quantity: number) => void;
	remove: (slug: string, size: string) => void;
	clear: () => void;
};

const CartContext = createContext<Cart | null>(null);
const KEY = "bag";

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [lines, setLines] = useState<Line[]>([]);
	const [ready, setReady] = useState(false);
	const [open, setOpen] = useState(false);

	// Read after the first render so server HTML and first client render match.
	useEffect(() => {
		try {
			setLines(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
		} catch {}

		setReady(true);
	}, []);

	useEffect(() => {
		if (ready) localStorage.setItem(KEY, JSON.stringify(lines));
	}, [lines, ready]);

	const value = useMemo<Cart>(() => {
		const same = (line: Line, slug: string, size: string) =>
			line.slug === slug && line.size === size;
		const max = (slug: string, size: string) => bySlug(slug)?.stock[size] ?? 1;

		return {
			lines,
			count: lines.reduce((sum, line) => sum + line.quantity, 0),
			subtotal: lines.reduce(
				(sum, line) => sum + (bySlug(line.slug)?.price ?? 0) * line.quantity,
				0,
			),
			open,
			setOpen,
			add: (slug, size) => {
				setLines((cur) =>
					cur.some((line) => same(line, slug, size))
						? cur.map((line) =>
								same(line, slug, size)
									? { ...line, quantity: Math.min(line.quantity + 1, max(slug, size)) }
									: line,
							)
						: [...cur, { slug, size, quantity: 1 }],
				);
				setOpen(true);
			},
			setQuantity: (slug, size, quantity) =>
				setLines((cur) =>
					cur.map((line) =>
						same(line, slug, size)
							? { ...line, quantity: Math.min(quantity, max(slug, size)) }
							: line,
					),
				),
			remove: (slug, size) => setLines((cur) => cur.filter((line) => !same(line, slug, size))),
			clear: () => setLines([]),
		};
	}, [lines, open]);

	return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
	const cart = use(CartContext);

	if (!cart) throw new Error("useCart must be used inside <CartProvider>");

	return cart;
}
