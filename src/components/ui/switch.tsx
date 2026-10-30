"use client";

import { motion } from "motion/react";
import { type ComponentProps, useRef } from "react";
import { useFieldControl } from "@/components/ui/field";
import { useFormReset } from "@/lib/form-value";
import { useControllableState } from "@/lib/use-controllable-state";
import { cn, spring } from "@/lib/utils";

type SwitchProps = Omit<
	ComponentProps<"input">,
	"type" | "onChange" | "checked" | "defaultChecked"
> & {
	/** Controlled state; pair with `onCheckedChange`. */
	checked?: boolean;
	/** State at first render (uncontrolled). */
	defaultChecked?: boolean;
	/** Called with the new state. */
	onCheckedChange?: (checked: boolean) => void;
};

/** Native checkbox (role="switch") with a spring knob. Controlled or uncontrolled. */
export function Switch({
	checked,
	defaultChecked = false,
	onCheckedChange,
	className,
	...rest
}: SwitchProps) {
	const props = useFieldControl(rest);
	const [on, setOn] = useControllableState(checked, defaultChecked, onCheckedChange);
	const root = useRef<HTMLSpanElement>(null);

	useFormReset(root, () => setOn(defaultChecked));

	return (
		<span ref={root} className={cn("relative inline-flex h-5 w-9 shrink-0", className)}>
			<input
				type="checkbox"
				role="switch"
				aria-checked={on}
				checked={on}
				onChange={(event) => setOn(event.target.checked)}
				// Hit area 28px tall around the 20px track (WCAG 2.5.8).
				className="peer absolute inset-x-0 -inset-y-1 z-10 cursor-pointer appearance-none rounded-full outline-none disabled:cursor-not-allowed"
				{...props}
			/>

			<span
				aria-hidden="true"
				className={cn(
					"flex size-full items-center rounded-full p-0.5 shadow-xs transition-colors duration-400 ease-in-out peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 peer-disabled:opacity-50",
					on ? "bg-primary" : "bg-track",
				)}
			>
				<motion.span
					className="size-4 rounded-full bg-white shadow-sm ring-[0.5px] ring-black/5"
					animate={{ x: on ? 16 : 0 }}
					transition={spring}
					initial={false}
				/>
			</span>
		</span>
	);
}
