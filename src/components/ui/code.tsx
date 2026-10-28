"use client";

import { Copy } from "lucide-react";
import { type CSSProperties, Fragment, type ReactNode, useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";
import { type CodeToken, highlightCode, languageOf } from "@/lib/highlight";
import { OverflowFocus } from "@/lib/overflow-focus";
import { cn } from "@/lib/utils";

/** One line, or an inclusive `[from, to]` run. Numbers are the ones shown in the gutter. */
type LineRange = number | [from: number, to: number];

/**
 * Text to mark: every match of a string, matches on one line, or an exact `[start, end)`
 * column range (String#slice indices) on one line.
 */
type CodeMark =
	| string
	| { text: string; line?: number }
	| { line: number; start: number; end: number };

type Annotations = {
	/** Gutter numbers; a number sets the first line's number (for excerpts). */
	lineNumbers?: boolean | number;
	/** Lines to tint, with a primary bar on the left. */
	highlight?: LineRange[];
	/** Words or ranges inside lines, wrapped in <mark>. */
	marks?: CodeMark[];
	/** Hover/focus note per line number: `{ 4: "Remember to add it to the registry" }`. */
	notes?: Record<number, ReactNode>;
};

type CodeFile = Annotations & {
	name: string;
	code: string;
	/** Lines from `highlightCode()`, made ahead of time (server or build): no Shiki in the browser. */
	tokens?: CodeToken[][];
};

type CodeProps = Annotations & {
	/** Source to highlight. */
	code: string;
	/** Shiki language id, e.g. "tsx", "bash", "json". */
	language?: string;
	/** "block": header with language and copy. "inline": one line with a copy button. */
	variant?: "block" | "inline";
	/** Run Prettier (default options) before highlighting; copy gets the formatted code too. Line
	 * numbers in `highlight`, `marks` and `notes` refer to the formatted code. */
	format?: boolean;
	/**
	 * Lines from `highlightCode(code, language)`, made on the server or at build time: the code
	 * renders highlighted from the first paint and Shiki never loads. Ignored with `format`.
	 */
	tokens?: CodeToken[][];
	className?: string;
};

type CodePanelProps = {
	/** One tab per file, each with its own annotations. Switching animates the body. */
	files: CodeFile[];
	/** Run Prettier on JS/TS files before highlighting; copy gets the formatted code too. */
	format?: boolean;
	/**
	 * Fold files longer than this many lines (by at least 5) behind a "Show all" button. The body
	 * never scrolls vertically, so the wheel and touch keep scrolling the page.
	 */
	collapse?: number;
	className?: string;
};

const cache = new Map<string, CodeToken[][]>();
const formatted = new Map<string, string>();
const PRETTIER_LANGS = new Set(["ts", "tsx", "js", "jsx"]);

/** Prettier with default options, loaded on demand. Returns the input as-is on error. */
async function prettify(code: string, language: string): Promise<string> {
	if (!PRETTIER_LANGS.has(language)) return code;

	const key = `${language}\0${code}`;
	const hit = formatted.get(key);

	if (hit !== undefined) return hit;

	try {
		const [{ format }, babel, estree] = await Promise.all([
			import("prettier/standalone"),
			import("prettier/plugins/babel"),
			import("prettier/plugins/estree"),
		]);
		let out = (await format(code, { parser: "babel-ts", plugins: [babel, estree] })).trimEnd();

		// A bare JSX line comes back as a statement, drop the added semicolon.
		if (code.trimStart().startsWith("<") && !code.trimEnd().endsWith(";"))
			out = out.replace(/;$/, "");
		formatted.set(key, out);

		return out;
	} catch {
		return code;
	}
}

async function tokenize(code: string, language: string) {
	const key = `${language}\0${code}`;
	const cached = cache.get(key);

	if (cached) return cached;

	const lines = await highlightCode(code, language);

	if (lines) cache.set(key, lines);

	return lines;
}

/**
 * `text` is what gets copied, `lines` is null until ready. Pre-highlighted tokens are used as-is
 * from the first render.
 */
function useCode(code: string, language: string, format = false, tokens?: CodeToken[][]) {
	const ready = tokens && !format;
	const [state, setState] = useState<{ text: string; lines: CodeToken[][] | null }>({
		text: code,
		lines: ready ? tokens : null,
	});

	useEffect(() => {
		if (ready) {
			setState({ text: code, lines: tokens });

			return;
		}

		let alive = true;

		(format ? prettify(code, language) : Promise.resolve(code)).then(async (text) => {
			const lines = await tokenize(text, language);

			if (alive) setState({ text, lines });
		});

		return () => {
			alive = false;
		};
	}, [code, language, format, tokens, ready]);

	return state;
}

/** Ghost "Copy" button that turns into "Copied" in place. Shared with Terminal. */
export function CopyButton({
	code,
	label = "Copy code",
}: {
	/** Text written to the clipboard. */
	code: string;
	/** Accessible name of the button. */
	label?: string;
}) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;

		const timer = setTimeout(() => setCopied(false), 1500);

		return () => clearTimeout(timer);
	}, [copied]);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
		} catch {}
	};

	return (
		<Button
			size="sm"
			variant="ghost"
			className="h-7 shrink-0 px-2 text-xs"
			status={copied ? "success" : "idle"}
			successLabel="Copied"
			aria-label={copied ? "Copied" : label}
			onClick={copy}
		>
			<Copy aria-hidden="true" />
			Copy
		</Button>
	);
}

