"use client";

import { Check, Minus } from "lucide-react";
import {
	type ComponentProps,
	type CSSProperties,
	Fragment,
	type ReactNode,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { AppLink } from "@/lib/link";
import { useControllableState } from "@/lib/use-controllable-state";
import { cn } from "@/lib/utils";

// Two real tables, one hidden by a container query, so the first paint needs no script. A scroller
// can't pin to the page, so the wide table's sticky header is a mirror bar outside its scroller.

export type ComparisonItem = {
	/** Key of this item in each row's `values`. */
	id: string;
	/** Column heading. */
	name: string;
	/** Link for the name. */
	href?: string;
	/** Photo above the name (`<img>`). */
	media?: ReactNode;
	/** Under the name, e.g. the price. */
	details?: ReactNode;
	/** Under the details, e.g. a Buy button. */
	action?: ReactNode;
	/** Small label beside the name, e.g. "Popular". */
	badge?: string;
	/** Tints the column in the accent. */
	featured?: boolean;
};

/** `true` is a check, `false` or nothing a dash, each with text for screen readers. */
export type ComparisonValue = ReactNode;

export type ComparisonRow = {
	/** Feature name. */
	label: string;
	/** Value per item `id`. An item left out shows a dash. */
	values: Record<string, ComparisonValue>;
	/** Whether the values differ, for cells that are your own nodes. Text, numbers and booleans are compared for you; own nodes count as different unless this says otherwise. */
	differs?: boolean;
};

export type ComparisonGroup = {
	/** Group heading, e.g. "Display". */
	label: string;
	/** Features in display order. */
	rows: ComparisonRow[];
};

type ComparisonTableProps = Omit<ComponentProps<"div">, "children"> & {
	/** Columns in display order. */
	items: ComparisonItem[];
	/** Grouped rows in display order. */
	groups: ComparisonGroup[];
	/** Names the table for screen readers. */
	label?: string;
	/** Controlled "differences only"; pair with `onDifferencesOnlyChange`. */
	differencesOnly?: boolean;
	/** "Differences only" at first render (uncontrolled). */
	defaultDifferencesOnly?: boolean;
	/** Called with the new "differences only" state. */
	onDifferencesOnlyChange?: (differencesOnly: boolean) => void;
	/** Shows the switch. Turn it off for a short table, or when your own control sets `differencesOnly`. */
	differencesToggle?: boolean;
	/** Text on the switch. */
	differencesLabel?: string;
	/** Text beside the switch while it is on. Call it from a client parent to translate. */
	countLabel?: (shown: number, total: number) => string;
	/** Shown when every row is the same. */
	emptyLabel?: ReactNode;
	/** Read by screen readers on a check. */
	yesLabel?: string;
	/** Read by screen readers on a dash. */
	noLabel?: string;
	/** Read by screen readers as the heading of the feature column. */
	featureLabel?: string;
	/** Names the column pickers on a narrow screen, before the column's number. */
	columnLabel?: string;
	/** How far below the top of the page the header pins, as a CSS length. Pass your sticky site header's height. */
	stickyTop?: string;
};

const FEATURE_WIDTH = "11rem";
const COLUMN_WIDTH = "9rem";
const SLOTS = [0, 1];

const cellLine = "border-b [tbody:last-of-type_tr:last-child>&]:border-b-0";
const groupHead = "h-8 border-b bg-muted/50 text-muted-foreground text-xs";
const flatRow = "hover:bg-transparent";
const headCell = "h-auto whitespace-normal py-3 align-top font-medium text-foreground text-sm";
const rowHead = "h-auto whitespace-normal py-2.5 font-normal text-foreground text-sm";
const featuredTint = "bg-primary/5";
const scrolledEdge = "in-data-scrolled:shadow-[1px_0_0_var(--color-border)]";
// Keeps a focused control clear of the pinned header.
const tableBase =
	"table-fixed border-separate border-spacing-0 [&_:is(a,button)]:scroll-mt-[calc(var(--comparison-top)+3.5rem)]";

/** The same value means the same text; own nodes can't be compared, so they get no key. */
function comparisonKey(value: ComparisonValue) {
	if (value === true) return "yes";
	if (value === false || value === null || value === undefined) return "no";
	if (typeof value === "string" || typeof value === "number") return `text:${value}`;

	return null;
}

function rowDiffers(row: ComparisonRow, ids: string[]) {
	if (row.differs !== undefined) return row.differs;

	const keys = ids.map((id) => comparisonKey(row.values[id]));

	return keys.includes(null) || new Set(keys).size > 1;
}

function visibleGroups(groups: ComparisonGroup[], ids: string[], differencesOnly: boolean) {
	if (!differencesOnly) return groups;

	return groups
		.map((group) => ({ ...group, rows: group.rows.filter((row) => rowDiffers(row, ids)) }))
		.filter((group) => group.rows.length > 0);
}

const countRows = (groups: ComparisonGroup[]) =>
	groups.reduce((sum, group) => sum + group.rows.length, 0);

function CellValue({
	value,
	yesLabel,
	noLabel,
}: {
	value: ComparisonValue;
	yesLabel: string;
	noLabel: string;
}) {
	if (comparisonKey(value) === "yes" || comparisonKey(value) === "no") {
		const Icon = value === true ? Check : Minus;

		return (
			<>
				<Icon
					aria-hidden="true"
					className={cn("size-4", value === true ? "text-primary-ink" : "text-muted-foreground")}
				/>

				<span className="sr-only">{value === true ? yesLabel : noLabel}</span>
			</>
		);
	}

	return value;
}

function ItemHeading({ item, nameAbove }: { item: ComparisonItem; nameAbove?: boolean }) {
	// The pinned row right above already shows the name; a link still has to be reachable.
	const quiet = nameAbove && !item.href;

	return (
		<div className="flex flex-col items-start gap-2">
			{item.media && (
				<AspectRatio ratio={4 / 3} className="w-full overflow-hidden rounded-lg bg-muted">
					{item.media}
				</AspectRatio>
			)}

			<span
				// A badge's height, so every column's details start on one line, badge or not.
				className={cn(
					"flex min-h-5.5 flex-wrap items-center gap-1.5",
					quiet && !item.badge && "sr-only",
				)}
			>
				{item.href ? (
					<AppLink
						href={item.href}
						className="rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
					>
						{item.name}
					</AppLink>
				) : (
					<span className={cn(quiet && "sr-only")}>{item.name}</span>
				)}

				{item.badge && (
					<Badge variant={item.featured ? "default" : "secondary"} shape="pill">
						{item.badge}
					</Badge>
				)}
			</span>

			{item.details && (
				<div className="font-normal text-muted-foreground text-xs">{item.details}</div>
			)}

			{item.action}
		</div>
	);
}

/**
 * A feature-by-feature comparison, grouped, that can show only the differences. Wide, every item is
 * a column under a pinned header and beside a pinned feature column. Narrow, two pickers choose the
 * items side by side, each feature's name above its values, and differences follow the two in view.
 */
export function ComparisonTable({
	items,
	groups,
	label = "Comparison",
	differencesOnly,
	defaultDifferencesOnly = false,
	onDifferencesOnlyChange,
	differencesToggle = true,
	differencesLabel = "Differences only",
	countLabel = (shown, total) => `${shown} of ${total} rows`,
	emptyLabel = "Every row is the same.",
	yesLabel = "Yes",
	noLabel = "No",
	featureLabel = "Feature",
	columnLabel = "Column",
	stickyTop = "0px",
	className,
	style,
	...props
}: ComparisonTableProps) {
	const baseId = useId();
	const [only, setOnly] = useControllableState(
		differencesOnly,
		defaultDifferencesOnly,
		onDifferencesOnlyChange,
	);
	const [picked, setPicked] = useState<string[]>([]);
	const wideTable = useRef<HTMLTableElement>(null);
	const wideHead = useRef<HTMLTableSectionElement>(null);
	const bar = useRef<HTMLDivElement>(null);

	// Items can change under the picks, so what shows is worked out on each render.
	const ids = items.map((item) => item.id);
	const stillThere = picked.filter((id) => ids.includes(id));
	const picks = [...stillThere, ...ids.filter((id) => !stillThere.includes(id))].slice(0, 2);

	const pick = (slot: number, id: string) => {
		const next = [...picks];
		const other = next.indexOf(id);

		// Asking for what the other column shows swaps them.
		if (other !== -1) next[other] = next[slot] ?? id;

		next[slot] = id;
		setPicked(next);
	};

	useEffect(() => {
		const scroller = wideTable.current?.parentElement;
		const header = wideHead.current;
		const mirror = bar.current;

		if (!scroller || !header || !mirror) return;

		const onScroll = () => {
			const scrolled = scroller.scrollLeft > 0;

			mirror.scrollLeft = scroller.scrollLeft;
			scroller.toggleAttribute("data-scrolled", scrolled);
			mirror.toggleAttribute("data-scrolled", scrolled);
		};

		scroller.addEventListener("scroll", onScroll, { passive: true });

		const top = Number.parseFloat(getComputedStyle(mirror).top) || 0;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry) return;

				// The bar pins while the header sits above it, in the page or in any scroller.
				const passed = entry.boundingClientRect.bottom <= mirror.getBoundingClientRect().top;

				mirror.toggleAttribute("data-stuck", !entry.isIntersecting && passed);
			},
			{ rootMargin: `${-top}px 0px 0px 0px` },
		);

		observer.observe(header);

		return () => {
			observer.disconnect();
			scroller.removeEventListener("scroll", onScroll);
		};
	}, []);

	const total = countRows(groups);
	const wideGroups = visibleGroups(groups, ids, only);
	const narrowGroups = visibleGroups(groups, picks, only);
	const wideWidth = `calc(${FEATURE_WIDTH} + ${items.length} * ${COLUMN_WIDTH})`;
	const headingExtras = items.some(
		(item) => item.media || item.details || item.action || item.href || item.badge,
	);
	const itemById = (id: string) => items.find((item) => item.id === id);

	const value = (row: ComparisonRow, id: string) => (
		<CellValue value={row.values[id]} yesLabel={yesLabel} noLabel={noLabel} />
	);

	return (
		<div
			className={cn("@container flex w-full flex-col gap-3", className)}
			style={{ "--comparison-top": stickyTop, ...style } as CSSProperties}
			{...props}
		>
			{differencesToggle && (
				<div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
					<p className="text-muted-foreground text-xs tabular-nums" aria-live="polite">
						{only && (
							<>
								<span className="@max-2xl:hidden">{countLabel(countRows(wideGroups), total)}</span>

								<span className="@2xl:hidden">{countLabel(countRows(narrowGroups), total)}</span>
							</>
						)}
					</p>

					<Label>
						{differencesLabel}

						<Switch checked={only} onCheckedChange={setOnly} />
					</Label>
				</div>
			)}

			<div className="relative @max-2xl:hidden">
				<div
					ref={bar}
					aria-hidden="true"
					className="invisible sticky top-(--comparison-top) z-10 -mb-11 h-11 overflow-hidden border-x border-b bg-card font-medium text-sm shadow-xs data-stuck:visible"
				>
					<div
						className="grid h-full items-center"
						style={{
							minWidth: wideWidth,
							gridTemplateColumns: `${FEATURE_WIDTH} repeat(${items.length}, 1fr)`,
						}}
					>
						<div className={cn("sticky left-0 h-full bg-card", scrolledEdge)} />

						{items.map((item) => (
							<div
								key={item.id}
								className={cn("flex h-full items-center px-3", item.featured && featuredTint)}
							>
								<span className="truncate">{item.name}</span>
							</div>
						))}
					</div>
				</div>

				<Table
					ref={wideTable}
					aria-label={label}
					className={tableBase}
					containerClassName="scroll-pl-44"
					style={{ minWidth: wideWidth }}
				>
					<colgroup>
						<col style={{ width: FEATURE_WIDTH }} />
					</colgroup>

					<TableHeader ref={wideHead}>
						<TableRow>
							<TableHead
								className={cn(headCell, "sticky left-0 z-[1] border-b bg-card", scrolledEdge)}
							>
								<span className="sr-only">{featureLabel}</span>
							</TableHead>

							{items.map((item) => (
								<TableHead
									key={item.id}
									abbr={item.name}
									className={cn(headCell, "border-b", item.featured && featuredTint)}
								>
									<ItemHeading item={item} />
								</TableHead>
							))}
						</TableRow>
					</TableHeader>

					{wideGroups.map((group) => (
						<TableBody key={group.label}>
							<TableRow className={flatRow}>
								<TableHead scope="rowgroup" colSpan={items.length + 1} className={groupHead}>
									<span className="sticky left-3">{group.label}</span>
								</TableHead>
							</TableRow>

							{group.rows.map((row) => (
								<TableRow key={row.label} className={flatRow}>
									<TableHead
										scope="row"
										className={cn(rowHead, cellLine, "sticky left-0 z-[1] bg-card", scrolledEdge)}
									>
										{row.label}
									</TableHead>

									{items.map((item) => (
										<TableCell
											key={item.id}
											className={cn(cellLine, item.featured && featuredTint)}
										>
											{value(row, item.id)}
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					))}

					{wideGroups.length === 0 && (
						<TableBody>
							<TableRow className={flatRow}>
								<TableCell colSpan={items.length + 1} className="text-muted-foreground">
									{emptyLabel}
								</TableCell>
							</TableRow>
						</TableBody>
					)}
				</Table>
			</div>

			<div className="@2xl:hidden">
				{/* overflow-clip, not a scroller: the pickers pin to the page. */}
				<Table aria-label={label} className={tableBase} containerClassName="overflow-clip">
					<TableHeader>
						<TableRow>
							{SLOTS.slice(0, picks.length).map((slot) => (
								<TableCell
									key={slot}
									className="sticky top-(--comparison-top) z-10 border-b bg-card p-2"
								>
									{items.length > 2 ? (
										<Select
											aria-label={`${columnLabel} ${slot + 1}`}
											options={items.map((item) => ({ value: item.id, label: item.name }))}
											value={picks[slot]}
											onValueChange={(id) => pick(slot, id)}
										/>
									) : (
										<span aria-hidden="true" className="block px-1 py-1.5 font-medium">
											{itemById(picks[slot] ?? "")?.name}
										</span>
									)}
								</TableCell>
							))}
						</TableRow>

						<TableRow>
							{picks.map((id, slot) => {
								const item = itemById(id);

								if (!item) return null;

								return (
									<TableHead
										key={id}
										id={`${baseId}-column-${slot}`}
										abbr={item.name}
										className={cn(
											headCell,
											!headingExtras && "p-0",
											headingExtras && "border-b",
											item.featured && featuredTint,
										)}
									>
										{headingExtras ? (
											<ItemHeading item={item} nameAbove />
										) : (
											<span className="sr-only">{item.name}</span>
										)}
									</TableHead>
								);
							})}
						</TableRow>
					</TableHeader>

					{narrowGroups.map((group, groupIndex) => {
						const groupId = `${baseId}-group-${groupIndex}`;

						return (
							<TableBody key={group.label}>
								<TableRow className={flatRow}>
									<TableHead
										id={groupId}
										scope="rowgroup"
										colSpan={picks.length}
										className={groupHead}
									>
										{group.label}
									</TableHead>
								</TableRow>

								{group.rows.map((row, rowIndex) => {
									const rowId = `${groupId}-row-${rowIndex}`;

									return (
										<Fragment key={row.label}>
											<TableRow className={flatRow}>
												<TableHead
													id={rowId}
													scope={undefined}
													colSpan={picks.length}
													className={cn(rowHead, "relative pb-0 text-muted-foreground text-xs")}
												>
													{/* The name spans both columns, so the featured half is tinted under it. */}
													{picks.map((id, slot) =>
														itemById(id)?.featured ? (
															<span
																key={id}
																aria-hidden="true"
																className={cn("absolute inset-y-0", featuredTint)}
																style={{
																	left: `${(slot / picks.length) * 100}%`,
																	width: `${100 / picks.length}%`,
																}}
															/>
														) : null,
													)}

													<span className="relative">{row.label}</span>
												</TableHead>
											</TableRow>

											<TableRow className={flatRow}>
												{picks.map((id, slot) => (
													<TableCell
														key={id}
														headers={`${baseId}-column-${slot} ${groupId} ${rowId}`}
														className={cn(
															cellLine,
															"pt-1 align-top",
															itemById(id)?.featured && featuredTint,
														)}
													>
														{value(row, id)}
													</TableCell>
												))}
											</TableRow>
										</Fragment>
									);
								})}
							</TableBody>
						);
					})}

					{narrowGroups.length === 0 && (
						<TableBody>
							<TableRow className={flatRow}>
								<TableCell colSpan={picks.length} className="text-muted-foreground">
									{emptyLabel}
								</TableCell>
							</TableRow>
						</TableBody>
					)}
				</Table>
			</div>
		</div>
	);
}
