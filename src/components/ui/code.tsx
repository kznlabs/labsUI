"use client";

import { Copy } from "lucide-react";
import { type CSSProperties, Fragment, type ReactNode, useEffect, useState } from "react";
import type { BundledLanguage } from "shiki";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";
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

type CodeFile = Annotations & { name: string; code: string };

type CodeProps = Annotations & {
	code: string;
	/** Shiki language id, e.g. "tsx", "bash", "json". */
	language?: string;
	/** "block": header with language and copy. "inline": one line with a copy button. */
	variant?: "block" | "inline";
	/** Run Prettier (default options) before highlighting; copy gets the formatted code too. Line
	 * numbers in `highlight`, `marks` and `notes` refer to the formatted code. */
	format?: boolean;
	className?: string;
};

type CodePanelProps = {
	/** One tab per file, each with its own annotations. Switching animates the body. */
	files: CodeFile[];
	/** Run Prettier on JS/TS files before highlighting; copy gets the formatted code too. */
	format?: boolean;
	className?: string;
};

type Token = { content: string; color?: string; fontStyle?: number };

const cache = new Map<string, Token[][]>();
const formatted = new Map<string, string>();
const PRETTIER_LANGS = new Set(["ts", "tsx", "js", "jsx"]);

/** Prettier with default options, loaded on demand. Returns the input unchanged on any error. */
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
		// A bare JSX usage line comes back as an expression statement; drop its added semicolon.
		if (code.trimStart().startsWith("<") && !code.trimEnd().endsWith(";"))
			out = out.replace(/;$/, "");
		formatted.set(key, out);
		return out;
	} catch {
		return code;
	}
}

/**
 * Tokenizes with Shiki, loaded on demand. Each token's color is a `light-dark()` pair, so the
 * page's color-scheme picks the theme. Resolves to null for unknown languages.
 */
async function tokenize(code: string, language: string): Promise<Token[][] | null> {
	const key = `${language}\0${code}`;
	const cached = cache.get(key);
	if (cached) return cached;
	try {
		const { codeToTokens } = await import("shiki");
		const { tokens } = await codeToTokens(code, {
			lang: language as BundledLanguage,
			// The "-default" pair is GitHub's AA-tuned palette (the classic one has 3.5:1 strings and comments).
			themes: { light: "github-light-default", dark: "github-dark-default" },
			defaultColor: false,
		});
		const lines = tokens.map((line) =>
			line.map(({ content, htmlStyle, fontStyle }) => {
				const light = htmlStyle?.["--shiki-light"];
				const dark = htmlStyle?.["--shiki-dark"];
				return {
					content,
					color: light && dark ? `light-dark(${light}, ${dark})` : undefined,
					fontStyle,
				};
			}),
		);
		cache.set(key, lines);
		return lines;
	} catch {
		return null;
	}
}

/** Formatted (optionally) and tokenized code. `text` is what to copy; `lines` is null until ready. */
function useCode(code: string, language: string, format = false) {
	const [state, setState] = useState<{ text: string; lines: Token[][] | null }>({
		text: code,
		lines: null,
	});
	useEffect(() => {
		let alive = true;
		(format ? prettify(code, language) : Promise.resolve(code)).then(async (text) => {
			const lines = await tokenize(text, language);
			if (alive) setState({ text, lines });
		});
		return () => {
			alive = false;
		};
	}, [code, language, format]);
	return state;
}

/** Language from a file extension. Falls back to tsx. */
function languageOf(name: string) {
	const ext = name.split(".").pop()?.toLowerCase();
	const map: Record<string, string> = {
		ts: "ts",
		tsx: "tsx",
		js: "js",
		jsx: "jsx",
		mjs: "js",
		cjs: "js",
		css: "css",
		html: "html",
		json: "json",
		md: "md",
		mdx: "mdx",
		yml: "yaml",
		yaml: "yaml",
		toml: "toml",
		sql: "sql",
		py: "python",
		go: "go",
		rs: "rust",
		sh: "bash",
		bash: "bash",
		env: "dotenv",
	};
	return (ext && map[ext]) || "tsx";
}