function markRanges(text: string, line: number, marks: CodeMark[]) {
	const out: [number, number][] = [];

	for (const mark of marks) {
		if (typeof mark !== "string" && "start" in mark) {
			if (mark.line === line) out.push([Math.max(0, mark.start), Math.min(text.length, mark.end)]);
			continue;
		}

		const needle = typeof mark === "string" ? mark : mark.text;

		if (!needle || (typeof mark !== "string" && mark.line !== undefined && mark.line !== line))
			continue;
		for (let i = text.indexOf(needle); i !== -1; i = text.indexOf(needle, i + needle.length))
			out.push([i, i + needle.length]);
	}

	out.sort((a, b) => a[0] - b[0]);

	const merged: [number, number][] = [];

	for (const range of out) {
		const last = merged[merged.length - 1];

		if (range[1] <= range[0]) continue;
		if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
		else merged.push([...range]);
	}

	return merged;
}

/** Shiki's FontStyle bit flags: 1 italic, 2 bold, 4 underline (-1 = not set). */
function tokenStyle({ color, fontStyle: style = 0 }: CodeToken): CSSProperties | undefined {
	if (!color && style <= 0) return undefined;

	return {
		color,
		fontStyle: style > 0 && style & 1 ? "italic" : undefined,
		fontWeight: style > 0 && style & 2 ? 600 : undefined,
		textDecoration: style > 0 && style & 4 ? "underline" : undefined,
	};
}

function LineTokens({ tokens, ranges }: { tokens: CodeToken[]; ranges: [number, number][] }) {
	if (!ranges.length)
		return tokens.map((token, i) => (
			// biome-ignore lint/suspicious/noArrayIndexKey: tokens are positional and never reorder
			<span key={i} style={tokenStyle(token)}>
				{token.content}
			</span>
		));

	const pieces: { text: string; token: CodeToken; mark: number }[] = [];
	let at = 0;

	for (const token of tokens) {
		const end = at + token.content.length;
		let cut = at;

		while (cut < end) {
			const mark = ranges.findIndex(([start, end]) => cut >= start && cut < end);
			const next =
				mark === -1
					? Math.min(end, ...ranges.map(([start]) => start).filter((start) => start > cut))
					: Math.min(end, ranges[mark][1]);

			pieces.push({ text: token.content.slice(cut - at, next - at), token, mark });
			cut = next;
		}

		at = end;
	}

	const groups: { mark: number; pieces: typeof pieces }[] = [];

	for (const part of pieces) {
		const last = groups[groups.length - 1];

		if (last && last.mark === part.mark && part.mark !== -1) last.pieces.push(part);
		else groups.push({ mark: part.mark, pieces: [part] });
	}

	return groups.map((group, i) => {
		const spans = group.pieces.map((piece, j) => (
			// biome-ignore lint/suspicious/noArrayIndexKey: pieces are positional and never reorder
			<span key={j} style={tokenStyle(piece.token)}>
				{piece.text}
			</span>
		));

		return group.mark === -1 ? (
			// biome-ignore lint/suspicious/noArrayIndexKey: groups are positional and never reorder
			<Fragment key={i}>{spans}</Fragment>
		) : (
			<mark
				// biome-ignore lint/suspicious/noArrayIndexKey: groups are positional and never reorder
				key={i}
				className="-mx-0.5 rounded-sm bg-primary/15 px-0.5 text-inherit ring-1 ring-primary/30"
			>
				{spans}
			</mark>
		);
	});
}

