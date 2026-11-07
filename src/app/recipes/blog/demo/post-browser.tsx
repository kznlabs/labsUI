"use client";

import { SearchX } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { SearchInput } from "@/components/ui/search-input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { spring } from "@/lib/utils";
import { PostTile } from "./post-tile";
import type { Post } from "./posts";

type Summary = Pick<Post, "slug" | "title" | "date" | "minutes" | "excerpt" | "tags">;

const matches = (post: Summary, query: string) =>
	[post.title, post.excerpt, ...post.tags].some((text) =>
		text.toLowerCase().includes(query.toLowerCase()),
	);

export function PostBrowser({ posts, tags }: { posts: Summary[]; tags: readonly string[] }) {
	const [tag, setTag] = useState("all");
	const [query, setQuery] = useState("");
	const filtered = tag !== "all" || query.trim() !== "";
	const shown = posts.filter(
		(post) =>
			(tag === "all" || post.tags.some((name) => name === tag)) && matches(post, query.trim()),
	);

	return (
		<section aria-labelledby="posts-heading" className="flex flex-col gap-6">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<h2 id="posts-heading" className="font-semibold text-xl tracking-tight">
					{filtered ? "Matching posts" : "Latest posts"}
				</h2>

				<SearchInput
					value={query}
					onValueChange={setQuery}
					label="Search posts"
					placeholder="Search posts"
					shortcut="/"
					className="w-full sm:w-64"
				/>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="-mx-4 max-w-[calc(100%+2rem)] overflow-x-auto px-4 sm:mx-0 sm:max-w-full sm:px-0">
					<ToggleGroup
						aria-label="Topic"
						size="sm"
						value={tag}
						onValueChange={(value) => value && setTag(value)}
					>
						<ToggleGroupItem value="all">All</ToggleGroupItem>

						{tags.map((name) => (
							<ToggleGroupItem key={name} value={name}>
								{name}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				</div>

				<p className="text-muted-foreground text-sm tabular-nums" aria-live="polite">
					{shown.length} {shown.length === 1 ? "post" : "posts"}
				</p>
			</div>

			{shown.length === 0 ? (
				<Empty
					bordered
					icon={<SearchX />}
					title="No posts match"
					description={`Nothing about “${query.trim()}”${tag === "all" ? "" : ` in ${tag}`} yet.`}
				>
					<Button
						variant="outline"
						onClick={() => {
							setTag("all");
							setQuery("");
						}}
					>
						Show all posts
					</Button>
				</Empty>
			) : (
				<ul className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
					<AnimatePresence initial={false} mode="popLayout">
						{shown.map((post, i) => (
							<motion.li
								key={post.slug}
								layout
								initial={{ opacity: 0, scale: 0.96 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.96 }}
								transition={spring}
							>
								<PostTile post={post} eager={i < 3} />
							</motion.li>
						))}
					</AnimatePresence>
				</ul>
			)}
		</section>
	);
}
