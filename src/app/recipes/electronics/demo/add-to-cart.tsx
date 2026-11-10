"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useCart } from "./cart";
import { type Product, price } from "./catalog";

export function AddToCart({
	product,
	size = "sm",
	className,
}: {
	product: Product;
	size?: "sm" | "default" | "lg";
	className?: string;
}) {
	const { add } = useCart();
	const out = product.stock === 0;

	return (
		<Button
			size={size}
			className={className}
			disabled={out}
			onClick={() => {
				add({
					key: product.slug,
					slug: product.slug,
					name: product.name,
					image: product.image,
					unitPrice: price(product),
				});
				toast(`${product.name} added to cart`);
			}}
		>
			<ShoppingCart aria-hidden />

			{out ? "Out of stock" : "Add to cart"}
		</Button>
	);
}