function inRanges(lineNumber: number, ranges: LineRange[]) {
	return ranges.some((range) =>
		typeof range === "number"
			? range === lineNumber
			: lineNumber >= range[0] && lineNumber <= range[1],
	);
}

/**
 * Before Shiki loads (or without JS) it renders the same structure uncolored, so nothing shifts.
 */
function CodeLines({
	text,
	lines,
	lineNumbers,
	highlight = [],
	marks = [],
	notes = {},
	inline,
}: Annotations & { text: string; lines: CodeToken[][] | null; inline?: boolean }) {
	const rows = lines ?? text.split("\n").map((content) => [{ content }]);
	const first = typeof lineNumbers === "number" ? lineNumbers : 1;
	const digits = String(first + rows.length - 1).length;
	const numbered = lineNumbers !== undefined && lineNumbers !== false;
	const hasNotes = Object.keys(notes).length > 0;
	const gutter = !inline && (numbered || hasNotes);

	return (
		<pre className={cn("font-mono", !inline && "w-max min-w-full py-3")}>
			<code className="grid">
				{rows.map((tokens, i) => {
					const lineNumber = first + i;
					const lineText = tokens.map((token) => token.content).join("");
					const lit = inRanges(lineNumber, highlight);
					const note = notes[lineNumber];
					const body = (
						<span className="whitespace-pre">
							<LineTokens
								tokens={tokens}
								ranges={marks.length ? markRanges(lineText, lineNumber, marks) : []}
							/>
						</span>
					);

					return (
						<span
							// biome-ignore lint/suspicious/noArrayIndexKey: lines are positional
							key={i}
							data-highlighted={lit || undefined}
							className={cn(
								"flex min-h-lh",
								!inline && "px-(--code-px)",
								lit && "bg-primary/10 shadow-[inset_2px_0_0_var(--color-primary)]",
							)}
						>
							{gutter && (
								<span
									aria-hidden="true"
									className={cn(
										"mr-4 flex shrink-0 select-none items-center justify-end gap-1.5 text-right text-muted-foreground/60 tabular-nums",
										lit && "text-foreground/70",
									)}
								>
									{hasNotes && (
										<span
											className={cn(
												"size-1.5 rounded-full",
												note ? "bg-primary" : "bg-transparent",
											)}
										/>
									)}
									{numbered && <span style={{ minWidth: `${digits}ch` }}>{lineNumber}</span>}
								</span>
							)}
							{note ? (
								<Tooltip content={note} side="top" align="start" delay={150}>
									<span
										// biome-ignore lint/a11y/noNoninteractiveTabindex: lets keyboard users reach the note
										tabIndex={0}
										className="-mx-1 cursor-help rounded-sm px-1 underline decoration-primary/50 decoration-dotted underline-offset-4 outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
									>
										{body}
									</span>
								</Tooltip>
							) : (
								body
							)}
						</span>
					);
				})}
			</code>
		</pre>
	);
}

