"use client";

import { ArrowDown } from "lucide-react";
import { AnimatePresence, animate, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AppWindow } from "@/components/ui/app-window";
import { CopyButton } from "@/components/ui/code";
import { useMounted } from "@/lib/platform";
import { cn, spring } from "@/lib/utils";

type Kind = "command" | "output" | "success" | "error" | "warn" | "muted";

export type TerminalLine = {
	/** Stable key for streamed logs; defaults to the line's index. */
	id?: string | number;
	kind?: Kind;
	/** Line content. */
	text: string;
	/** Optional left column, e.g. "12:04:31". */
	time?: string;
};

type TerminalProps = {
	/** Lines in order; append to stream a `log`. */
	lines: TerminalLine[];
	/** Window title. */
	title?: string;
	/** Symbol before commands. */
	prompt?: string;
	/** Types the commands and reveals the output once in view (install snippets). */
	typing?: boolean;
	/** Ms per typed character. */
	speed?: number;
	/** Live log: role="log", sticks to the bottom unless you scroll up to read. */
	log?: boolean;
	/** What Copy puts on the clipboard; defaults to the commands. `false` hides it. */
	copyText?: string | false;
	className?: string;
	/** Size the scrolling body, e.g. "h-64". */
	bodyClassName?: string;
};

// Status is never color alone, each status line gets a glyph.
const kinds: Record<Kind, { className: string; glyph?: string; glyphClass?: string }> = {
	command: { className: "text-foreground" },
	output: { className: "text-foreground/80" },
	muted: { className: "text-muted-foreground" },
	success: { className: "text-foreground", glyph: "✓", glyphClass: "text-success-ink" },
	warn: { className: "text-foreground", glyph: "⚠", glyphClass: "text-warning-ink" },
	error: { className: "text-destructive-ink", glyph: "✗", glyphClass: "text-destructive-ink" },
};

function Line({
	line,
	prompt,
	text = line.text,
	cursor,
}: {
	line: TerminalLine;
	prompt: string;
	text?: string;
	cursor?: boolean;
}) {
	const kind = kinds[line.kind ?? "output"];

	return (
		<div className={cn("whitespace-pre-wrap break-words", kind.className)}>
			{line.time && (
				<span className="mr-3 text-muted-foreground tabular-nums select-none">{line.time}</span>
			)}
			{line.kind === "command" && (
				<span className="mr-2 text-muted-foreground select-none">{prompt}</span>
			)}
			{kind.glyph && (
				<span aria-hidden="true" className={cn("mr-2", kind.glyphClass)}>
					{kind.glyph}
				</span>
			)}
			{text}
			{cursor && <Cursor />}
		</div>
	);
}

function Cursor() {
	return (
		<span
			aria-hidden="true"
			className="ml-px inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] animate-pulse bg-foreground/70"
		/>
	);
}

/**
 * Terminal window. Snippet mode types install commands once in view (full text stays
 * in the DOM for SEO and no-JS); log mode streams lines and follows the bottom unless you
 * scroll up, offering a jump back when new output arrives.
 */
