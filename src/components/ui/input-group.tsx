import type { ComponentProps, MouseEvent } from "react";
import { cn } from "@/lib/utils";

/* Server-safe (no "use client"). */

/**
 * One field made of an Input plus addons (icons, text like "https://", buttons). The group
 * draws the border and focus ring; the inner Input drops its own (matched by data-slot).
 */
export function InputGroup({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="input-group"
			className={cn(
				"flex h-9 w-full min-w-0 items-center rounded-lg border border-input bg-field shadow-xs transition-[color,box-shadow,border-color] duration-200 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 has-[[aria-invalid=true]]:border-destructive has-[[aria-invalid=true]]:ring-destructive/20 has-[:disabled]:opacity-50",
				"[&_[data-slot=input]]:h-full [&_[data-slot=input]]:rounded-none [&_[data-slot=input]]:border-0 [&_[data-slot=input]]:bg-transparent [&_[data-slot=input]]:shadow-none [&_[data-slot=input]]:ring-0",
				className,
			)}
			{...props}
		/>
	);
}

/** Text, icon or button beside the input. Clicking plain text focuses the input. */
export function InputGroupAddon({
	align = "start",
	className,
	onClick,
	...props
}: ComponentProps<"div"> & {
	/** Side of the control it sits on. */
	align?: "start" | "end";
}) {
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: forwards pointer clicks to the input; keyboard users focus the input directly
		// biome-ignore lint/a11y/useKeyWithClickEvents: same as above
		<div
			data-align={align}
			onClick={(event: MouseEvent<HTMLDivElement>) => {
				onClick?.(event);
				if ((event.target as HTMLElement).closest("button, a")) return;
				event.currentTarget.parentElement?.querySelector<HTMLElement>("[data-slot=input]")?.focus();
			}}
			className={cn(
				"flex h-full shrink-0 cursor-text select-none items-center gap-1.5 text-muted-foreground text-sm [&_svg]:size-4 [&_svg]:shrink-0",
				align === "start" ? "order-first pl-3" : "order-last pr-1.5 [&:not(:has(button))]:pr-3",
				"[&>button]:h-7 [&>button]:rounded-md [&>button]:px-2",
				className,
			)}
			{...props}
		/>
	);
}
