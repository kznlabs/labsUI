"use client";

import { Coffee, Download } from "lucide-react";
import { useState } from "react";
import { StatTile } from "@/components/blocks/stat-tile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { Counter } from "./counter";
import { dateOf, earliestIndex, indexOf, lastIndex, store } from "./data";
import { Live } from "./live";
import {
	change,
	channelRows,
	countryRows,
	formatDay,
	formatSpan,
	type Grain,
	grainFits,
	grainFor,
	grains,
	isoDay,
	type Metric,
	type ProductRow,
	previousOf,
	productRows,
	type Span,
	series,
	spanLength,
	toCsv,
	totals,
} from "./metrics";

const euroWhole = new Intl.NumberFormat(store.locale, {
	style: "currency",
	currency: store.currency,
	maximumFractionDigits: 0,
});
const whole = new Intl.NumberFormat(store.locale);
const currencyFormat = {
	style: "currency",
	currency: store.currency,
	maximumFractionDigits: 0,
} as const;

const back = (count: number): Span => ({ from: lastIndex - count + 1, to: lastIndex });
const yearStart = indexOf(new Date(2026, 0, 1));

const presets = [
	{ label: "Last 7 days", span: back(7) },
	{ label: "Last 30 days", span: back(30) },
	{ label: "Last 90 days", span: back(90) },
	{ label: "Year to date", span: { from: yearStart, to: lastIndex } },
	{ label: "Last 12 months", span: back(365) },
].map((preset) => ({
	label: preset.label,
	value: { from: dateOf(preset.span.from), to: dateOf(preset.span.to) },
}));

const metrics: {
	value: Metric;
	label: string;
	previous: string;
	format?: Intl.NumberFormatOptions;
}[] = [
	{ value: "revenue", label: "Revenue", previous: "previousRevenue", format: currencyFormat },
	{ value: "orders", label: "Orders", previous: "previousOrders" },
	{ value: "sessions", label: "Sessions", previous: "previousSessions" },
];

const categories = ["All", "Coffee", "Subscription", "Gear", "Gifts"].map((value) => ({
	value,
	label: value === "All" ? "All categories" : value,
}));

function Change({ value, label }: { value: number; label?: string }) {
	if (Number.isNaN(value)) return <Badge variant="outline">New</Badge>;

	return (
		<Badge variant={value >= 0 ? "success" : "destructive"} shape="pill" className="tabular-nums">
			{value > 0 ? "+" : value < 0 ? "−" : ""}
			{Math.abs(value)}%{label && <span className="sr-only"> {label}</span>}
		</Badge>
	);
}

const columns: DataTableColumn<ProductRow>[] = [
	{
		id: "product",
		header: "Product",
		accessor: (row) => row.name,
		cell: (row) => (
			<div className="min-w-0">
				<p className="font-medium">{row.name}</p>

				<p className="text-muted-foreground text-xs">{row.detail}</p>
			</div>
		),
		sortable: true,
	},
	{
		id: "category",
		header: "Category",
		accessor: (row) => row.category,
		className: "hidden md:table-cell",
	},
	{
		id: "units",
		header: "Units",
		accessor: (row) => row.units,
		cell: (row) => whole.format(row.units),
		sortable: true,
		className: "hidden text-right tabular-nums sm:table-cell",
	},
	{
		id: "revenue",
		header: "Revenue",
		accessor: (row) => row.revenue,
		cell: (row) => euroWhole.format(row.revenue),
		sortable: true,
		className: "text-right tabular-nums",
	},
	{
		id: "share",
		header: "Share",
		accessor: (row) => row.share,
		cell: (row) => (
			<div className="flex items-center justify-end gap-2">
				<span
					aria-hidden="true"
					className="h-1.5 w-16 overflow-hidden rounded-full bg-foreground/10"
				>
					<span
						className="block h-full rounded-full bg-chart-1"
						style={{ width: `${Math.min(100, row.share * 2.5)}%` }}
					/>
				</span>
				{row.share.toFixed(1)}%
			</div>
		),
		sortable: true,
		className: "hidden text-right tabular-nums sm:table-cell",
	},
	{
		id: "change",
		header: "Change",
		accessor: (row) => (Number.isNaN(row.change) ? Number.POSITIVE_INFINITY : row.change),
		cell: (row) => <Change value={row.change} />,
		sortable: true,
		className: "text-right",
	},
];

