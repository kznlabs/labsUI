import { Fragment, type ReactNode } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { OverflowFocus } from "@/lib/overflow-focus";
import { apiFor } from "@/site/api";

const mono = "font-mono text-[0.8125rem]";

function prose(text: string): ReactNode {
	return text
		.replace(/\s+/g, " ")
		.split("`")
		.map((part, i) =>
			i % 2 ? (
				// biome-ignore lint/suspicious/noArrayIndexKey: static split of one string
				<code key={i} className={`${mono} rounded bg-foreground/[0.06] px-1 py-0.5`}>
					{part}
				</code>
			) : (
				part
			),
		);
}

/**
 * Props tables for the components a section documents, generated from their TypeScript types
 * (scripts/build-api.ts). Server-rendered; closed content stays crawlable. On a component page
 * it starts open and its export names are h2s under the page's h1.
 */
export function ApiReference({
	files,
	label,
	page = false,
}: {
	files: string[];
	/** Component name, so each trigger reads "API reference for …" to screen readers. */
	label: string;
	page?: boolean;
}) {
	const Heading = page ? "h2" : "h3";
	const { entries, types } = apiFor(files);

	if (!entries.length) return null;

	return (
		<Collapsible defaultOpen={page}>
			<CollapsibleTrigger chevron className="text-muted-foreground hover:text-foreground">
				API reference
				<span className="sr-only"> for {label}</span>
				<span className="font-normal text-xs">
					{entries.length} {entries.length === 1 ? "export" : "exports"}
				</span>
			</CollapsibleTrigger>
			<CollapsibleContent className="grid gap-8 pt-5">
				{entries.map((entry) => (
					<div key={entry.name} className="grid min-w-0 gap-2">
						<Heading className={`${mono} font-semibold text-sm`}>
							{entry.kind === "component" ? `<${entry.name}>` : `${entry.name}()`}
						</Heading>
						{entry.description && (
							<p className="max-w-2xl text-muted-foreground text-sm leading-relaxed">
								{prose(entry.description)}
							</p>
						)}
						{entry.kind === "function" ? (
							<pre
								className={`${mono} overflow-x-auto rounded-lg border bg-card px-3 py-2 leading-relaxed outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50`}
							>
								{entry.signature}
								<OverflowFocus />
							</pre>
						) : (
							<>
								{entry.props.length > 0 && (
									<ul
										className="divide-y rounded-xl border bg-card text-sm sm:hidden"
										aria-label={`${entry.name} props`}
									>
										{entry.props.map((prop) => (
											<li key={prop.name} className="grid gap-1.5 px-3 py-3">
												<div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
													<code className={`${mono} font-medium text-foreground`}>
														{prop.name}
														{prop.required && <span className="text-destructive-ink">*</span>}
													</code>
													{prop.default && (
														<span className="text-muted-foreground text-xs">
															default{" "}
															<code className={`${mono} text-foreground`}>{prop.default}</code>
														</span>
													)}
												</div>
												<code className={`${mono} text-primary-ink wrap-break-word`}>
													{prop.type}
												</code>
												{prop.description && (
													<p className="text-muted-foreground text-xs leading-relaxed">
														{prose(prop.description)}
													</p>
												)}
											</li>
										))}
									</ul>
								)}
								{entry.props.length > 0 && (
									<Table containerClassName="shadow-none max-sm:hidden">
										<TableHeader>
											<TableRow>
												<TableHead>Prop</TableHead>
												<TableHead>Type</TableHead>
												<TableHead>Default</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{entry.props.map((prop) => (
												<TableRow key={prop.name}>
													<TableCell className="min-w-44 align-top">
														<code className={`${mono} font-medium text-foreground`}>
															{prop.name}
															{prop.required && <span className="text-destructive-ink">*</span>}
														</code>
														{prop.description && (
															<p className="mt-1 max-w-sm whitespace-normal text-muted-foreground text-xs leading-relaxed">
																{prose(prop.description)}
															</p>
														)}
													</TableCell>
													<TableCell className="align-top">
														<code
															className={`${mono} whitespace-normal text-primary-ink wrap-anywhere`}
														>
															{prop.type}
														</code>
													</TableCell>
													<TableCell className="align-top">
														{prop.default ? (
															<code className={`${mono} wrap-anywhere`}>{prop.default}</code>
														) : (
															<span className="text-muted-foreground">—</span>
														)}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								)}
								{entry.extends && (
									<p className="text-muted-foreground text-xs">
										Also accepts every <code className={mono}>{entry.extends}</code> prop
										{entry.props.length ? "" : " (none of its own)"}.
									</p>
								)}
							</>
						)}
					</div>
				))}
				{types.length > 0 && (
					<dl className="grid gap-2 text-sm">
						{types.map(([name, def]) => (
							<Fragment key={name}>
								<dt className={`${mono} font-semibold`}>type {name}</dt>
								<dd className={`${mono} -mt-1 break-words text-muted-foreground`}>
									{def as string}
								</dd>
							</Fragment>
						))}
					</dl>
				)}
				<p className="text-muted-foreground text-xs">
					<span className="text-destructive-ink">*</span> required. Every component also takes{" "}
					<code className={mono}>className</code>.
				</p>
			</CollapsibleContent>
		</Collapsible>
	);
}
