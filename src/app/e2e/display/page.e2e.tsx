"use client";

import { Home, Settings } from "lucide-react";
import { useState } from "react";
import { Newsletter } from "@/components/blocks/newsletter";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { CodePanel } from "@/components/ui/code";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { CountTo } from "@/components/ui/count-to";
import { DataTable } from "@/components/ui/data-table";
import { HoverCard } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { SearchInput } from "@/components/ui/search-input";
import { Sidebar, SidebarLayout } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal } from "@/components/ui/terminal";
import { Typewriter } from "@/components/ui/typewriter";

const people = Array.from({ length: 14 }, (_, i) => ({
	id: String(i + 1),
	name: i === 0 ? "Ada" : i === 12 ? "Bob" : `Member ${i + 1}`,
}));

export default function DisplayProbe() {
	const [query, setQuery] = useState("");
	const [lines, setLines] = useState(
		Array.from({ length: 30 }, (_, i) => ({
			id: String(i),
			kind: "output" as const,
			text: `line ${i}`,
		})),
	);

	return (
		<SidebarLayout>
			<Sidebar
				label="Probe"
				groups={[
					{
						label: "Pages",
						items: [
							{ label: "Home", href: "#home", icon: <Home /> },
							{ label: "Settings", href: "#settings", icon: <Settings /> },
						],
					},
				]}
			/>

			<main className="grid min-w-0 flex-1 gap-6 p-4">
				<h1>Display probes</h1>

				<Accordion type="single" collapsible>
					<AccordionItem value="a">
						<AccordionTrigger>Accordion question</AccordionTrigger>

						<AccordionContent>Accordion closed answer</AccordionContent>
					</AccordionItem>
				</Accordion>

				<Collapsible>
					<CollapsibleTrigger>More</CollapsibleTrigger>

					<CollapsibleContent>Collapsible closed content</CollapsibleContent>
				</Collapsible>

				<Tabs defaultValue="a">
					<TabsList aria-label="Views">
						<TabsTrigger value="a">First</TabsTrigger>

						<TabsTrigger value="b">Second</TabsTrigger>
					</TabsList>

					<TabsContent value="a">First panel</TabsContent>

					<TabsContent value="b">Inactive tab panel</TabsContent>
				</Tabs>

				<CodePanel
					files={[
						{ name: "first.ts", code: "export const first = 1;" },
						{ name: "second.ts", code: "export const hiddenSecondFile = 2;" },
					]}
				/>

				<NavigationMenu aria-label="Main">
					<NavigationMenuList>
						<NavigationMenuItem>
							<NavigationMenuTrigger>Products</NavigationMenuTrigger>

							<NavigationMenuContent className="w-80">
								<NavigationMenuLink href="#bot" title="Closed panel link" description="Bot" />
							</NavigationMenuContent>
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>

				<Typewriter text={["Typewriter full sentence"]} />

				<CountTo to={48290} />

				<Terminal typing lines={[{ kind: "command", text: "bun add typed-later" }]} />

				<SearchInput value={query} onValueChange={setQuery} shortcut="/" label="Quick find" />

				<Input aria-label="Notes field" />

				<InputGroup>
					<InputGroupAddon>https://</InputGroupAddon>

					<Input aria-label="Site" />
				</InputGroup>

				<DataTable
					label="People"
					data={people}
					columns={[{ id: "name", header: "Name", accessor: (person) => person.name }]}
					getRowId={(person) => person.id}
					rowLabel={(person) => person.name}
					pageSize={10}
					searchable
					selectable
					toolbar={(selected) => <span>{selected.length} selected</span>}
				/>

				<button
					type="button"
					onClick={() =>
						setLines((list) => [
							...list,
							{ id: String(list.length), kind: "output", text: "newest line" },
						])
					}
				>
					Append line
				</button>

				<Terminal log lines={lines} bodyClassName="h-32" />

				<Newsletter
					onSubscribe={async () => {
						throw new Error("That address is already subscribed");
					}}
				/>

				<ContextMenu>
					<ContextMenuTrigger aria-label="Clip">Clip area</ContextMenuTrigger>

					<ContextMenuContent>
						<ContextMenuItem>Play</ContextMenuItem>
					</ContextMenuContent>
				</ContextMenu>

				<HoverCard content={<p>Card preview</p>}>
					<a href="#jane">@jane</a>
				</HoverCard>
			</main>
		</SidebarLayout>
	);
}
