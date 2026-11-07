// Fernhill, a made-up homeware shop. Sample data is generated from fixed seeds, so the server
// and the browser build the same rows and every visit starts from the same store.

export const locale = "en-IE";
export const currency = "EUR";
export const timeZone = "Europe/Dublin";

/** The demo's "now": dates count back from it, so the data never goes stale. */
export const now = Date.UTC(2026, 10, 6, 15, 40);

const day = 86_400_000;

const euroFormat = new Intl.NumberFormat(locale, { style: "currency", currency });
const dateFormat = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone });
const timeFormat = new Intl.DateTimeFormat(locale, {
	day: "numeric",
	month: "short",
	hour: "2-digit",
	minute: "2-digit",
	timeZone,
});

const wholeEuroFormat = new Intl.NumberFormat(locale, {
	style: "currency",
	currency,
	maximumFractionDigits: 0,
});

export const euro = (value: number) => euroFormat.format(value);
export const euroWhole = (value: number) => wholeEuroFormat.format(value);
export const shortDate = (time: number) => dateFormat.format(time);
export const dateTime = (time: number) => timeFormat.format(time);
export const isoDate = (time: number) => new Date(time).toISOString();

export type Category = "Kitchen" | "Table" | "Home" | "Textiles";

export type Product = {
	id: string;
	name: string;
	category: Category;
	price: number;
	stock: number;
	active: boolean;
};

export const categories: Category[] = ["Kitchen", "Table", "Home", "Textiles"];

export const sampleProducts: Product[] = (
	[
		{ id: "FH-101", name: "Stoneware mug, sand", category: "Kitchen", price: 18, stock: 64 },
		{ id: "FH-102", name: "Speckled dinner plate", category: "Table", price: 24, stock: 41 },
		{ id: "FH-103", name: "Linen napkins, set of 4", category: "Textiles", price: 32, stock: 3 },
		{ id: "FH-104", name: "Oak serving board", category: "Kitchen", price: 46, stock: 18 },
		{ id: "FH-105", name: "Glass carafe", category: "Table", price: 29, stock: 0 },
		{ id: "FH-106", name: "Wool throw, moss", category: "Textiles", price: 89, stock: 12 },
		{ id: "FH-107", name: "Tall ceramic vase", category: "Home", price: 54, stock: 7 },
		{ id: "FH-108", name: "Beeswax candles, pair", category: "Home", price: 16, stock: 120 },
		{ id: "FH-109", name: "Rattan basket", category: "Home", price: 38, stock: 4 },
		{ id: "FH-110", name: "Cotton apron, rust", category: "Textiles", price: 27, stock: 33 },
		{ id: "FH-111", name: "Enamel colander", category: "Kitchen", price: 34, stock: 15 },
		{
			id: "FH-112",
			name: "Olive wood spoons, set of 3",
			category: "Kitchen",
			price: 22,
			stock: 52,
		},
		{ id: "FH-113", name: "Stoneware bowl, sand", category: "Table", price: 21, stock: 47 },
		{ id: "FH-114", name: "Brass bottle opener", category: "Kitchen", price: 19, stock: 0 },
		{ id: "FH-115", name: "Jute rug, small", category: "Home", price: 120, stock: 6 },
		{ id: "FH-116", name: "Waffle tea towels, pair", category: "Textiles", price: 15, stock: 88 },
	] satisfies Omit<Product, "active">[]
).map((product, i) => ({ ...product, active: i !== 13 }));

export type Customer = {
	id: string;
	name: string;
	email: string;
	city: string;
	country: string;
	address: string;
};

const people = [
	["Aoife Brennan", "Galway", "IE", "14 Dominick Street"],
	["Luca Romano", "Bologna", "IT", "Via del Pratello 22"],
	["Marta Nowak", "Kraków", "PL", "ul. Józefa 9/4"],
	["Jonas Berg", "Aarhus", "DK", "Mejlgade 41"],
	["Sofia Costa", "Porto", "PT", "Rua das Flores 118"],
	["Tom Becker", "Leipzig", "DE", "Karl-Heine-Straße 70"],
	["Elena Petrova", "Plovdiv", "BG", "ul. Otets Paisiy 5"],
	["Hugo Martin", "Lyon", "FR", "12 rue Mercière"],
	["Saoirse Walsh", "Cork", "IE", "3 Paul Street"],
	["Pieter de Vries", "Utrecht", "NL", "Oudegracht 201"],
	["Ines García", "Valencia", "ES", "Carrer de Russafa 30"],
	["Mikko Laine", "Tampere", "FI", "Hämeenkatu 16"],
	["Clara Hofer", "Graz", "AT", "Sporgasse 8"],
	["Nora Lindqvist", "Malmö", "SE", "Davidshallsgatan 3"],
	["Tomás Novák", "Brno", "CZ", "Kounicova 12"],
	["Ana Kovač", "Ljubljana", "SI", "Trubarjeva 27"],
	["Matteo Ricci", "Turin", "IT", "Via Po 44"],
	["Léa Dubois", "Ghent", "BE", "Kraanlei 19"],
] as const;

export const customers: Customer[] = people.map(([name, city, country, address], i) => ({
	id: `C-${String(i + 1).padStart(3, "0")}`,
	name,
	email: `${name
		.split(" ")[0]
		.normalize("NFD")
		.replace(/[^A-Za-z]/g, "")
		.toLowerCase()}@example.com`,
	city,
	country,
	address,
}));

export const countryNames: Record<string, string> = {
	IE: "Ireland",
	IT: "Italy",
	PL: "Poland",
	DK: "Denmark",
	PT: "Portugal",
	DE: "Germany",
	BG: "Bulgaria",
	FR: "France",
	NL: "Netherlands",
	ES: "Spain",
	FI: "Finland",
	AT: "Austria",
	SE: "Sweden",
	CZ: "Czechia",
	SI: "Slovenia",
	BE: "Belgium",
};

