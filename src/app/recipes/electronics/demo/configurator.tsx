"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Stepper, StepperFooter, StepperList, StepperStep } from "@/components/ui/stepper";
import { toast } from "@/components/ui/toast";
import { useCart } from "./cart";
import { euro, lowest30, type Product, price, storePath } from "./catalog";
import { Delivery } from "./delivery";
import { Instalments, Sparkline } from "./price";

type OptionList = [Opt, ...Opt[]];

type Opt = { id: string; label: string; note: string; add: number; lead?: number };

const size: OptionList = [
	{ id: "14", label: "14.2 in", note: "1.24 kg, fits a small bag", add: 0 },
	{ id: "16", label: "16 in", note: "1.92 kg, more room for windows", add: 250 },
];
const chip: OptionList = [
	{ id: "oct", label: "Octa-core, 3 nm", note: "4 fast + 4 efficient cores", add: 0 },
	{
		id: "deca",
		label: "Deca-core Pro, 3 nm",
		note: "6 fast + 4 efficient cores, 40 % faster multi-core",
		add: 300,
	},
];
const memory: OptionList = [
	{ id: "16", label: "16 GB", note: "Enough for browsing, office and light editing", add: 0 },
	{ id: "32", label: "32 GB", note: "Built to order, ships a day later", add: 220, lead: 1 },
	{ id: "64", label: "64 GB", note: "Built to order, ships two days later", add: 520, lead: 2 },
];
const storage: OptionList = [
	{ id: "512", label: "512 GB SSD", note: "Ready to ship", add: 0 },
	{ id: "1tb", label: "1 TB SSD", note: "Ready to ship", add: 140 },
	{ id: "2tb", label: "2 TB SSD", note: "Built to order, ships a day later", add: 380, lead: 1 },
];

const choose = (options: OptionList, id: string) =>
	options.find((option) => option.id === id) ?? options[0];

const steps = [
	{ value: "size", title: "Size" },
	{ value: "chip", title: "Chip" },
	{ value: "memory", title: "Memory" },
	{ value: "storage", title: "Storage" },
];

export function Configurator({ product }: { product: Product }) {
	const router = useRouter();
	const { add } = useCart();
	const [sel, setSel] = useState({ size: "14", chip: "oct", memory: "16", storage: "512" });
	const pick = (field: keyof typeof sel) => (value: string) =>
		setSel((current) => ({ ...current, [field]: value }));

	const rows = [
		["Size", choose(size, sel.size)],
		["Chip", choose(chip, sel.chip)],
		["Memory", choose(memory, sel.memory)],
		["Storage", choose(storage, sel.storage)],
	] as const;
	const total = price(product) + rows.reduce((sum, [, option]) => sum + option.add, 0);
	const lead = rows.reduce((sum, [, option]) => sum + (option.lead ?? 0), 0);
	const details = rows.map(([, option]) => option.label).join(" · ");

	const group = (legend: string, key: keyof typeof sel, options: OptionList) => (
		<RadioGroup
			legend={legend}
			variant="card"
			value={sel[key]}
			onValueChange={pick(key)}
			name={key}
			className="mt-2"
		>
			{options.map((option) => (
				<RadioGroupItem
					key={option.id}
					value={option.id}
					description={option.note}
					end={option.add ? `+ ${euro(option.add)}` : "Included"}
				>
					{option.label}
				</RadioGroupItem>
			))}
		</RadioGroup>
	);

	return (
		<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
			<Stepper
				steps={steps}
				onSubmit={(event) => {
					event.preventDefault();
					add({
						key: `${product.slug}:${Object.values(sel).join(":")}`,
						slug: product.slug,
						name: product.name,
						image: product.image,
						unitPrice: total,
						details,
					});
					toast("Configured laptop added to cart");
					router.push(storePath("/cart"));
				}}
			>
				<StepperList />

				<StepperStep value="size">
					<h2 className="text-lg font-semibold">How big should the screen be?</h2>

					{group("Screen size", "size", size)}
				</StepperStep>

				<StepperStep value="chip">
					<h2 className="text-lg font-semibold">How much processing power do you need?</h2>

					{group("Chip", "chip", chip)}
				</StepperStep>

				<StepperStep value="memory">
					<h2 className="text-lg font-semibold">How much memory for running things at once?</h2>

					{group("Memory", "memory", memory)}
				</StepperStep>

				<StepperStep value="storage">
					<h2 className="text-lg font-semibold">How much room for your files?</h2>

					{group("Storage", "storage", storage)}
				</StepperStep>

				<StepperFooter submitLabel="Add to cart" />
			</Stepper>

			<aside
				aria-label="Your configuration"
				className="h-fit space-y-3 rounded-xl border p-3 lg:sticky lg:top-28"
			>
				<h2 className="text-base font-semibold">{product.name}</h2>

				<dl className="divide-y text-sm">
					{rows.map(([label, option]) => (
						<div key={label} className="flex justify-between gap-3 py-1.5">
							<dt className="text-muted-foreground">{label}</dt>

							<dd className="text-right">
								<span className="font-medium">{option.label}</span>

								{option.add > 0 && (
									<span className="block text-xs text-muted-foreground tabular-nums">
										+ {euro(option.add)}
									</span>
								)}
							</dd>
						</div>
					))}
				</dl>

				<div>
					<p className="text-3xl font-semibold tracking-tight tabular-nums" aria-live="polite">
						{euro(total)}
					</p>

					<Instalments amount={total} />
				</div>

				<Delivery extraDays={lead} />

				<div className="flex items-center gap-2 border-t pt-2">
					<Sparkline data={product.history} />

					<p className="text-xs leading-snug text-muted-foreground">
						Base model (14.2 in, 16 GB, 512 GB), lowest in the last 30 days:{" "}
						<span className="font-medium text-foreground tabular-nums">
							{euro(lowest30(product))}
						</span>
						. Upgrades are priced separately, so no discount is shown on a configuration.
					</p>
				</div>
			</aside>
		</div>
	);
}
