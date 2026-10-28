"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import { spring } from "@/lib/utils";

type CountToProps = {
	/** Final number. */
	to: number;
	/** Starting number. */
	from?: number;
	/** Text before the number, e.g. "$". */
	prefix?: string;
	/** Text after the number, e.g. "%". */
	suffix?: string;
	/** Digits after the decimal point. */
	decimals?: number;
	/** BCP 47 locale for grouping and decimals. */
	locale?: string;
	className?: string;
};

/** Springs a number from `from` to `to` once it scrolls into view. Final value stays in the DOM for SEO. */
export function CountTo({
	to,
	from = 0,
	prefix = "",
	suffix = "",
	decimals = 0,
	locale = "en-US",
	className,
}: CountToProps) {
	const reduce = useReducedMotion();
	const ref = useRef<HTMLSpanElement>(null);
	const out = useRef<HTMLSpanElement>(null);
	const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
	// One formatter, building it per frame (what toLocaleString does) is the slow part.
	const formatter = useMemo(
		() =>
			new Intl.NumberFormat(locale, {
				minimumFractionDigits: decimals,
				maximumFractionDigits: decimals,
			}),
		[locale, decimals],
	);
	const text = (value: number) => `${prefix}${formatter.format(value)}${suffix}`;
	const target = text(to);

	useEffect(() => {
		const element = out.current;

		if (!inView || !element) return;

		const show = (value: number) => {
			element.textContent = `${prefix}${formatter.format(value)}${suffix}`;
		};

		if (reduce) return show(to);

		// Straight to the DOM, no React render per tick.
		const controls = animate(from, to, {
			...spring,
			// Spring overshoots, a counter can't show past its target (no "100.4%" uptime).
			onUpdate: (value) => show(to >= from ? Math.min(value, to) : Math.max(value, to)),
		});

		return () => controls.stop();
	}, [inView, from, to, prefix, suffix, formatter, reduce]);

	return (
		<span ref={ref} className={className}>
			<span className="sr-only">{target}</span>
			<span ref={out} aria-hidden="true" data-count-to-animated="">
				{text(from)}
			</span>
			<span aria-hidden="true" data-count-to-fallback="" className="hidden">
				{target}
			</span>
		</span>
	);
}
