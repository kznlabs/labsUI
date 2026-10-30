"use client";

import { MoreHorizontal, SearchX } from "lucide-react";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty } from "@/components/ui/empty";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useControllableState } from "@/lib/use-controllable-state";
import { cn } from "@/lib/utils";

export type DataTableSort = { id: string; dir: "ascending" | "descending" };

export type DataTableColumn<T> = {
	/** Unique key; also used by `defaultSort`. */
	id: string;
	header: ReactNode;
	/** Value for sorting and search. Also the cell, unless `cell` is given. */
	accessor?: (row: T) => string | number;
	cell?: (row: T) => ReactNode;
	/** Needs `accessor`. */
	sortable?: boolean;
	/** Applied to the header and every cell, e.g. "text-right" or "hidden sm:table-cell". */
	className?: string;
};

type DataTableProps<T> = {
	/** Rows; search, sort and paging happen on the client. */
	data: T[];
	/** Column definitions in display order. */
	columns: DataTableColumn<T>[];
	/** Stable id per row; selection is kept by it across pages. */
	getRowId: (row: T) => string;
	/** Names the table, the search box and each row's controls: "Members", "Select Jane". */
	label: string;
	/** Row name for screen readers, e.g. on its checkbox and ⋯ menu. */
	rowLabel: (row: T) => string;
	/** Rows per page. */
	pageSize?: number;
	/** Sort at first render. */
	defaultSort?: DataTableSort;
	/** Show a search field that filters every column. */
	searchable?: boolean;
	/** Search field placeholder. */
	searchPlaceholder?: string;
	/** Checkbox column; selection survives search and paging. */
	selectable?: boolean;
	/** Controlled selected row ids; pair with `onSelectionChange`. */
	selection?: string[];
	/** Called with every selected row id. */
	onSelectionChange?: (ids: string[]) => void;
	/** Items for the row's ⋯ menu (DropdownMenuItem and friends). */
	rowActions?: (row: T) => ReactNode;
	/** Right side of the toolbar; receives the selected rows (bulk actions). */
	toolbar?: (selected: T[]) => ReactNode;
	/** Alternate row backgrounds. */
	striped?: boolean;
	className?: string;
};

const compare = (a: string | number, b: string | number) =>
	typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b));

/**
 * Table with search, sortable columns, row selection, row actions and pagination, all on the
 * client. Columns are data: `{ id, header, accessor, cell?, sortable? }`. For server-driven
 * data, compose Table + Pagination yourself.
 */
