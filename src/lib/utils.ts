import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/** Frosted material for floating surfaces (menus, popovers, tooltips, toasts): translucent + blur. */
export const material = "bg-popover/92 backdrop-blur-xl backdrop-saturate-125";

/** The one spring. Every interaction in the library uses it. */
export const spring = { type: "spring", stiffness: 400, damping: 30 } as const;

export const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);

/** An amount of money, with decimals only when it has any: `$49`, `$49.99`, `49,99 zł`. */
export function formatMoney(amount: number, currency = "USD", locale = "en-US") {
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency,
		trailingZeroDisplay: "stripIfInteger",
	}).format(amount);
}
