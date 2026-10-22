import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { fieldClass } from "./input";

/** Auto-grows with content (`field-sizing: content`); cap with `max-h-*`. */
export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
	return (
		<textarea
			className={cn(fieldClass, "field-sizing-content min-h-16 resize-none px-3 py-2", className)}
			{...props}
		/>
	);
}
