"use client";

import { PostCard } from "@/components/blocks/post-card";
import { Pager } from "@/components/ui/pager";
import { useNavigate } from "./blog-chrome";
import { blogHref, coverOf, formatDate, type Post } from "./posts";

type PostTileProps = {
	post: Pick<Post, "slug" | "title" | "date" | "minutes" | "excerpt" | "tags">;
	as?: "h2" | "h3";
	eager?: boolean;
	className?: string;
};

export function PostTile({ post, as = "h3", eager, className }: PostTileProps) {
	const navigate = useNavigate();
	const cover = coverOf(post.slug);

	return (
		<PostCard
			as={as}
			className={className}
			title={post.title}
			href={blogHref(`/posts/${post.slug}`)}
			time={formatDate(post.date)}
			dateTime={post.date}
			meta={`${post.minutes} min read`}
			excerpt={post.excerpt}
			tags={post.tags}
			media={
				cover && (
					// biome-ignore lint/performance/noImgElement: the static export has no image optimizer
					<img src={cover.src} alt="" width={960} height={540} loading={eager ? "eager" : "lazy"} />
				)
			}
			onNavigate={navigate}
		/>
	);
}

type Link = { title: string; slug: string };

export function PostPager({ newer, older }: { newer?: Link; older?: Link }) {
	const navigate = useNavigate();
	const link = (post?: Link) =>
		post && { title: post.title, href: blogHref(`/posts/${post.slug}`) };

	return (
		<Pager
			label="More posts"
			previousLabel="Newer"
			nextLabel="Older"
			previous={link(newer)}
			next={link(older)}
			onNavigate={navigate}
		/>
	);
}
