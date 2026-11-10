"use client";

import { Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const CUTOFF_HOUR = 16;

/** Days that count for shipping: Sunday is skipped. */
function addShipDays(from: Date, days: number) {
	const date = new Date(from);
	let left = days;

	while (left > 0) {
		date.setDate(date.getDate() + 1);
		if (date.getDay() !== 0) left--;
	}

	return date;
}

export function deliveryPromise(now: Date, extraDays = 0) {
	const cutoff = new Date(now);

	cutoff.setHours(CUTOFF_HOUR, 0, 0, 0);

	const afterCutoff = now >= cutoff;

	if (afterCutoff) cutoff.setDate(cutoff.getDate() + 1);

	// Orders after cut-off are packed the next day; a Sunday cut-off rolls to Monday.
	const packDay = new Date(cutoff);

	if (packDay.getDay() === 0) packDay.setDate(packDay.getDate() + 1);

	const arrival = addShipDays(packDay, 1 + extraDays);
	const mins = Math.max(1, Math.ceil((cutoff.getTime() - now.getTime()) / 60000));
	const left = mins >= 60 ? `${Math.floor(mins / 60)} h ${mins % 60} min` : `${mins} min`;
	const tomorrow = new Date(now);

	tomorrow.setDate(tomorrow.getDate() + 1);

	const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
	const when = same(arrival, tomorrow)
		? "tomorrow"
		: arrival.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });

	return { left, when };
}

/** "Order in the next 2 h 14 min, arrives tomorrow": a promise with a time. */
export function Delivery({ extraDays = 0, className }: { extraDays?: number; className?: string }) {
	const [now, setNow] = useState<Date | null>(null);

	useEffect(() => {
		setNow(new Date());

		const timer = setInterval(() => setNow(new Date()), 15000);

		return () => clearInterval(timer);
	}, []);

	const promise = now ? deliveryPromise(now, extraDays) : null;

	return (
		<p className={cn("flex items-start gap-2 text-sm", className)}>
			<Truck className="mt-0.5 size-4 shrink-0 text-primary-ink" aria-hidden />

			{promise ? (
				<span>
					Order in the next <strong className="font-semibold">{promise.left}</strong>, arrives{" "}
					<strong className="font-semibold">{promise.when}</strong>
				</span>
			) : (
				<span className="text-muted-foreground">Order before 16:00 for the fastest delivery</span>
			)}
		</p>
	);
}
