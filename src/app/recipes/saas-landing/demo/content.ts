import type { PricingPeriodOption, PricingPlan } from "@/components/blocks/pricing";

export const product = {
	name: "Pingwell",
	tagline: "Uptime monitoring for small teams",
	currency: "EUR",
	locale: "en-IE",
};

export type PlanId = "hobby" | "team" | "business";
export type Period = "monthly" | "yearly";

export const periods: PricingPeriodOption[] = [
	{ value: "monthly", label: "Monthly", priceNote: "/ month" },
	{ value: "yearly", label: "Yearly", note: "2 months free", priceNote: "/ month" },
];

/** Plans with what the estimator and the signup need beside what Pricing shows. */
export const plans: (PricingPlan & { id: PlanId; monitors: number; interval: string })[] = [
	{
		id: "hobby",
		name: "Hobby",
		description: "For side projects and a first status page.",
		price: { monthly: 0, yearly: 0 },
		monitors: 10,
		interval: "5 min",
		features: [
			"10 monitors, checked every 5 minutes",
			"Email alerts",
			"1 status page",
			"30 days of history",
		],
	},
	{
		id: "team",
		name: "Team",
		description: "For a product with customers who notice.",
		price: { monthly: 29, yearly: 24 },
		monitors: 50,
		interval: "1 min",
		featured: true,
		badge: "Most popular",
		features: [
			"50 monitors, checked every minute",
			"Slack, SMS and phone alerts",
			"On-call rotations for 10 people",
			"3 status pages on your domain",
			"1 year of history",
		],
	},
	{
		id: "business",
		name: "Business",
		description: "For several products and a support desk.",
		price: { monthly: 79, yearly: 66 },
		monitors: 250,
		interval: "30 s",
		features: [
			"250 monitors, checked every 30 seconds",
			"Everything in Team",
			"Unlimited on-call members",
			"SSO and audit log",
			"Unlimited history and exports",
		],
	},
];

export const planOf = (id: PlanId) => plans.find((plan) => plan.id === id) ?? plans[0];

/** The smallest plan that holds this many monitors. */
export const planFor = (monitors: number) =>
	plans.find((plan) => plan.monitors >= monitors) ?? plans[plans.length - 1];

export const euro = (amount: number) =>
	new Intl.NumberFormat(product.locale, {
		style: "currency",
		currency: product.currency,
		maximumFractionDigits: amount % 1 ? 2 : 0,
	}).format(amount);

export const regions = [
	"Frankfurt",
	"Dublin",
	"Stockholm",
	"Virginia",
	"Oregon",
	"São Paulo",
	"Singapore",
	"Sydney",
];

export type Monitor = {
	id: string;
	name: string;
	url: string;
	base: number;
	/** Slow region that shows up in the tooltip. */
	region: string;
};

export const monitors: Monitor[] = [
	{ id: "web", name: "Website", url: "harbourline.example", base: 182, region: "Frankfurt" },
	{ id: "api", name: "Public API", url: "api.harbourline.example", base: 96, region: "Dublin" },
	{
		id: "checkout",
		name: "Checkout",
		url: "pay.harbourline.example",
		base: 241,
		region: "Virginia",
	},
	{ id: "auth", name: "Sign in", url: "id.harbourline.example", base: 134, region: "Stockholm" },
	{ id: "cdn", name: "Image CDN", url: "img.harbourline.example", base: 48, region: "Singapore" },
];

export const stats = [
	{ label: "Checks a day", value: 412, suffix: "M" },
	{ label: "Check regions", value: regions.length },
	{ label: "Median alert time", value: 23, suffix: " s", hint: "from failure to your phone" },
	{ label: "Our own uptime", value: 99.99, decimals: 2, suffix: "%", hint: "last 12 months" },
];

export const testimonials = [
	{
		author: "Maren Holt",
		subtitle: "CTO, Harbourline",
		body: "We used to hear about outages from customers on social media. Now the on-call phone rings before the first support ticket, and the status page has already said so.",
	},
	{
		author: "Tomás Ferreira",
		subtitle: "Founder, Ledgerly",
		body: "Set up in an afternoon. Ten monitors on the free plan carried us to our first paying customers.",
	},
	{
		author: "Ji-woo Park",
		subtitle: "SRE lead, Quayside",
		body: "Alerts confirmed from three regions mean nobody gets woken up for a network blip any more.",
	},
	{
		author: "Ola Brennan",
		subtitle: "Support lead, Mise",
		body: "Our status page took the 'is it just me?' tickets down by two thirds during the last incident.",
	},
];

