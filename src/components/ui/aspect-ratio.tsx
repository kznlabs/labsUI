import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/* Server-safe (no "use client"). */

type AspectRatioProps = ComponentProps<"div"> & {
	/** Width / height, e.g. `16 / 9`, `1`, `9 / 16`. */
	ratio?: number;
};

/** Box locked to a ratio. A direct `<img>` or `<video>` child fills it (object-cover). */
export function AspectRatio({ ratio = 16 / 9, className, style, ...props }: AspectRatioProps) {
	return (
		<div
			data-slot="aspect-ratio"
			style={{ aspectRatio: ratio, ...style }}
			className={cn(
				"relative w-full overflow-hidden [&>:is(img,video)]:absolute [&>:is(img,video)]:inset-0 [&>:is(img,video)]:size-full [&>:is(img,video)]:object-cover",
				className,
			)}
			{...props}
		/>
	);
}
