import { demoPath, withBase } from "@/site/config";

/** Root-relative path of a page inside the demo, for the router (it adds the base path). */
export const storePath = (path = "") => `${demoPath("electronics")}${path}`;

/** Href of a page inside the demo, for a plain `<a>`. */
export const storeHref = (path = "") => withBase(storePath(path));

const photo = (name: string) => withBase(`/recipes/media/electronics-${name}.webp`);

export type CategoryId = "laptops" | "phones" | "headphones" | "keyboards" | "speakers" | "watches";

export const categories: {
	id: CategoryId;
	label: string;
	blurb: string;
	image: string;
	position?: string;
}[] = [
	{
		id: "laptops",
		label: "Laptops",
		blurb: "Compare chips, memory and weight",
		image: photo("laptop-keys"),
	},
	{
		id: "phones",
		label: "Phones",
		blurb: "Screen, camera and battery side by side",
		image: photo("phone-hands"),
		position: "50% 55%",
	},
	{
		id: "headphones",
		label: "Headphones",
		blurb: "Drivers, battery and codecs",
		image: photo("headphones-wired"),
	},
	{
		id: "keyboards",
		label: "Keyboards",
		blurb: "Switches, layout and connection",
		image: photo("keyboard-mechanical"),
	},
	{
		id: "speakers",
		label: "Speakers",
		blurb: "Output, battery and water rating",
		image: photo("speaker-blue"),
	},
	{
		id: "watches",
		label: "Watches",
		blurb: "Display, battery and sensors",
		image: photo("watch-wrist"),
	},
];

export type SpecGroup = { label: string; rows: [string, string | number | boolean][] };

export type Product = {
	slug: string;
	name: string;
	brand: string;
	category: CategoryId;
	image: string;
	imagePosition?: string;
	/** Three specs shown in the list row. */
	key: [string, string][];
	specs: SpecGroup[];
	/** Daily prices for the last 30 days, oldest first; the last one is today's price. */
	history: number[];
	stock: number;
	rating: number;
	reviews: number;
};

/** Deterministic 30-day history ending at `now`. `shape` describes the month. */
function series(
	now: number,
	base: number,
	shape: "flat" | "drop" | "spike" | "dip",
	seed: number,
): number[] {
	const out: number[] = [];

	for (let i = 0; i < 30; i++) {
		const wobble = Math.round(Math.sin(i * 1.7 + seed) * base * 0.012);
		let value = base + wobble;

		if (shape === "spike" && i >= 8 && i <= 20) value = Math.round(base * 1.16) + wobble; // price raised, then "reduced" back
		if (shape === "dip" && i >= 12 && i <= 15) value = Math.round(base * 0.96);
		out.push(value);
	}

	out[29] = now;

	return out;
}

