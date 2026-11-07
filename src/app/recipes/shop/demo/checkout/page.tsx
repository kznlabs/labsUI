import type { Metadata } from "next";
import { site } from "@/site/config";
import { shopPath } from "../catalog";
import { CheckoutForm } from "../checkout-form";

const url = `${site.url}${shopPath("/checkout")}`;

export const metadata: Metadata = {
	title: "Checkout · Shop demo",
	description: "The shop demo's checkout: shipping, payment and an order summary.",
	alternates: { canonical: url },
};

export default function CheckoutPage() {
	return (
		<>
			<h1 className="mb-8 font-semibold text-3xl tracking-tight">Checkout</h1>

			<CheckoutForm />
		</>
	);
}
