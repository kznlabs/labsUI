"use client";

import { type ComponentProps, useId, useState } from "react";
import { useFieldControl } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { fieldClass } from "./input";

type TextareaProps = ComponentProps<"textarea"> & {
	/** Show "used / maxLength" in the corner (needs `maxLength`). Turns warning, then red, near the end. */
	showCount?: boolean;
};

/** Auto-grows with content (`field-sizing: content`); cap with `max-h-*`. Resizable where unsupported (Firefox). */
export function Textarea({ className, showCount, onChange, ...rest }: TextareaProps) {
	const props = useFieldControl(rest);
	const countId = useId();
	const [typed, setTyped] = useState(() => String(rest.defaultValue ?? "").length);
	const used = rest.value !== undefined ? String(rest.value).length : typed;
	const max = rest.maxLength;
	const counted = showCount && max !== undefined;

	const textarea = (
		<textarea
			className={cn(
				fieldClass,
				"field-sizing-content min-h-16 resize-none px-3 py-2 [@supports_not_(field-sizing:content)]:resize-y",
				counted && "pb-6",
				className,
			)}
			onChange={(e) => {
				setTyped(e.target.value.length);
				onChange?.(e);
			}}
			{...props}
			// Described by the counter, not live: announcing every keystroke would be noise.
			aria-describedby={
				counted
					? [props["aria-describedby"], countId].filter(Boolean).join(" ")
					: props["aria-describedby"]
			}
		/>
	);
	if (!counted) return textarea;
	return (
		<span className="relative block w-full">
			{textarea}
			<span
				id={countId}
				className={cn(
					"pointer-events-none absolute right-2.5 bottom-1.5 text-xs tabular-nums transition-colors duration-200",
					used >= max
						? "text-destructive-ink"
						: used >= max * 0.9
							? "text-warning-ink"
							: "text-muted-foreground",
				)}
			>
				{used}/{max}
				<span className="sr-only"> characters used</span>
			</span>
		</span>
	);
}
