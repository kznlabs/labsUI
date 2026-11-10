import type { Metadata } from "next";
import { demoPath, site } from "@/site/config";
import { CheckoutForm } from "../checkout-form";

const url = `${site.url}${demoPath("shop")}/checkout`;

export const metadata: Metadata = {
	title: "Checkout · Fashion store demo",
	alternates: { canonical: url },
	openGraph: { url, title: `Checkout · Fashion store demo · ${site.name}` },
};

export default function CheckoutPage() {
	return <CheckoutForm />;
}
