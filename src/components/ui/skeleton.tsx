import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// Server-safe. The infinite pulse is the one allowed tween (loader), see animate-skeleton in
// labsui.css.

/** Placeholder block. Size it with classes: `<Skeleton className="h-4 w-32" />`. */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			aria-hidden="true"
			className={cn(
				"animate-skeleton rounded-lg bg-foreground/[0.09] motion-reduce:animate-none",
				className,
			)}
			{...props}
		/>
	);
}

/** Wrap skeletons in this so screen readers hear one "Loading" instead of nothing. */
export function SkeletonGroup({
	label = "Loading",
	className,
	children,
	...props
}: ComponentProps<"div"> & {
	/** Announced to screen readers while it is shown. */ label?: string;
}) {
	return (
		<div role="status" aria-busy="true" className={className} {...props}>
			<span className="sr-only">{label}</span>

			{children}
		</div>
	);
}
