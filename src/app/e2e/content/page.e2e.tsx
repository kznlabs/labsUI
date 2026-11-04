"use client";

import { useState } from "react";
import { PostCard } from "@/components/blocks/post-card";
import { Pager } from "@/components/ui/pager";
import { PropsTable } from "@/components/ui/props-table";
import { TableOfContents } from "@/components/ui/table-of-contents";

const pageItems = [
	{ id: "page-one", label: "One" },
	{ id: "page-closed", label: "Closed" },
	{ id: "page-two", label: "Two", level: 3 },
	{ id: "page-three", label: "Three" },
	{ id: "page-tail-a", label: "Tail A" },
	{ id: "page-tail-b", label: "Tail B" },
];

const nestedItems = [
	{ id: "nested-one", label: "Nested one" },
	{ id: "nested-two", label: "Nested two" },
	{ id: "nested-tail", label: "Nested tail" },
];

const longItems = Array.from({ length: 30 }, (_, index) => ({
	id: `long-${index}`,
	label: `Long ${index}`,
}));

const rows = [
	{
		name: "signal",
		type: "AbortSignal",
		required: true,
		description: "Stops `retry` between tries.",
	},
	{ name: "attempts", type: "number", default: "3" },
];

function Tall({ id, title }: { id: string; title: string }) {
	return (
		<section className="h-[120vh]">
			<h2 id={id} className="scroll-mt-20 font-semibold text-xl">
				{title}
			</h2>
		</section>
	);
}

function Posts() {
	const [picked, setPicked] = useState("none");

	return (
		<section data-probe="post" className="grid max-w-3xl gap-4 sm:grid-cols-2">
			<output>{picked}</output>

			<PostCard
				as="h2"
				title="Full post"
				href="/full"
				time="Oct 21, 2026"
				dateTime="2026-10-21"
				meta="6 min read"
				excerpt="Excerpt"
				tags={["One", "Two"]}
				media={<div className="size-full" />}
				onNavigate={(href, event) => {
					event.preventDefault();
					setPicked(href);
				}}
				action={
					<button type="button" onClick={() => setPicked("action")}>
						Source
					</button>
				}
			/>

			<PostCard title="Text only" />
		</section>
	);
}

export default function ContentPage() {
	return (
		<main className="flex flex-col gap-10 p-4">
			<Posts />

			<section data-probe="pager-both" className="max-w-xl">
				<Pager
					label="Both"
					previous={{ title: "Earlier", href: "#earlier" }}
					next={{ title: "Later", href: "#later" }}
				/>
			</section>

			<section data-probe="pager-next" className="max-w-xl">
				<Pager label="Next only" next={{ title: "Later", href: "#later" }} />
			</section>

			<section data-probe="pager-none">
				<Pager label="Neither" />
			</section>

			<section data-probe="props-wide" className="max-w-3xl">
				<PropsTable label="Wide" rows={rows} />
			</section>

			<section data-probe="props-narrow" className="w-64">
				<PropsTable label="Narrow" rows={rows} labels={{ name: "Option" }} />
			</section>

			<section data-probe="toc-nested" className="flex max-w-xl gap-4">
				<div data-nested-scroller className="relative h-64 flex-1 overflow-y-auto border">
					<div className="h-[32rem]">
						<h2 id="nested-one" className="font-semibold">
							Nested one
						</h2>
					</div>

					<div className="h-[32rem]">
						<h2 id="nested-two" className="font-semibold">
							Nested two
						</h2>
					</div>

					<h2 id="nested-tail" className="font-semibold">
						Nested tail
					</h2>
				</div>

				<TableOfContents items={nestedItems} label="Nested" offset={24} className="w-40" />
			</section>

			<section data-probe="toc-long" className="flex max-w-xl gap-4">
				<div className="relative h-64 flex-1 overflow-y-auto border">
					{longItems.map((item) => (
						<h2 key={item.id} id={item.id} className="h-40">
							{item.label}
						</h2>
					))}
				</div>

				<TableOfContents items={longItems} label="Long" offset={24} className="h-48 w-40" />
			</section>

			<div className="relative grid grid-cols-[minmax(0,1fr)_12rem] gap-6">
				<article>
					<Tall id="page-one" title="One" />

					<h2 id="page-closed" hidden>
						Closed
					</h2>

					<Tall id="page-two" title="Two" />

					<Tall id="page-three" title="Three" />

					<h2 id="page-tail-a" className="scroll-mt-20 font-semibold text-xl">
						Tail A
					</h2>

					<p>Short.</p>

					<h2 id="page-tail-b" className="scroll-mt-20 font-semibold text-xl">
						Tail B
					</h2>

					<p>Short.</p>
				</article>

				<aside data-probe="toc-page">
					<TableOfContents items={pageItems} className="sticky top-4" />
				</aside>
			</div>
		</main>
	);
}
