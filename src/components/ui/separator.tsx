import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/* Server-safe (no "use client"). */

type SeparatorProps = ComponentProps<"div"> & {
	/** Direction of the line. */
	orientation?: "horizontal" | "vertical";
	/** Purely visual (default). Set false when the line separates content for assistive tech. */
	decorative?: boolean;
	/** Centered text on the line, e.g. "or". Horizontal only. */
	label?: string;
};

export function Separator({
	orientation = "horizontal",
	decorative = true,
	label,
	className,
	...props
}: SeparatorProps) {
	const semantics = decorative
		? { role: "none" }
		: { role: "separator", "aria-orientation": orientation };

	if (label && orientation === "horizontal") {
		return (
			<div
				{...semantics}
				className={cn(
					"flex items-center gap-3 text-muted-foreground text-xs before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border",
					className,
				)}
				{...props}
			>
				{label}
			</div>
		);
	}

	return (
		<div
			{...semantics}
			className={cn(
				"shrink-0 bg-border",
				orientation === "horizontal" ? "h-px w-full" : "w-px self-stretch",
				className,
			)}
			{...props}
		/>
	);
}
