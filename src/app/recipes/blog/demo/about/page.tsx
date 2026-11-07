import { BookOpen, Briefcase, Mic, PenLine, Rocket } from "lucide-react";
import type { Metadata } from "next";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar } from "@/components/ui/avatar";
import { Prose } from "@/components/ui/prose";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { site as labs, withBase } from "@/site/config";
import { BlogNewsletter } from "../blog-chrome";
import { blogPath, coverOf, posts, site } from "../posts";

const url = `${labs.url}${blogPath("/about")}`;

export const metadata: Metadata = {
	title: "About · Blog demo",
	description: site.author.bio,
	alternates: { canonical: url },
	openGraph: { url, title: `About · Blog demo · ${labs.name}`, description: site.author.bio },
};

export default function AboutPage() {
	const cover = coverOf("about");

	return (
		<div className="mx-auto max-w-3xl">
			<header className="flex items-center gap-4">
				<Avatar src={withBase("/avatar-demo.svg")} alt={site.author.name} size="lg" />

				<div>
					<h1 className="font-semibold text-3xl tracking-tight">{site.author.name}</h1>

					<p className="text-muted-foreground">{site.author.role}</p>
				</div>
			</header>

			{cover && (
				<AspectRatio ratio={21 / 9} className="mt-8 overflow-hidden rounded-2xl bg-muted">
					{/* biome-ignore lint/performance/noImgElement: the static export has no image optimizer */}
					<img src={cover.src} alt={cover.alt} width={960} height={540} className="object-cover" />
				</AspectRatio>
			)}

			<Prose className="mt-8">
				<p>{site.author.bio}</p>

				<p>
					{site.name} is where I collect notes on TypeScript, React, servers, tooling and working in
					teams. Posts are written for working developers: short on theory, long on examples you can
					paste into a project and adapt. There are {posts.length} so far.
				</p>

				<h2>What I write about</h2>

				<ul>
					<li>Type-safe patterns that stay readable</li>

					<li>Rendering and caching on the server and in the browser</li>

					<li>Small tools that save a team a few minutes every day</li>
				</ul>

				<h2>Get in touch</h2>

				<p>
					Spotted a mistake or have a question about a post? Write to{" "}
					<a href="mailto:hello@example.com">hello@example.com</a>.
				</p>
			</Prose>

			<section aria-labelledby="journey-heading" className="mt-12">
				<h2 id="journey-heading" className="font-semibold text-xl tracking-tight">
					Along the way
				</h2>

				<Timeline className="mt-6">
					<TimelineItem icon={<PenLine />} variant="active" time="2026" title="Started Field Notes">
						Began writing up the things I kept explaining in code review.
					</TimelineItem>

					<TimelineItem icon={<Mic />} time="2025" title="First conference talk">
						Twenty minutes on database migrations that don't wake anyone up.
					</TimelineItem>

					<TimelineItem icon={<Briefcase />} time="2022 – now" title="Platform team">
						Build tooling and shared UI for a dozen product teams.
					</TimelineItem>

					<TimelineItem icon={<Rocket />} time="2019" title="Joined a four-person startup">
						Shipped the first version of a booking app, then rewrote half of it.
					</TimelineItem>

					<TimelineItem icon={<BookOpen />} time="2017" title="First production React app">
						A booking flow for a small marina, still running today.
					</TimelineItem>
				</Timeline>
			</section>

			<BlogNewsletter className="mt-16" />
		</div>
	);
}
