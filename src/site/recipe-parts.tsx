import { withBase } from "@/site/config";

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

/** The checked run's screenshot, light and dark; the page's theme picks one. */
export function RecipeShot({ id, alt, eager }: { id: string; alt: string; eager?: boolean }) {
	const loading = eager ? "eager" : "lazy";

	return (
		<>
			{/* biome-ignore lint/performance/noImgElement: the static export has no image optimizer */}
			<img
				src={withBase(`/recipes/${id}-light.webp`)}
				alt={alt}
				width={1280}
				height={800}
				loading={loading}
				className="size-full object-cover object-top dark:hidden"
			/>

			{/* biome-ignore lint/performance/noImgElement: the static export has no image optimizer */}
			<img
				src={withBase(`/recipes/${id}-dark.webp`)}
				alt={alt}
				width={1280}
				height={800}
				loading={loading}
				className="hidden size-full object-cover object-top dark:block"
			/>
		</>
	);
}
