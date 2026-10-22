"use client";

import { animate } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useSpringConfig } from "@/lib/spring-config";

type CountToProps = {
	to: number;
	from?: number;
	prefix?: string;
	suffix?: string;
	decimals?: number;
	locale?: string;
	className?: string;
};

function format(
	n: number,
	{ prefix, suffix, decimals, locale }: Required<Omit<CountToProps, "to" | "from" | "className">>,
) {
	return `${prefix}${n.toLocaleString(locale, {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	})}${suffix}`;
}

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
	const spring = useSpringConfig();
	const ref = useRef<HTMLSpanElement>(null);
	const [started, setStarted] = useState(false);
	const [display, setDisplay] = useState(() => format(from, { prefix, suffix, decimals, locale }));
	const targetDisplay = format(to, { prefix, suffix, decimals, locale });

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					setStarted(true);
					observer.disconnect();
				}
			},
			{ rootMargin: "0px 0px -10% 0px" },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!started) return;
		const controls = animate(from, to, {
			...spring,
			onUpdate: (v) => setDisplay(format(v, { prefix, suffix, decimals, locale })),
		});
		return () => controls.stop();
	}, [started, from, to, prefix, suffix, decimals, locale, spring]);

	return (
		<span ref={ref} className={className}>
			<span className="sr-only">{targetDisplay}</span>
			<span aria-hidden="true" data-count-to-animated="">
				{display}
			</span>
			<span aria-hidden="true" data-count-to-fallback="" className="hidden">
				{targetDisplay}
			</span>
		</span>
	);
}