/** Ghost "Copy" button that turns into "Copied" in place. Shared with Terminal. */
export function CopyButton({ code, label = "Copy code" }: { code: string; label?: string }) {
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

/** Merged, sorted `[start, end)` ranges to mark on one line. */
function markRanges(text: string, line: number, marks: CodeMark[]) {
	const out: [number, number][] = [];
	for (const m of marks) {
		if (typeof m !== "string" && "start" in m) {
			if (m.line === line) out.push([Math.max(0, m.start), Math.min(text.length, m.end)]);
			continue;
		}
		const needle = typeof m === "string" ? m : m.text;
		if (!needle || (typeof m !== "string" && m.line !== undefined && m.line !== line)) continue;
		for (let i = text.indexOf(needle); i !== -1; i = text.indexOf(needle, i + needle.length))
			out.push([i, i + needle.length]);
	}
	out.sort((a, b) => a[0] - b[0]);
	const merged: [number, number][] = [];
	for (const r of out) {
		const last = merged[merged.length - 1];
		if (r[1] <= r[0]) continue;
		if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
		else merged.push([...r]);
	}
	return merged;
}

/** Shiki's FontStyle bit flags: 1 italic, 2 bold, 4 underline (-1 = not set). */
function tokenStyle({ color, fontStyle: f = 0 }: Token): CSSProperties | undefined {
	if (!color && f <= 0) return undefined;
	return {
		color,
		fontStyle: f > 0 && f & 1 ? "italic" : undefined,
		fontWeight: f > 0 && f & 2 ? 600 : undefined,
		textDecoration: f > 0 && f & 4 ? "underline" : undefined,
	};
}

/** One line's tokens, split at mark boundaries; each mark is one <mark> around its pieces. */
function LineTokens({ tokens, ranges }: { tokens: Token[]; ranges: [number, number][] }) {
	if (!ranges.length)
		return tokens.map((t, i) => (
			// biome-ignore lint/suspicious/noArrayIndexKey: tokens are positional and never reorder
			<span key={i} style={tokenStyle(t)}>
				{t.content}
			</span>
		));

	// Pieces tagged with the mark they fall in (-1 = none), then grouped by that tag.
	const pieces: { text: string; token: Token; mark: number }[] = [];
	let at = 0;
	for (const token of tokens) {
		const end = at + token.content.length;
		let cut = at;
		while (cut < end) {
			const mark = ranges.findIndex(([s, e]) => cut >= s && cut < e);
			const next =
				mark === -1
					? Math.min(end, ...ranges.map(([s]) => s).filter((s) => s > cut))
					: Math.min(end, ranges[mark][1]);
			pieces.push({ text: token.content.slice(cut - at, next - at), token, mark });
			cut = next;
		}
		at = end;
	}

	const groups: { mark: number; pieces: typeof pieces }[] = [];
	for (const p of pieces) {
		const last = groups[groups.length - 1];
		if (last && last.mark === p.mark && p.mark !== -1) last.pieces.push(p);
		else groups.push({ mark: p.mark, pieces: [p] });
	}

	return groups.map((g, i) => {
		const spans = g.pieces.map((p, j) => (
			// biome-ignore lint/suspicious/noArrayIndexKey: pieces are positional and never reorder
			<span key={j} style={tokenStyle(p.token)}>
				{p.text}
			</span>
		));
		return g.mark === -1 ? (
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

function inRanges(n: number, ranges: LineRange[]) {
	return ranges.some((r) => (typeof r === "number" ? r === n : n >= r[0] && n <= r[1]));
}

/**
 * Tokenized lines with an optional gutter, tinted lines, marks and notes. Before Shiki loads
 * (and without JS) it renders the same structure uncolored, so nothing shifts when it arrives.
 */
function CodeLines({
	text,
	lines,
	lineNumbers,
	highlight = [],
	marks = [],
	notes = {},
	inline,
}: Annotations & { text: string; lines: Token[][] | null; inline?: boolean }) {
	const rows = lines ?? text.split("\n").map((content) => [{ content }]);
	const first = typeof lineNumbers === "number" ? lineNumbers : 1;
	const digits = String(first + rows.length - 1).length;
	const numbered = lineNumbers !== undefined && lineNumbers !== false;
	const hasNotes = Object.keys(notes).length > 0;
	const gutter = !inline && (numbered || hasNotes);

	return (
		<pre className={cn("m-0 font-mono", inline ? "p-0" : "w-max min-w-full py-3")}>
			<code className="grid">
				{rows.map((tokens, i) => {
					const n = first + i;
					const lineText = tokens.map((t) => t.content).join("");
					const lit = inRanges(n, highlight);
					const note = notes[n];
					const body = (
						<span className="whitespace-pre">
							<LineTokens
								tokens={tokens}
								ranges={marks.length ? markRanges(lineText, n, marks) : []}
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
									{numbered && <span style={{ minWidth: `${digits}ch` }}>{n}</span>}
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
	className,
	...annotations
}: CodeProps) {
	const { text: code, lines } = useCode(source, language, format);

	if (variant === "inline") {
		return (
			<div
				className={cn(
					"flex min-w-0 items-center gap-3 rounded-md bg-muted/50 px-3 py-1.5",
					className,
				)}
			>
				<div className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs">
					<CodeLines text={code} lines={lines} marks={annotations.marks} inline />
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
			<div className="overflow-x-auto font-mono text-xs leading-5 [--code-px:--spacing(3)]">
				<CodeLines text={code} lines={lines} {...annotations} />
			</div>
		</div>
	);
}

/** One file's body. Tokenizes on its own, so a switch never shows the previous file's markup. */
function FileBody({ code, name, format, ...annotations }: CodeFile & { format?: boolean }) {
	const { text, lines } = useCode(code, languageOf(name), format);
	return <CodeLines text={text} lines={lines} {...annotations} />;
}

/** File panel: one tab per file, copy for the active one. Every file stays in the DOM. */
export function CodePanel({ files, format, className }: CodePanelProps) {
	const [active, setActive] = useState(files[0]?.name ?? "");
	const file = files.find((f) => f.name === active) ?? files[0];
	// Same cache as the visible body, so copy hands out exactly what is shown.
	const { text: copyText } = useCode(file?.code ?? "", languageOf(file?.name ?? ""), format);

	if (!file) return null;

	return (
		<Tabs
			value={file.name}
			onValueChange={setActive}
			className={cn(
				"gap-0 overflow-hidden rounded-lg border bg-muted/50 text-foreground",
				className,
			)}
		>
			<div className="flex shrink-0 items-center justify-between gap-2 border-b px-2 py-1.5">
				<TabsList aria-label="Snippet files" className="bg-transparent p-0">
					{files.map((f) => (
						<TabsTrigger key={f.name} value={f.name} className="h-6 px-2.5 font-mono text-xs">
							{f.name}
						</TabsTrigger>
					))}
				</TabsList>
				<CopyButton code={copyText} />
			</div>
			{files.map((f) => (
				<TabsContent
					key={f.name}
					value={f.name}
					className="min-h-0 flex-1 overflow-auto rounded-none py-1 font-mono text-xs leading-5 [--code-px:--spacing(4)]"
				>
					<FileBody {...f} format={format} />
				</TabsContent>
			))}
		</Tabs>
	);
}
