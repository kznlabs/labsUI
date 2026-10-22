"use client";

import { motion } from "motion/react";
import { type ComponentProps, useState } from "react";
import { useSpringConfig } from "@/lib/spring-config";
import { cn } from "@/lib/utils";

type SwitchProps = Omit<
	ComponentProps<"input">,
	"type" | "onChange" | "checked" | "defaultChecked"
> & {
	checked?: boolean;
	defaultChecked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
};

/** Native checkbox (role="switch") with a spring knob. Controlled or uncontrolled. */
export function Switch({
	checked,
	defaultChecked = false,
	onCheckedChange,
	className,
	...props
}: SwitchProps) {
	const spring = useSpringConfig();
	const [inner, setInner] = useState(defaultChecked);
	const on = checked ?? inner;
	return (
		<span className={cn("relative inline-flex h-5 w-9 shrink-0", className)}>
			<input
				type="checkbox"
				role="switch"
				aria-checked={on}
				checked={on}
				onChange={(e) => {
					if (checked === undefined) setInner(e.target.checked);
					onCheckedChange?.(e.target.checked);
				}}
				className="peer absolute inset-0 z-10 cursor-pointer appearance-none rounded-full outline-none disabled:cursor-not-allowed"
				{...props}
			/>
			<span
				aria-hidden="true"
				className={cn(
					"flex size-full items-center rounded-full p-0.5 shadow-xs transition-colors duration-400 ease-in-out peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 peer-disabled:opacity-50",
					on ? "bg-primary" : "bg-input dark:bg-input/80",
				)}
			>
				<motion.span
					className="size-4 rounded-full bg-background shadow-sm dark:bg-foreground"
					animate={{ x: on ? 16 : 0 }}
					transition={spring}
					initial={false}
				/>
			</span>
		</span>
	);
}
