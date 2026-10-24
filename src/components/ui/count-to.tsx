"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import { spring } from "@/lib/utils";

type CountToProps = {
	to: number;
	from?: number;
	prefix?: string;
	suffix?: string;
	decimals?: number;
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
	// One formatter: building it per frame (what toLocaleString does) is the expensive part.
	const nf = useMemo(
		() =>
			new Intl.NumberFormat(locale, {
				minimumFractionDigits: decimals,
				maximumFractionDigits: decimals,
			}),
		[locale, decimals],
	);
	const text = (n: number) => `${prefix}${nf.format(n)}${suffix}`;
	const target = text(to);

	useEffect(() => {
		const el = out.current;
		if (!inView || !el) return;
		const show = (n: number) => {
			el.textContent = `${prefix}${nf.format(n)}${suffix}`;
		};
		if (reduce) return show(to);
		// Straight to the DOM each frame: no React render per tick.
		const controls = animate(from, to, {
			...spring,
			// The spring overshoots; a counter must never show past its target (no "100.4%" uptime).
			onUpdate: (v) => show(to >= from ? Math.min(v, to) : Math.max(v, to)),
		});
		return () => controls.stop();
	}, [inView, from, to, prefix, suffix, nf, reduce]);

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
