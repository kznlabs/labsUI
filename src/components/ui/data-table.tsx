"use client";

import { MoreHorizontal, SearchX } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty } from "@/components/ui/empty";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
	pageRange,
} from "@/components/ui/pagination";
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

type Sort = { id: string; dir: "ascending" | "descending" };

export type DataTableColumn<T> = {
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
	data: T[];
	columns: DataTableColumn<T>[];
	getRowId: (row: T) => string;
	/** Names the table, the search box and each row's controls: "Members", "Select Jane". */
	label: string;
	rowLabel: (row: T) => string;
	/** Rows per page. */
	pageSize?: number;
	defaultSort?: Sort;
	searchable?: boolean;
	searchPlaceholder?: string;
	/** Checkbox column; selection survives search and paging. */
	selectable?: boolean;
	selection?: string[];
	onSelectionChange?: (ids: string[]) => void;
	/** Items for the row's ⋯ menu (DropdownMenuItem and friends). */
	rowActions?: (row: T) => ReactNode;
	/** Right side of the toolbar; receives the selected rows (bulk actions). */
	toolbar?: (selected: T[]) => ReactNode;
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

	const q = query.trim().toLowerCase();
	const filtered = q
		? data.filter((row) =>
				columns.some((c) => c.accessor && String(c.accessor(row)).toLowerCase().includes(q)),
			)
		: data;
	const sortCol = columns.find((c) => c.id === sort?.id);
	const sorted =
		sort && sortCol?.accessor
			? [...filtered].sort((a, b) => {
					const d = compare(
						(sortCol.accessor as (row: T) => string | number)(a),
						(sortCol.accessor as (row: T) => string | number)(b),
					);
					return sort.dir === "ascending" ? d : -d;
				})
			: filtered;

	const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
	// Clamp, so shrinking data or a narrower search never strands you past the last page.
	const page = Math.min(pageState, pages);
	const rows = sorted.slice((page - 1) * pageSize, page * pageSize);
	const from = sorted.length ? (page - 1) * pageSize + 1 : 0;

	const filteredIds = sorted.map(getRowId);
	const selectedHere = filteredIds.filter((id) => selected.includes(id));
	const allHere = filteredIds.length > 0 && selectedHere.length === filteredIds.length;
	const span = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);

	const go = (p: number) => (e: { preventDefault: () => void }) => {
		e.preventDefault();
		setPage(p);
	};

	return (
		<div className={cn("grid w-full grid-cols-1 gap-3", className)}>
			{(searchable || toolbar) && (
				<div className="flex flex-wrap items-center justify-between gap-2">
					{searchable && (
						<SearchInput
							label={`Search ${label.toLowerCase()}`}
							placeholder={searchPlaceholder}
							value={query}
							onValueChange={(v) => {
								setQuery(v);
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
						{columns.map((c) => (
							<TableHead
								key={c.id}
								className={c.className}
								{...(c.sortable && c.accessor
									? {
											sort: sort?.id === c.id ? sort.dir : "none",
											onSort: () => {
												setSort((s) => ({
													id: c.id,
													dir: s?.id === c.id && s.dir === "ascending" ? "descending" : "ascending",
												}));
												setPage(1);
											},
										}
									: {})}
							>
								{c.header}
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
									title={q ? "No matches" : `No ${label.toLowerCase()} yet`}
									description={q ? `Nothing matches “${query.trim()}”.` : undefined}
								>
									{q && (
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
												onCheckedChange={(c) =>
													select(c ? [...selected, id] : selected.filter((x) => x !== id))
												}
											/>
										</TableCell>
									)}
									{columns.map((c) => (
										<TableCell key={c.id} className={c.className}>
											{c.cell ? c.cell(row) : c.accessor?.(row)}
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

			<div className="flex flex-wrap items-center justify-between gap-3">
				<p className="text-muted-foreground text-xs tabular-nums" aria-live="polite">
					{selectable && selected.length > 0 && `${selected.length} selected · `}
					{sorted.length === 0
						? "0 results"
						: `${from}–${from + rows.length - 1} of ${sorted.length}`}
				</p>
				{pages > 1 && (
					<Pagination className="mx-0 w-auto">
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious href="#" onClick={go(page - 1)} disabled={page === 1} />
							</PaginationItem>
							{pageRange(page, pages).map((p, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: slots stay mounted so numbers swipe (see pageRange)
								<PaginationItem key={i}>
									{p === "…" ? (
										<PaginationEllipsis />
									) : (
										<PaginationLink href="#" onClick={go(p)} isActive={p === page}>
											{p}
										</PaginationLink>
									)}
								</PaginationItem>
							))}
							<PaginationItem>
								<PaginationNext href="#" onClick={go(page + 1)} disabled={page === pages} />
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				)}
			</div>
		</div>
	);
}