/** Syntax-highlighted code with light/dark themes, line annotations and an in-place copy button. */
export function Code({
	code: source,
	language = "tsx",
	variant = "block",
	format,
	tokens,
	className,
	...annotations
}: CodeProps) {
	const { text: code, lines } = useCode(source, language, format, tokens);

	if (variant === "inline") {
		return (
			<div
				className={cn(
					"flex min-w-0 items-center gap-3 rounded-md bg-muted/50 px-3 py-1.5",
					className,
				)}
			>
				<div className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap rounded-sm font-mono text-xs outline-none [scrollbar-width:none] focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-scrollbar]:hidden">
					<CodeLines text={code} lines={lines} marks={annotations.marks} inline />
					<OverflowFocus />
				</div>
				<CopyButton code={code} />
			</div>
		);
	}

	return (
		<div
			className={cn(
				"my-2 overflow-hidden rounded-lg border bg-muted/50 text-foreground",
				className,
			)}
		>
			<div className="flex h-8 items-center justify-between border-b px-3">
				<span className="font-mono text-muted-foreground text-xs">{language}</span>
				<CopyButton code={code} />
			</div>
			<div className="overflow-x-auto font-mono text-xs leading-5 outline-none [--code-px:--spacing(3)] focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset">
				<CodeLines text={code} lines={lines} {...annotations} />
				<OverflowFocus />
			</div>
		</div>
	);
}

/** Tokenizes on its own so switching files never flashes the previous file. */
function FileBody({ code, name, format, tokens, ...annotations }: CodeFile & { format?: boolean }) {
	const { text, lines } = useCode(code, languageOf(name), format, tokens);

	return <CodeLines text={text} lines={lines} {...annotations} />;
}

/** File panel: one tab per file, copy for the active one. Every file stays in the DOM. */
export function CodePanel({ files, format, collapse, className }: CodePanelProps) {
	const [active, setActive] = useState(files[0]?.name ?? "");
	const [expanded, setExpanded] = useState(false);
	const bodyId = useId();
	const file = files.find((file) => file.name === active) ?? files[0];
	// Same cache as the visible body, so copy gives exactly what's shown.
	const { text: copyText } = useCode(
		file?.code ?? "",
		languageOf(file?.name ?? ""),
		format,
		file?.tokens,
	);

	if (!file) return null;

	const lineCount = copyText.split("\n").length;
	// Only fold when it hides a real chunk, "Show all 21 lines" at 20 is noise.
	const foldable = collapse !== undefined && lineCount > collapse + 4;
	const folded = foldable && !expanded;

	return (
		<Tabs
			value={file.name}
			onValueChange={(name) => {
				setActive(name);
				setExpanded(false);
			}}
			className={cn(
				"gap-0 overflow-hidden rounded-lg border bg-muted/50 text-foreground",
				className,
			)}
		>
			<div className="flex shrink-0 items-center justify-between gap-2 border-b px-2 py-1.5">
				<TabsList aria-label="Snippet files" className="bg-transparent p-0">
					{files.map((file) => (
						<TabsTrigger key={file.name} value={file.name} className="h-6 px-2.5 font-mono text-xs">
							{file.name}
						</TabsTrigger>
					))}
				</TabsList>
				<CopyButton code={copyText} />
			</div>
			{files.map((tab) => (
				<TabsContent
					key={tab.name}
					value={tab.name}
					className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden rounded-none py-1 font-mono text-xs leading-5 [--code-px:--spacing(4)]"
				>
					{/* clip, not hidden: it folds without becoming a second scroll container. */}
					<div
						id={tab.name === file.name ? bodyId : undefined}
						// leading-5 rows + top padding = exactly `collapse` lines when folded.
						style={folded ? { maxHeight: `calc(${collapse} * 1.25rem + 0.75rem)` } : undefined}
						className="w-max min-w-full overflow-y-clip"
					>
						<FileBody {...tab} format={format} />
					</div>
				</TabsContent>
			))}
			{foldable && (
				<button
					type="button"
					aria-expanded={expanded}
					aria-controls={bodyId}
					onClick={() => setExpanded((current) => !current)}
					className="h-9 shrink-0 cursor-pointer border-t font-medium text-muted-foreground text-xs outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset"
				>
					{expanded ? "Show less" : `Show all ${lineCount} lines`}
				</button>
			)}
		</Tabs>
	);
}
