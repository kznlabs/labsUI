import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Shared control styles (Input, Textarea). */
export const fieldClass =
	"w-full min-w-0 rounded-lg border border-input bg-transparent text-sm shadow-xs outline-none transition-[color,box-shadow,border-color] duration-200 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30";

export function Input({ className, type = "text", ...props }: ComponentProps<"input">) {
	return (
		<input
			type={type}
			className={cn(
				fieldClass,
				"h-9 px-3 py-1 file:mr-3 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm",
				className,
			)}
			{...props}
		/>
	);
}
