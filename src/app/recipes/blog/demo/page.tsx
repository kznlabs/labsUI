import type { Metadata } from "next";
import { demoPath, site as labs } from "@/site/config";
import { BlogNewsletter } from "./blog-chrome";
import { PostBrowser } from "./post-browser";
import { posts, site, tags } from "./posts";

const description =
	"A reference build of the blog recipe: a post list with topics and search, long posts with highlighted code and a list of sections, and an about page.";
const url = `${labs.url}${demoPath("blog")}`;

export const metadata: Metadata = {
	title: "Blog demo",
	description,
	alternates: { canonical: url },
	openGraph: { url, title: `Blog demo · ${labs.name}`, description },
};

export default function BlogDemo() {
	const summaries = posts.map(({ sections: _sections, ...summary }) => summary);

	return (
		<>
			<header className="mb-10 max-w-2xl">
				<p className="font-medium text-muted-foreground text-sm">
					{site.author.name} · {posts.length} posts
				</p>

				<h1 className="mt-2 text-balance font-semibold text-3xl tracking-tight sm:text-4xl">
					{site.name}
				</h1>

				<p className="mt-3 text-lg text-muted-foreground leading-relaxed">{site.description}</p>
			</header>

			<PostBrowser posts={summaries} tags={tags} />

			<BlogNewsletter className="mt-16" />
		</>
	);
}
