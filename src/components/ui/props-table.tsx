import type { ComponentProps, ReactNode } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const mono = "font-mono text-[0.8125rem]";

/** Text with its `backticks` turned into inline code and its line breaks into spaces. */
export function inlineCode(text: string): ReactNode {
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

export type PropsTableRow = {
	/** Name of the prop or option. */
	name: string;
	/** Its type, as text. */
	type: string;
	/** Marks the name with a star. */
	required?: boolean;
	/** Its default value, as text. */
	default?: string;
	/** What it does. In a string, `backticks` become inline code. */
	description?: ReactNode;
};

type PropsTableProps = Omit<ComponentProps<"div">, "children"> & {
	/** One row per prop or option. */
	rows: PropsTableRow[];
	/** Accessible name of the list shown in a narrow container. */
	label: string;
	/** Column headings, e.g. `{ name: "Option" }` for a function's options. */
	labels?: { name?: string; type?: string; default?: string };
	/** Explains the star on required rows. */
	requiredLabel?: string;
};

const descriptionOf = ({ description }: PropsTableRow) =>
	typeof description === "string" ? inlineCode(description) : description;

function Name({ row, requiredLabel }: { row: PropsTableRow; requiredLabel: string }) {
	return (
		<code className={`${mono} font-medium text-foreground`}>
			{row.name}

			{row.required && (
				<span className="text-destructive-ink">
					<span aria-hidden="true">*</span>

					<span className="sr-only"> {requiredLabel}</span>
				</span>
			)}
		</code>
	);
}

/**
 * The props or options of a component or function: a table, or a list where the container is too
 * narrow for one. Server-safe.
 */
export function PropsTable({
	rows,
	label,
	labels,
	requiredLabel = "required",
	className,
	...props
}: PropsTableProps) {
	if (!rows.length) return null;

	return (
		<div className={cn("@container grid min-w-0 gap-2", className)} {...props}>
			<ul className="divide-y rounded-xl border bg-card text-sm @xl:hidden" aria-label={label}>
				{rows.map((row) => (
					<li key={row.name} className="grid gap-1.5 px-3 py-3">
						<div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
							<Name row={row} requiredLabel={requiredLabel} />

							{row.default && (
								<span className="text-muted-foreground text-xs">
									{labels?.default ?? "Default"}{" "}
									<code className={`${mono} text-foreground`}>{row.default}</code>
								</span>
							)}
						</div>

						<code className={`${mono} text-primary-ink wrap-break-word`}>{row.type}</code>

						{row.description && (
							<div className="text-muted-foreground text-xs leading-relaxed">
								{descriptionOf(row)}
							</div>
						)}
					</li>
				))}
			</ul>

			<Table containerClassName="shadow-none @max-xl:hidden">
				<TableHeader>
					<TableRow>
						<TableHead>{labels?.name ?? "Prop"}</TableHead>

						<TableHead>{labels?.type ?? "Type"}</TableHead>

						<TableHead>{labels?.default ?? "Default"}</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{rows.map((row) => (
						<TableRow key={row.name}>
							<TableCell className="min-w-44 align-top">
								<Name row={row} requiredLabel={requiredLabel} />

								{row.description && (
									<div className="mt-1 max-w-sm whitespace-normal text-muted-foreground text-xs leading-relaxed">
										{descriptionOf(row)}
									</div>
								)}
							</TableCell>

							<TableCell className="align-top">
								<code className={`${mono} whitespace-normal text-primary-ink wrap-anywhere`}>
									{row.type}
								</code>
							</TableCell>

							<TableCell className="align-top">
								{row.default ? (
									<code className={`${mono} wrap-anywhere`}>{row.default}</code>
								) : (
									<span className="text-muted-foreground">—</span>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			{rows.some((row) => row.required) && (
				<p className="text-muted-foreground text-xs">
					<span className="text-destructive-ink" aria-hidden="true">
						*
					</span>{" "}
					{requiredLabel}
				</p>
			)}
		</div>
	);
}
