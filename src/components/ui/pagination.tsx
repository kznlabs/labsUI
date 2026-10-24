import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import type { ComponentProps } from "react";
import { buttonVariants } from "@/components/ui/button-variants";
import {
	PaginationActivePill,
	PaginationMotion,
	PaginationNumber,
} from "@/components/ui/pagination-motion";
import { cn } from "@/lib/utils";

/* Server-safe (no "use client"): links work without JS. Motion lives in `pagination-motion.tsx`. */

export function Pagination({ className, ...props }: ComponentProps<"nav">) {
	return (
		<nav
			aria-label="Pagination"
			className={cn("mx-auto flex w-full justify-center", className)}
			{...props}
		/>
	);
}

export function PaginationContent({ className, children, ...props }: ComponentProps<"ul">) {
	return (
		<ul className={cn("isolate flex flex-row items-center gap-1", className)} {...props}>
			<PaginationMotion>{children}</PaginationMotion>
		</ul>
	);
}

export function PaginationItem(props: ComponentProps<"li">) {
	return <li {...props} />;
}

type PaginationLinkProps = ComponentProps<"a"> & {
	isActive?: boolean;
	size?: "sm" | "default" | "icon";
};

/** A number child swipes when it changes; the active link gets the sliding pill. */
export function PaginationLink({
	isActive,
	size = "icon",
	className,
	children,
	...props
}: PaginationLinkProps) {
	return (
		<a
			aria-current={isActive ? "page" : undefined}
			data-active={isActive ? "" : undefined}
			className={buttonVariants({
				variant: "ghost",
				size,
				className: cn("relative tabular-nums", isActive && "hover:bg-transparent", className),
			})}
			{...props}
		>
			{isActive && <PaginationActivePill />}
			{typeof children === "number" ? <PaginationNumber value={children} /> : children}
		</a>
	);
}

type EdgeProps = ComponentProps<"a"> & {
	/** First/last page: drops `href` and `onClick` so neither mouse nor keyboard can follow it. */
	disabled?: boolean;
};

const edge = ({ disabled, href, onClick }: EdgeProps) =>
	disabled
		? ({ "aria-disabled": true, role: "link", className: "pointer-events-none" } as const)
		: { href, onClick, className: undefined };

export function PaginationPrevious({
	disabled,
	href,
	onClick,
	className,
	children,
	...props
}: EdgeProps) {
	const state = edge({ disabled, href, onClick });
	return (
		<PaginationLink
			aria-label="Go to previous page"
			size="default"
			{...props}
			{...state}
			className={cn("gap-1 px-2.5 sm:pl-2.5", state.className, className)}
		>
			<ChevronLeft aria-hidden="true" />
			<span className="hidden sm:block">{children ?? "Previous"}</span>
		</PaginationLink>
	);
}

export function PaginationNext({
	disabled,
	href,
	onClick,
	className,
	children,
	...props
}: EdgeProps) {
	const state = edge({ disabled, href, onClick });
	return (
		<PaginationLink
			aria-label="Go to next page"
			size="default"
			{...props}
			{...state}
			className={cn("gap-1 px-2.5 sm:pr-2.5", state.className, className)}
		>
			<span className="hidden sm:block">{children ?? "Next"}</span>
			<ChevronRight aria-hidden="true" />
		</PaginationLink>
	);
}

export function PaginationEllipsis({ className, ...props }: ComponentProps<"span">) {
	return (
		<span
			aria-hidden="true"
			className={cn("flex size-9 items-center justify-center text-muted-foreground", className)}
			{...props}
		>
			<MoreHorizontal className="size-4" />
		</span>
	);
}

/**
 * Page numbers to render, with `"…"` for gaps. Keeps first, last and `siblings` pages on each
 * side of `page`, and always returns the same length so the bar never changes width.
 * Key items by index so each slot stays mounted and its number swipes instead of remounting.
 * E.g. `pageRange(6, 12)` → `[1, "…", 5, 6, 7, "…", 12]`.
 */
export function pageRange(page: number, total: number, siblings = 1): (number | "…")[] {
	const slots = siblings * 2 + 5;
	const pages = (from: number, to: number) =>
		Array.from({ length: to - from + 1 }, (_, i) => from + i);
	if (total <= slots) return pages(1, total);
	const edge = slots - 2; // pages shown on the side without a gap
	if (page <= siblings + 3) return [...pages(1, edge), "…", total];
	if (page >= total - siblings - 2) return [1, "…", ...pages(total - edge + 1, total)];
	return [1, "…", ...pages(page - siblings, page + siblings), "…", total];
}