export const products: Product[] = [
	{
		slug: "aero-14",
		name: "Aero 14 laptop",
		brand: "Kestrel",
		category: "laptops",
		image: photo("laptop-keys"),
		key: [
			["Screen", "14.2 in, 120 Hz"],
			["Chip", "Octa-core, 3 nm"],
			["Weight", "1.24 kg"],
		],
		specs: [
			{
				label: "Display",
				rows: [
					["Size", "14.2 in"],
					["Resolution", "2880 × 1800"],
					["Refresh rate", "120 Hz"],
					["Touch screen", false],
				],
			},
			{
				label: "Performance",
				rows: [
					["Chip", "Octa-core, 3 nm"],
					["Memory", "16 GB"],
					["Storage", "512 GB SSD"],
				],
			},
			{
				label: "Body",
				rows: [
					["Weight", "1.24 kg"],
					["Battery", "18 h video"],
					["USB-C ports", 3],
				],
			},
		],
		history: series(1349, 1349, "flat", 1),
		stock: 14,
		rating: 4.7,
		reviews: 212,
	},
	{
		slug: "slate-15",
		name: "Slate 15 laptop",
		brand: "Norda",
		category: "laptops",
		image: photo("keyboard-black"),
		key: [
			["Screen", "15.6 in, 60 Hz"],
			["Chip", "Hexa-core, 5 nm"],
			["Weight", "1.71 kg"],
		],
		specs: [
			{
				label: "Display",
				rows: [
					["Size", "15.6 in"],
					["Resolution", "1920 × 1080"],
					["Refresh rate", "60 Hz"],
					["Touch screen", true],
				],
			},
			{
				label: "Performance",
				rows: [
					["Chip", "Hexa-core, 5 nm"],
					["Memory", "16 GB"],
					["Storage", "512 GB SSD"],
				],
			},
			{
				label: "Body",
				rows: [
					["Weight", "1.71 kg"],
					["Battery", "11 h video"],
					["USB-C ports", 2],
				],
			},
		],
		history: series(729, 799, "spike", 2),
		stock: 31,
		rating: 4.2,
		reviews: 540,
	},
	{
		slug: "forge-16",
		name: "Forge 16 laptop",
		brand: "Volta",
		category: "laptops",
		image: photo("laptop-keys"),
		imagePosition: "50% 30%",
		key: [
			["Screen", "16 in, 165 Hz"],
			["Chip", "Dedicated GPU, 8 GB"],
			["Weight", "2.30 kg"],
		],
		specs: [
			{
				label: "Display",
				rows: [
					["Size", "16 in"],
					["Resolution", "2560 × 1600"],
					["Refresh rate", "165 Hz"],
					["Touch screen", false],
				],
			},
			{
				label: "Performance",
				rows: [
					["Chip", "Dedicated GPU, 8 GB"],
					["Memory", "32 GB"],
					["Storage", "1 TB SSD"],
				],
			},
			{
				label: "Body",
				rows: [
					["Weight", "2.30 kg"],
					["Battery", "7 h video"],
					["USB-C ports", 2],
				],
			},
		],
		history: series(1649, 1749, "dip", 3),
		stock: 0,
		rating: 4.5,
		reviews: 98,
	},
	{
		slug: "lume-pro",
		name: "Lume Pro phone",
		brand: "Kestrel",
		category: "phones",
		image: photo("phone-hands"),
		imagePosition: "50% 60%",
		key: [
			["Screen", "6.7 in OLED"],
			["Camera", "50 MP + 12 MP"],
			["Battery", "5,000 mAh"],
		],
		specs: [
			{
				label: "Display",
				rows: [
					["Size", "6.7 in"],
					["Panel", "OLED"],
					["Refresh rate", "120 Hz"],
				],
			},
			{
				label: "Camera",
				rows: [
					["Main", "50 MP"],
					["Ultra-wide", "12 MP"],
					["Optical zoom", "3×"],
				],
			},
			{
				label: "Power",
				rows: [
					["Battery", "5,000 mAh"],
					["Wired charging", "67 W"],
					["Wireless charging", true],
				],
			},
		],
		history: series(899, 899, "flat", 4),
		stock: 52,
		rating: 4.6,
		reviews: 1043,
	},
	{
		slug: "lume-mini",
		name: "Lume Mini phone",
		brand: "Kestrel",
		category: "phones",
		image: photo("phone-hands"),
		imagePosition: "30% 40%",
		key: [
			["Screen", "6.1 in OLED"],
			["Camera", "48 MP"],
			["Battery", "4,100 mAh"],
		],
		specs: [
			{
				label: "Display",
				rows: [
					["Size", "6.1 in"],
					["Panel", "OLED"],
					["Refresh rate", "90 Hz"],
				],
			},
			{
				label: "Camera",
				rows: [
					["Main", "48 MP"],
					["Ultra-wide", "—"],
					["Optical zoom", "—"],
				],
			},
			{
				label: "Power",
				rows: [
					["Battery", "4,100 mAh"],
					["Wired charging", "33 W"],
					["Wireless charging", false],
				],
			},
		],
		history: series(449, 499, "spike", 5),
		stock: 80,
		rating: 4.1,
		reviews: 389,
	},
	{
		slug: "tarn-x",
		name: "Tarn X phone",
		brand: "Tarn",
		category: "phones",
		image: photo("phone-hands"),
		imagePosition: "70% 70%",
		key: [
			["Screen", "6.8 in LCD"],
			["Camera", "108 MP"],
			["Battery", "6,000 mAh"],
		],
		specs: [
			{
				label: "Display",
				rows: [
					["Size", "6.8 in"],
					["Panel", "LCD"],
					["Refresh rate", "120 Hz"],
				],
			},
			{
				label: "Camera",
				rows: [
					["Main", "108 MP"],
					["Ultra-wide", "8 MP"],
					["Optical zoom", "—"],
				],
			},
			{
				label: "Power",
				rows: [
					["Battery", "6,000 mAh"],
					["Wired charging", "45 W"],
					["Wireless charging", false],
				],
			},
		],
		history: series(329, 379, "dip", 6),
		stock: 6,
		rating: 4.3,
		reviews: 721,
	},
	{
		slug: "echo-ie",
		name: "Echo IE in-ear headphones",
		brand: "Norda",
		category: "headphones",
		image: photo("headphones-wired"),
		key: [
			["Type", "In-ear, wired"],
			["Drivers", "Dual dynamic"],
			["Cable", "Detachable, 1.2 m"],
		],
		specs: [
			{
				label: "Sound",
				rows: [
					["Drivers", "Dual dynamic"],
					["Impedance", "16 Ω"],
					["Frequency", "10–40,000 Hz"],
				],
			},
			{
				label: "Connection",
				rows: [
					["Cable", "Detachable, 1.2 m"],
					["Plug", "3.5 mm"],
					["Wireless", false],
				],
			},
		],
		history: series(89, 89, "flat", 7),
		stock: 120,
		rating: 4.8,
		reviews: 305,
	},
	{
		slug: "echo-bt",
		name: "Echo BT in-ear headphones",
		brand: "Norda",
		category: "headphones",
		image: photo("headphones-wired"),
		imagePosition: "70% 50%",
		key: [
			["Type", "In-ear, wireless"],
			["Battery", "9 h + 27 h case"],
			["Noise cancelling", "Active"],
		],
		specs: [
			{
				label: "Sound",
				rows: [
					["Drivers", "Single dynamic"],
					["Impedance", "—"],
					["Frequency", "20–20,000 Hz"],
				],
			},
			{
				label: "Connection",
				rows: [
					["Cable", "—"],
					["Plug", "USB-C charge"],
					["Wireless", true],
				],
			},
		],
		history: series(119, 149, "spike", 8),
		stock: 44,
		rating: 4.4,
		reviews: 877,
	},
	{
		slug: "click-75",
		name: "Click 75 keyboard",
		brand: "Volta",
		category: "keyboards",
		image: photo("keyboard-mechanical"),
		key: [
			["Layout", "75 %, 82 keys"],
			["Switches", "Tactile, hot-swap"],
			["Connection", "USB-C, Bluetooth"],
		],
		specs: [
			{
				label: "Typing",
				rows: [
					["Layout", "75 %, 82 keys"],
					["Switches", "Tactile"],
					["Hot-swap", true],
				],
			},
			{
				label: "Connection",
				rows: [
					["Wired", "USB-C"],
					["Wireless", "Bluetooth 5.1"],
					["Battery", "4,000 mAh"],
				],
			},
		],
		history: series(109, 119, "dip", 9),
		stock: 23,
		rating: 4.6,
		reviews: 164,
	},
	{
		slug: "desk-tkl",
		name: "Desk TKL keyboard",
		brand: "Tarn",
		category: "keyboards",
		image: photo("keyboard-black"),
		key: [
			["Layout", "TKL, 87 keys"],
			["Switches", "Linear"],
			["Connection", "USB-C"],
		],
		specs: [
			{
				label: "Typing",
				rows: [
					["Layout", "TKL, 87 keys"],
					["Switches", "Linear"],
					["Hot-swap", false],
				],
			},
			{
				label: "Connection",
				rows: [
					["Wired", "USB-C"],
					["Wireless", "—"],
					["Battery", "—"],
				],
			},
		],
		history: series(69, 69, "flat", 10),
		stock: 61,
		rating: 4.0,
		reviews: 92,
	},
	{
		slug: "wave-go",
		name: "Wave Go speaker",
		brand: "Volta",
		category: "speakers",
		image: photo("speaker-blue"),
		key: [
			["Output", "20 W"],
			["Battery", "16 h"],
			["Water rating", "IP67"],
		],
		specs: [
			{
				label: "Sound",
				rows: [
					["Output", "20 W"],
					["Drivers", "Woofer + tweeter"],
					["Stereo pairing", true],
				],
			},
			{
				label: "Body",
				rows: [
					["Battery", "16 h"],
					["Water rating", "IP67"],
					["Weight", "0.54 kg"],
				],
			},
		],
		history: series(69, 79, "spike", 11),
		stock: 37,
		rating: 4.5,
		reviews: 611,
	},
	{
		slug: "wave-max",
		name: "Wave Max speaker",
		brand: "Volta",
		category: "speakers",
		image: photo("speaker-blue"),
		imagePosition: "30% 50%",
		key: [
			["Output", "60 W"],
			["Battery", "24 h"],
			["Water rating", "IP65"],
		],
		specs: [
			{
				label: "Sound",
				rows: [
					["Output", "60 W"],
					["Drivers", "Woofer + 2 tweeters"],
					["Stereo pairing", true],
				],
			},
			{
				label: "Body",
				rows: [
					["Battery", "24 h"],
					["Water rating", "IP65"],
					["Weight", "2.1 kg"],
				],
			},
		],
		history: series(199, 199, "flat", 12),
		stock: 9,
		rating: 4.7,
		reviews: 233,
	},
	{
		slug: "pulse-s",
		name: "Pulse S watch",
		brand: "Tarn",
		category: "watches",
		image: photo("watch-wrist"),
		key: [
			["Display", "1.8 in AMOLED"],
			["Battery", "10 days"],
			["GPS", "Built in"],
		],
		specs: [
			{
				label: "Display",
				rows: [
					["Size", "1.8 in"],
					["Panel", "AMOLED"],
					["Always-on", true],
				],
			},
			{
				label: "Health",
				rows: [
					["Heart rate", true],
					["Blood oxygen", true],
					["GPS", "Built in"],
				],
			},
			{
				label: "Power",
				rows: [
					["Battery", "10 days"],
					["Water rating", "5 ATM"],
				],
			},
		],
		history: series(139, 159, "dip", 13),
		stock: 28,
		rating: 4.3,
		reviews: 450,
	},
	{
		slug: "pulse-lite",
		name: "Pulse Lite watch",
		brand: "Tarn",
		category: "watches",
		image: photo("watch-box"),
		key: [
			["Display", "1.6 in LCD"],
			["Battery", "14 days"],
			["GPS", "Via phone"],
		],
		specs: [
			{
				label: "Display",
				rows: [
					["Size", "1.6 in"],
					["Panel", "LCD"],
					["Always-on", false],
				],
			},
			{
				label: "Health",
				rows: [
					["Heart rate", true],
					["Blood oxygen", false],
					["GPS", "Via phone"],
				],
			},
			{
				label: "Power",
				rows: [
					["Battery", "14 days"],
					["Water rating", "3 ATM"],
				],
			},
		],
		history: series(59, 59, "flat", 14),
		stock: 90,
		rating: 3.9,
		reviews: 318,
	},
];

