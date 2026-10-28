"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { spring } from "@/lib/utils";

/** Global default spring + honors prefers-reduced-motion. */
export function MotionProvider({ children }: { children: ReactNode }) {
	return (
		<MotionConfig transition={spring} reducedMotion="user">
			{children}
		</MotionConfig>
	);
}
