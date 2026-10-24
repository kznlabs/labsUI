"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn, spring } from "@/lib/utils";

type MessageBubbleProps = {
	from: "user" | "assistant";
	/** Avatar slot, e.g. <Avatar size="sm" … />. */
	avatar?: ReactNode;
	name?: string;
	time?: string;
	/** Shows animated typing dots after the content. */
	streaming?: boolean;
	className?: string;
	children?: ReactNode;
};

/** Chat bubble. Children are rich content: <p>, inline <code>, lists, <Code>. */
export function MessageBubble({
	from,
	avatar,
	name,
	time,
	streaming,
	className,
	children,
}: MessageBubbleProps) {
	const user = from === "user";
	return (
		<motion.article
			aria-label={`${name ?? from} message`}
			initial={{ opacity: 0, y: 10, scale: 0.98 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={spring}
			style={{ transformOrigin: user ? "bottom right" : "bottom left" }}
			className={cn("flex w-full gap-3", user && "flex-row-reverse", className)}
		>
			{avatar && <div className="shrink-0 pt-5">{avatar}</div>}
			<div className={cn("flex min-w-0 max-w-[85%] flex-col gap-1", user && "items-end")}>
				{(name || time) && (
					<header className="flex items-center gap-2 px-1 text-muted-foreground text-xs">
						{name && <span className="font-medium text-foreground">{name}</span>}
						{time && <time>{time}</time>}
					</header>
				)}
				<div
					className={cn(
						"min-w-0 rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
						"[&_p+*]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_:not(pre)>code]:rounded [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.85em]",
						user
							? "rounded-br-md bg-primary text-primary-foreground [&_:not(pre)>code]:bg-primary-foreground/15"
							: "rounded-bl-md border bg-card text-card-foreground shadow-xs [&_:not(pre)>code]:bg-muted",
					)}
				>
					{children}
					{streaming && <TypingDots className={children ? "mt-2" : "py-1.5"} />}
				</div>
			</div>
		</motion.article>
	);
}

function TypingDots({ className }: { className?: string }) {
	return (
		<span
			role="status"
			aria-label="Assistant is typing"
			className={cn("flex items-center gap-1", className)}
		>
			{[0, 1, 2].map((i) => (
				<motion.span
					key={i}
					className="size-1.5 rounded-full bg-current opacity-60"
					animate={{ y: [0, -4, 0], opacity: [0.35, 1, 0.35] }}
					transition={{
						duration: 0.9,
						repeat: Number.POSITIVE_INFINITY,
						delay: i * 0.15,
						ease: "easeInOut",
					}}
				/>
			))}
		</span>
	);
}
