import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button-variants";
import {
	PaginationActivePill,
	PaginationMotion,
	PaginationNumber,
} from "@/components/ui/pagination-motion";
import { clamp, cn } from "@/lib/utils";

// Server-safe: as links the bar works without JS. Motion lives in pagination-motion.tsx.

type PaginationProps = Omit<ComponentProps<"nav">, "children"> & {
	/** Current page, from 1. */
	page: number;
	/** Number of pages. */
	total: number;
	/** URL of a page, for links that work without JS. Default `?page=N`. Unused with `onPageChange`. */
	href?: (page: number) => string;
	/** Called with the picked page; the controls become buttons. From client parents only. */
	onPageChange?: (page: number) => void;
	/** Pages kept on each side of the current one. */
	siblings?: number;
	/** Text of the previous and next controls; phones show the arrows only. */
	labels?: { previous?: ReactNode; next?: ReactNode };
};

type ControlProps = {
	to: number;
	active?: boolean;
	disabled?: boolean;
	label?: string;
	className?: string;
	children: ReactNode;
} & Pick<PaginationProps, "href" | "onPageChange">;

function Control({
	to,
	active,
	disabled,
	label,
	className,
	children,
	href,
	onPageChange,
}: ControlProps) {
	const classes = buttonVariants({
		variant: "ghost",
		size: label ? "default" : "icon",
		className: cn("relative tabular-nums", active && "hover:bg-transparent", className),
	});
	const content = (
		<>
			{active && <PaginationActivePill />}
			{children}
		</>
	);

	if (onPageChange)
		return (
			<button
				type="button"
				aria-label={label}
				aria-current={active ? "page" : undefined}
				disabled={disabled}
				onClick={() => onPageChange(to)}
				className={classes}
			>
				{content}
			</button>
		);

	// First/last page link loses its href so neither mouse nor keyboard can follow it.
	return (
		<a
			href={disabled ? undefined : href?.(to)}
			role={disabled ? "link" : undefined}
			aria-disabled={disabled || undefined}
			aria-label={label}
			aria-current={active ? "page" : undefined}
			className={cn(classes, disabled && "pointer-events-none opacity-50")}
		>
			{content}
		</a>
	);
}

/**
 * Page links (or buttons) with previous and next. The active pill slides between pages and the
 * numbers swipe the way you moved. The row keeps its width: gaps become an ellipsis.
 */
export function Pagination({
	page,
	total,
	href = (page) => `?page=${page}`,
	onPageChange,
	siblings = 1,
	labels,
	className,
	"aria-label": label = "Pagination",
	...props
}: PaginationProps) {
	const last = Math.max(1, total);
	const current = clamp(page, 1, last);
	const nav = { href, onPageChange };

	return (
		<nav aria-label={label} className={cn("flex justify-center", className)} {...props}>
			<ul className="isolate flex items-center gap-0.5 sm:gap-1">
				<PaginationMotion>
					<li>
						<Control
							{...nav}
							to={current - 1}
							disabled={current === 1}
							label="Go to previous page"
							className="gap-1 px-2.5"
						>
							<ChevronLeft aria-hidden="true" />
							<span className="hidden sm:block">{labels?.previous ?? "Previous"}</span>
						</Control>
					</li>
					{pageRange(current, total, siblings).map((page, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: slots stay mounted so numbers swipe (see pageRange)
						<li key={i}>
							{page === "…" ? (
								<span
									aria-hidden="true"
									className="flex size-9 items-center justify-center text-muted-foreground"
								>
									<MoreHorizontal className="size-4" />
								</span>
							) : (
								<Control {...nav} to={page} active={page === current}>
									<PaginationNumber value={page} />
								</Control>
							)}
						</li>
					))}
					<li>
						<Control
							{...nav}
							to={current + 1}
							disabled={current === last}
							label="Go to next page"
							className="gap-1 px-2.5"
						>
							<span className="hidden sm:block">{labels?.next ?? "Next"}</span>
							<ChevronRight aria-hidden="true" />
						</Control>
					</li>
				</PaginationMotion>
			</ul>
		</nav>
	);
}

/**
 * Page numbers to render, with `"…"` for gaps. Keeps first, last and `siblings` pages on each
 * side of `page`, and always returns the same length so the bar never changes width.
 * Key items by index so each slot stays mounted and its number swipes instead of remounting.
 * E.g. `pageRange(6, 12)` returns `[1, "…", 5, 6, 7, "…", 12]`.
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
