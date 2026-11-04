import { Fragment } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { inlineCode, PropsTable } from "@/components/ui/props-table";
import { OverflowFocus } from "@/lib/overflow-focus";
import { apiFor } from "@/site/api";

const mono = "font-mono text-[0.8125rem]";

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
								{inlineCode(entry.description)}
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
								<PropsTable label={`${entry.name} props`} rows={entry.props} />

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
					Every component also takes <code className={mono}>className</code>.
				</p>
			</CollapsibleContent>
		</Collapsible>
	);
}
