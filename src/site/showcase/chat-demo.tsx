"use client";

import { ArrowUp, Bot, Sparkles } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { AppWindow } from "@/components/ui/app-window";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code } from "@/components/ui/code";
import { MessageBubble } from "@/components/ui/message-bubble";
import { Textarea } from "@/components/ui/textarea";

type Msg = {
	id: number;
	from: "user" | "assistant";
	text: string;
	code?: string;
	streaming?: boolean;
};

const SPRING_CODE = `<motion.div
  animate={{ height: open ? "auto" : 0 }}
  transition={{ type: "spring", stiffness: 400, damping: 30 }}
/>`;

const replies = [
	"Springs feel natural because they carry velocity: interrupt one mid-flight and it redirects smoothly instead of restarting.",
	"Compose primitives: wrap a MessageBubble list in a AppWindow, add a Textarea and a Button, and you have a chat UI.",
	"Tip: keep one spring config for the whole app. Consistency matters more than the exact numbers.",
];

const bot = <Avatar size="sm" alt="Assistant" fallback={<Bot className="size-4" />} />;
const me = <Avatar size="sm" alt="You" fallback="ME" />;

export function ChatDemo() {
	const [messages, setMessages] = useState<Msg[]>([
		{ id: 1, from: "user", text: "How do I animate height with motion?" },
		{
			id: 2,
			from: "assistant",
			text: "Animate to `auto` with a spring. motion measures the target height for you:",
			code: SPRING_CODE,
		},
	]);
	const [draft, setDraft] = useState("");
	const busy = messages.some((message) => message.streaming);
	const log = useRef<HTMLOListElement>(null);
	const turn = useRef(0);

	useEffect(() => {
		const element = log.current;

		if (element && messages.length)
			element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
	}, [messages]);

	const send = (event?: FormEvent) => {
		event?.preventDefault();

		const text = draft.trim();

		if (!text || busy) return;

		const id = Date.now();

		setDraft("");
		setMessages((message) => [
			...message,
			{ id, from: "user", text },
			{ id: id + 1, from: "assistant", text: "", streaming: true },
		]);

		const words = (replies[turn.current++ % replies.length] ?? "").split(" ");
		let i = 0;

		setTimeout(() => {
			const timer = setInterval(() => {
				i++;

				const done = i >= words.length;

				setMessages((message) =>
					message.map((msg) =>
						msg.id === id + 1
							? { ...msg, text: words.slice(0, i).join(" "), streaming: !done }
							: msg,
					),
				);
				if (done) clearInterval(timer);
			}, 45);
		}, 700);
	};

	return (
		<AppWindow
			className="h-[520px] w-full max-w-2xl"
			bodyClassName="flex min-h-0 flex-col"
			title="Assistant"
			actions={
				<Badge variant={busy ? "secondary" : "success"} shape="pill" dot>
					{busy ? "Thinking" : "Online"}
				</Badge>
			}
		>
			<ol
				ref={log}
				aria-label="Conversation"
				className="flex flex-1 flex-col gap-5 overflow-y-auto p-5"
			>
				{messages.map((message) => (
					<li key={message.id}>
						<MessageBubble
							from={message.from}
							avatar={message.from === "user" ? me : bot}
							name={message.from === "user" ? "You" : "Assistant"}
							streaming={message.streaming}
						>
							{message.text && <p>{renderInlineCode(message.text)}</p>}

							{message.code && <Code code={message.code} language="tsx" />}
						</MessageBubble>
					</li>
				))}
			</ol>

			<form onSubmit={send} className="border-t p-3">
				<div className="flex items-end gap-2 rounded-xl border bg-background p-1.5 shadow-xs transition-shadow focus-within:ring-[3px] focus-within:ring-ring/50">
					<Textarea
						rows={1}
						value={draft}
						onChange={(event) => setDraft(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === "Enter" && !event.shiftKey) send(event);
						}}
						placeholder="Message the assistant…  (Enter to send)"
						aria-label="Message"
						className="max-h-32 min-h-9 border-0 bg-transparent shadow-none focus-visible:ring-0"
					/>

					<Button type="submit" size="icon" aria-label="Send" disabled={!draft.trim() || busy}>
						<ArrowUp />
					</Button>
				</div>

				<p className="mt-2 flex items-center gap-1.5 px-1 text-muted-foreground text-xs">
					<Sparkles className="size-3" /> Simulated streaming reply
				</p>
			</form>
		</AppWindow>
	);
}

/** Backticks as <code>. Minimal on purpose, use a markdown renderer in real apps. */
function renderInlineCode(text: string) {
	return text.split(/(`[^`]+`)/).map((part, i) =>
		part.startsWith("`") && part.endsWith("`") ? (
			// biome-ignore lint/suspicious/noArrayIndexKey: static split of an immutable string
			<code key={i}>{part.slice(1, -1)}</code>
		) : (
			part
		),
	);
}
