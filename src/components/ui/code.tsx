"use client";

import { Copy } from "lucide-react";
import { motion } from "motion/react";
import { type ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { useSpringConfig } from "@/lib/spring-config";
import { cn } from "@/lib/utils";

type CodeFile = { name: string; code: string };

type CodeProps = {
	code: string;
	/** Shiki language id, e.g. "tsx", "bash", "json". */
	language?: string;
	/** "block": header with language and copy. "inline": one line with a copy button. */
	variant?: "block" | "inline";
	className?: string;
};

type CodePanelProps = {
	/** One tab per file. Switching animates the body. */
	files: CodeFile[];
	className?: string;
};

const cache = new Map<string, string>();

/** Highlights with Shiki, loaded on demand. Resolves to null for unknown languages. */
async function highlight(code: string, language: string): Promise<string | null> {
	const key = `${language}\0${code}`;
	const cached = cache.get(key);
	if (cached) return cached;
	try {
		const { codeToHtml } = await import("shiki");
		const html = await codeToHtml(code, {
			lang: language,
			themes: { light: "github-light", dark: "github-dark" },
			defaultColor: false,
		});
		cache.set(key, html);
		return html;
	} catch {
		return null;
	}
}

function useHighlighted(code: string, language: string) {
	const [html, setHtml] = useState<string | null>(null);
	useEffect(() => {
		let alive = true;
		highlight(code, language).then((result) => {
			if (alive) setHtml(result);
		});
		return () => {
			alive = false;
		};
	}, [code, language]);
	return html;
}

/** Language from a file extension. Falls back to tsx. */
function languageOf(name: string) {
	const ext = name.split(".").pop()?.toLowerCase();
	const map: Record<string, string> = {
		ts: "ts",
		tsx: "tsx",
		js: "js",
		jsx: "jsx",
		css: "css",
		json: "json",
		sh: "bash",
	};
	return (ext && map[ext]) || "tsx";
}

function CopyButton({ code }: { code: string }) {
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
			aria-label="Copy code"
			onClick={copy}
		>
			<Copy aria-hidden="true" />
			Copy
		</Button>
	);
}

function CodeBody({ html, code }: { html: string | null; code: string }): ReactNode {
	if (html) {
		return (
			// biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output from our own snippets
			<div dangerouslySetInnerHTML={{ __html: html }} />
		);
	}
	return (
		<pre>
			<code>{code}</code>
		</pre>
	);
}

/** Syntax-highlighted code with light/dark themes and an in-place copy button. */
export function Code({ code, language = "tsx", variant = "block", className }: CodeProps) {
	const html = useHighlighted(code, language);

	if (variant === "inline") {
		return (
			<div
				className={cn(
					"flex min-w-0 items-center gap-3 rounded-md bg-muted/50 px-3 py-1.5",
					className,
				)}
			>
				<div className="code-body min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs [&_pre]:m-0 [&_pre]:p-0">
					<CodeBody html={html} code={code} />
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
			<div className="code-body overflow-x-auto p-3 font-mono text-xs [&_pre]:m-0 [&_pre]:p-0">
				<CodeBody html={html} code={code} />
			</div>
		</div>
	);
}

/** One file's body. Highlights on its own, so a switch never shows the previous file's markup. */
function FileBody({ code, language }: { code: string; language: string }) {
	const html = useHighlighted(code, language);
	return <CodeBody html={html} code={code} />;
}

/** File panel: `[file tabs] … [copy]` over the highlighted file. Body slides when switching files. */
export function CodePanel({ files, className }: CodePanelProps) {
	const spring = useSpringConfig();
	const [active, setActive] = useState(files[0]?.name ?? "");
	const file = files.find((f) => f.name === active) ?? files[0];

	if (!file) return null;

	return (
		<div className={cn("overflow-hidden rounded-lg border bg-muted/50 text-foreground", className)}>
			<div className="flex items-center justify-between gap-2 border-b px-2 py-1.5">
				<SegmentedTabs
					label="Snippet files"
					items={files.map((f) => f.name)}
					value={file.name}
					onChange={setActive}
				/>
				<CopyButton code={file.code} />
			</div>
			<div className="code-body overflow-x-auto p-4 font-mono text-xs [&_pre]:m-0 [&_pre]:p-0">
				<motion.div
					key={file.name}
					initial={{ opacity: 0, x: 12 }}
					animate={{ opacity: 1, x: 0 }}
					transition={spring}
				>
					<FileBody code={file.code} language={languageOf(file.name)} />
				</motion.div>
			</div>
		</div>
	);
}
