import { demoPath, withBase } from "@/site/config";

/** Root-relative path of a page inside the demo, for the router (it adds the base path). */
export const storePath = (path = "") => `${demoPath("shop")}${path}`;

/** Href of a page inside the demo, for a plain `<a>`. */
export const storeHref = (path = "") => withBase(storePath(path));

export type Photo = {
	src: string;
	/** object-position of the crop, e.g. "45% 20%". */
	pos?: string;
	/** Extra scale for a detail crop, around `pos`. */
	zoom?: number;
};

export type Category = "clothing" | "footwear" | "accessories";
export type Fit = "small" | "true" | "large";

export type Product = {
	slug: string;
	name: string;
	/** EUR, major units. */
	price: number;
	compareAt?: number;
	/** Lowest price in the 30 days before the reduction (EU Omnibus rule). */
	lowest?: number;
	category: Category;
	colors: { name: string; hex: string }[];
	/** Units in stock per size. 0 = unavailable. */
	stock: Record<string, number>;
	fit: Fit;
	material: string;
	description: string;
	photos: [Photo, Photo];
	goesWith: string[];
};

const photoSrc = (id: string) => withBase(`/recipes/media/shop-${id.toLowerCase()}.webp`);

const CLOTHING = ["XS", "S", "M", "L", "XL"] as const;
const sizes = (
	extraSmall: number,
	small: number,
	medium: number,
	large: number,
	extraLarge: number,
) =>
	Object.fromEntries(
		CLOTHING.map((size, index) => [size, [extraSmall, small, medium, large, extraLarge][index]]),
	);

