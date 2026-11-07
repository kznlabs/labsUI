// Sample portfolio for the demo, from the recipe's run, with two more projects and CC0 covers.
import { demoPath, withBase } from "@/site/config";

/** Root-relative path of a page inside the demo, for the router (it adds the base path). */
export const portfolioPath = (path = "") => `${demoPath("portfolio")}${path}`;

/** Href of a page inside the demo, for a plain `<a>`. */
export const portfolioHref = (path = "") => withBase(portfolioPath(path));

export const kinds = ["Web app", "Mobile", "Open source"] as const;

export type Kind = (typeof kinds)[number];

export type Result = {
	label: string;
	value: number;
	prefix?: string;
	suffix?: string;
	decimals?: number;
	hint?: string;
};

export type Project = {
	slug: string;
	title: string;
	kind: Kind;
	year: string;
	role: string;
	client: string;
	duration: string;
	summary: string;
	stack: string[];
	challenge: string[];
	approach: string[];
	highlights: string[];
	results: Result[];
	quote?: { text: string; author: string; role: string };
};

export const site = {
	name: "Ada Novak",
	role: "Product engineer",
	location: "Lisbon, Portugal",
	timezone: "UTC+0",
	email: "hello@example.com",
	available: "Booking projects from January 2027",
	description:
		"I build fast, accessible web apps with small teams: from the database schema to the last pixel of a focus ring.",
};

export type Credit = { slug: string; alt: string; creator: string; source: string };

/** Cover photos: CC0 from StockSnap, found through Openverse. */
export const covers: Credit[] = [
	{
		slug: "harbor-booking",
		alt: "Sailboats moored along the piers of a marina under a cloudy sky",
		creator: "Skitter Photo",
		source: "https://stocksnap.io/photo/marina-boats-00DD267706",
	},
	{
		slug: "platform",
		alt: "A metro train pulling into an open-air station under green steel arches",
		creator: "Kaique Rocha",
		source: "https://stocksnap.io/photo/train-station-KHG87AQB9N",
	},
	{
		slug: "ledgerly",
		alt: "A hand writing in a notebook beside a cup of coffee",
		creator: "Green Chameleon",
		source: "https://stocksnap.io/photo/writing-drawing-8Y0EDX4VP9",
	},
	{
		slug: "mise",
		alt: "Herbs, garlic, peppercorns and spices on a wooden board",
		creator: "Patrycja Tomaszczyk",
		source: "https://stocksnap.io/photo/herbs-spices-6ASMNGB3YI",
	},
	{
		slug: "trailmap",
		alt: "A hiker on a rocky ridge above a river, snowy mountains behind",
		creator: "Jay Mantri",
		source: "https://stocksnap.io/photo/mountains-cliffs-E544644D29",
	},
	{
		slug: "grain",
		alt: "A row of sharpened coloured pencils of different lengths",
		creator: "Jess Watters",
		source: "https://stocksnap.io/photo/colored-pencils-SWKBAF0RNQ",
	},
];

export const coverOf = (slug: string) => {
	const credit = covers.find((cover) => cover.slug === slug);

	return credit && { src: withBase(`/recipes/media/portfolio-${slug}.webp`), alt: credit.alt };
};

