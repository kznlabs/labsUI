import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/* Server-safe (no "use client"). */

/** One key cap, e.g. `<Kbd>⌘</Kbd>`. */
export function Kbd({ className, ...props }: ComponentProps<"kbd">) {
	return (
		<kbd
			className={cn(
				"inline-flex h-5 min-w-5 select-none items-center justify-center gap-1 rounded-md border border-b-2 bg-muted px-1 font-medium font-sans text-[11px] text-muted-foreground leading-none [&_svg]:size-3",
				className,
			)}
			{...props}
		/>
	);
}

/** A shortcut made of several keys: `<KbdGroup keys={["⌘", "K"]} />`. Nested `<kbd>`s, per the HTML spec. */
export function KbdGroup({
	keys,
	className,
	...props
}: Omit<ComponentProps<"kbd">, "children"> & {
	/** One `<kbd>` per key, e.g. ["⇧", "⌘", "P"]. */ keys: readonly string[];
}) {
	return (
		<kbd className={cn("inline-flex items-center gap-1", className)} {...props}>
			{keys.map((symbol) => (
				<Kbd key={symbol}>{symbol}</Kbd>
			))}
		</kbd>
	);
}
