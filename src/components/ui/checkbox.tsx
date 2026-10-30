"use client";

import { motion } from "motion/react";
import type { ComponentProps } from "react";
import { useFieldControl } from "@/components/ui/field";
import { useControllableState } from "@/lib/use-controllable-state";
import { cn, spring } from "@/lib/utils";

type CheckboxProps = Omit<
	ComponentProps<"input">,
	"type" | "onChange" | "checked" | "defaultChecked"
> & {
	/** Controlled state; pair with `onCheckedChange`. */
	checked?: boolean;
	/** State at first render (uncontrolled). */
	defaultChecked?: boolean;
	/** Called with the new state. */
	onCheckedChange?: (checked: boolean) => void;
	/** Mixed state, e.g. a "select all" with some rows selected. Shows a dash. */
	indeterminate?: boolean;
};

/** Native checkbox with a spring-drawn check. Controlled or uncontrolled; works inside <Field>. */
export function Checkbox({
	checked,
	defaultChecked = false,
	onCheckedChange,
	indeterminate = false,
	className,
	...rest
}: CheckboxProps) {
	const props = useFieldControl(rest);
	const [on, setOn] = useControllableState(checked, defaultChecked, onCheckedChange);
	const filled = on || indeterminate;

	return (
		<span className={cn("relative inline-flex size-4 shrink-0", className)}>
			<input
				type="checkbox"
				ref={(element) => {
					if (element) element.indeterminate = indeterminate;
				}}
				checked={on}
				onChange={(event) => setOn(event.target.checked)}
				// 24px hit area around the 16px box (WCAG 2.5.8 target size).
				className="peer absolute -inset-1 z-10 cursor-pointer appearance-none rounded-[5px] outline-none disabled:cursor-not-allowed"
				{...props}
			/>

			<span
				aria-hidden="true"
				className={cn(
					"grid size-full place-items-center rounded-[5px] border shadow-xs transition-colors peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 peer-disabled:opacity-50 peer-aria-invalid:border-destructive peer-aria-invalid:ring-destructive/20 peer-user-invalid:border-destructive",
					filled ? "border-primary bg-primary text-primary-foreground" : "border-input bg-field",
				)}
			>
				<svg
					aria-hidden="true"
					viewBox="0 0 16 16"
					className="size-3.5"
					fill="none"
					stroke="currentColor"
				>
					<motion.path
						d={indeterminate ? "M4 8h8" : "M3.5 8.5l3 3 6-7"}
						strokeWidth={2}
						strokeLinecap="round"
						strokeLinejoin="round"
						initial={false}
						animate={{ pathLength: filled ? 1 : 0, opacity: filled ? 1 : 0 }}
						transition={spring}
					/>
				</svg>
			</span>
		</span>
	);
}
