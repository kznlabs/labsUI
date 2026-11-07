import type { LucideIcon } from "lucide-react";
import {
	Bird,
	Cat,
	Crown,
	Drama,
	Feather,
	Flame,
	Ghost,
	HardHat,
	Leaf,
	Music,
	PartyPopper,
	Rabbit,
	Snowflake,
	Sparkles,
	Squirrel,
} from "lucide-react";

export const currency = "EUR";
export const locale = "en-IE";

export const euro = new Intl.NumberFormat(locale, { style: "currency", currency });

export const categories = ["Trails", "Pets", "Hats", "Emotes"] as const;

export type Category = (typeof categories)[number];

/** Preview tile per rarity: a tint and the icon's colour. */
export const rarities = {
	Common: "bg-muted text-muted-foreground",
	Rare: "bg-chart-1/15 text-chart-1",
	Epic: "bg-chart-7/15 text-chart-7",
	Legendary: "bg-chart-4/20 text-chart-4",
} as const;

export type Rarity = keyof typeof rarities;

export type Cosmetic = {
	id: string;
	name: string;
	category: Category;
	rarity: Rarity;
	price: number;
	/** Price before the reduction, while on sale. */
	was?: number;
	/** Lowest price in the 30 days before the reduction. */
	lowest?: number;
	badge?: string;
	rating: number;
	reviews: number;
	icon: LucideIcon;
	soldOut?: boolean;
};

export const cosmetics: Cosmetic[] = [
	{
		id: "ember-trail",
		name: "Ember Trail",
		category: "Trails",
		rarity: "Epic",
		price: 4.99,
		badge: "New",
		rating: 4.8,
		reviews: 212,
		icon: Flame,
	},
	{
		id: "frostbite-trail",
		name: "Frostbite Trail",
		category: "Trails",
		rarity: "Rare",
		price: 4.99,
		rating: 4.6,
		reviews: 143,
		icon: Snowflake,
	},
	{
		id: "stardust-trail",
		name: "Stardust Trail",
		category: "Trails",
		rarity: "Legendary",
		price: 6.49,
		was: 8.99,
		lowest: 8.99,
		rating: 4.9,
		reviews: 318,
		icon: Sparkles,
	},
	{
		id: "falling-leaves",
		name: "Falling Leaves",
		category: "Trails",
		rarity: "Common",
		price: 2.49,
		rating: 4.3,
		reviews: 87,
		icon: Leaf,
	},
	{
		id: "ash-fox",
		name: "Ash Fox",
		category: "Pets",
		rarity: "Epic",
		price: 7.99,
		rating: 4.7,
		reviews: 187,
		icon: Cat,
	},
	{
		id: "lantern-owl",
		name: "Lantern Owl",
		category: "Pets",
		rarity: "Rare",
		price: 7.99,
		rating: 4.5,
		reviews: 96,
		icon: Bird,
	},
	{
		id: "moss-hare",
		name: "Moss Hare",
		category: "Pets",
		rarity: "Common",
		price: 4.49,
		rating: 4.4,
		reviews: 71,
		icon: Rabbit,
	},
	{
		id: "acorn-squirrel",
		name: "Acorn Squirrel",
		category: "Pets",
		rarity: "Legendary",
		price: 9.99,
		rating: 4.9,
		reviews: 58,
		icon: Squirrel,
		soldOut: true,
	},
	{
		id: "sunken-crown",
		name: "Sunken Crown",
		category: "Hats",
		rarity: "Legendary",
		price: 5.49,
		rating: 4.6,
		reviews: 120,
		icon: Crown,
	},
	{
		id: "miners-helmet",
		name: "Miner's Helmet",
		category: "Hats",
		rarity: "Common",
		price: 3.99,
		rating: 4.3,
		reviews: 77,
		icon: HardHat,
	},
	{
		id: "ghost-sheet",
		name: "Ghost Sheet",
		category: "Hats",
		rarity: "Rare",
		price: 3.49,
		was: 4.49,
		lowest: 4.49,
		rating: 4.7,
		reviews: 164,
		icon: Ghost,
	},
	{
		id: "plumed-cap",
		name: "Plumed Cap",
		category: "Hats",
		rarity: "Epic",
		price: 4.99,
		badge: "New",
		rating: 4.5,
		reviews: 39,
		icon: Feather,
	},
	{
		id: "confetti-burst",
		name: "Confetti Burst",
		category: "Emotes",
		rarity: "Rare",
		price: 2.99,
		rating: 4.5,
		reviews: 301,
		icon: PartyPopper,
	},
	{
		id: "campfire-dance",
		name: "Campfire Dance",
		category: "Emotes",
		rarity: "Epic",
		price: 3.49,
		rating: 4.8,
		reviews: 245,
		icon: Music,
	},
	{
		id: "curtain-call",
		name: "Curtain Call",
		category: "Emotes",
		rarity: "Legendary",
		price: 4.99,
		rating: 4.9,
		reviews: 133,
		icon: Drama,
	},
];

