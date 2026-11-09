"use client";

import NextLink from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { LinkProvider } from "@/lib/link";
import { withBase } from "@/site/config";

const base = withBase("");

// Demo hrefs carry the base path for plain anchors; the router adds its own.
function BaseLink({ href, ...props }: ComponentProps<"a"> & { href: string }) {
	const path = base && href.startsWith(base) ? href.slice(base.length) || "/" : href;

	return <NextLink href={path} {...props} />;
}

/** Every component link in a recipe demo routes on the client, as an app's root would set up. */
export function DemoLinks({ children }: { children: ReactNode }) {
	return <LinkProvider component={BaseLink}>{children}</LinkProvider>;
}
