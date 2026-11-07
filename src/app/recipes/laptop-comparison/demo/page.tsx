import { Truck, Undo2, Wrench } from "lucide-react";
import type { Metadata } from "next";
import { ComparisonTable } from "@/components/blocks/comparison-table";
import { demoPath, site } from "@/site/config";
import { BuyButton } from "./buy-button";

const description =
	"A reference build of the product comparison recipe: four laptops, feature by feature, in groups.";
const url = `${site.url}${demoPath("laptop-comparison")}`;

export const metadata: Metadata = {
	title: "Product comparison demo",
	description,
	alternates: { canonical: url },
	openGraph: { url, title: `Product comparison demo · ${site.name}`, description },
};

const euro = new Intl.NumberFormat("en-IE", {
	style: "currency",
	currency: "EUR",
	maximumFractionDigits: 0,
});

const laptops = [
	{ id: "lumen", name: "Lumen 13", price: 899, monthly: 38, badge: "New" },
	{ id: "harbor", name: "Harbor 15", price: 1399, monthly: 59, badge: "Popular", featured: true },
	{ id: "forge", name: "Forge 16", price: 1899, monthly: 80 },
	{ id: "drift", name: "Drift 14", price: 1099, was: 1249, monthly: 46 },
];

const items = laptops.map((laptop) => ({
	id: laptop.id,
	name: laptop.name,
	badge: laptop.badge,
	featured: laptop.featured,
	details: (
		<span className="flex flex-col gap-0.5">
			<span className="flex flex-wrap items-baseline gap-x-1.5">
				<span className="font-semibold text-base text-foreground tabular-nums">
					{euro.format(laptop.price)}
				</span>

				{laptop.was && (
					<s className="text-muted-foreground text-xs tabular-nums">
						<span className="sr-only">was </span>

						{euro.format(laptop.was)}
					</s>
				)}
			</span>

			<span className="text-muted-foreground text-xs tabular-nums">
				or {euro.format(laptop.monthly)}/mo for 24 months
			</span>
		</span>
	),
	action: <BuyButton name={laptop.name} featured={laptop.featured} />,
}));

