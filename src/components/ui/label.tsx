import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: ComponentProps<"label">) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: primitive; consumer passes htmlFor or wraps the control
		<label
			className={cn("flex select-none items-center gap-2 font-medium text-sm", className)}
			{...props}
		/>
	);
}
