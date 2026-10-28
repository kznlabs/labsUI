import { cn } from "@/lib/utils";

// Server-safe, callable from Server Components.

const variants = {
	default:
		"bg-primary text-primary-foreground shadow-xs shadow-[inset_0_1px_0_rgb(255_255_255/0.18)] hover:bg-primary/90",
	secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
	outline:
		"border border-control-border bg-control shadow-xs hover:bg-accent hover:text-accent-foreground",
	ghost: "hover:bg-accent hover:text-accent-foreground",
	destructive:
		"bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/30",
} as const;

const sizes = {
	sm: "h-8 gap-1.5 rounded-md px-3 text-xs",
	default: "h-9 gap-2 rounded-lg px-4 text-sm",
	lg: "h-10 gap-2 rounded-lg px-6 text-sm",
	icon: "size-9 rounded-lg",
} as const;

export type VariantProps = {
	/** Fill and emphasis: one primary action per view, `destructive` for irreversible ones. */
	variant?: keyof typeof variants;
	/** Height and padding; "icon" is square, so give it an `aria-label`. */
	size?: keyof typeof sizes;
	className?: string;
};

/** Button classes for non-button elements, e.g. `<a className={buttonVariants({ variant: "outline" })}>`. */
export function buttonVariants({
	variant = "default",
	size = "default",
	className,
}: VariantProps = {}) {
	return cn(
		"inline-flex shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap font-medium outline-none transition-[color,background-color,border-color,box-shadow,opacity] duration-400 ease-in-out focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-default aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
		variants[variant],
		sizes[size],
		className,
	);
}