const groups = [
	{
		label: "Display",
		rows: [
			{
				label: "Size",
				values: { lumen: "13.3 in", harbor: "15.6 in", forge: "16 in", drift: "14 in" },
			},
			{
				label: "Resolution",
				values: {
					lumen: "1920 × 1200",
					harbor: "2880 × 1620",
					forge: "3200 × 2000",
					drift: "2560 × 1600",
				},
			},
			{ label: "Panel", values: { lumen: "IPS", harbor: "OLED", forge: "Mini-LED", drift: "IPS" } },
			{
				label: "Brightness",
				values: { lumen: "400 nits", harbor: "500 nits", forge: "1000 nits", drift: "500 nits" },
			},
			{
				label: "Refresh rate",
				values: { lumen: "60 Hz", harbor: "120 Hz", forge: "165 Hz", drift: "120 Hz" },
			},
			{
				label: "Touch screen",
				values: { lumen: false, harbor: true, forge: false, drift: true },
			},
		],
	},
	{
		label: "Performance",
		rows: [
			{
				label: "Processor",
				values: {
					lumen: "6-core, 3.8 GHz",
					harbor: "8-core, 4.4 GHz",
					forge: "14-core, 5.1 GHz",
					drift: "8-core, 4.4 GHz",
				},
			},
			{
				label: "Memory",
				values: { lumen: "8 GB", harbor: "16 GB", forge: "32 GB", drift: "16 GB" },
			},
			{
				label: "Storage",
				values: { lumen: "256 GB", harbor: "512 GB", forge: "1 TB", drift: "512 GB" },
			},
			{
				label: "Graphics",
				values: {
					lumen: "Integrated",
					harbor: "Integrated",
					forge: "Dedicated, 8 GB",
					drift: "Integrated",
				},
			},
			{
				label: "Fans",
				values: { lumen: "None, silent", harbor: "One", forge: "Two", drift: "One" },
			},
		],
	},
	{
		label: "Battery & build",
		rows: [
			{
				label: "Battery life",
				values: {
					lumen: "Up to 14 h",
					harbor: "Up to 11 h",
					forge: "Up to 7 h",
					drift: "Up to 13 h",
				},
			},
			{
				label: "Fast charging",
				values: { lumen: false, harbor: true, forge: true, drift: true },
			},
			{
				label: "Weight",
				values: { lumen: "1.2 kg", harbor: "1.7 kg", forge: "2.3 kg", drift: "1.4 kg" },
			},
			{
				label: "Thickness",
				values: { lumen: "13 mm", harbor: "16 mm", forge: "21 mm", drift: "15 mm" },
			},
			{
				label: "Body",
				values: {
					lumen: "Recycled aluminium",
					harbor: "Aluminium",
					forge: "Magnesium alloy",
					drift: "Aluminium",
				},
			},
			{
				label: "Colours",
				values: {
					lumen: "Sand, Slate, Sage",
					harbor: "Silver, Graphite",
					forge: "Graphite",
					drift: "Silver, Midnight",
				},
			},
		],
	},
	{
		label: "Keyboard & camera",
		rows: [
			{
				label: "Backlit keyboard",
				values: { lumen: true, harbor: true, forge: true, drift: true },
			},
			{
				label: "Number pad",
				values: { lumen: false, harbor: true, forge: true, drift: false },
			},
			{
				label: "Webcam",
				values: { lumen: "1080p", harbor: "1080p", forge: "1440p", drift: "1080p" },
			},
			{
				label: "Fingerprint reader",
				values: { lumen: true, harbor: true, forge: false, drift: true },
			},
		],
	},
	{
		label: "Ports & connectivity",
		rows: [
			{ label: "USB-C", values: { lumen: 2, harbor: 2, forge: 3, drift: 2 } },
			{ label: "USB-A", values: { lumen: 0, harbor: 1, forge: 2, drift: 1 } },
			{ label: "HDMI", values: { lumen: false, harbor: true, forge: true, drift: false } },
			{
				label: "SD card reader",
				values: { lumen: false, harbor: false, forge: true, drift: true },
			},
			{
				label: "Wi-Fi",
				values: { lumen: "Wi-Fi 6", harbor: "Wi-Fi 6E", forge: "Wi-Fi 7", drift: "Wi-Fi 6E" },
			},
		],
	},
	{
		label: "Warranty",
		rows: [
			{
				label: "Included",
				values: { lumen: "2 years", harbor: "2 years", forge: "3 years", drift: "2 years" },
			},
			{
				label: "Accidental damage",
				values: { lumen: false, harbor: false, forge: true, drift: false },
			},
		],
	},
];

const features = groups.flatMap((group) => group.rows).length;

const perks = [
	{ icon: Truck, title: "Free delivery", text: "In 1 to 3 working days" },
	{ icon: Undo2, title: "30-day returns", text: "Free, in the original box" },
	{ icon: Wrench, title: "Repair at home", text: "Pickup and return within a week" },
];

export default function LaptopComparisonDemo() {
	return (
		<main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
			<header className="flex max-w-2xl flex-col gap-3">
				<p className="font-medium text-primary-ink text-sm">Laptops</p>

				<h1 className="text-balance font-semibold text-3xl tracking-tight sm:text-4xl">
					Find the laptop that fits how you work
				</h1>

				<p className="text-pretty text-muted-foreground leading-relaxed">
					Four models side by side, {features} features in {groups.length} groups. Turn on
					“Differences only” to hide what they share. Prices include VAT.
				</p>
			</header>

			<ComparisonTable
				label="Laptops compared"
				columnLabel="Laptop"
				items={items}
				groups={groups}
				stickyTop="3rem"
			/>

			<ul className="grid gap-3 sm:grid-cols-3">
				{perks.map((perk) => (
					<li key={perk.title} className="flex items-start gap-3 rounded-xl border bg-card p-4">
						<perk.icon
							aria-hidden="true"
							className="mt-0.5 size-5 shrink-0 text-muted-foreground"
						/>

						<div className="flex flex-col gap-0.5">
							<p className="font-medium text-sm">{perk.title}</p>

							<p className="text-muted-foreground text-sm">{perk.text}</p>
						</div>
					</li>
				))}
			</ul>

			<p className="text-muted-foreground text-xs">
				Sample data: these laptops and prices are made up for the demo.
			</p>
		</main>
	);
}
