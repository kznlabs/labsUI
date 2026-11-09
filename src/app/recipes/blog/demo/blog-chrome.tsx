"use client";

import { usePathname } from "next/navigation";
import { Newsletter } from "@/components/blocks/newsletter";
import { SiteFooter } from "@/components/blocks/site-footer";
import { SiteHeader } from "@/components/blocks/site-header";
import { AppLink } from "@/lib/link";
import { blogHref, covers, posts, site } from "./posts";

export function BlogHeader() {
	const pathname = usePathname();
	const onAbout = /\/about\/?$/.test(pathname);

	return (
		<SiteHeader
			className="top-12"
			label="Blog"
			brand={
				<AppLink href={blogHref()} className="font-semibold tracking-tight">
					{site.name}
				</AppLink>
			}
			nav={[
				{ label: "Posts", href: blogHref() },
				{ label: "About", href: blogHref("/about") },
			]}
			current={onAbout ? blogHref("/about") : blogHref()}
		/>
	);
}

export function BlogFooter() {
	const creators = [...new Set(covers.map((cover) => cover.creator))];

	return (
		<SiteFooter
			className="mt-16"
			brand={
				<AppLink href={blogHref()} className="font-semibold">
					{site.name}
				</AppLink>
			}
			description={`${site.description} A demo blog: sample posts, no real newsletter.`}
			columns={[
				{
					title: "Latest",
					links: posts.slice(0, 3).map((post) => ({
						label: post.title,
						href: blogHref(`/posts/${post.slug}`),
					})),
				},
				{
					title: "Blog",
					links: [
						{ label: "All posts", href: blogHref() },
						{ label: "About", href: blogHref("/about") },
					],
				},
			]}
			legal={`Cover photos CC0 from StockSnap by ${creators.join(", ")}.`}
		/>
	);
}

export function BlogNewsletter({ className }: { className?: string }) {
	return (
		<Newsletter
			className={className}
			title="New posts by email"
			description="One email when a post goes up, about twice a month. No tracking pixels."
			onSubscribe={() => new Promise((done) => setTimeout(done, 900))}
			successMessage="Demo mode: no email sent, a real blog would ask you to confirm"
		/>
	);
}
