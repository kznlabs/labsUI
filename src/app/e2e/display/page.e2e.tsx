"use client";

import { Home, Settings } from "lucide-react";
import { useState } from "react";
import { Hero } from "@/components/blocks/hero";
import { Newsletter } from "@/components/blocks/newsletter";
import { SiteFooter } from "@/components/blocks/site-footer";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
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
import { Prose } from "@/components/ui/prose";
import { Quote } from "@/components/ui/quote";
import { SearchInput } from "@/components/ui/search-input";
import { Sidebar, SidebarLayout, SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal } from "@/components/ui/terminal";
import { TextSwap } from "@/components/ui/text-swap";
import { Typewriter } from "@/components/ui/typewriter";

const people = Array.from({ length: 14 }, (_, i) => ({
	id: String(i + 1),
	name: i === 0 ? "Ada" : i === 12 ? "Bob" : `Member ${i + 1}`,
}));

export default function DisplayProbe() {
	const [query, setQuery] = useState("");
	const [footerHref, setFooterHref] = useState("");
	const [picked, setPicked] = useState("");
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
				onSelect={(id, event) => {
					if (id !== "#settings") return;

					event.preventDefault();
					setPicked(id);
				}}
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

				<p data-probe="sidebar-picked">{picked}</p>

				<p className="flex gap-2">
					<Badge variant="destructive">Sale</Badge>

					<Badge variant="success">Online</Badge>
				</p>

				<SidebarTrigger />

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

						<NavigationMenuItem>
							<NavigationMenuTrigger>Guides</NavigationMenuTrigger>

							<NavigationMenuContent className="w-80">
								<NavigationMenuLink href="#bot" title="Install" description="Bot" />

								<NavigationMenuLink href="#bot" title="Theming" description="Bot" />

								<NavigationMenuLink href="#bot" title="Motion" description="Bot" />
							</NavigationMenuContent>
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>

				<Typewriter text={["Typewriter full sentence"]} />

				<p data-probe="type">
					<Typewriter
						text={["Ab", "Cd"]}
						speed={20}
						deleteSpeed={20}
						pauseDuration={100}
						controls
					/>
				</p>

				<p data-probe="swap">
					<TextSwap items={["Swap first", "Swap second"]} interval={500} controls />
				</p>

				<div data-probe="quote-swap" className="max-w-xs">
					<Quote
						textSwap={{
							items: [
								"Quote first",
								"Quote second, long enough to wrap onto more than one line in this narrow box",
							],
							interval: 500,
							controls: true,
						}}
					>
						Quote first
					</Quote>
				</div>

				<div data-probe="quote-type">
					<Quote typewriter={{ speed: 20, controls: true }}>
						A quote long enough to keep typing through every sample of the pause test, well past the
						first few seconds of it, and then some more words for good measure.
					</Quote>
				</div>

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

				<Prose data-probe="prose" className="w-80">
					<h2>Prose heading</h2>

					<p>
						A paragraph with a <a href="#prose-link">prose link</a>.
					</p>

					<pre data-probe="pre-short">
						<code>short</code>
					</pre>

					<pre data-probe="pre-wide">
						<code>{"wide ".repeat(60)}</code>
					</pre>

					<table data-probe="table-wide">
						<thead>
							<tr>
								{["One", "Two", "Three", "Four", "Five", "Six"].map((name) => (
									<th key={name}>{`${name} long column heading`}</th>
								))}
							</tr>
						</thead>

						<tbody>
							<tr>
								{["a", "b", "c", "d", "e", "f"].map((cell) => (
									<td key={cell}>{cell}</td>
								))}
							</tr>
						</tbody>
					</table>

					<div data-probe="prose-embedded">
						<h2 className="mt-1">Embedded heading</h2>
					</div>
				</Prose>

				<Prose data-probe="prose-section" className="w-80">
					<section>
						<h2>Section heading</h2>

						<p>Section text</p>
					</section>

					<section>
						<h2>Second section heading</h2>

						<pre data-probe="pre-section">
							<code>{"wide ".repeat(60)}</code>
						</pre>
					</section>
				</Prose>

				<Prose
					data-probe="prose-html"
					className="w-80"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: a constant string in a test page
					dangerouslySetInnerHTML={{
						__html: `<pre data-probe="pre-html"><code>${"html ".repeat(60)}</code></pre>`,
					}}
				/>

				<Hero as="h2" title="Hero probe title" description="Hero probe text" />

				<SiteFooter
					label="Probe footer"
					onNavigate={(href, event) => {
						event.preventDefault();
						setFooterHref(href);
					}}
					columns={[{ title: "Probe links", links: [{ label: "Footer link", href: "/footer" }] }]}
					legal={<output>{footerHref || "not clicked"}</output>}
				/>
			</main>
		</SidebarLayout>
	);
}
