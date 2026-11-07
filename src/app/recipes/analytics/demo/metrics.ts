import { channels, countries, type Day, days, products, store } from "./data";

/** First and last day index, both included. */
export type Span = { from: number; to: number };

export type Grain = "day" | "week" | "month";

export const grains: { value: Grain; label: string }[] = [
	{ value: "day", label: "Day" },
	{ value: "week", label: "Week" },
	{ value: "month", label: "Month" },
];

export const spanLength = (span: Span) => span.to - span.from + 1;

/** The same number of days right before. */
export const previousOf = (span: Span): Span => ({
	from: span.from - spanLength(span),
	to: span.from - 1,
});

/** Day bars past three months are too thin to read; one month bar says nothing. */
export const grainFits = (grain: Grain, span: Span) =>
	grain === "day"
		? spanLength(span) <= 92
		: grain === "week"
			? spanLength(span) >= 14
			: spanLength(span) >= 60;

export const grainFor = (span: Span): Grain =>
	spanLength(span) <= 31 ? "day" : spanLength(span) <= 120 ? "week" : "month";

const utc = { timeZone: "UTC" } as const;
const dayLabel = new Intl.DateTimeFormat(store.locale, { ...utc, day: "numeric", month: "short" });
const monthLabel = new Intl.DateTimeFormat(store.locale, {
	...utc,
	month: "short",
	year: "numeric",
});
const longDate = new Intl.DateTimeFormat(store.locale, { ...utc, dateStyle: "medium" });

export const formatSpan = (span: Span) =>
	longDate.formatRange(days[span.from].date, days[span.to].date);

export const isoDay = (index: number) => new Date(days[index].date).toISOString().slice(0, 10);

export const formatDay = (index: number) => longDate.format(days[index].date);

function bucketKey(index: number, grain: Grain) {
	const when = new Date(days[index].date);

	if (grain === "day") return index;
	if (grain === "month") return when.getUTCFullYear() * 12 + when.getUTCMonth();

	// Weeks start on Monday.
	return index - ((when.getUTCDay() + 6) % 7);
}

/** Consecutive runs of days that share a bucket, each with its label. */
export function buckets(span: Span, grain: Grain) {
	const runs: { label: string; from: number; to: number }[] = [];

	for (let index = span.from; index <= span.to; index++) {
		const last = runs[runs.length - 1];

		if (last && bucketKey(last.from, grain) === bucketKey(index, grain)) last.to = index;
		else
			runs.push({
				label:
					grain === "month"
						? monthLabel.format(days[index].date)
						: dayLabel.format(days[index].date),
				from: index,
				to: index,
			});
	}

	return runs;
}

function total(span: Span, pick: (day: Day) => number) {
	let sum = 0;

	for (let index = Math.max(0, span.from); index <= span.to; index++) sum += pick(days[index]);

	return sum;
}

export type Totals = {
	revenue: number;
	orders: number;
	sessions: number;
	average: number;
	conversion: number;
	returning: number;
};

export function totals(span: Span): Totals {
	const revenue = total(span, (day) => day.revenue);
	const orders = total(span, (day) => day.orders);
	const sessions = total(span, (day) => day.sessions);

	return {
		revenue,
		orders,
		sessions,
		average: orders ? revenue / orders : 0,
		conversion: sessions ? (orders / sessions) * 100 : 0,
		returning: orders ? (total(span, (day) => day.returning) / orders) * 100 : 0,
	};
}

/** Change in %, one decimal. */
export const change = (current: number, previous: number) =>
	previous === 0 ? 0 : Math.round(((current - previous) / previous) * 1000) / 10;

export type Metric = "revenue" | "orders" | "sessions";

/** One chart row per bucket: this period, and the bucket as far back as the span is long. */
export function series(span: Span, grain: Grain) {
	const shift = spanLength(span);

	return buckets(span, grain).map((bucket) => {
		const current = totals(bucket);
		const before = totals({ from: bucket.from - shift, to: bucket.to - shift });

		return {
			x: bucket.label,
			revenue: Math.round(current.revenue),
			orders: current.orders,
			sessions: current.sessions,
			average: Math.round(current.average * 100) / 100,
			conversion: Math.round(current.conversion * 100) / 100,
			rate: current.conversion / 100,
			previousRevenue: Math.round(before.revenue),
			previousOrders: before.orders,
			previousSessions: before.sessions,
			...Object.fromEntries(
				channels.map((channel, i) => [
					channel.id,
					Math.round(total(bucket, (day) => day.channels[i])),
				]),
			),
		};
	});
}

export type ProductRow = {
	id: string;
	name: string;
	detail: string;
	category: string;
	units: number;
	revenue: number;
	share: number;
	change: number;
};

export function productRows(span: Span): ProductRow[] {
	const before = previousOf(span);
	const all = totals(span).revenue;

	return products
		.map((product, i) => {
			const units = total(span, (day) => day.units[i]);
			const previousUnits = total(before, (day) => day.units[i]);
			const revenue = units * product.price;

			return {
				id: product.id,
				name: product.name,
				detail: product.detail,
				category: product.category,
				units,
				revenue,
				share: all ? (revenue / all) * 100 : 0,
				change: previousUnits ? change(units, previousUnits) : Number.NaN,
			};
		})
		.filter((row) => row.units > 0);
}

export function channelRows(span: Span) {
	const before = previousOf(span);

	return channels.map((channel, i) => {
		const revenue = total(span, (day) => day.channels[i]);

		return {
			...channel,
			revenue,
			change: change(
				revenue,
				total(before, (day) => day.channels[i]),
			),
		};
	});
}

export function countryRows(span: Span) {
	return countries.map((country, i) => ({
		...country,
		orders: total(span, (day) => day.countries[i]),
	}));
}

/** CSV of the chart's rows, the same buckets the page shows. */
export function toCsv(span: Span, grain: Grain) {
	const rows = series(span, grain);
	const header = [
		"period",
		"revenue_eur",
		"orders",
		"sessions",
		"average_order_eur",
		"conversion_pct",
	];
	const lines = rows.map((row) =>
		[row.x, row.revenue, row.orders, row.sessions, row.average, row.conversion].join(","),
	);

	return [header.join(","), ...lines].join("\n");
}
