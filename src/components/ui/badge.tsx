"use client";

import { motion } from "motion/react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const variants = {
	default: "border-transparent bg-primary text-primary-foreground",
	secondary: "border-transparent bg-secondary text-secondary-foreground",
	outline: "border-border text-foreground",
	destructive: "border-transparent bg-destructive/10 text-destructive",
	success: "border-transparent bg-success/12 text-success",
} as const;

type BadgeProps = ComponentProps<"span"> & {
	variant?: keyof typeof variants;
	/** "pill" = fully rounded tag. */
	shape?: "badge" | "pill";
	/** Leading status dot in the current text color. */
	dot?: boolean;
	/** Dot emits an expanding ring forever, like a live status. Needs `dot`. */
	pulse?: boolean;
};

export function Badge({
	variant = "default",
	shape = "badge",
	dot,
	pulse,
	className,
	children,
	...props
}: BadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap border px-2 py-0.5 font-medium text-xs [&_svg]:size-3",
				shape === "pill" ? "rounded-full px-2.5" : "rounded-md",
				variants[variant],
				className,
			)}
			{...props}
		>
			{dot && (
				<span className="relative flex size-1.5" aria-hidden="true">
					{pulse && (
						<motion.span
							className="absolute inset-0 rounded-full bg-current"
							initial={{ scale: 1, opacity: 0.6 }}
							animate={{ scale: 3, opacity: 0 }}
							transition={{ duration: 1.6, ease: "easeOut", repeat: Number.POSITIVE_INFINITY }}
						/>
					)}
					<span className="relative size-1.5 rounded-full bg-current" />
				</span>
			)}
			{children}
		</span>
	);
}