function download(name: string, text: string) {
	const url = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
	const link = document.createElement("a");

	link.href = url;
	link.download = name;
	link.click();
	URL.revokeObjectURL(url);
}

export function Dashboard() {
	const [span, setSpan] = useState<Span>(back(30));
	const [grain, setGrain] = useState<Grain>("day");
	const [metric, setMetric] = useState<Metric>("revenue");
	const [compare, setCompare] = useState(true);
	const [category, setCategory] = useState("All");

	const before = previousOf(span);
	const now = totals(span);
	const then = totals(before);
	const rows = series(span, grain);
	const days = spanLength(span);
	const versus = `vs the ${days} days before`;
	const shown = metrics.find((item) => item.value === metric) ?? metrics[0];
	const products = productRows(span).filter(
		(row) => category === "All" || row.category === category,
	);
	const channels = channelRows(span);
	const countries = countryRows(span);
	const countryTotal = countries.reduce((sum, country) => sum + country.orders, 0);

	const pick = (range: { from?: Date; to?: Date }) => {
		if (!range.from || !range.to) return;

		const next = { from: indexOf(range.from), to: indexOf(range.to) };

		setSpan(next);
		if (!grainFits(grain, next)) setGrain(grainFor(next));
	};

	const exportCsv = () => {
		const name = `halden-${grain}-${isoDay(span.from)}-${isoDay(span.to)}.csv`;

		download(name, toCsv(span, grain));
		toast.success("Report exported", {
			description: `${rows.length} rows by ${grain}, ${formatSpan(span)}.`,
		});
	};

	return (
		<main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
			<header className="flex flex-wrap items-end justify-between gap-4">
				<div className="flex items-center gap-3">
					<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
						<Coffee aria-hidden="true" className="size-5" />
					</span>

					<div>
						<p className="text-muted-foreground text-sm">{store.name}</p>

						<h1 className="font-semibold text-2xl tracking-tight">Analytics</h1>
					</div>
				</div>

				<div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
					<Label htmlFor="range" className="sr-only">
						Date range
					</Label>

					<DatePicker
						id="range"
						mode="range"
						value={{ from: dateOf(span.from), to: dateOf(span.to) }}
						onValueChange={pick}
						min={dateOf(earliestIndex)}
						max={dateOf(lastIndex)}
						presets={presets}
						locale={store.locale}
						className="w-full sm:w-64"
					/>

					<ToggleGroup
						aria-label="Group by"
						value={grain}
						onValueChange={(value) => setGrain(value as Grain)}
					>
						{grains.map((item) => (
							<ToggleGroupItem
								key={item.value}
								value={item.value}
								disabled={!grainFits(item.value, span)}
							>
								{item.label}
							</ToggleGroupItem>
						))}
					</ToggleGroup>

					<Button variant="outline" onClick={exportCsv} className="ml-auto sm:ml-0">
						<Download aria-hidden="true" />
						Export
					</Button>
				</div>
			</header>

			<p className="mt-3 text-muted-foreground text-sm">
				{formatSpan(span)}, against {formatSpan(before)}. Sample data up to {formatDay(lastIndex)}.
			</p>

			<section
				aria-label="Key figures"
				className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
			>
				<StatTile
					label="Revenue"
					value={<Counter to={Math.round(now.revenue)} prefix="€" />}
					delta={change(now.revenue, then.revenue)}
					period={versus}
					data={rows}
					dataKey="revenue"
					format={currencyFormat}
				/>

				<StatTile
					label="Orders"
					value={<Counter to={now.orders} />}
					delta={change(now.orders, then.orders)}
					period={versus}
					data={rows}
					dataKey="orders"
				/>

				<StatTile
					label="Average order"
					value={<Counter to={now.average} prefix="€" decimals={2} />}
					delta={change(now.average, then.average)}
					period={versus}
					data={rows}
					dataKey="average"
					format={{ style: "currency", currency: store.currency }}
				/>

				<StatTile
					label="Conversion rate"
					value={<Counter to={now.conversion} suffix="%" decimals={2} />}
					delta={change(now.conversion, then.conversion)}
					period={versus}
					data={rows}
					dataKey="rate"
					format={{ style: "percent", maximumFractionDigits: 2 }}
				/>
			</section>

			<div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
				<Card>
					<CardHeader className="flex flex-wrap items-start justify-between gap-3">
						<div>
							<CardTitle as="h2">{shown.label} over time</CardTitle>

							<CardDescription>
								{metric === "revenue" ? euroWhole.format(now.revenue) : whole.format(now[metric])}{" "}
								by {grain}
								{compare ? ", the period before in the second color" : ""}
							</CardDescription>
						</div>

						<div className="flex flex-wrap items-center gap-4">
							<div className="flex items-center gap-2">
								<Switch id="compare" checked={compare} onCheckedChange={setCompare} />

								<Label htmlFor="compare">Compare</Label>
							</div>

							<ToggleGroup
								size="sm"
								aria-label="Metric"
								value={metric}
								onValueChange={(value) => setMetric(value as Metric)}
							>
								{metrics.map((item) => (
									<ToggleGroupItem key={item.value} value={item.value}>
										{item.label}
									</ToggleGroupItem>
								))}
							</ToggleGroup>
						</div>
					</CardHeader>

					<CardContent>
						<Chart
							type={grain === "day" ? "area" : "bar"}
							label={`${shown.label} by ${grain}`}
							data={rows}
							index="x"
							series={[
								{ key: metric, label: "This period" },
								...(compare ? [{ key: shown.previous, label: "Period before" }] : []),
							]}
							format={shown.format}
							locale={store.locale}
							height={380}
						/>
					</CardContent>
				</Card>

				<Live />
			</div>

			<div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
				<Card>
					<CardHeader className="flex flex-wrap items-start justify-between gap-3">
						<div>
							<CardTitle as="h2">Top products</CardTitle>

							<CardDescription>
								Units and revenue in the range, change against the period before.
							</CardDescription>
						</div>

						<Select
							aria-label="Category"
							options={categories}
							value={category}
							onValueChange={setCategory}
							className="w-44"
						/>
					</CardHeader>

					<CardContent>
						<DataTable
							label="Top products"
							data={products}
							columns={columns}
							getRowId={(row) => row.id}
							rowLabel={(row) => row.name}
							defaultSort={{ id: "revenue", dir: "descending" }}
							searchable
							searchPlaceholder="Search products"
							pageSize={8}
						/>
					</CardContent>
				</Card>

				<div className="grid gap-6">
					<Card>
						<CardHeader>
							<CardTitle as="h2">Channels</CardTitle>

							<CardDescription>Where revenue came from.</CardDescription>
						</CardHeader>

						<CardContent className="grid gap-4">
							<Chart
								type="bar"
								stacked
								label={`Revenue by channel and ${grain}`}
								data={rows}
								index="x"
								series={channels.map((channel) => ({ key: channel.id, label: channel.label }))}
								format={currencyFormat}
								locale={store.locale}
								height={180}
							/>

							<ul className="grid gap-2 text-sm">
								{channels.map((channel, i) => (
									<li key={channel.id} className="flex items-center gap-2">
										<span aria-hidden="true" className={cn("size-2 rounded-full", chartFill[i])} />

										<span className="flex-1">{channel.label}</span>

										<span className="tabular-nums">{euroWhole.format(channel.revenue)}</span>

										<Change value={channel.change} label={versus} />
									</li>
								))}
							</ul>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle as="h2">Orders by country</CardTitle>

							<CardDescription>
								{whole.format(countryTotal)} orders, {Math.round(now.returning)}% from returning
								customers.
							</CardDescription>
						</CardHeader>

						<CardContent>
							<ul className="grid gap-3 text-sm">
								{countries.map((country) => {
									const share = countryTotal ? (country.orders / countryTotal) * 100 : 0;

									return (
										<li key={country.id} className="grid gap-1.5">
											<div className="flex justify-between gap-2">
												<span>{country.label}</span>

												<span className="text-muted-foreground tabular-nums">
													{whole.format(country.orders)} · {share.toFixed(0)}%
												</span>
											</div>

											<span
												aria-hidden="true"
												className="h-1.5 overflow-hidden rounded-full bg-foreground/10"
											>
												<span
													className="block h-full rounded-full bg-chart-1"
													style={{ width: `${share * 2.5}%` }}
												/>
											</span>
										</li>
									);
								})}
							</ul>
						</CardContent>
					</Card>
				</div>
			</div>
		</main>
	);
}

// Literal classes, so Tailwind finds them.
const chartFill = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];
