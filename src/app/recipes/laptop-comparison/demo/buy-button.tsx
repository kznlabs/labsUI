"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export function BuyButton({ name, featured }: { name: string; featured?: boolean }) {
	return (
		<Button
			size="sm"
			variant={featured ? "default" : "outline"}
			className="w-full"
			onClick={() => toast(`Demo mode: would add the ${name} to your cart`)}
		>
			<ShoppingBag aria-hidden="true" />
			Add to cart
		</Button>
	);
}