export const projects: Project[] = [
	{
		slug: "harbor-booking",
		title: "Harbor Booking",
		kind: "Web app",
		year: "2026",
		role: "Lead engineer",
		client: "Porto Eira Marina",
		duration: "5 months",
		summary: "A booking flow for a small marina, from berth search to payment.",
		stack: ["Next.js", "Postgres", "Stripe"],
		challenge: [
			"The marina took every reservation by phone and kept the season in a shared spreadsheet. In summer two people spent their mornings answering the same three questions: is there room, how much, and can I pay by card.",
			"Berths differ in length, depth and power, prices change by season and boat length, and a double booking means a skipper arriving at night with nowhere to tie up.",
		],
		approach: [
			"I started with the staff, not the screens: a week of shadowing at the harbour office turned into a list of every rule they kept in their heads. Those rules became one pricing table staff can edit, so a new season needs no developer.",
			"Availability is one Postgres query over date ranges with an exclusion constraint, so two bookings for the same berth and night can't both commit, whatever the web server does.",
		],
		highlights: [
			"Availability search that answers in under 100 ms on a single query.",
			"Seasonal and length-based prices that staff edit themselves.",
			"Card payments with webhooks that keep bookings and payments in step.",
			"A tide-aware arrival note in every confirmation email.",
		],
		results: [
			{ label: "Phone bookings", value: 62, prefix: "−", suffix: "%", hint: "first season" },
			{ label: "Conversion", value: 4.1, suffix: "%", decimals: 1, hint: "search to payment" },
			{ label: "Time to book", value: 2, suffix: " min", hint: "median" },
		],
		quote: {
			text: "Our mornings used to belong to the phone. Now the harbour office opens to a list of confirmed arrivals, and Ada left us a tool we can change ourselves.",
			author: "Inês Carvalho",
			role: "Harbour master, Porto Eira Marina",
		},
	},
	{
		slug: "platform",
		title: "Platform",
		kind: "Mobile",
		year: "2025",
		role: "Frontend lead",
		client: "Northline Transit",
		duration: "9 months",
		summary: "Live departures and disruption alerts for a regional rail network.",
		stack: ["React Native", "TypeScript", "GraphQL"],
		challenge: [
			"Riders checked three places before a trip: the timetable PDF, a social feed for delays and the station screens. None of them agreed for long.",
			"The network's feed updates every fifteen seconds, and most riders open the app on a platform with one bar of signal.",
		],
		approach: [
			"We designed for the worst platform first: the last good answer stays on screen with its age, and new data slides in without moving what you're reading.",
			"Alerts are per journey, not per line, so a rider hears about the 8:12 they take, not every train on the route.",
		],
		highlights: [
			"Departure boards that work offline and say how old they are.",
			"Journey alerts with a quiet-hours schedule.",
			"Screen reader support tested with riders who use it daily.",
		],
		results: [
			{ label: "Weekly riders", value: 84, suffix: "k", hint: "six months after launch" },
			{ label: "Store rating", value: 4.7, decimals: 1, hint: "both stores" },
			{ label: "Crash-free sessions", value: 99.8, suffix: "%", decimals: 1 },
		],
		quote: {
			text: "Ada argued for the rider on the platform with one bar of signal in every meeting. That rider is why our reviews changed.",
			author: "Tomás Reyes",
			role: "Head of digital, Northline Transit",
		},
	},
	{
		slug: "ledgerly",
		title: "Ledgerly",
		kind: "Web app",
		year: "2025",
		role: "Frontend engineer",
		client: "Ledgerly",
		duration: "7 months",
		summary: "A bookkeeping dashboard that turns bank feeds into clear monthly reports.",
		stack: ["TypeScript", "tRPC", "Tailwind"],
		challenge: [
			"Freelancers wanted to see where their money went without learning accounting, and to hand their accountant something better than a shoebox of receipts.",
		],
		approach: [
			"I built the dashboard, the review queue that sorts transactions and learns from corrections, and a printable monthly report.",
			"Every chart has a table view, so the numbers are readable by screen readers and by accountants who don't trust charts.",
		],
		highlights: [
			"A review queue that learns from each correction.",
			"Accessible charts with a table view and keyboard focus.",
			"A print stylesheet for tax-ready PDF reports.",
		],
		results: [
			{ label: "Hours saved a month", value: 6, hint: "per user, self-reported" },
			{ label: "Sorted automatically", value: 91, suffix: "%" },
			{ label: "Accessibility score", value: 100, hint: "every page" },
		],
	},
	{
		slug: "mise",
		title: "Mise",
		kind: "Mobile",
		year: "2024",
		role: "Product engineer",
		client: "Mise Kitchen",
		duration: "4 months",
		summary: "Meal planning that turns a week of recipes into one sorted shopping list.",
		stack: ["Next.js", "PWA", "SQLite"],
		challenge: [
			"Home cooks plan a week of meals, then rewrite every ingredient by hand into a list that doesn't match the shop's aisles.",
		],
		approach: [
			"Recipes are parsed into quantities and units once, so a week's plan adds up: three recipes with onions become one line, in grams or pieces.",
			"The list sorts by aisle and works offline in the shop, checking items off with one thumb.",
		],
		highlights: [
			"Quantities that add up across recipes, in metric or cups.",
			"An offline shopping list sorted by aisle.",
			"Cooking mode that keeps the screen awake and the text large.",
		],
		results: [
			{ label: "Weekly planners", value: 12, suffix: "k" },
			{ label: "Lists finished", value: 73, suffix: "%", hint: "every item checked" },
			{ label: "Install size", value: 1.8, suffix: " MB", decimals: 1 },
		],
	},
	{
		slug: "trailmap",
		title: "Trailmap",
		kind: "Mobile",
		year: "2024",
		role: "Solo developer",
		client: "Side project",
		duration: "Ongoing",
		summary: "Offline-first hiking maps with trail conditions from the community.",
		stack: ["Next.js", "MapLibre", "PWA"],
		challenge: [
			"Hikers lose signal exactly where they need a map, and trail conditions change faster than any guidebook.",
		],
		approach: [
			"Trailmap stores regions for offline use and syncs condition reports when a connection returns. Two hikers who report the same washed-out bridge get one merged report, not two.",
		],
		highlights: [
			"Map regions stored offline, with a meter for the space they take.",
			"Condition reports that merge without conflicts.",
			"An installable app with background sync.",
		],
		results: [
			{ label: "Regions offline", value: 40 },
			{ label: "Monthly hikers", value: 18, suffix: "k" },
			{ label: "Reports a week", value: 1.2, suffix: "k", decimals: 1 },
		],
		quote: {
			text: "I used Trailmap on a three-day crossing with no signal at all. The bridge report from the morning before saved us a two-hour detour.",
			author: "Marta Kowal",
			role: "Mountain guide",
		},
	},
	{
		slug: "grain",
		title: "Grain",
		kind: "Open source",
		year: "2023",
		role: "Maintainer",
		client: "Open source",
		duration: "Since 2023",
		summary: "Color tokens that pass contrast checks by construction, for any brand color.",
		stack: ["TypeScript", "OKLCH", "CLI"],
		challenge: [
			"Every design system I joined had a palette that looked right and failed contrast in one theme. Fixing it by hand took days and broke again with the next brand refresh.",
		],
		approach: [
			"Grain takes one brand color and builds a full scale in OKLCH, then checks every text and surface pair against WCAG and nudges lightness until each one passes.",
			"It runs in CI, so a pull request that breaks contrast fails before review.",
		],
		highlights: [
			"Light and dark scales from one color.",
			"A contrast report for every pair a theme uses.",
			"A CLI and a CI check, no browser needed.",
		],
		results: [
			{ label: "GitHub stars", value: 3.4, suffix: "k", decimals: 1 },
			{ label: "Weekly downloads", value: 21, suffix: "k" },
			{ label: "Contributors", value: 46 },
		],
	},
];

export const projectBySlug = (slug: string) => projects.find((project) => project.slug === slug);

/** What a grid card needs; the rest stays on the project's page. */
export type ProjectSummary = Pick<
	Project,
	"slug" | "title" | "kind" | "year" | "role" | "summary" | "stack"
>;

export const summaryOf = ({ slug, title, kind, year, role, summary, stack }: Project) => ({
	slug,
	title,
	kind,
	year,
	role,
	summary,
	stack,
});
