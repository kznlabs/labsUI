import { demoPath, withBase } from "@/site/config";

export const currency = "EUR";
export const locale = "en-IE";
export const freeShippingFrom = 100;

export const euro = new Intl.NumberFormat(locale, { style: "currency", currency });

/** Root-relative path of a page inside the demo, for the router (it adds the base path). */
export const shopPath = (path = "") => `${demoPath("shop")}${path}`;

/** Href of a page inside the demo, for a plain `<a>`. */
export const shopHref = (path = "") => withBase(shopPath(path));

export const categories = ["Footwear", "Knitwear", "Outerwear", "Bags"] as const;

export type Category = (typeof categories)[number];

export type Photo = { src: string; alt: string };

export type Product = {
	slug: string;
	name: string;
	category: Category;
	tagline: string;
	description: string;
	details: string[];
	price: number;
	/** Price before the reduction, while on sale. */
	was?: number;
	/** Lowest price in the 30 days before the reduction. */
	lowest?: number;
	badge?: string;
	rating: number;
	reviews: number;
	/** What the size picker is called: "Size", "EU size", "Length". */
	sizeLabel: string;
	/** Units left per size; 0 is sold out in that size. */
	stock: Record<string, number>;
	photos: Photo[];
};

const photo = (name: string, alt: string): Photo => ({
	src: withBase(`/recipes/media/shop-${name}.webp`),
	alt,
});

