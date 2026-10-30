"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { useMounted } from "@/lib/platform";
import { cn } from "@/lib/utils";

type TypewriterProps = {
	/** Text to type, or an array of phrases to cycle through. */
	text: string | readonly string[];
	/** Milliseconds per character while typing (default: 40). */
	speed?: number;
	/** Milliseconds per character while deleting (default: 24). */
	deleteSpeed?: number;
	/** Milliseconds to wait before starting typing (default: 0). */
	delay?: number;
	/** Milliseconds to pause once a phrase is fully typed (default: 2000). */
	pauseDuration?: number;
	/** Whether to loop through phrases when text is an array (default: true). */
	loop?: boolean;
	/** Whether to show a blinking cursor (default: true). */
	cursor?: boolean;
	/** Custom character for the cursor (default: "|"). */
	cursorChar?: string;
	/** Classes for the blinking cursor. */
	cursorClassName?: string;
	className?: string;
	/** Called when the text is fully typed. */
	onComplete?: () => void;
};

/** Typewriter effect for headers, quotes, and hero text. Full text stays in the DOM for SEO. */
export function Typewriter({
	text,
	speed = 40,
	deleteSpeed = 24,
	delay = 0,
	pauseDuration = 2000,
	loop = true,
	cursor = true,
	cursorChar = "|",
	cursorClassName,
	className,
	onComplete,
}: TypewriterProps) {
	const phrases = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);
	const [started, setStarted] = useState(delay <= 0);
	const [phraseIndex, setPhraseIndex] = useState(0);
	const [subIndex, setSubIndex] = useState(0);
	const [isDeleting, setIsDeleting] = useState(false);

	const mounted = useMounted();
	// After mount only, so hydration matches.
	const reduce = useReducedMotion() && mounted;
	// Effect event, an inline onComplete can't restart the effect (and fire again) every render.
	const complete = useEffectEvent(() => onComplete?.());

	const fullText = phrases.join(" ");
	const currentPhrase = phrases[phraseIndex] ?? "";

	useEffect(() => {
		if (delay <= 0) return;

		const timer = setTimeout(() => setStarted(true), delay);

		return () => clearTimeout(timer);
	}, [delay]);

	useEffect(() => {
		if (!started || phrases.length === 0) return;

		if (!isDeleting && subIndex === currentPhrase.length) {
			if (phrases.length === 1 && !loop) {
				complete();

				return;
			}

			const timer = setTimeout(() => {
				setIsDeleting(true);
			}, pauseDuration);

			return () => clearTimeout(timer);
		}

		if (isDeleting && subIndex === 0) {
			setIsDeleting(false);

			const next = (phraseIndex + 1) % phrases.length;

			if (next === 0 && !loop) {
				complete();

				return;
			}

			setPhraseIndex(next);

			return;
		}

		const timeout = isDeleting ? deleteSpeed : speed;
		const timer = setTimeout(() => {
			setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
		}, timeout);

		return () => clearTimeout(timer);
	}, [
		started,
		subIndex,
		isDeleting,
		phraseIndex,
		currentPhrase,
		phrases,
		loop,
		pauseDuration,
		speed,
		deleteSpeed,
	]);

	// Reduced motion: no typing, just the first phrase.
	const displayed = reduce ? (phrases[0] ?? "") : currentPhrase.slice(0, subIndex);

	return (
		<span className={cn("inline-flex items-baseline", className)}>
			<span className="sr-only">{fullText}</span>

			<span aria-hidden="true" data-typewriter-animated="">
				{displayed}
			</span>

			<span aria-hidden="true" data-typewriter-fallback="" className="hidden">
				{phrases[0]}
			</span>

			{cursor && (
				<span
					aria-hidden="true"
					className={cn(
						"ml-0.5 inline-block animate-pulse font-light text-muted-foreground select-none",
						cursorClassName,
					)}
				>
					{cursorChar}
				</span>
			)}
		</span>
	);
}
