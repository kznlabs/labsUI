"use client";

import { Activity } from "lucide-react";
import type { MouseEvent } from "react";
import { Newsletter } from "@/components/blocks/newsletter";
import { SiteFooter } from "@/components/blocks/site-footer";
import { SiteHeader } from "@/components/blocks/site-header";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { toast } from "@/components/ui/toast";
import { footerColumns, product } from "./content";

const sections = [
	{ label: "Features", href: "#features" },
	{ label: "Customers", href: "#customers" },
	{ label: "Pricing", href: "#pricing" },
	{ label: "FAQ", href: "#faq" },
];

// Page links scroll; the rest would leave the demo, so they answer instead.
function navigate(href: string, event: MouseEvent<HTMLAnchorElement>) {
	if (href.startsWith("#")) return;

	event.preventDefault();
	toast.info("Demo mode: this page isn't part of the demo");
}

function Brand() {
	return (
		<a href="#top" className="flex items-center gap-2 font-semibold tracking-tight">
			<span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
				<Activity aria-hidden="true" className="size-4" />
			</span>

			{product.name}
		</a>
	);
}

export function LandingHeader() {
	return (
		<SiteHeader
			className="top-12"
			label="Pingwell"
			brand={<Brand />}
			nav={sections}
			onNavigate={navigate}
			actions={
				<>
					<Button
						variant="ghost"
						size="sm"
						className="max-sm:hidden"
						onClick={() => toast.info("Demo mode: there are no accounts to sign in to")}
					>
						Sign in
					</Button>

					<a href="#pricing" className={buttonVariants({ size: "sm" })}>
						Start free
					</a>
				</>
			}
		/>
	);
}

export function LandingNewsletter() {
	return (
		<Newsletter
			title="The uptime letter"
			description="One email a month: what we shipped, and one outage story worth learning from."
			placeholder="you@company.com"
			successMessage="Demo mode: nothing was sent, no address was kept"
			onSubscribe={(email) =>
				new Promise((resolve, reject) =>
					setTimeout(
						() =>
							email.endsWith("@example.com")
								? reject(new Error("That address is already subscribed"))
								: resolve(email),
						800,
					),
				)
			}
		/>
	);
}

export function LandingFooter() {
	return (
		<SiteFooter
			brand={<Brand />}
			description={`${product.tagline}. A made-up product: every customer, figure and quote here is sample data.`}
			columns={footerColumns}
			onNavigate={navigate}
			legal={`© 2026 ${product.name}. Prices in euros, excluding VAT.`}
		/>
	);
}
