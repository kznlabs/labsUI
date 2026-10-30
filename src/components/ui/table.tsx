import { ArrowUp } from "lucide-react";
import type { ComponentProps } from "react";
import { OverflowFocus } from "@/lib/overflow-focus";
import { cn } from "@/lib/utils";

// Server-safe, onSort only comes from client parents. Selected rows get a primary tint, not the
// solid menu selection, so checkboxes and badges stay readable.

type TableProps = ComponentProps<"table"> & {
	/** Alternating row shading. */
	striped?: boolean;
	/** Classes for the scrolling card around the table. */
	containerClassName?: string;
};

/** A real <table> in a card that scrolls sideways on narrow screens (and is keyboard-scrollable then). */
export function Table({ striped = false, className, containerClassName, ...props }: TableProps) {
	return (
		<div
			className={cn(
				"relative w-full overflow-x-auto rounded-xl border bg-card shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
				containerClassName,
			)}
		>
			<table
				className={cn(
					"w-full caption-bottom border-collapse text-sm",
					striped && "[&_tbody_tr:nth-child(even)]:bg-muted/50",
					className,
				)}
				{...props}
			/>

			<OverflowFocus />
		</div>
	);
}

export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
	return (
		<thead className={cn("[&_tr]:border-b [&_tr]:hover:bg-transparent", className)} {...props} />
	);
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
	return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TableFooter({ className, ...props }: ComponentProps<"tfoot">) {
	return (
		<tfoot
			className={cn("border-t bg-foreground/[0.03] font-medium [&>tr]:last:border-b-0", className)}
			{...props}
		/>
	);
}

/** Pass `data-state="selected"` (or aria-selected) to tint a selected row. */
export function TableRow({ className, ...props }: ComponentProps<"tr">) {
	return (
		<tr
			className={cn(
				"border-b transition-colors hover:bg-accent/60 aria-selected:bg-primary/10 data-[state=selected]:bg-primary/10",
				className,
			)}
			{...props}
		/>
	);
}

type TableHeadProps = ComponentProps<"th"> & {
	/** Makes the column sortable: sets aria-sort and shows the direction arrow. */
	sort?: "ascending" | "descending" | "none";
	/** Called when the header button is pressed. Requires `sort`. */
	onSort?: () => void;
};

export function TableHead({ sort, onSort, className, children, ...props }: TableHeadProps) {
	return (
		<th
			scope="col"
			aria-sort={sort}
			className={cn(
				"h-9 whitespace-nowrap px-3 text-left align-middle font-medium text-muted-foreground text-xs [&:has([type=checkbox])]:w-px [&:has([type=checkbox])]:pr-0",
				className,
			)}
			{...props}
		>
			{sort ? (
				<button
					type="button"
					onClick={onSort}
					className="group -mx-1.5 inline-flex h-7 items-center gap-1 rounded-md px-1.5 outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 in-[.text-right]:flex-row-reverse"
				>
					{children}

					<ArrowUp
						aria-hidden="true"
						className={cn(
							"size-3.5 transition-[rotate,opacity] duration-200",
							sort === "descending" && "rotate-180",
							sort === "none" && "opacity-0 group-hover:opacity-50 group-focus-visible:opacity-50",
						)}
					/>
				</button>
			) : (
				children
			)}
		</th>
	);
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
	return (
		<td
			className={cn(
				"px-3 py-2.5 align-middle [&:has([type=checkbox])]:w-px [&:has([type=checkbox])]:pr-0",
				className,
			)}
			{...props}
		/>
	);
}

export function TableCaption({ className, ...props }: ComponentProps<"caption">) {
	return (
		<caption className={cn("px-3 py-3 text-muted-foreground text-xs", className)} {...props} />
	);
}