export const products: Product[] = [
	{
		slug: "tan-suede-jacket",
		name: "Tan suede jacket",
		price: 189,
		category: "clothing",
		colors: [{ name: "Tan", hex: "#a9692f" }],
		stock: sizes(0, 4, 2, 6, 3),
		fit: "true",
		material: "Suede, cotton lining",
		description:
			"A cropped zip jacket in soft suede that darkens and relaxes with wear. Sits at the hip, narrow through the sleeve.",
		photos: [
			{ src: photoSrc("QQHFI13JZG"), pos: "4% 80%" },
			{ src: photoSrc("QQHFI13JZG"), pos: "2% 100%", zoom: 2 },
		],
		goesWith: ["oat-cable-knit", "indigo-jeans", "felt-hat"],
	},
	{
		slug: "oat-cable-knit",
		name: "Oat cable knit",
		price: 96,
		compareAt: 128,
		lowest: 128,
		category: "clothing",
		colors: [
			{ name: "Oat", hex: "#d9d0c1" },
			{ name: "Charcoal", hex: "#4a4a4c" },
		],
		stock: sizes(3, 5, 7, 2, 0),
		fit: "small",
		material: "Wool and nylon blend",
		description:
			"A soft, slightly brushed pullover with a cable down the front. Warm without bulk; the cuffs hold their shape.",
		photos: [
			{ src: photoSrc("8H1NE3XL3Q"), pos: "25% 0%" },
			{ src: photoSrc("OA0AFM3HYZ"), pos: "40% 50%" },
		],
		goesWith: ["indigo-jeans", "tan-suede-jacket", "canvas-sneakers"],
	},
	{
		slug: "striped-linen-shirt",
		name: "Striped linen shirt",
		price: 74,
		category: "clothing",
		colors: [{ name: "Ivory", hex: "#ece7dc" }],
		stock: sizes(2, 6, 8, 5, 2),
		fit: "large",
		material: "Washed linen",
		description:
			"A relaxed popover with a deep V, patch pockets and a washed finish. It creases the way linen should.",
		photos: [
			{ src: photoSrc("BD2F94946C"), pos: "50% 30%" },
			{ src: photoSrc("BD2F94946C"), pos: "50% 20%", zoom: 1.9 },
		],
		goesWith: ["indigo-jeans", "felt-hat", "canvas-sneakers"],
	},
	{
		slug: "rose-linen-shirt",
		name: "Rose linen shirt",
		price: 74,
		category: "clothing",
		colors: [
			{ name: "Rose", hex: "#c46a62" },
			{ name: "Ivory", hex: "#ece7dc" },
		],
		stock: sizes(1, 3, 5, 4, 0),
		fit: "large",
		material: "Washed linen",
		description: "The same cut as the striped shirt in a dyed rose, with a rolled cuff.",
		photos: [
			{ src: photoSrc("BD2F94946C"), pos: "88% 40%" },
			{ src: photoSrc("BD2F94946C"), pos: "80% 35%", zoom: 2 },
		],
		goesWith: ["indigo-jeans", "camel-cardigan", "felt-hat"],
	},
	{
		slug: "floral-cotton-shirt",
		name: "Floral cotton shirt",
		price: 68,
		category: "clothing",
		colors: [
			{ name: "Blue", hex: "#9aa7bd" },
			{ name: "Navy", hex: "#232c4a" },
		],
		stock: sizes(4, 6, 6, 3, 1),
		fit: "true",
		material: "Cotton poplin",
		description:
			"A small-scale print on soft poplin with pearl-coloured buttons and a camp collar.",
		photos: [
			{ src: photoSrc("XKWNU0JJ9U"), pos: "72% 50%" },
			{ src: photoSrc("XKWNU0JJ9U"), pos: "18% 50%", zoom: 1.4 },
		],
		goesWith: ["indigo-jeans", "camel-cardigan", "canvas-sneakers"],
	},
	{
		slug: "green-print-dress",
		name: "Green print dress",
		price: 142,
		category: "clothing",
		colors: [{ name: "Green", hex: "#1f7a52" }],
		stock: sizes(2, 4, 3, 2, 0),
		fit: "small",
		material: "Viscose satin",
		description:
			"A full skirt that moves, a fitted bodice and a border print at the hem. Midi length.",
		photos: [
			{ src: photoSrc("1CXI0CSPE5"), pos: "46% 50%" },
			{ src: photoSrc("1CXI0CSPE5"), pos: "46% 75%", zoom: 1.8 },
		],
		goesWith: ["tan-suede-jacket", "felt-hat", "oxford-shoes"],
	},
	{
		slug: "camel-cardigan",
		name: "Camel cardigan",
		price: 118,
		category: "clothing",
		colors: [
			{ name: "Camel", hex: "#b48a5e" },
			{ name: "Oat", hex: "#d9d0c1" },
		],
		stock: sizes(3, 5, 6, 4, 2),
		fit: "true",
		material: "Merino wool",
		description:
			"A pocketed cardigan with a soft hand and ribbed cuffs. Layers under a jacket without pulling.",
		photos: [
			{ src: photoSrc("0369993BB5"), pos: "8% 15%" },
			{ src: photoSrc("ZN97ZIF3ZU"), pos: "35% 50%" },
		],
		goesWith: ["indigo-jeans", "striped-linen-shirt", "felt-hat"],
	},
	{
		slug: "indigo-jeans",
		name: "Indigo straight jeans",
		price: 98,
		category: "clothing",
		colors: [{ name: "Indigo", hex: "#25365b" }],
		stock: sizes(0, 0, 0, 0, 0),
		fit: "true",
		material: "Organic cotton denim",
		description: "A straight leg in a mid-weight denim, cut to sit just above the hip.",
		photos: [
			{ src: photoSrc("WTLBU65VI8"), pos: "100% 10%", zoom: 1.5 },
			{ src: photoSrc("0369993BB5"), pos: "42% 55%" },
		],
		goesWith: ["oat-cable-knit", "striped-linen-shirt", "tan-suede-jacket"],
	},
	{
		slug: "dotted-shirt",
		name: "Dotted poplin shirt",
		price: 72,
		category: "clothing",
		colors: [
			{ name: "Ivory", hex: "#ece7dc" },
			{ name: "Navy", hex: "#232c4a" },
		],
		stock: sizes(2, 3, 5, 5, 4),
		fit: "true",
		material: "Cotton poplin",
		description: "A sharp little print in navy on ivory. A classic collar and a clean placket.",
		photos: [
			{ src: photoSrc("3WTQ3M15W8"), pos: "12% 45%" },
			{ src: photoSrc("3WTQ3M15W8"), pos: "22% 35%", zoom: 1.8 },
		],
		goesWith: ["indigo-jeans", "oxford-shoes", "camel-cardigan"],
	},
	{
		slug: "oxford-shoes",
		name: "Cognac oxford shoes",
		price: 210,
		category: "footwear",
		colors: [{ name: "Cognac", hex: "#a35a1f" }],
		stock: { "40": 2, "41": 0, "42": 3, "43": 1, "44": 0 },
		fit: "small",
		material: "Calf leather, leather sole",
		description: "A cap-toe oxford on a leather sole, stitched and hand-finished. Resoleable.",
		photos: [
			{ src: photoSrc("3WTQ3M15W8"), pos: "100% 60%" },
			{ src: photoSrc("3WTQ3M15W8"), pos: "75% 60%", zoom: 1.8 },
		],
		goesWith: ["dotted-shirt", "camel-cardigan", "indigo-jeans"],
	},
	{
		slug: "felt-hat",
		name: "Camel felt hat",
		price: 58,
		category: "accessories",
		colors: [{ name: "Camel", hex: "#c9a77c" }],
		stock: { "One size": 9 },
		fit: "true",
		material: "Wool felt, grosgrain band",
		description: "A soft-brimmed hat that holds its shape. One size, with an inner band to adjust.",
		photos: [
			{ src: photoSrc("WTLBU65VI8"), pos: "20% 0%" },
			{ src: photoSrc("1U68PK9DJ0"), pos: "100% 75%" },
		],
		goesWith: ["tan-suede-jacket", "camel-cardigan", "striped-linen-shirt"],
	},
	{
		slug: "canvas-sneakers",
		name: "White canvas sneakers",
		price: 84,
		category: "footwear",
		colors: [{ name: "White", hex: "#f2f0ea" }],
		stock: { "40": 3, "41": 4, "42": 5, "43": 2, "44": 2 },
		fit: "small",
		material: "Organic canvas, rubber sole",
		description: "A low-top with a flat sole and a plain toe. Wash cold, dry in the shade.",
		photos: [
			{ src: photoSrc("1U68PK9DJ0"), pos: "0% 85%" },
			{ src: photoSrc("1U68PK9DJ0"), pos: "8% 60%", zoom: 1.8 },
		],
		goesWith: ["indigo-jeans", "floral-cotton-shirt", "oat-cable-knit"],
	},
];

