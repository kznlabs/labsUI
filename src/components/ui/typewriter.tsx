"use client";

import { useEffect, useMemo, useState } from "react";
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
	cursorClassName?: string;
	className?: string;
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

	const fullText = phrases.join(" ");
	const currentPhrase = phrases[phraseIndex] ?? "";

	// Start delay
	useEffect(() => {
		if (delay <= 0) return;
		const timer = setTimeout(() => setStarted(true), delay);
		return () => clearTimeout(timer);
	}, [delay]);

	// Typing, pausing, deleting, and cycling
	useEffect(() => {
		if (!started || phrases.length === 0) return;

		// Completed typing the current phrase
		if (!isDeleting && subIndex === currentPhrase.length) {
			if (phrases.length === 1 && !loop) {
				onComplete?.();
				return;
			}
			const timer = setTimeout(() => {
				setIsDeleting(true);
			}, pauseDuration);
			return () => clearTimeout(timer);
		}

		// Completed deleting the current phrase
		if (isDeleting && subIndex === 0) {
			setIsDeleting(false);
			const next = (phraseIndex + 1) % phrases.length;
			if (next === 0 && !loop) {
				onComplete?.();
				return;
			}
			setPhraseIndex(next);
			return;
		}

		// Step next character (typing or deleting)
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
		onComplete,
	]);

	const displayed = currentPhrase.slice(0, subIndex);

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
