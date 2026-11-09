"use client";

import { type ComponentProps, type ComponentType, createContext, type ReactNode, use } from "react";

/** A link component that takes anchor props and a string `href`, such as `next/link`. */
export type LinkComponent = ComponentType<ComponentProps<"a"> & { href: string }>;

const LinkContext = createContext<LinkComponent | null>(null);

/**
 * Sets the link every component renders, once at the root: pass your router's link
 * (`next/link`) and nav, footer, pager and card links route on the client.
 */
export function LinkProvider({
	component,
	children,
}: {
	/** Rendered for every component link with an `href`, e.g. `Link` from `next/link`. */
	component: LinkComponent;
	/** The app, or the part of it whose links should route this way. */
	children: ReactNode;
}) {
	return <LinkContext value={component}>{children}</LinkContext>;
}

/**
 * An `<a>` that renders the provider's link instead, when there is one. Links without an
 * `href`, in-page `#hash` links and downloads stay plain anchors.
 */
export function AppLink({ href, ...props }: ComponentProps<"a">) {
	const Component = use(LinkContext);

	if (!Component || !href || href.startsWith("#") || props.download !== undefined)
		return <a href={href} {...props} />;

	return <Component href={href} {...props} />;
}
