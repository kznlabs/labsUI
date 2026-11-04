"use client";

import { useState } from "react";
import { ComparisonTable } from "@/components/blocks/comparison-table";
import { Badge } from "@/components/ui/badge";

const many = ["a", "b", "c", "d", "e", "f", "g", "h"].map((id) => ({
	id,
	name: `Item ${id.toUpperCase()}`,
	details: `$${id.charCodeAt(0)}`,
}));

const manyValues = (make: (id: string) => string | boolean) =>
	Object.fromEntries(many.map((item) => [item.id, make(item.id)]));

const manyGroups = [
	{
		label: "Mixed",
		rows: [
			{ label: "Differs everywhere", values: manyValues((id) => `Value ${id}`) },
			{ label: "Same text", values: manyValues(() => "Equal") },
			{ label: "Differs after two", values: manyValues((id) => "ab".includes(id)) },
			{
				label: "Own node",
				values: { a: <Badge>Same</Badge>, b: <Badge>Same</Badge> },
			},
			{
				label: "Own node, same",
				differs: false,
				values: { a: <Badge>Same</Badge>, b: <Badge>Same</Badge> },
			},
		],
	},
	{
		label: "All the same",
		rows: [{ label: "Same check", values: manyValues(() => true) }],
	},
	{
		label: "Long",
		rows: Array.from({ length: 40 }, (_, index) => ({
			label: `Long row ${index}`,
			values: manyValues((id) => `${id}${index}`),
		})),
	},
];

const pair = [
	{ id: "left", name: "Left" },
	{ id: "right", name: "Right" },
];

const pairGroups = [
	{
		label: "Pair",
		rows: [
			{ label: "Check", values: { left: true, right: false } },
			{ label: "Left out", values: { left: "There" } },
		],
	},
];

const sameGroups = [{ label: "Same", rows: [{ label: "Equal", values: { left: 1, right: 1 } }] }];

function Controlled() {
	const [only, setOnly] = useState(true);

	return (
		<section data-probe="compare-controlled">
			<output>{only ? "on" : "off"}</output>

			<ComparisonTable
				label="Controlled"
				items={pair}
				groups={pairGroups}
				differencesOnly={only}
				onDifferencesOnlyChange={setOnly}
			/>
		</section>
	);
}

export default function ComparePage() {
	return (
		<main className="flex flex-col gap-10 p-4">
			<section data-probe="compare-same">
				<ComparisonTable label="Same" items={pair} groups={sameGroups} defaultDifferencesOnly />
			</section>

			<section data-probe="compare-pair">
				<ComparisonTable
					label="Pair"
					items={pair}
					groups={pairGroups}
					yesLabel="Included"
					noLabel="Not included"
				/>
			</section>

			<Controlled />

			<section data-probe="compare-many">
				<ComparisonTable label="Many" items={many} groups={manyGroups} stickyTop="3rem" />
			</section>

			<div className="h-screen" />
		</main>
	);
}