export const periods = [
	{ value: "30", label: "30 days", priceNote: "for 30 days" },
	{ value: "90", label: "90 days", note: "Save 15%", priceNote: "for 90 days" },
	{ value: "forever", label: "Forever", priceNote: "one payment" },
] as const;

export type Period = (typeof periods)[number]["value"];

export const periodLabel = (period: Period) =>
	periods.find((option) => option.value === period)?.label ?? period;

export type Rank = {
	id: string;
	name: string;
	description: string;
	price: Record<Period, number>;
	compareAt?: Partial<Record<Period, number>>;
	lowestPrice?: Partial<Record<Period, number>>;
	features: string[];
	featured?: boolean;
	badge?: string;
};

export const ranks: Rank[] = [
	{
		id: "squire",
		name: "Squire",
		description: "A first step up from the crowd.",
		price: { 30: 4.99, 90: 12.99, forever: 29.99 },
		features: ["Coloured name in chat", "2 home points", "Join when the server is full"],
	},
	{
		id: "knight",
		name: "Knight",
		description: "What most regulars pick.",
		price: { 30: 9.99, 90: 24.99, forever: 59.99 },
		compareAt: { forever: 79.99 },
		lowestPrice: { forever: 79.99 },
		features: [
			"Everything in Squire",
			"5 home points",
			"A cosmetic crate every month",
			"Priority support",
		],
		featured: true,
		badge: "Popular",
	},
	{
		id: "warden",
		name: "Warden",
		description: "Every perk the server offers.",
		price: { 30: 17.99, 90: 44.99, forever: 109.99 },
		features: [
			"Everything in Knight",
			"10 home points",
			"Custom join message",
			"Early access to events",
		],
	},
];

export const payments = [
	{ value: "card", label: "Card", description: "Debit or credit, confirmed at once." },
	{ value: "wallet", label: "Online wallet", description: "Pay from your wallet balance." },
	{ value: "transfer", label: "SEPA transfer", description: "Delivered when it clears, 1-2 days." },
	{ value: "voucher", label: "Prepaid voucher", description: "A 16-digit code from a shop." },
] as const;

export type Payment = (typeof payments)[number]["value"];

export const server = {
	name: "Emberfall",
	address: "play.emberfall.example",
	version: "1.21.4",
	region: "Frankfurt",
	players: 142,
	maxPlayers: 200,
	ping: 38,
	uptime: "12 days",
};

export const goal = {
	title: "A new survival world",
	description: "When the server's running costs are covered for the season, everyone gets these.",
	raised: 3420,
	target: 5000,
	backers: 268,
	endsIn: "18 days",
	milestones: [
		{ at: 1000, label: "Event crate for every player" },
		{ at: 2500, label: "New spawn city" },
		{ at: 4000, label: "Double-XP weekend" },
		{ at: 5000, label: "A fresh survival world" },
	],
};

export type Buyer = { name: string; purchases: number; total: number };

export const topBuyers: Record<"month" | "all", Buyer[]> = {
	month: [
		{ name: "NovaBlade", purchases: 9, total: 184.9 },
		{ name: "PixelWitch", purchases: 7, total: 152.5 },
		{ name: "Ironroot", purchases: 3, total: 139.97 },
		{ name: "Mossy_Crab", purchases: 11, total: 96.45 },
		{ name: "ZeroGravity", purchases: 4, total: 88 },
	],
	all: [
		{ name: "Ironroot", purchases: 41, total: 1204.6 },
		{ name: "NovaBlade", purchases: 58, total: 986.3 },
		{ name: "Quillfeather", purchases: 37, total: 742.15 },
		{ name: "PixelWitch", purchases: 49, total: 701.8 },
		{ name: "Tallowmere", purchases: 22, total: 655 },
	],
};

/** Names the nickname check knows, with when they last played. */
export const players: Record<string, string> = {
	novablade: "online now",
	pixelwitch: "last seen 2 hours ago",
	ironroot: "online now",
	mossy_crab: "last seen yesterday",
	zerogravity: "last seen 3 days ago",
	quillfeather: "online now",
	tallowmere: "last seen 5 hours ago",
	oakenshield_7: "last seen 1 hour ago",
	brindle: "online now",
};

export type Purchase = { id: string; player: string; item: string; ago: string };

export const recentPurchases: Purchase[] = [
	{ id: "p1", player: "Brindle", item: "Knight · 90 days", ago: "2 min ago" },
	{ id: "p2", player: "Mossy_Crab", item: "Campfire Dance", ago: "9 min ago" },
	{ id: "p3", player: "Oakenshield_7", item: "Lantern Owl", ago: "21 min ago" },
	{ id: "p4", player: "PixelWitch", item: "Stardust Trail", ago: "48 min ago" },
	{ id: "p5", player: "Quillfeather", item: "Warden · Forever", ago: "1 hour ago" },
];
