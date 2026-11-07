"use client";

import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { Newsletter } from "@/components/blocks/newsletter";
import { SiteFooter } from "@/components/blocks/site-footer";
import { SiteHeader } from "@/components/blocks/site-header";
import { withBase } from "@/site/config";
import { blogHref, covers, posts, site } from "./posts";

/** Client routing for a demo link: hrefs carry the base path, the router adds its own. */
export function useNavigate() {
	const router = useRouter();

	return (href: string, event: MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		router.push(href.slice(withBase("").length) || "/");
	};
}

export function BlogHeader() {
	const pathname = usePathname();
	const navigate = useNavigate();
	const onAbout = /\/about\/?$/.test(pathname);

	return (
		<SiteHeader
			className="top-12"
			label="Blog"
			brand={
				<a
					href={blogHref()}
					onClick={(event) => navigate(blogHref(), event)}
					className="font-semibold tracking-tight"
				>
					{site.name}
				</a>
			}
			nav={[
				{ label: "Posts", href: blogHref() },
				{ label: "About", href: blogHref("/about") },
			]}
			current={onAbout ? blogHref("/about") : blogHref()}
			onNavigate={navigate}
		/>
	);
}

export function BlogFooter() {
	const navigate = useNavigate();
	const creators = [...new Set(covers.map((cover) => cover.creator))];

	return (
		<SiteFooter
			className="mt-16"
			brand={
				<a
					href={blogHref()}
					onClick={(event) => navigate(blogHref(), event)}
					className="font-semibold"
				>
					{site.name}
				</a>
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
			onNavigate={navigate}
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
