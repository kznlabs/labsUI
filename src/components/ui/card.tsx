import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type CardProps = ComponentProps<"div"> & {
	/** Subtle macOS translucency; place over textured/colored backgrounds. */
	glass?: boolean;
};

export function Card({ glass, className, ...props }: CardProps) {
	return (
		<div
			className={cn(
				"flex flex-col gap-6 rounded-xl border py-6 text-card-foreground shadow-sm",
				glass ? "bg-card/70 backdrop-blur-xl backdrop-saturate-150" : "bg-card",
				className,
			)}
			{...props}
		/>
	);
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
	return <div className={cn("flex flex-col gap-1.5 px-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
	return <h3 className={cn("font-semibold leading-none tracking-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
	return <p className={cn("text-muted-foreground text-sm", className)} {...props} />;
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
	return <div className={cn("px-6", className)} {...props} />;
}

export function CardFooter({ className, ...props }: ComponentProps<"div">) {
	return <div className={cn("flex items-center gap-2 px-6", className)} {...props} />;
}