export const bySlug = (slug: string) => products.find((product) => product.slug === slug);
export const price = (product: Product) => product.history[product.history.length - 1];
/** Lowest price of the last 30 days (today included). */
export const lowest30 = (product: Product) => Math.min(...product.history);
/** Lowest price of the 29 days before today: the only honest reference for a reduction. */
export const lowestBefore = (product: Product) => Math.min(...product.history.slice(0, -1));

/** Percent below the prior 30-day low; 0 when today's price is not a real reduction. */
export const discountPercent = (product: Product) => {
	const reference = lowestBefore(product);
	const now = price(product);

	return now < reference ? Math.round(((reference - now) / reference) * 100) : 0;
};

export const monthly = (amount: number, months = 12) => amount / months;

export const euro = (amount: number, digits = 0) =>
	new Intl.NumberFormat("en-IE", {
		style: "currency",
		currency: "EUR",
		minimumFractionDigits: digits,
		maximumFractionDigits: digits,
	}).format(amount);

export const brandsIn = (list: Product[]) => {
	const counts = new Map<string, number>();

	for (const product of list) counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1);

	return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
};

/** Last 30 days as chart rows, labelled relative to today (no clock needed at build). */
export function historyRows(product: Product) {
	return product.history.map((value, day) => ({
		day: day === 29 ? "Today" : `${29 - day} d ago`,
		price: value,
	}));
}

export const credits = [
	{ file: "laptop-keys", description: "Laptop keyboard, close-up" },
	{ file: "phone-hands", description: "Hands holding a phone" },
	{ file: "headphones-wired", description: "In-ear headphones on a table" },
	{ file: "keyboard-mechanical", description: "Mechanical keyboard with keycaps removed" },
	{ file: "keyboard-black", description: "Dark keyboard, close-up" },
	{ file: "speaker-blue", description: "Portable speaker on rocks" },
	{ file: "watch-wrist", description: "Smartwatch on a wrist" },
	{ file: "watch-box", description: "Smartwatch in its box" },
];
