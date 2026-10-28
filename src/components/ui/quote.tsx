"use client";

import { Quote as QuoteIcon } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn, spring } from "@/lib/utils";
import { TextSwap } from "./text-swap";
import { Typewriter } from "./typewriter";

type QuoteProps = {
	/** The quoted text; plain strings work with `typewriter`. */
	children: ReactNode;
	/** Who said or wrote it. */
	author?: string;
	/** Language of the quoted text, e.g. "pl": correct screen-reader pronunciation and SEO. */
	lang?: string;
	/** Secondary line under the author, e.g. job title. */
	subtitle?: string;
	/** Avatar slot, e.g. <Avatar size="sm" alt="Jane Doe" />. */
	avatar?: ReactNode;
	/** "plain" text, "card" surface, or "large" display text with an accent mark. */
	variant?: "plain" | "card" | "large";
	/** Enables typewriter effect for string children, or pass custom speed/delay options. */
	typewriter?: boolean | { speed?: number; delay?: number; cursor?: boolean };
	/** Cycles through an array of quotes with spring text swap transitions. */
	textSwap?:
		| readonly string[]
		| {
				items: readonly string[];
				interval?: number;
				direction?: "up" | "down" | "fade";
		  };
	className?: string;
};

const surface = {
	plain: "gap-3",
	card: "gap-4 rounded-xl border bg-card p-5 text-card-foreground shadow-xs",
	large: "gap-5 py-4",
} as const;

/** Semantic quote: figure, blockquote and figcaption. Fades in on a spring when it scrolls into view. Supports typewriter and textSwap. */
export function Quote({
	children,
	author,
	subtitle,
	avatar,
	lang,
	variant = "plain",
	typewriter,
	textSwap,
	className,
}: QuoteProps) {
	const large = variant === "large";

	return (
		<motion.figure
			data-reveal=""
			initial={{ opacity: 0, y: 12 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={spring}
			className={cn("flex flex-col", surface[variant], className)}
		>
			{large && <QuoteIcon aria-hidden="true" className="size-8 text-muted-foreground/60" />}
			<blockquote
				lang={lang}
				className={cn(
					large
						? "font-medium text-2xl leading-snug tracking-tight text-balance"
						: "text-muted-foreground text-sm leading-relaxed",
				)}
			>
				<div className={cn(!large && "text-foreground")}>
					{typewriter && typeof children === "string" ? (
						<Typewriter
							text={children}
							loop={false}
							{...(typeof typewriter === "object" ? typewriter : {})}
						/>
					) : textSwap ? (
						<TextSwap
							items={
								Array.isArray(textSwap)
									? textSwap
									: "items" in textSwap
										? textSwap.items
										: undefined
							}
							interval={
								typeof textSwap === "object" && "interval" in textSwap
									? textSwap.interval
									: undefined
							}
							direction={
								typeof textSwap === "object" && "direction" in textSwap
									? textSwap.direction
									: undefined
							}
						/>
					) : (
						children
					)}
				</div>
			</blockquote>
			{(author || avatar) && (
				<figcaption className="flex items-center gap-3">
					{avatar}
					<span className="grid text-left">
						{author && <span className="font-medium text-foreground text-sm">{author}</span>}
						{subtitle && <span className="text-muted-foreground text-xs">{subtitle}</span>}
					</span>
				</figcaption>
			)}
		</motion.figure>
	);
}