export type Status = "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "refunded";

export const statuses: { value: Status; label: string }[] = [
	{ value: "pending", label: "Awaiting payment" },
	{ value: "paid", label: "To fulfil" },
	{ value: "shipped", label: "Shipped" },
	{ value: "delivered", label: "Delivered" },
	{ value: "cancelled", label: "Cancelled" },
	{ value: "refunded", label: "Refunded" },
];

export const statusLabel = (status: Status) =>
	statuses.find((option) => option.value === status)?.label ?? status;

export type Payment = "Card" | "Bank transfer" | "Wallet";

export type OrderLine = { product: string; name: string; quantity: number; price: number };

export type OrderEvent = { time: number; title: string; detail?: string; by?: string };

export type Order = {
	id: string;
	customer: string;
	placed: number;
	status: Status;
	payment: Payment;
	lines: OrderLine[];
	shipping: number;
	tracking: string;
	note: string;
	events: OrderEvent[];
};

/** Free delivery from this subtotal; below it a flat rate. */
export const freeShippingFrom = 60;
export const shippingRate = 5.9;

export const subtotal = (order: Pick<Order, "lines">) =>
	order.lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

export const orderTotal = (order: Pick<Order, "lines" | "shipping">) =>
	subtotal(order) + order.shipping;

export const itemCount = (order: Pick<Order, "lines">) =>
	order.lines.reduce((sum, line) => sum + line.quantity, 0);

// Park–Miller: tiny, deterministic, good enough to spread sample orders around.
function seeded(seed: number) {
	let state = seed;

	return () => {
		state = (state * 48_271) % 2_147_483_647;

		return state / 2_147_483_647;
	};
}

function pick<T>(random: () => number, list: readonly T[]) {
	return list[Math.floor(random() * list.length)];
}

const hour = day / 24;
const payments: Payment[] = ["Card", "Card", "Card", "Bank transfer", "Wallet", "Wallet"];

function statusFor(age: number, random: () => number): Status {
	const roll = random();

	if (age < 0.6) return roll < 0.45 ? "pending" : "paid";

	if (age < 2) return roll < 0.25 ? "pending" : roll < 0.75 ? "paid" : "shipped";

	if (age < 5) return roll < 0.1 ? "cancelled" : roll < 0.65 ? "shipped" : "delivered";

	return roll < 0.06 ? "cancelled" : roll < 0.12 ? "refunded" : "delivered";
}

function eventsFor(order: Omit<Order, "events">): OrderEvent[] {
	const events: OrderEvent[] = [
		{
			time: order.placed,
			title: "Order placed",
			detail: `${itemCount(order)} items, ${order.payment.toLowerCase()}`,
		},
	];
	const paid = order.placed + 0.2 * hour;
	const shipped = order.placed + 1.4 * day;
	const delivered = order.placed + 3.6 * day;

	if (order.status === "pending") return events;

	if (order.status === "cancelled") {
		events.push({
			time: order.placed + 5 * hour,
			title: "Cancelled",
			detail: "Payment not received",
			by: "Store",
		});

		return events;
	}

	events.push({ time: paid, title: "Payment received", detail: euro(orderTotal(order)) });

	if (order.status === "paid") return events;

	events.push({
		time: shipped,
		title: "Shipped",
		detail: `Tracking ${order.tracking}`,
		by: "Ada Novak",
	});

	if (order.status === "shipped") return events;

	events.push({ time: delivered, title: "Delivered", detail: "Signed for at the door" });

	if (order.status === "refunded")
		events.push({
			time: delivered + 2 * day,
			title: "Refunded",
			detail: "Returned within 30 days",
			by: "Ada Novak",
		});

	return events;
}

function makeOrders(): Order[] {
	const random = seeded(20_261_106);
	const orders: Order[] = [];
	let placed = now - 0.3 * hour;

	for (let i = 0; i < 120; i++) {
		const lines: OrderLine[] = [];
		const count = random() < 0.5 ? 1 : random() < 0.7 ? 2 : 3;

		for (let j = 0; j < count; j++) {
			const product = pick(random, sampleProducts);

			if (lines.some((line) => line.product === product.id)) continue;

			lines.push({
				product: product.id,
				name: product.name,
				quantity: random() < 0.75 ? 1 : 2,
				price: product.price,
			});
		}

		const age = (now - placed) / day;
		const status = statusFor(age, random);
		const shipping = subtotal({ lines }) >= freeShippingFrom ? 0 : shippingRate;
		const shipped = status === "shipped" || status === "delivered" || status === "refunded";
		const base = {
			id: `#${1312 - i}`,
			// Squared, so a few regulars place most orders and some people only one.
			customer: customers[Math.floor(random() ** 2 * customers.length)].id,
			placed,
			status,
			payment: pick(random, payments),
			lines,
			shipping,
			tracking: shipped ? `FH${String(Math.floor(random() * 1e9)).padStart(9, "0")}IE` : "",
			note: i === 3 ? "Gift: leave out the receipt." : "",
		};

		orders.push({ ...base, events: eventsFor(base) });
		// A little busier in the last two weeks, so the trend has somewhere to go.
		placed -= (age < 14 ? 3.5 : 5) * hour + random() * 7 * hour;
	}

	return orders;
}

export const sampleOrders = makeOrders();

/** The person signed in to the demo admin. */
export const admin = "Ada Novak";

export const trackingPattern = "[A-Z]{2}[0-9]{9}[A-Z]{2}";
