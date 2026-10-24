"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

/* One shared ticker for every <RelativeTime> on the page. */
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
function subscribe(cb: () => void) {
	listeners.add(cb);
	timer ??= setInterval(() => {
		for (const l of listeners) l();
	}, 15_000);
	return () => {
		listeners.delete(cb);
		if (listeners.size === 0) {
			clearInterval(timer);
			timer = undefined;
		}
	};
}

const units: [Intl.RelativeTimeFormatUnit, number][] = [
	["year", 31_536_000],
	["month", 2_592_000],
	["week", 604_800],
	["day", 86_400],
	["hour", 3_600],
	["minute", 60],
];

function relative(date: Date, locale: string) {
	const seconds = (date.getTime() - Date.now()) / 1000;
	const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
	for (const [unit, size] of units) {
		if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
	}
	return Math.abs(seconds) < 45
		? rtf.format(0, "second")
		: rtf.format(Math.round(seconds), "second");
}

type RelativeTimeProps = {
	/** A stored timestamp. Not `Date.now()` in render: server and client would differ (hydration). */
	date: Date | string | number;
	/** Both the relative text and the full date in the title (default "en-US"; pass the page's). */
	locale?: string;
	className?: string;
};

/**
 * "5 minutes ago" that keeps itself current (one shared 15s ticker). A semantic <time> with the
 * full date in its title. The server renders the absolute date, so there is no hydration mismatch
 * and crawlers get a real date.
 */
export function RelativeTime({ date, locale = "en-US", className }: RelativeTimeProps) {
	const d = new Date(date);
	const absolute = new Intl.DateTimeFormat(locale, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(d);
	const text = useSyncExternalStore(
		subscribe,
		() => relative(d, locale),
		() => absolute,
	);
	return (
		<time dateTime={d.toISOString()} title={absolute} className={cn("tabular-nums", className)}>
			{text}
		</time>
	);
}
