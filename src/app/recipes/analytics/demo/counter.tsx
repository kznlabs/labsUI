"use client";

import { useState } from "react";
import { CountTo } from "@/components/ui/count-to";
import { store } from "./data";

/** CountTo that springs from the number it showed last, not from zero, when the range changes. */
export function Counter({
	to,
	prefix,
	suffix,
	decimals = 0,
}: {
	to: number;
	prefix?: string;
	suffix?: string;
	decimals?: number;
}) {
	const [shown, setShown] = useState({ from: 0, to });

	if (shown.to !== to) setShown({ from: shown.to, to });

	return (
		<CountTo
			from={shown.from}
			to={to}
			prefix={prefix}
			suffix={suffix}
			decimals={decimals}
			locale={store.locale}
		/>
	);
}
