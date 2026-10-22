"use client";

import { spring as defaultSpring } from "@/lib/utils";

type SpringConfig = {
	type: "spring";
	stiffness: number;
	damping: number;
	mass?: number;
};

/** The library-wide spring from `@/lib/utils`. */
export function useSpringConfig(): SpringConfig {
	return defaultSpring;
}