export const products: Product[] = [
	{
		slug: "ridge-leather-boot",
		name: "Ridge Leather Boot",
		category: "Footwear",
		tagline: "Oiled full-grain leather on a stitched rubber sole.",
		description:
			"A lace-up boot for wet streets and dry trails. Oiled full-grain leather that darkens with wear, a padded collar and a Goodyear-welted sole you can have resoled.",
		details: [
			"Oiled full-grain leather upper",
			"Goodyear welt, resoleable",
			"Leather lining, removable cork insole",
			"Fits true to size",
		],
		price: 189,
		badge: "New",
		rating: 4.8,
		reviews: 326,
		sizeLabel: "EU size",
		stock: { 39: 2, 40: 6, 41: 9, 42: 11, 43: 7, 44: 3, 45: 0, 46: 1 },
		photos: [
			photo("ridge-boot-1", "Dark brown leather boots worn with black jeans on a wet road"),
			photo("ridge-boot-2", "Brown lace-up boots hanging in front of a grey metal cabinet"),
		],
	},
	{
		slug: "wheat-work-boot",
		name: "Wheat Work Boot",
		category: "Footwear",
		tagline: "Waterproof nubuck with a lugged sole.",
		description:
			"The six-inch work boot in a warm wheat nubuck. Seam-sealed so puddles stay outside, with a lugged sole that grips on wet leaves and a padded collar for long days.",
		details: [
			"Waterproof nubuck, seam-sealed",
			"Lugged rubber outsole",
			"Padded collar and tongue",
			"Half a size up if you wear thick socks",
		],
		price: 169,
		rating: 4.6,
		reviews: 214,
		sizeLabel: "EU size",
		stock: { 39: 4, 40: 0, 41: 5, 42: 8, 43: 6, 44: 4, 45: 2, 46: 0 },
		photos: [
			photo("wheat-boot-1", "Wheat nubuck work boots on a herringbone brick floor"),
			photo("wheat-boot-2", "A pair of wheat work boots on a wooden deck under a pale sky"),
		],
	},
	{
		slug: "merino-rib-beanie",
		name: "Merino Rib Beanie",
		category: "Knitwear",
		tagline: "Soft merino rib in three autumn colours.",
		description:
			"A close rib beanie knitted from extra-fine merino. Warm without the itch, with a deep turn-up you can wear high or low.",
		details: [
			"100% extra-fine merino wool",
			"Rust, mustard or charcoal",
			"Double-layer turn-up",
			"Hand wash cold, dry flat",
		],
		price: 29,
		rating: 4.9,
		reviews: 512,
		sizeLabel: "Size",
		stock: { "S/M": 24, "L/XL": 15 },
		photos: [
			photo("rib-beanie-1", "Woman in a rust beanie and denim jacket sitting on railway tracks"),
			photo("rib-beanie-2", "Hiker in a mustard beanie and brown jacket in an autumn forest"),
			photo("rib-beanie-3", "Man in a charcoal beanie in a dark forest"),
		],
	},
	{
		slug: "tartan-flannel-shirt",
		name: "Tartan Flannel Shirt",
		category: "Outerwear",
		tagline: "Brushed cotton flannel, worn open or buttoned.",
		description:
			"A heavyweight flannel in a red and cream tartan, brushed on both sides for a soft hand. Two chest pockets and a back yoke cut on the bias.",
		details: [
			"100% cotton flannel, 220 gsm",
			"Brushed inside and out",
			"Two button-flap chest pockets",
			"Regular fit; size up to layer",
		],
		price: 49,
		was: 69,
		lowest: 69,
		rating: 4.7,
		reviews: 188,
		sizeLabel: "Size",
		stock: { XS: 3, S: 8, M: 0, L: 6, XL: 4 },
		photos: [
			photo(
				"tartan-shirt-1",
				"Close-up of a red and cream tartan flannel shirt with a chest pocket",
			),
			photo("tartan-shirt-2", "Woman holding a tartan flannel shirt open in front of a waterfall"),
		],
	},
	{
		slug: "chunky-knit-scarf",
		name: "Chunky Knit Scarf",
		category: "Knitwear",
		tagline: "A long, loose knit in wool and alpaca.",
		description:
			"Knitted loose and long so it wraps twice. Wool and alpaca for warmth with almost no weight, finished with a short fringe.",
		details: [
			"70% wool, 30% alpaca",
			"Regular 180 cm or long 220 cm",
			"Grey melange, moss or lime",
			"Hand wash cold",
		],
		price: 45,
		rating: 4.8,
		reviews: 97,
		sizeLabel: "Length",
		stock: { "180 cm": 12, "220 cm": 5 },
		photos: [
			photo("chunky-scarf-1", "Man in a grey chunky scarf and bobble hat against a yellow wall"),
			photo("chunky-scarf-2", "Man in a green chunky scarf and beanie on a city street at night"),
			photo("chunky-scarf-3", "Folded knit scarves in grey, lime and white on a wooden table"),
		],
	},
	{
		slug: "leather-messenger-bag",
		name: "Leather Messenger Bag",
		category: "Bags",
		tagline: "Vegetable-tanned leather with brass buckles.",
		description:
			"A messenger in vegetable-tanned leather that picks up a patina from the first week. A padded laptop sleeve, two front pockets and an adjustable shoulder strap.",
		details: [
			"Vegetable-tanned cowhide",
			"Padded sleeve for a 13 or 15 inch laptop",
			"Solid brass buckles",
			"Adjustable strap, 90 to 140 cm",
		],
		price: 159,
		rating: 4.7,
		reviews: 143,
		sizeLabel: "Laptop size",
		stock: { "13 in": 6, "15 in": 3 },
		photos: [
			photo("messenger-bag-1", "Tan leather messenger bag with two buckles on a stone block"),
		],
	},
	{
		slug: "cable-knit-sweater",
		name: "Cable Knit Sweater",
		category: "Knitwear",
		tagline: "A classic cable in lambswool, rust or cream.",
		description:
			"A crew-neck sweater with a deep cable down the front, knitted from soft lambswool. Ribbed cuffs and hem keep its shape through years of winters.",
		details: [
			"100% lambswool",
			"Rust or cream",
			"Relaxed fit through the body",
			"Hand wash cold, dry flat",
		],
		price: 89,
		badge: "Bestseller",
		rating: 4.9,
		reviews: 407,
		sizeLabel: "Size",
		stock: { XS: 2, S: 7, M: 12, L: 9, XL: 0 },
		photos: [
			photo("cable-sweater-1", "Close-up of a rust cable knit sweater"),
			photo("cable-sweater-2", "Cream knit sweater worn with jeans, seen from above"),
		],
	},
	{
		slug: "storm-rain-shell",
		name: "Storm Rain Shell",
		category: "Outerwear",
		tagline: "A bright, packable shell with taped seams.",
		description:
			"A three-layer rain shell in signal yellow, so you are seen on dark mornings. Fully taped seams, a peaked hood and pit zips for the climb.",
		details: [
			"Three-layer waterproof fabric",
			"Fully taped seams",
			"Adjustable peaked hood",
			"Packs into its own pocket",
		],
		price: 129,
		rating: 4.6,
		reviews: 76,
		sizeLabel: "Size",
		stock: { XS: 0, S: 0, M: 0, L: 0, XL: 0 },
		photos: [photo("rain-shell-1", "Person in a yellow rain shell looking down at a winding road")],
	},
	{
		slug: "wool-trail-socks",
		name: "Wool Trail Socks",
		category: "Knitwear",
		tagline: "Cushioned merino for long days in boots.",
		description:
			"A mid-weight hiking sock in a merino blend, cushioned under the heel and toe. Stripes because socks should be fun.",
		details: [
			"60% merino, 38% nylon, 2% elastane",
			"Cushioned heel and toe",
			"Seamless toe",
			"Machine wash at 30 °C",
		],
		price: 18,
		rating: 4.8,
		reviews: 655,
		sizeLabel: "EU size",
		stock: { "36–39": 18, "40–43": 25, "44–47": 11 },
		photos: [photo("wool-socks-1", "Striped wool socks on a sunlit wooden floor")],
	},
];

