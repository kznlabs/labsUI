"use client";

import { createContext, type ReactNode, useContext } from "react";
import { spring as defaultSpring } from "@/lib/utils";

export type SpringConfig = { type: "spring"; stiffness: number; damping: number };

const SpringContext = createContext<SpringConfig>(defaultSpring);

/** Overrides the spring for everything inside, e.g. a showcase playground. */
export function SpringScope({ value, children }: { value: SpringConfig; children: ReactNode }) {
	return <SpringContext.Provider value={value}>{children}</SpringContext.Provider>;
}

/** The current spring. Defaults to the library-wide `spring` from `@/lib/utils`. */
export function useSpringConfig() {
	return useContext(SpringContext);
}
