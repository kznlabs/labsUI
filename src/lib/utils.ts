import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/** macOS vibrancy for floating surfaces (menus, popovers, tooltips, toasts): translucent + blur. */
export const material = "bg-popover/80 backdrop-blur-2xl backdrop-saturate-[1.8]";

/** The one spring. Every interaction in the library uses it. */
export const spring = { type: "spring", stiffness: 400, damping: 30 } as const;