export const bySlug = (slug: string) => products.find((product) => product.slug === slug);

export const soldOut = (product: Product) =>
	Object.values(product.stock).every((left) => left === 0);

export const shipping = [
	{
		id: "locker",
		name: "Parcel locker",
		description: "1–2 working days, to a locker near you.",
		price: 2.9,
	},
	{
		id: "standard",
		name: "Standard delivery",
		description: `2–4 working days. Free over ${euro.format(freeShippingFrom)}.`,
		price: 4.9,
	},
	{
		id: "express",
		name: "Express",
		description: "Next working day if ordered by 14:00.",
		price: 12.9,
	},
] as const;

export type ShippingId = (typeof shipping)[number]["id"];

export function shippingPrice(id: ShippingId, subtotal: number) {
	if (id === "standard" && subtotal >= freeShippingFrom) return 0;

	return shipping.find((option) => option.id === id)?.price ?? 0;
}

/** Every photo is CC0 1.0 from StockSnap, found through Openverse. */
export const credits = [
	{
		file: "ridge-boot-1",
		creator: "Elliott Chau",
		source: "https://stocksnap.io/photo/winter-cold-S9PCRT7BCO",
	},
	{
		file: "ridge-boot-2",
		creator: "Rosan Harmens",
		source: "https://stocksnap.io/photo/shoes-boots-UTSNXEYBGR",
	},
	{
		file: "wheat-boot-1",
		creator: "Daria Nepriakhina",
		source: "https://stocksnap.io/photo/shoes-boots-8MFMFJDSZT",
	},
	{
		file: "wheat-boot-2",
		creator: "Olu Eletu",
		source: "https://stocksnap.io/photo/bluesky-boots-IO0UJ7FYCA",
	},
	{
		file: "rib-beanie-1",
		creator: "Elliott Chau",
		source: "https://stocksnap.io/photo/sitting-train-43NDVUBY6M",
	},
	{
		file: "rib-beanie-2",
		creator: "Chad Madden",
		source: "https://stocksnap.io/photo/backpack-people-KKOSK85WCR",
	},
	{
		file: "rib-beanie-3",
		creator: "Forrest Cavale",
		source: "https://stocksnap.io/photo/guy-man-AE44BFC757",
	},
	{
		file: "tartan-shirt-1",
		creator: "Daria Nepriakhina",
		source: "https://stocksnap.io/photo/plaid-shirt-381E9A13D0",
	},
	{
		file: "tartan-shirt-2",
		creator: "Greg Raines",
		source: "https://stocksnap.io/photo/girl-woman-UQ7PG8OVBU",
	},
	{
		file: "chunky-scarf-1",
		creator: "Clem Onojeghuo",
		source: "https://stocksnap.io/photo/beanie-scarf-M2U9VL0ZWG",
	},
	{
		file: "chunky-scarf-2",
		creator: "Clem Onojeghuo",
		source: "https://stocksnap.io/photo/beanie-scarf-IAAVICHVMT",
	},
	{
		file: "chunky-scarf-3",
		creator: "Kelly Sikkema",
		source: "https://stocksnap.io/photo/blanket-scarf-LQZSN13S95",
	},
	{
		file: "messenger-bag-1",
		creator: "Álvaro Serrano",
		source: "https://stocksnap.io/photo/bag-leather-DQCQ6W96UC",
	},
	{
		file: "cable-sweater-1",
		creator: "Valeria Boltneva",
		source: "https://stocksnap.io/photo/clothing-jacket-7FNKYQP438",
	},
	{
		file: "cable-sweater-2",
		creator: "Kasia Serbin",
		source: "https://stocksnap.io/photo/clothes-fashion-8H1NE3XL3Q",
	},
	{
		file: "rain-shell-1",
		creator: "Justin Luebke",
		source: "https://stocksnap.io/photo/yellow-jacket-C6J16TFD75",
	},
	{
		file: "wool-socks-1",
		creator: "Snufkin",
		source: "https://stocksnap.io/photo/socks-footwear-TFRHSVS7NL",
	},
];
