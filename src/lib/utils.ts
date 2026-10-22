import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/** The one spring. Every interaction in the library uses it. */
export const spring = { type: "spring", stiffness: 400, damping: 30 } as const;
