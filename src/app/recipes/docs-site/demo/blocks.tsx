import { Changelog } from "@/components/blocks/changelog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Code } from "@/components/ui/code";
import { inlineCode, PropsTable } from "@/components/ui/props-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { highlightCode } from "@/lib/highlight";
import { type Block, releases } from "./docs";

// Highlighted at build time, so the browser never loads Shiki.
async function CodeBlock({ block }: { block: Extract<Block, { type: "code" }> }) {
	const tokens = await highlightCode(block.code, block.language);

	return (
		<Code
			code={block.code}
			language={block.language}
			tokens={tokens ?? undefined}
			lineNumbers={block.code.includes("\n")}
			highlight={block.highlight}
			notes={block.notes}
		/>
	);
}

const managers = [
	{ name: "npm", add: "npm install", dev: "-D" },
	{ name: "pnpm", add: "pnpm add", dev: "-D" },
	{ name: "bun", add: "bun add", dev: "-d" },
	{ name: "yarn", add: "yarn add", dev: "-D" },
];

export async function InstallTabs({ packages, dev }: { packages: string; dev?: boolean }) {
	const commands = await Promise.all(
		managers.map(async (manager) => {
			const code = [manager.add, dev && manager.dev, packages].filter(Boolean).join(" ");

			return { ...manager, code, tokens: await highlightCode(code, "bash") };
		}),
	);

	return (
		<Tabs defaultValue="npm" variant="underline">
			<TabsList aria-label="Package manager">
				{commands.map((command) => (
					<TabsTrigger key={command.name} value={command.name}>
						{command.name}
					</TabsTrigger>
				))}
			</TabsList>

			{commands.map((command) => (
				<TabsContent key={command.name} value={command.name} className="pt-3">
					<Code
						variant="inline"
						code={command.code}
						language="bash"
						tokens={command.tokens ?? undefined}
					/>
				</TabsContent>
			))}
		</Tabs>
	);
}

export function BlockView({ block }: { block: Block }) {
	switch (block.type) {
		case "p":
			return <p>{inlineCode(block.text)}</p>;
		case "list":
			return (
				<ul>
					{block.items.map((item) => (
						<li key={item}>{inlineCode(item)}</li>
					))}
				</ul>
			);
		case "code":
			return (
				<div className="my-6">
					<CodeBlock block={block} />
				</div>
			);
		case "install":
			return (
				<div className="my-6">
					<InstallTabs packages={block.packages} dev={block.dev} />
				</div>
			);
		case "callout":
			return (
				<div className="my-6">
					<Alert variant={block.tone}>
						<AlertTitle>{block.title}</AlertTitle>

						<AlertDescription>{inlineCode(block.text)}</AlertDescription>
					</Alert>
				</div>
			);
		case "options":
			return (
				<div className="my-6">
					<PropsTable label={block.label} labels={{ name: "Option" }} rows={block.rows} />
				</div>
			);
		case "releases":
			return (
				<div className="my-6">
					<Changelog
						releases={releases.map((release) => ({
							...release,
							changes: release.changes.map((change) => ({
								...change,
								text: typeof change.text === "string" ? inlineCode(change.text) : change.text,
							})),
						}))}
					/>
				</div>
			);
	}
}
