"use client";

import { Clapperboard, GitBranch, Waves } from "lucide-react";
import type { MouseEvent } from "react";
import { PostCard } from "@/components/blocks/post-card";
import { Pager } from "@/components/ui/pager";
import { PropsTable } from "@/components/ui/props-table";
import { Prose } from "@/components/ui/prose";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TableOfContents } from "@/components/ui/table-of-contents";
import { toast } from "@/components/ui/toast";

const stub = (href: string, event: MouseEvent<HTMLAnchorElement>) => {
	event.preventDefault();
	toast(`Demo mode: would open ${href}`);
};

const sections = [
	{ id: "toc-demo-record", label: "Recording" },
	{ id: "toc-demo-upload", label: "Uploading" },
	{ id: "toc-demo-retry", label: "When an upload fails", level: 3 },
	{ id: "toc-demo-keep", label: "Keeping clips" },
	{ id: "toc-demo-delete", label: "Deleting" },
];

export function TableOfContentsDemo() {
	return (
		<div className="flex w-full max-w-3xl flex-col-reverse gap-6 sm:flex-row">
			<ScrollArea
				aria-label="Clips guide"
				className="h-80 min-w-0 rounded-xl border bg-card sm:flex-1"
				viewportClassName="p-5"
			>
				<Prose as="article" className="text-sm/6">
					<h2 id="toc-demo-record">Recording</h2>

					<p>
						Acme keeps the last two minutes of every match in memory. Nothing reaches the disk until
						a player asks for a clip or a round ends in a way the server marks as worth keeping.
					</p>

					<p>
						A clip starts a few seconds before the moment it marks, so the lead-up is in it. Length,
						quality and frame rate come from the server's settings, and players can't change them.
					</p>

					<p>
						Recording stops by itself when the server gets busy. Matches always come first, and a
						missing clip is cheaper than a stutter during a round.
					</p>

					<h2 id="toc-demo-upload">Uploading</h2>

					<p>
						Finished clips upload in the background, one at a time, at a rate the server owner
						chooses. A clip is playable as soon as its first few seconds arrive.
					</p>

					<p>
						Uploads pause while a match is running on a small server and pick up between rounds. The
						queue survives a restart, so nothing has to start over.
					</p>

					<h3 id="toc-demo-retry">When an upload fails</h3>

					<p>
						A failed upload retries five times, waiting longer after each try. After that the clip
						stays on disk and the owner gets one message, not five.
					</p>

					<p>
						Retrying by hand starts from where the upload stopped. A clip that was removed in the
						meantime leaves the queue with a short note in the log.
					</p>

					<h2 id="toc-demo-keep">Keeping clips</h2>

					<p>Clips stay for thirty days, or until the owner deletes them.</p>

					<h2 id="toc-demo-delete">Deleting</h2>

					<p>Deleting a clip removes it everywhere.</p>
				</Prose>
			</ScrollArea>

			<TableOfContents items={sections} offset={24} className="shrink-0 sm:w-48" />
		</div>
	);
}

export function PagerDemo() {
	return (
		<Pager
			label="More guides"
			className="w-full max-w-xl"
			previous={{ title: "Install", href: "/docs/install" }}
			next={{ title: "Theming", href: "/docs/theming" }}
			onNavigate={stub}
		/>
	);
}

const cover = (Icon: typeof Waves, tone: string) => (
	<div className={`flex size-full items-center justify-center ${tone}`}>
		<Icon className="size-8" aria-hidden="true" />
	</div>
);

export function PostCardDemo() {
	return (
		<div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<PostCard
				title="Keeping clips after a match"
				href="/blog/keeping-clips"
				time="Oct 21, 2026"
				dateTime="2026-10-21"
				meta="6 min read"
				excerpt="Where clips go once a match ends, how long they stay and who can delete them."
				tags={["Guides"]}
				media={cover(Clapperboard, "bg-chart-2/12 text-chart-2")}
				onNavigate={stub}
			/>

			<PostCard
				title="Harbor booking"
				href="/work/harbor"
				time="2026"
				meta="Client work"
				excerpt="A booking flow for a small marina, from the first sketch to the summer season."
				tags={["Next.js", "Postgres"]}
				media={cover(Waves, "bg-chart-1/12 text-chart-1")}
				onNavigate={stub}
				action={
					<a
						href="/work/harbor/source"
						onClick={(event) => stub("/work/harbor/source", event)}
						aria-label="Harbor booking source"
						className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
					>
						<GitBranch className="size-4" aria-hidden="true" />
					</a>
				}
			/>

			<PostCard
				title="Why one spring is enough"
				href="/blog/one-spring"
				time="Sep 3, 2026"
				dateTime="2026-09-03"
				excerpt="A text-only post needs no cover. It still links from anywhere on the card."
				tags={["Motion"]}
				onNavigate={stub}
			/>
		</div>
	);
}

export function PropsTableDemo() {
	return (
		<PropsTable
			label="Retry options"
			labels={{ name: "Option" }}
			className="w-full max-w-3xl"
			rows={[
				{
					name: "signal",
					type: "AbortSignal",
					required: true,
					description: "Stops waiting between tries.",
				},
				{
					name: "attempts",
					type: "number",
					default: "3",
					description: "Tries before `retry` gives up and rethrows the last error.",
				},
				{
					name: "backoff",
					type: '"fixed" | "linear" | "exponential"',
					default: '"exponential"',
					description: "How the wait grows after each try.",
				},
			]}
		/>
	);
}