export const bySlug = (slug: string) => products.find((product) => product.slug === slug);
export const isSoldOut = (product: Product) =>
	Object.values(product.stock).every((left) => left === 0);
export const isSale = (product: Product) => product.compareAt !== undefined;

export const eur = (amount: number) =>
	new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(amount);

export const fitHint: Record<Fit, string> = {
	small: "Most buyers say it runs small. Consider sizing up.",
	true: "Most buyers say it fits true to size.",
	large: "Most buyers say it runs large. Consider sizing down.",
};

/** Size guide in cm, body measurements. */
export const sizeGuide = [
	{ size: "XS", chest: "82–86", waist: "62–66", hip: "88–92" },
	{ size: "S", chest: "87–91", waist: "67–71", hip: "93–97" },
	{ size: "M", chest: "92–97", waist: "72–77", hip: "98–103" },
	{ size: "L", chest: "98–104", waist: "78–85", hip: "104–110" },
	{ size: "XL", chest: "105–112", waist: "86–94", hip: "111–118" },
];

export const SHIPPING = [
	{ id: "standard", label: "Standard", note: "3–5 working days", price: 4.9 },
	{ id: "express", label: "Express", note: "Next working day", price: 9.9 },
	{ id: "pickup", label: "Pickup point", note: "2–4 working days", price: 2.9 },
] as const;
export const FREE_SHIPPING_FROM = 150;
