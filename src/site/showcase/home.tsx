import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { nav, showcase } from "@/site/catalog";
import { componentPath, groupPath, withBase } from "@/site/config";
import { Playground } from "@/site/showcase/playground";

const firstSentence = (text: string) => text.split(/(?<=\.)\s/)[0] ?? text;
const link =
	"outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50";

/** Live compositions, each opening its component page. */
export function Showcase() {
	return (
		<section aria-labelledby="showcase" className="flex flex-col gap-6 border-t py-12">
			<div className="flex flex-col gap-2">
				<h2 id="showcase" className="font-semibold text-2xl tracking-tight">
					Built with labsUI
				</h2>

				<p className="max-w-2xl text-muted-foreground text-sm leading-relaxed">
					Compositions where several components work together. Each one opens its page with the
					code, the props and the install command.
				</p>
			</div>

			<ul className="grid gap-6 lg:grid-cols-2">
				{showcase.map(({ entry, demo, wide }) => (
					<li
						key={entry.id}
						className={cn(
							"flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-xs",
							wide && "lg:col-span-2",
						)}
					>
						{/* The stage takes the row's height, so footers line up across a row. */}
						<div className="flex flex-1 flex-col *:flex-1">
							<Playground previewClassName={cn("h-full rounded-none", demo.preview)}>
								{demo.node}
							</Playground>
						</div>

						<a
							href={withBase(componentPath(entry.id))}
							className={cn(
								"group flex items-center justify-between gap-3 border-t px-4 py-3 text-sm focus-visible:ring-inset",
								link,
							)}
						>
							<span className="flex min-w-0 flex-col gap-0.5">
								<span className="font-medium">{entry.name}</span>

								<span className="truncate text-muted-foreground text-xs">
									{firstSentence(entry.description)}
								</span>
							</span>

							<ArrowUpRight
								aria-hidden="true"
								className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground"
							/>
						</a>
					</li>
				))}
			</ul>
		</section>
	);
}

/** Every component by group; each links to its page. Group anchors match `groupPath()`. */
export function ComponentIndex() {
	const count = nav.reduce((sum, group) => sum + group.items.length, 0);

	return (
		<section aria-labelledby="components" className="flex flex-col gap-8 border-t py-12">
			<div className="flex flex-col gap-2">
				<h2 id="components" className="font-semibold text-2xl tracking-tight">
					All components <span className="text-muted-foreground tabular-nums">{count}</span>
				</h2>

				<p className="max-w-2xl text-muted-foreground text-sm leading-relaxed">
					Each has its own page: a live demo, the code, the props and what it installs. Search them
					from anywhere with the palette in the header.
				</p>
			</div>

			{nav.map((group) => (
				<div
					key={group.label}
					id={groupPath(group.label).slice(2)}
					className="flex scroll-mt-20 flex-col gap-3"
				>
					<h3 className="font-medium text-muted-foreground text-sm">{group.label}</h3>

					<ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{group.items.map((item) => (
							<li key={item.id}>
								<a
									href={withBase(componentPath(item.id))}
									className={cn(
										"flex h-full flex-col gap-1 rounded-xl border bg-card px-4 py-3",
										link,
									)}
								>
									<span className="font-medium text-sm">{item.name}</span>

									<span className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">
										{firstSentence(item.description)}
									</span>
								</a>
							</li>
						))}
					</ul>
				</div>
			))}
		</section>
	);
}
