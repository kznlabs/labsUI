// Halden Roastery, a made-up coffee roaster: two years of daily sample data from a fixed seed.

export const store = { name: "Halden Roastery", currency: "EUR", locale: "en-IE" };

const day = 86_400_000;

/** Last day with data, 6 Nov 2026 (UTC midnight). */
export const lastDay = Date.UTC(2026, 10, 6);

const length = 730;

export const firstDay = lastDay - (length - 1) * day;

/** Ranges start a year in, so a previous period always has data. */
export const earliest = firstDay + 365 * day;

export type Category = "Coffee" | "Subscription" | "Gear" | "Gifts";

export type Product = {
	id: string;
	name: string;
	detail: string;
	category: Category;
	price: number;
	/** Units per order, before the season. */
	weight: number;
	/** Seasonal factor for a month (0 = January). */
	season?: (month: number) => number;
};

const winterOnly = (month: number) => (month === 10 || month === 11 || month === 0 ? 1 : 0);
const summer = (month: number) =>
	month >= 5 && month <= 7 ? 1.8 : month === 4 || month === 8 ? 0.8 : 0.2;
const gifting = (month: number) => (month === 11 ? 3.2 : month === 10 ? 1.8 : 0.6);

export const products: Product[] = [
	{
		id: "guji",
		name: "Guji Natural",
		detail: "Ethiopia, 250 g",
		category: "Coffee",
		price: 16.5,
		weight: 0.32,
	},
	{
		id: "huila",
		name: "Huila Pink Bourbon",
		detail: "Colombia, 250 g",
		category: "Coffee",
		price: 18,
		weight: 0.22,
	},
	{
		id: "house",
		name: "House Espresso",
		detail: "Brazil and Guatemala, 1 kg",
		category: "Coffee",
		price: 38,
		weight: 0.18,
	},
	{
		id: "nyeri",
		name: "Nyeri AA",
		detail: "Kenya, 250 g",
		category: "Coffee",
		price: 19.5,
		weight: 0.12,
	},
	{
		id: "decaf",
		name: "Sugarcane Decaf",
		detail: "Colombia, 250 g",
		category: "Coffee",
		price: 15,
		weight: 0.09,
	},
	{
		id: "winter",
		name: "Winter Blend",
		detail: "Seasonal, 250 g",
		category: "Coffee",
		price: 17,
		weight: 0.3,
		season: winterOnly,
	},
	{
		id: "monthly",
		name: "Monthly beans",
		detail: "Two bags a month",
		category: "Subscription",
		price: 29,
		weight: 0.14,
	},
	{
		id: "espresso-club",
		name: "Espresso club",
		detail: "1 kg a month",
		category: "Subscription",
		price: 34,
		weight: 0.05,
	},
	{
		id: "grinder",
		name: "Hand grinder",
		detail: "Steel burrs",
		category: "Gear",
		price: 89,
		weight: 0.025,
	},
	{
		id: "kettle",
		name: "Pour-over kettle",
		detail: "0.9 l, gooseneck",
		category: "Gear",
		price: 64,
		weight: 0.03,
	},
	{
		id: "dripper",
		name: "Ceramic dripper",
		detail: "Size 02",
		category: "Gear",
		price: 28,
		weight: 0.05,
	},
	{
		id: "filters",
		name: "Paper filters",
		detail: "100 pack",
		category: "Gear",
		price: 7.5,
		weight: 0.16,
	},
	{
		id: "cold-brew",
		name: "Cold brew bags",
		detail: "Pack of 8",
		category: "Coffee",
		price: 12,
		weight: 0.08,
		season: summer,
	},
	{
		id: "gift-card",
		name: "Gift card",
		detail: "€50",
		category: "Gifts",
		price: 50,
		weight: 0.02,
		season: gifting,
	},
];

export const channels = [
	{ id: "organic", label: "Organic search", share: 0.34 },
	{ id: "email", label: "Email", share: 0.22 },
	{ id: "social", label: "Paid social", share: 0.18 },
	{ id: "direct", label: "Direct", share: 0.17 },
	{ id: "referral", label: "Referral", share: 0.09 },
] as const;

