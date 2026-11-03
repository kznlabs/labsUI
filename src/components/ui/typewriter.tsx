"use client";

import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { buttonVariants } from "@/components/ui/button-variants";
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
	/** Pause typing on mouse hover (default: true). */
	pauseOnHover?: boolean;
	/** Show a pause button, so keyboard and touch users can stop it too (WCAG 2.2.2). With a mouse it shows on hover or focus. Use it when the text keeps moving next to other content. Hidden with reduced motion. */
	controls?: boolean;
	/** Accessible name of the pause button (default: "Pause animation"). */
	pauseLabel?: string;
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
	pauseOnHover = true,
	controls = false,
	pauseLabel = "Pause animation",
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
	const [isHovered, setIsHovered] = useState(false);
	const [isStopped, setIsStopped] = useState(false);
	const isPaused = isHovered || isStopped;

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
		if (!started || isPaused || phrases.length === 0) return;

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
		isPaused,
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
		/* biome-ignore lint/a11y/noStaticElementInteractions: pause typing on hover */
		<span
			onMouseEnter={pauseOnHover ? () => setIsHovered(true) : undefined}
			onMouseLeave={pauseOnHover ? () => setIsHovered(false) : undefined}
			className={cn("group/pause inline-flex items-baseline", className)}
		>
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
						"ml-0.5 inline-block animate-pulse font-light motion-reduce:animate-none text-muted-foreground select-none",
						cursorClassName,
					)}
				>
					{cursorChar}
				</span>
			)}

			{controls && mounted && !reduce && (
				<PauseButton label={pauseLabel} pressed={isStopped} onPressedChange={setIsStopped} />
			)}
		</span>
	);
}

function PauseButton({
	label,
	pressed,
	onPressedChange,
}: {
	label: string;
	pressed: boolean;
	onPressedChange: (pressed: boolean) => void;
}) {
	return (
		<button
			type="button"
			aria-label={label}
			aria-pressed={pressed}
			onClick={() => onPressedChange(!pressed)}
			className={buttonVariants({
				variant: "ghost",
				size: "icon",
				// A mouse pauses it by hovering, so the button waits for hover or focus; touch always sees it.
				className:
					"ml-1 size-6 self-center rounded-md text-muted-foreground [&_svg]:size-3.5 opacity-0 group-hover/pause:opacity-100 focus-visible:opacity-100 aria-pressed:opacity-100 pointer-coarse:opacity-100",
			})}
		>
			{pressed ? <Play /> : <Pause />}
		</button>
	);
}
