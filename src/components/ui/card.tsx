import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type CardProps = ComponentProps<"div"> & {
	/** Subtle translucency; place over textured/colored backgrounds. */
	glass?: boolean;
};

export function Card({ glass, className, ...props }: CardProps) {
	return (
		<div
			className={cn(
				"flex flex-col gap-6 rounded-2xl border p-6 text-card-foreground shadow-xs",
				glass ? "bg-card/70 backdrop-blur-xl backdrop-saturate-150" : "bg-card",
				className,
			)}
			{...props}
		/>
	);
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
	return <div className={cn("grid gap-1.5", className)} {...props} />;
}

/** Heading level follows the page outline: `as="h2"` directly under the page's h1. Default h3. */
export function CardTitle({
	as: Tag = "h3",
	className,
	...props
}: ComponentProps<"h3"> & {
	/** Heading level that fits the page outline; "p" when it is not a heading. */
	as?: "h2" | "h3" | "h4" | "h5" | "h6" | "p";
}) {
	return <Tag className={cn("font-semibold leading-snug", className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
	return <p className={cn("text-muted-foreground text-sm", className)} {...props} />;
}

export function CardContent(props: ComponentProps<"div">) {
	return <div {...props} />;
}

export function CardFooter({ className, ...props }: ComponentProps<"div">) {
	return <div className={cn("flex items-center gap-2", className)} {...props} />;
}
