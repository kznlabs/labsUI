import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button-variants";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { demoPath, withBase } from "@/site/config";

/** The docs page an item is on: `forms` for `input`, the item's own name for most. */
export function pageOf(item: string, entries: { id: string; file: string }[]) {
	return entries.find((entry) =>
		entry.file.split("·").some(
			(file) =>
				file
					.trim()
					.replace(/^blocks\//, "")
					.replace(/\.tsx?$/, "") === item,
		),
	)?.id;
}

/**
 * A screenshot in `public/recipes/`, light and dark; the page's theme picks one. `name` is the
 * file's stem: `<id>` for the checked run, `<id>-demo` for the reference build.
 */
export function RecipeShot({ name, alt, eager }: { name: string; alt: string; eager?: boolean }) {
	const loading = eager ? "eager" : "lazy";

	return (
		<>
			{/* biome-ignore lint/performance/noImgElement: the static export has no image optimizer */}
			<img
				src={withBase(`/recipes/${name}-light.webp`)}
				alt={alt}
				width={1280}
				height={800}
				loading={loading}
				className="size-full object-cover object-top dark:hidden"
			/>

			{/* biome-ignore lint/performance/noImgElement: the static export has no image optimizer */}
			<img
				src={withBase(`/recipes/${name}-dark.webp`)}
				alt={alt}
				width={1280}
				height={800}
				loading={loading}
				className="hidden size-full object-cover object-top dark:block"
			/>
		</>
	);
}

/**
 * "Open demo" over a screenshot: shown on hover or focus where there is a pointer that hovers,
 * always on touch screens. `group` is the Tailwind group whose hover reveals it.
 */
export function OpenDemo({ id, group }: { id: string; group: "post" | "shot" }) {
	return (
		<a
			href={withBase(demoPath(id))}
			className={cn(
				buttonVariants({ size: "sm" }),
				"absolute right-3 bottom-3 z-10 shadow-md transition-opacity duration-200 focus-visible:opacity-100",
				"[@media(hover:hover)]:opacity-0",
				group === "post"
					? "[@media(hover:hover)]:group-hover/post:opacity-100"
					: "[@media(hover:hover)]:group-hover/shot:opacity-100",
			)}
		>
			Open demo
			<ArrowUpRight aria-hidden="true" />
		</a>
	);
}

/**
 * A demo page's only chrome: back to the recipes, the recipe's name and the theme. A `nav`, not a
 * `header`, so a demo's own site header stays the page's one banner.
 */
export function DemoShell({ title, children }: { title: string; children: ReactNode }) {
	return (
		<>
			<nav
				aria-label="Demo"
				className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl backdrop-saturate-150"
			>
				<div className="mx-auto flex h-12 max-w-7xl items-center gap-3 px-4 sm:px-6">
					<a
						href={withBase("/recipes")}
						className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}
					>
						<ArrowLeft aria-hidden="true" />
						Back to recipes
					</a>

					<span aria-hidden="true" className="h-4 w-px bg-border" />

					<p className="min-w-0 flex-1 truncate font-medium text-sm">
						{title}

						<span className="hidden text-muted-foreground sm:inline"> · reference build</span>
					</p>

					<ThemeToggle />
				</div>
			</nav>

			{children}
		</>
	);
}
