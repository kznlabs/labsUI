import { ChevronRight, MoreHorizontal } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Breadcrumb({ className, ...props }: ComponentProps<"nav">) {
	return <nav aria-label="Breadcrumb" className={cn("relative", className)} {...props} />;
}

export function BreadcrumbList({ className, ...props }: ComponentProps<"ol">) {
	return (
		<ol
			className={cn(
				"flex flex-wrap items-center gap-1.5 break-words font-medium text-muted-foreground text-sm sm:gap-2",
				className,
			)}
			{...props}
		/>
	);
}

export function BreadcrumbItem({ className, ...props }: ComponentProps<"li">) {
	return <li className={cn("inline-flex items-center gap-1.5 sm:gap-2", className)} {...props} />;
}

export function BreadcrumbLink({ className, ...props }: ComponentProps<"a">) {
	return (
		<a
			className={cn(
				"rounded-sm transition-colors duration-400 ease-in-out hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
				className,
			)}
			{...props}
		/>
	);
}

export function BreadcrumbPage({ className, ...props }: ComponentProps<"span">) {
	return (
		<span
			aria-current="page"
			aria-disabled="true"
			className={cn("font-medium text-foreground", className)}
			{...props}
		/>
	);
}

export function BreadcrumbSeparator({ children, className, ...props }: ComponentProps<"li">) {
	return (
		<li
			role="presentation"
			aria-hidden="true"
			className={cn("text-muted-foreground/60 [&>svg]:size-3.5", className)}
			{...props}
		>
			{children ?? <ChevronRight className="size-3.5" />}
		</li>
	);
}

export function BreadcrumbEllipsis({ className, ...props }: ComponentProps<"span">) {
	return (
		<span
			role="presentation"
			aria-hidden="true"
			className={cn("flex size-7 items-center justify-center text-muted-foreground", className)}
			{...props}
		>
			<MoreHorizontal className="size-4" />
			<span className="sr-only">More</span>
		</span>
	);
}
