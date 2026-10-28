"use client";

import type { ComponentProps } from "react";
import { useFieldControl } from "@/components/ui/field";
import { cn } from "@/lib/utils";

/** Shared control styles (Input, Textarea, NativeSelect). `user-invalid`: native validation after interaction. */
export const fieldClass =
	"w-full min-w-0 rounded-lg border border-input bg-field text-sm shadow-xs outline-none transition-[color,box-shadow,border-color] duration-200 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 user-invalid:border-destructive user-invalid:ring-destructive/20";

/** Works inside <Field> (id and ARIA filled in) and <InputGroup> (chrome handed to the group). */
export function Input({ className, type = "text", ...rest }: ComponentProps<"input">) {
	const props = useFieldControl(rest);

	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				fieldClass,
				"h-9 px-3 py-1 file:mr-3 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm",
				className,
			)}
			{...props}
		/>
	);
}