export function Terminal({
	lines,
	title = "Terminal",
	prompt = "$",
	typing = false,
	speed = 35,
	log = false,
	copyText,
	className,
	bodyClassName,
}: TerminalProps) {
	const mounted = useMounted();
	// After mount only, so hydration matches.
	const reduce = useReducedMotion() && mounted;
	const body = useRef<HTMLDivElement>(null);
	const inView = useInView(body, { once: true, margin: "0px 0px -15% 0px" });

	/* ---- typing ---- */
	const [at, setAt] = useState({ line: 0, chars: 0 });
	const animated = typing && !reduce;
	const done = !animated || at.line >= lines.length;

	useEffect(() => {
		if (!animated || !inView || at.line >= lines.length) return;

		const line = lines[at.line];

		if (!line) return;

		const typingCommand = line.kind === "command" && at.chars < line.text.length;
		const timer = setTimeout(
			() =>
				setAt(
					typingCommand ? { line: at.line, chars: at.chars + 1 } : { line: at.line + 1, chars: 0 },
				),
			typingCommand ? speed : line.kind === "command" ? 350 : 90,
		);

		return () => clearTimeout(timer);
	}, [animated, inView, at, lines, speed]);

	/* ---- log: follow the bottom ---- */
	const stuck = useRef(true);
	const [behind, setBehind] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: runs when a line arrives
	useLayoutEffect(() => {
		const element = body.current;

		if (!log || !element) return;
		if (stuck.current) element.scrollTop = element.scrollHeight;
		else setBehind(true);
	}, [log, lines.length]);

	const toBottom = () => {
		const element = body.current;

		if (!element) return;
		stuck.current = true;
		setBehind(false);

		const target = element.scrollHeight - element.clientHeight;

		if (reduce) element.scrollTop = target;
		else
			animate(element.scrollTop, target, {
				...spring,
				onUpdate: (value) => (element.scrollTop = value),
			});
	};

	const clip =
		copyText === false
			? null
			: (copyText ??
				(lines.some((line) => line.kind === "command")
					? lines.filter((line) => line.kind === "command").map((item) => item.text)
					: lines.map((line) => line.text)
				).join("\n"));

	const key = (item: TerminalLine, i: number) => item.id ?? i;
	// Log mode: named live region, focusable so keyboard users can scroll back.
	const live = log ? ({ role: "log", "aria-label": title, tabIndex: 0 } as const) : {};

	return (
		<AppWindow
			title={title}
			actions={clip ? <CopyButton code={clip} label="Copy commands" /> : undefined}
			className={cn("w-full", className)}
			bodyClassName="relative p-0"
		>
			<div
				ref={body}
				{...live}
				onScroll={(event) => {
					const element = event.currentTarget;

					stuck.current = element.scrollHeight - element.scrollTop - element.clientHeight < 24;
					if (stuck.current) setBehind(false);
				}}
				className={cn(
					"overflow-auto p-4 font-mono text-[13px] leading-relaxed outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset",
					bodyClassName,
				)}
			>
				{animated ? (
					<>
						<div className="sr-only">
							{lines.map((item, i) => (
								<Line key={key(item, i)} line={item} prompt={prompt} />
							))}
						</div>
						<div aria-hidden="true" data-typewriter-animated="">
							{lines
								.slice(0, at.line + 1)
								.map((item, i) =>
									i < at.line ? (
										<Line key={key(item, i)} line={item} prompt={prompt} />
									) : item.kind === "command" ? (
										<Line
											key={key(item, i)}
											line={item}
											prompt={prompt}
											text={item.text.slice(0, at.chars)}
											cursor
										/>
									) : null,
								)}
							{done && <Line line={{ kind: "command", text: "" }} prompt={prompt} cursor />}
						</div>
						<div aria-hidden="true" data-typewriter-fallback="" className="hidden">
							{lines.map((item, i) => (
								<Line key={key(item, i)} line={item} prompt={prompt} />
							))}
						</div>
					</>
				) : log ? (
					lines.map((item, i) => (
						<motion.div
							key={key(item, i)}
							initial={{ opacity: 0, y: 4 }}
							animate={{ opacity: 1, y: 0 }}
							transition={spring}
						>
							<Line line={item} prompt={prompt} />
						</motion.div>
					))
				) : (
					lines.map((item, i) => <Line key={key(item, i)} line={item} prompt={prompt} />)
				)}
			</div>
			<AnimatePresence>
				{log && behind && (
					<motion.button
						type="button"
						onClick={toBottom}
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 8 }}
						transition={spring}
						className="-translate-x-1/2 absolute bottom-3 left-1/2 flex cursor-pointer items-center gap-1.5 rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground text-xs shadow-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
					>
						<ArrowDown className="size-3.5" aria-hidden="true" />
						New output
					</motion.button>
				)}
			</AnimatePresence>
		</AppWindow>
	);
}