export function DataTable<T>({
	data,
	columns,
	getRowId,
	label,
	rowLabel,
	pageSize = 10,
	defaultSort,
	searchable = true,
	searchPlaceholder = "Search…",
	selectable = false,
	selection,
	onSelectionChange,
	rowActions,
	toolbar,
	striped = false,
	className,
}: DataTableProps<T>) {
	const [query, setQuery] = useState("");
	const [sort, setSort] = useState(defaultSort);
	const [pageState, setPage] = useState(1);
	const [selected, select] = useControllableState<string[]>(selection, [], onSelectionChange);

	const needle = query.trim().toLowerCase();
	const filtered = needle
		? data.filter((row) =>
				columns.some(
					(column) =>
						column.accessor && String(column.accessor(row)).toLowerCase().includes(needle),
				),
			)
		: data;
	const sortCol = columns.find((column) => column.id === sort?.id);
	const sorted =
		sort && sortCol?.accessor
			? [...filtered].sort((a, b) => {
					const order = compare(
						(sortCol.accessor as (row: T) => string | number)(a),
						(sortCol.accessor as (row: T) => string | number)(b),
					);

					return sort.dir === "ascending" ? order : -order;
				})
			: filtered;

	const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
	// Clamp, so shrinking data or a narrower search can't strand you past the last page.
	const page = Math.min(pageState, pages);
	const rows = sorted.slice((page - 1) * pageSize, page * pageSize);
	const from = sorted.length ? (page - 1) * pageSize + 1 : 0;

	const filteredIds = sorted.map(getRowId);
	const selectedHere = filteredIds.filter((id) => selected.includes(id));
	const allHere = filteredIds.length > 0 && selectedHere.length === filteredIds.length;
	const span = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);

	// Never shrinks while paging, or a short last page pulls the pager from under your finger.
	const box = useRef<HTMLDivElement>(null);
	const layoutKey = `${query}|${pageSize}|${data.length}`;
	const [tallest, setTallest] = useState({ key: "", height: 0 });
	const minHeight = tallest.key === layoutKey ? tallest.height : undefined;

	useLayoutEffect(() => {
		const table = box.current?.firstElementChild as HTMLElement | null;

		if (!table) return;

		const observer = new ResizeObserver(() => {
			const height = table.offsetHeight;

			setTallest((current) =>
				current.key === layoutKey && current.height >= height
					? current
					: {
							key: layoutKey,
							height: current.key === layoutKey ? Math.max(current.height, height) : height,
						},
			);
		});

		observer.observe(table);

		return () => observer.disconnect();
	}, [layoutKey]);

	return (
		<div className={cn("grid w-full grid-cols-1 gap-3", className)}>
			{(searchable || toolbar) && (
				<div className="flex flex-wrap items-center justify-between gap-2">
					{searchable && (
						<SearchInput
							label={`Search ${label.toLowerCase()}`}
							placeholder={searchPlaceholder}
							value={query}
							onValueChange={(value) => {
								setQuery(value);
								setPage(1);
							}}
							className="w-full sm:max-w-64"
						/>
					)}

					{toolbar && (
						<div className="ml-auto flex items-center gap-2">
							{toolbar(data.filter((row) => selected.includes(getRowId(row))))}
						</div>
					)}
				</div>
			)}

			<div ref={box} style={{ minHeight }}>
				<Table striped={striped} aria-label={label}>
					<TableHeader>
						<TableRow>
							{selectable && (
								<TableHead>
									<Checkbox
										aria-label={`Select all ${sorted.length} ${label.toLowerCase()}`}
										checked={allHere}
										indeterminate={selectedHere.length > 0 && !allHere}
										disabled={sorted.length === 0}
										onCheckedChange={(on) =>
											select(
												on
													? [...new Set([...selected, ...filteredIds])]
													: selected.filter((id) => !filteredIds.includes(id)),
											)
										}
									/>
								</TableHead>
							)}

							{columns.map((column) => (
								<TableHead
									key={column.id}
									className={column.className}
									{...(column.sortable && column.accessor
										? {
												sort: sort?.id === column.id ? sort.dir : "none",
												onSort: () => {
													setSort((current) => ({
														id: column.id,
														dir:
															current?.id === column.id && current.dir === "ascending"
																? "descending"
																: "ascending",
													}));
													setPage(1);
												},
											}
										: {})}
								>
									{column.header}
								</TableHead>
							))}

							{rowActions && (
								<TableHead className="w-px">
									<span className="sr-only">Actions</span>
								</TableHead>
							)}
						</TableRow>
					</TableHeader>

					<TableBody>
						{rows.length === 0 ? (
							<TableRow className="hover:bg-transparent">
								<TableCell colSpan={span}>
									<Empty
										icon={<SearchX />}
										title={needle ? "No matches" : `No ${label.toLowerCase()} yet`}
										description={needle ? `Nothing matches “${query.trim()}”.` : undefined}
									>
										{needle && (
											<Button size="sm" variant="outline" onClick={() => setQuery("")}>
												Clear search
											</Button>
										)}
									</Empty>
								</TableCell>
							</TableRow>
						) : (
							rows.map((row) => {
								const id = getRowId(row);
								const on = selected.includes(id);

								return (
									<TableRow key={id} data-state={on ? "selected" : undefined}>
										{selectable && (
											<TableCell>
												<Checkbox
													aria-label={`Select ${rowLabel(row)}`}
													checked={on}
													onCheckedChange={(column) =>
														select(column ? [...selected, id] : selected.filter((x) => x !== id))
													}
												/>
											</TableCell>
										)}

										{columns.map((column) => (
											<TableCell key={column.id} className={column.className}>
												{column.cell ? column.cell(row) : column.accessor?.(row)}
											</TableCell>
										))}

										{rowActions && (
											<TableCell className="py-1 pr-2">
												<DropdownMenu>
													<DropdownMenuTrigger
														variant="ghost"
														size="icon"
														aria-label={`Actions for ${rowLabel(row)}`}
														className="size-8"
													>
														<MoreHorizontal />
													</DropdownMenuTrigger>

													<DropdownMenuContent align="end">{rowActions(row)}</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										)}
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>

			{/* Stacked on phones, a long count would wrap the pages. */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-muted-foreground text-xs tabular-nums" aria-live="polite">
					{selectable && selected.length > 0 && `${selected.length} selected · `}

					{sorted.length === 0
						? "0 results"
						: `${from}–${from + rows.length - 1} of ${sorted.length}`}
				</p>

				{pages > 1 && (
					<Pagination
						page={page}
						total={pages}
						onPageChange={setPage}
						aria-label={`${label} pages`}
					/>
				)}
			</div>
		</div>
	);
}
