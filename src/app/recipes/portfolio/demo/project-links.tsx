"use client";

import { ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { AppLink } from "@/lib/link";
import { demoLink } from "./portfolio-chrome";
import { portfolioHref } from "./projects";

/** A project's way out: its live site (none here, so demo mode) and the contact form. */
export function ProjectLinks({ title }: { title: string }) {
	const contact = portfolioHref("#contact");

	return (
		<div className="flex flex-col items-start gap-2">
			<a
				href={`https://example.com/${title.toLowerCase().replace(/\s+/g, "-")}`}
				onClick={(event) => demoLink(event, title)}
				className={buttonVariants({ variant: "outline" })}
			>
				Visit the live site
				<ArrowUpRight aria-hidden="true" />
			</a>

			<AppLink href={contact} className={buttonVariants({ variant: "ghost", size: "sm" })}>
				Start a similar project
			</AppLink>
		</div>
	);
}
