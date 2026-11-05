// The page the CLI run ends on: copied into the fresh app, each tile one file it just added.
"use client";

import { type ReactNode, useState } from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Rating } from "@/components/ui/rating";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";

const cities = [
	{ value: "warsaw", label: "Warsaw" },
	{ value: "lisbon", label: "Lisbon" },
	{ value: "tokyo", label: "Tokyo" },
];

function Tile({ file, children }: { file: string; children: ReactNode }) {
	return (
		<section className="flex min-w-0 flex-col gap-3 rounded-2xl border bg-card p-4">
			<h2 className="font-mono text-muted-foreground text-xs">{file}</h2>

			{children}
		</section>
	);
}

export default function Home() {
	const [city, setCity] = useState("warsaw");
	const [stars, setStars] = useState(2);

	return (
		<main className="grid min-h-dvh auto-rows-[11.5rem] grid-cols-3 content-center gap-3 bg-background p-4 text-foreground">
			<Tile file="tabs.tsx">
				<Tabs defaultValue="code">
					<TabsList aria-label="View">
						<TabsTrigger value="code">Code</TabsTrigger>

						<TabsTrigger value="preview">Preview</TabsTrigger>
					</TabsList>

					<TabsContent className="pt-3 text-sm" value="code">
						Yours to edit.
					</TabsContent>

					<TabsContent className="pt-3 text-sm" value="preview">
						Springs between tabs.
					</TabsContent>
				</Tabs>
			</Tile>

			<Tile file="select.tsx">
				<Select aria-label="City" onValueChange={setCity} options={cities} value={city} />
			</Tile>

			<Tile file="accordion.tsx">
				<Accordion type="single">
					<AccordionItem value="keys">
						<AccordionTrigger>Keyboard</AccordionTrigger>

						<AccordionContent>Arrows, Home, End.</AccordionContent>
					</AccordionItem>

					<AccordionItem value="motion">
						<AccordionTrigger>Motion</AccordionTrigger>

						<AccordionContent>One spring.</AccordionContent>
					</AccordionItem>
				</Accordion>
			</Tile>

			<Tile file="switch.tsx">
				<div className="flex items-center justify-between gap-3">
					<Label htmlFor="updates">Updates</Label>

					<Switch id="updates" />
				</div>
			</Tile>

			<Tile file="rating.tsx">
				<Rating label="Rating" onValueChange={setStars} value={stars} />
			</Tile>

			<Tile file="toast.tsx">
				<Button
					onClick={() =>
						toast.success("Saved", {
							action: { label: "Undo", onClick: () => toast("Change undone") },
						})
					}
				>
					Save
				</Button>
			</Tile>
		</main>
	);
}
