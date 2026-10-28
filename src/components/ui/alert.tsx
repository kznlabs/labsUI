import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Server-safe. Tints are solid (tone mixed into card) so patterns don't show through.

const variants = {
	default: { box: "border-border bg-card", icon: "text-muted-foreground", glyph: <Info /> },
	info: {
		box: "border-primary/20 bg-[color-mix(in_oklch,var(--color-primary)_7%,var(--color-card))]",
		icon: "text-primary-ink",
		glyph: <Info />,
	},
	success: {
		box: "border-success/25 bg-[color-mix(in_oklch,var(--color-success)_8%,var(--color-card))]",
		icon: "text-success-ink",
		glyph: <CircleCheck />,
	},
	warning: {
		box: "border-warning/30 bg-[color-mix(in_oklch,var(--color-warning)_10%,var(--color-card))]",
		icon: "text-warning-ink",
		glyph: <TriangleAlert />,
	},
	destructive: {
		box: "border-destructive/25 bg-[color-mix(in_oklch,var(--color-destructive)_7%,var(--color-card))]",
		icon: "text-destructive-ink",
		glyph: <CircleAlert />,
	},
} as const;

type AlertProps = ComponentProps<"div"> & {
	/** Tone: sets the tint and the default icon. */
	variant?: keyof typeof variants;
	/** Replaces the variant's icon; pass `null` for none. */
	icon?: ReactNode;
	/** Right-aligned slot, e.g. a small Button. */
	action?: ReactNode;
};

/**
 * Inline banner: tinted surface, colored icon, title and description. No live-region role by
 * default (a static banner should not be announced on load); add `role="alert"` when it appears
 * in response to something the user did.
 */
export function Alert({
	variant = "default",
	icon,
	action,
	className,
	children,
	...props
}: AlertProps) {
	const value = variants[variant];
	const glyph = icon === undefined ? value.glyph : icon;

	return (
		<div
			data-variant={variant}
			className={cn(
				"flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-sm",
				value.box,
				className,
			)}
			{...props}
		>
			{glyph && (
				<span aria-hidden="true" className={cn("mt-px shrink-0 [&_svg]:size-4", value.icon)}>
					{glyph}
				</span>
			)}
			<div className="grid min-w-0 flex-1 gap-1">{children}</div>
			{action && <div className="-my-1 shrink-0 self-center">{action}</div>}
		</div>
	);
}

export function AlertTitle({ className, ...props }: ComponentProps<"p">) {
	return <p className={cn("font-medium leading-5", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			className={cn("text-muted-foreground leading-relaxed [&_a]:underline", className)}
			{...props}
		/>
	);
}
