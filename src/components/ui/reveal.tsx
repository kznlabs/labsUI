"use client";

import { type HTMLMotionProps, motion } from "motion/react";
import { useSpringConfig } from "@/lib/spring-config";

type RevealProps = HTMLMotionProps<"div"> & {
	/** Seconds to wait after entering view. */
	delay?: number;
	/** Start offset in px. Content rises into place. */
	y?: number;
};

/** Fades and rises in on a spring the first time it scrolls into view. Stays visible after. */
export function Reveal({ delay = 0, y = 24, children, ...props }: RevealProps) {
	const spring = useSpringConfig();
	return (
		<motion.div
			data-reveal=""
			initial={{ opacity: 0, y }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "0px 0px -10% 0px" }}
			transition={{ ...spring, delay }}
			{...props}
		>
			{children}
		</motion.div>
	);
}