export const countries = [
	{ id: "ie", label: "Ireland", share: 0.31 },
	{ id: "de", label: "Germany", share: 0.19 },
	{ id: "nl", label: "Netherlands", share: 0.13 },
	{ id: "fr", label: "France", share: 0.11 },
	{ id: "be", label: "Belgium", share: 0.08 },
	{ id: "at", label: "Austria", share: 0.06 },
	{ id: "other", label: "Elsewhere in the EU", share: 0.12 },
] as const;

export type Day = {
	date: number;
	sessions: number;
	orders: number;
	revenue: number;
	/** Orders from people who had ordered before. */
	returning: number;
	units: number[];
	channels: number[];
	countries: number[];
};

// Mulberry32: small, fast, the same numbers on every load.
function random(seed: number) {
	let state = seed;

	return () => {
		state = (state + 0x6d2b79f5) | 0;

		let value = Math.imul(state ^ (state >>> 15), 1 | state);

		value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;

		return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
	};
}

const weekday = [1.14, 1.1, 1, 0.95, 0.94, 0.88, 0.99]; // Sunday first

/** Black Friday is the fourth Friday of November; the week around it sells most. */
function blackFriday(year: number) {
	const first = new Date(Date.UTC(year, 10, 1)).getUTCDay();

	return Date.UTC(year, 10, 1 + ((5 - first + 7) % 7) + 21);
}

function season(date: number) {
	const when = new Date(date);
	const month = when.getUTCMonth();
	const dayOfMonth = when.getUTCDate();
	const fromFriday = (date - blackFriday(when.getUTCFullYear())) / day;

	if (fromFriday >= -2 && fromFriday <= 3) return fromFriday === 0 || fromFriday === 3 ? 2.6 : 1.9;
	if (month === 11 && dayOfMonth <= 20) return 1.55;
	if (month === 11) return 0.8;
	if (month === 0) return 0.82;
	if (month === 6 || month === 7) return 0.86;

	return 1;
}

function build() {
	const next = random(20_261_106);
	const days: Day[] = [];

	for (let i = 0; i < length; i++) {
		const date = firstDay + i * day;
		const month = new Date(date).getUTCMonth();
		const growth = 1 + (0.42 * i) / length;
		const noise = 0.84 + next() * 0.32;
		const orders = Math.round(
			46 * growth * weekday[new Date(date).getUTCDay()] * season(date) * noise,
		);
		const units = products.map((product) =>
			Math.round(orders * product.weight * (product.season?.(month) ?? 1) * (0.75 + next() * 0.5)),
		);
		const revenue = products.reduce((sum, product, index) => sum + units[index] * product.price, 0);
		const conversion = 0.021 + next() * 0.006 + (season(date) > 1.5 ? 0.008 : 0);
		const email = season(date) > 1.5 ? 1.6 : 1;
		const weights = channels.map(
			(channel) => channel.share * (channel.id === "email" ? email : 1) * (0.85 + next() * 0.3),
		);
		const total = weights.reduce((sum, weight) => sum + weight, 0);
		const spread = countries.map((country) => country.share * (0.8 + next() * 0.4));
		const spreadTotal = spread.reduce((sum, weight) => sum + weight, 0);

		days.push({
			date,
			orders,
			revenue: Math.round(revenue * 100) / 100,
			sessions: Math.round(orders / conversion),
			returning: Math.round(orders * (0.36 + (0.08 * i) / length + next() * 0.06)),
			units,
			channels: weights.map((weight) => (revenue * weight) / total),
			countries: spread.map((weight) => Math.round((orders * weight) / spreadTotal)),
		});
	}

	return days;
}

export const days = build();

/** Day index of a picked date (the picker hands out local midnights). */
export const indexOf = (date: Date) =>
	Math.round((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - firstDay) / day);

/** Local midnight of a day index, for the picker. */
export const dateOf = (index: number) => {
	const when = new Date(firstDay + index * day);

	return new Date(when.getUTCFullYear(), when.getUTCMonth(), when.getUTCDate());
};

export const lastIndex = length - 1;
export const earliestIndex = 365;

// Live feed: who orders what, from where.
export const towns = [
	"Dublin",
	"Cork",
	"Galway",
	"Berlin",
	"Hamburg",
	"Munich",
	"Amsterdam",
	"Utrecht",
	"Lyon",
	"Paris",
	"Ghent",
	"Antwerp",
	"Vienna",
	"Graz",
	"Lisbon",
	"Copenhagen",
];
