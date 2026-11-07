import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Fragment, type ReactNode } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Code } from "@/components/ui/code";
import { Prose } from "@/components/ui/prose";
import { Separator } from "@/components/ui/separator";
import { highlightCode } from "@/lib/highlight";
import { site as labs, withBase } from "@/site/config";
import { Contents, CopyLink, ReadingProgress } from "../../post-parts";
import { PostPager, PostTile } from "../../post-tile";
import {
	type Block,
	blogHref,
	blogPath,
	coverOf,
	formatDate,
	postBySlug,
	posts,
	site,
} from "../../posts";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
	return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const post = postBySlug((await params).slug);

	if (!post) return {};

	const url = `${labs.url}${blogPath(`/posts/${post.slug}`)}`;

	return {
		title: `${post.title} · Blog demo`,
		description: post.excerpt,
		alternates: { canonical: url },
		openGraph: {
			url,
			title: `${post.title} · Blog demo · ${labs.name}`,
			description: post.excerpt,
		},
	};
}

/** `backticks` in sample text become inline code. */
function inline(text: string): ReactNode {
	// Odd parts sit between backticks; a part's position is its identity.
	return text.split(/`([^`]+)`/).map((part, i) => {
		const key = `${i}-${part}`;

		return i % 2 ? <code key={key}>{part}</code> : <Fragment key={key}>{part}</Fragment>;
	});
}

// Highlighted at build time, so the browser never loads Shiki.
async function CodeBlock({ code, language }: { code: string; language: string }) {
	const tokens = await highlightCode(code, language);

	return <Code code={code} language={language} tokens={tokens ?? undefined} lineNumbers />;
}

function BlockView({ block }: { block: Block }) {
	switch (block.type) {
		case "p":
			return <p>{inline(block.text)}</p>;
		case "quote":
			return (
				<blockquote>
					<p>{inline(block.text)}</p>
				</blockquote>
			);
		case "list":
			return (
				<ul>
					{block.items.map((item) => (
						<li key={item}>{inline(item)}</li>
					))}
				</ul>
			);
		case "code":
			return (
				<div className="my-6">
					<CodeBlock code={block.code} language={block.language} />
				</div>
			);
	}
}

export default async function PostPage({ params }: Props) {
	const post = postBySlug((await params).slug);

	if (!post) notFound();

	const index = posts.indexOf(post);
	const cover = coverOf(post.slug);
	// Two more posts: shared topics first, then the newest.
	const shares = (other: typeof post) => other.tags.some((tag) => post.tags.includes(tag));
	const more = posts
		.filter((other) => other !== post)
		.toSorted((a, b) => Number(shares(b)) - Number(shares(a)))
		.slice(0, 2);

	return (
		<>
			<ReadingProgress />

			<Breadcrumb
				className="mb-6"
				items={[{ label: "Posts", href: blogHref() }, { label: post.title }]}
			/>

			<header className="max-w-3xl">
				<div className="flex flex-wrap gap-1.5">
					{post.tags.map((tag) => (
						<Badge key={tag} variant="secondary">
							{tag}
						</Badge>
					))}
				</div>

				<h1 className="mt-4 text-balance font-semibold text-3xl tracking-tight sm:text-4xl">
					{post.title}
				</h1>

				<p className="mt-4 text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>

				<div className="mt-6 flex flex-wrap items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<Avatar src={withBase("/avatar-demo.svg")} alt={site.author.name} />

						<div className="text-sm">
							<p className="font-medium">{site.author.name}</p>

							<p className="text-muted-foreground">
								<time dateTime={post.date}>{formatDate(post.date)}</time> · {post.minutes} min read
							</p>
						</div>
					</div>

					<CopyLink />
				</div>
			</header>

			{cover && (
				<AspectRatio ratio={21 / 9} className="mt-8 overflow-hidden rounded-2xl bg-muted">
					{/* biome-ignore lint/performance/noImgElement: the static export has no image optimizer */}
					<img src={cover.src} alt={cover.alt} width={960} height={540} className="object-cover" />
				</AspectRatio>
			)}

			<div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_14rem]">
				<div className="min-w-0 lg:order-2">
					<Contents
						items={post.sections.map(({ id, title, level }) => ({ id, label: title, level }))}
					/>
				</div>

				<Prose as="article" className="min-w-0 max-w-3xl lg:order-1">
					{post.sections.map((section) => {
						const Heading = section.level === 3 ? "h3" : "h2";

						return (
							<section key={section.id}>
								<Heading id={section.id} className="scroll-mt-32">
									{section.title}
								</Heading>

								{section.blocks.map((block, i) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: sample blocks never reorder
									<BlockView key={i} block={block} />
								))}
							</section>
						);
					})}
				</Prose>
			</div>

			<Separator className="my-12" />

			<PostPager newer={posts[index - 1]} older={posts[index + 1]} />

			<section aria-labelledby="more-heading" className="mt-14">
				<h2 id="more-heading" className="font-semibold text-xl tracking-tight">
					Keep reading
				</h2>

				<ul className="mt-6 grid gap-5 sm:grid-cols-2">
					{more.map(({ sections: _sections, ...summary }) => (
						<li key={summary.slug}>
							<PostTile post={summary} />
						</li>
					))}
				</ul>
			</section>
		</>
	);
}
