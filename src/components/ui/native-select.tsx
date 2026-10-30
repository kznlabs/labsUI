"use client";

import { ChevronsUpDown } from "lucide-react";
import type { ComponentProps } from "react";
import { useFieldControl } from "@/components/ui/field";
import { fieldClass } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * A real <select>: native picker on phones, works in forms without JS, native validation
 * (`required` + :user-invalid). Where the browser supports customizable select
 * (`appearance: base-select`), the open list gets the menu look; elsewhere it stays native.
 * Use `Select` instead when options need icons or custom rendering.
 */
export function NativeSelect({ className, children, ...rest }: ComponentProps<"select">) {
	const props = useFieldControl(rest);

	return (
		<span className={cn("relative inline-flex w-full", className)}>
			<select
				data-slot="input"
				className={cn(
					fieldClass,
					"native-select h-9 cursor-pointer appearance-none py-0 pr-9 pl-3 disabled:cursor-not-allowed",
				)}
				{...props}
			>
				{children}
			</select>

			<ChevronsUpDown
				aria-hidden="true"
				className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 size-4 text-muted-foreground"
			/>
		</span>
	);
}

/** A labeled group of options (<optgroup>). */
export function NativeSelectGroup(
	props: ComponentProps<"optgroup"> & {
		/** Group heading in the list. */
		label: string;
	},
) {
	return <optgroup {...props} />;
}

export function NativeSelectOption(props: ComponentProps<"option">) {
	return <option {...props} />;
}
