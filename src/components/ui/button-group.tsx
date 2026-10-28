import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ButtonGroupProps = ComponentProps<"div"> & {
	/** "horizontal" (default) or "vertical". */
	orientation?: "horizontal" | "vertical";
	/** Fuse borders and corners into a single connected strip (default: true). */
	attached?: boolean;
};

/** Groups related buttons together into a connected control or toolbar. */
export function ButtonGroup({
	orientation = "horizontal",
	attached = true,
	className,
	...props
}: ButtonGroupProps) {
	return (
		/* biome-ignore lint/a11y/useSemanticElements: ARIA group pattern for button bars */
		<div
			role="group"
			data-orientation={orientation}
			data-attached={attached ? "" : undefined}
			className={cn(
				"inline-flex",
				orientation === "vertical" ? "flex-col" : "flex-row",
				attached
					? orientation === "vertical"
						? "[&>*:not(:first-child)]:-mt-px [&>*]:focus-visible:z-10 [&>*]:hover:z-10 [&>*:not(:last-child)]:rounded-b-none [&>*:not(:first-child)]:rounded-t-none"
						: "[&>*:not(:first-child)]:-ml-px [&>*]:focus-visible:z-10 [&>*]:hover:z-10 [&>*:not(:last-child)]:rounded-r-none [&>*:not(:first-child)]:rounded-l-none"
					: "gap-1.5 sm:gap-2",
				className,
			)}
			{...props}
		/>
	);
}
