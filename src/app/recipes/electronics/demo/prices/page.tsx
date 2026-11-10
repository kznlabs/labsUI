import { credits } from "../catalog";

export const metadata = { title: "How we show discounts · Electronics demo" };

export default function Prices() {
	return (
		<div className="max-w-2xl space-y-3 text-sm">
			<h1 className="text-2xl font-semibold tracking-tight">How we show discounts</h1>

			<p>
				Every product shows a chart of its daily price for the last 30 days and the lowest price in
				that window.
			</p>

			<p>
				A reduction (“−8 %”) appears only when today’s price is below the lowest price of the 29
				days before today, and the percentage is measured against that price, not against a list
				price or a price that was raised for a few days.
			</p>

			<p>
				Configured laptops show no discount: upgrades are priced separately, so there is no single
				earlier price to compare with.
			</p>

			<p>
				All data in this store is sample data, and the Omnibus rule wording here is a design
				pointer, not legal advice.
			</p>

			<h2 className="pt-3 text-lg font-semibold">Photo credits</h2>

			<p>
				Every photo is CC0 1.0 from the WordPress Photo Directory, so no attribution is required.
				They are stand-ins: one photo can stand for several sample products.
			</p>

			<ul className="divide-y rounded-xl border">
				{credits.map((credit) => (
					<li key={credit.file} className="flex justify-between gap-3 p-2">
						<span>{credit.description}</span>

						<code className="font-mono text-muted-foreground text-xs">{credit.file}</code>
					</li>
				))}
			</ul>
		</div>
	);
}