export const teams = [
	"Harbourline",
	"Ledgerly",
	"Quayside",
	"Mise",
	"Northline",
	"Fernhill",
	"Orbital",
	"Porto Eira",
	"Halden",
];

export const faqs = [
	{
		id: "trial",
		question: "How does the free trial work?",
		answer:
			"Every paid plan starts with 14 days free, no card needed. At the end you pick a plan or drop back to Hobby; your monitors and history stay.",
	},
	{
		id: "yearly",
		question: "What do I save with yearly billing?",
		answer:
			"About two months a year: Team is €288 a year instead of €348, Business €792 instead of €948. You can switch from monthly to yearly at any time and we credit what's left of the month.",
	},
	{
		id: "vat",
		question: "Do prices include VAT?",
		answer:
			"Prices are in euros and exclude VAT. Businesses in the EU with a valid VAT number are reverse-charged; everyone else in the EU pays their country's rate at checkout.",
	},
	{
		id: "limits",
		question: "What happens if I go over my monitor limit?",
		answer:
			"Nothing breaks. New monitors wait in a paused state and we email you; upgrade, or pause another monitor to make room.",
	},
	{
		id: "regions",
		question: "Where do checks run from?",
		answer: `From ${regions.length} regions: ${regions.join(", ")}. An alert goes out only when at least three of them agree, so a single network blip never wakes anyone.`,
	},
	{
		id: "cancel",
		question: "Can I cancel at any time?",
		answer:
			"Yes, from the billing page, in two clicks. A yearly plan runs to the end of the year you paid for; we don't renew it without a reminder a week before.",
	},
];

/** Plans feature by feature, for ComparisonTable. */
export const comparison = [
	{
		label: "Monitoring",
		rows: [
			{ label: "Monitors", values: { hobby: 10, team: 50, business: 250 } },
			{ label: "Check interval", values: { hobby: "5 min", team: "1 min", business: "30 s" } },
			{ label: "Check regions", values: { hobby: 3, team: 8, business: 8 } },
			{ label: "Keyword and SSL checks", values: { hobby: true, team: true, business: true } },
			{ label: "Cron job heartbeats", values: { hobby: false, team: true, business: true } },
		],
	},
	{
		label: "Alerts",
		rows: [
			{ label: "Email", values: { hobby: true, team: true, business: true } },
			{ label: "Slack and webhooks", values: { hobby: false, team: true, business: true } },
			{ label: "SMS and phone calls", values: { hobby: false, team: true, business: true } },
			{ label: "On-call members", values: { hobby: 1, team: 10, business: "Unlimited" } },
		],
	},
	{
		label: "Status pages",
		rows: [
			{ label: "Status pages", values: { hobby: 1, team: 3, business: "Unlimited" } },
			{ label: "Custom domain", values: { hobby: false, team: true, business: true } },
			{ label: "Subscriber updates", values: { hobby: false, team: true, business: true } },
		],
	},
	{
		label: "Team and security",
		rows: [
			{ label: "History", values: { hobby: "30 days", team: "1 year", business: "Unlimited" } },
			{ label: "SSO (SAML)", values: { hobby: false, team: false, business: true } },
			{ label: "Audit log", values: { hobby: false, team: false, business: true } },
		],
	},
];

export const footerColumns = [
	{
		title: "Product",
		links: [
			{ label: "Features", href: "#features" },
			{ label: "Pricing", href: "#pricing" },
			{ label: "Customers", href: "#customers" },
			{ label: "FAQ", href: "#faq" },
		],
	},
	{
		title: "Company",
		links: [
			{ label: "About", href: "/about" },
			{ label: "Careers", href: "/careers" },
			{ label: "Contact", href: "/contact" },
		],
	},
	{
		title: "Legal",
		links: [
			{ label: "Terms", href: "/terms" },
			{ label: "Privacy", href: "/privacy" },
			{ label: "Data processing", href: "/dpa" },
		],
	},
];
