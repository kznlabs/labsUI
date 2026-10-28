import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/** Frosted material for floating surfaces (menus, popovers, tooltips, toasts): translucent + blur. */
export const material = "bg-popover/80 backdrop-blur-2xl backdrop-saturate-[1.8]";

/** The one spring. Every interaction in the library uses it. */
export const spring = { type: "spring", stiffness: 400, damping: 30 } as const;

export const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);
