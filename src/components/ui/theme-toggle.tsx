"use client";

import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useSyncExternalStore } from "react";
import { isDark, setTheme, subscribeTheme } from "@/lib/theme";
import { cn, spring } from "@/lib/utils";
import { Button } from "./button";

/** Icon button: sun/moon rotate-swap on a spring. Follows OS until first click. */
export function ThemeToggle({ className }: { className?: string }) {
	const dark = useSyncExternalStore(subscribeTheme, isDark, () => false);
	return (
		<Button
			variant="outline"
			size="icon"
			className={cn("rounded-full", className)}
			aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
			onClick={() => setTheme(dark ? "light" : "dark")}
		>
			<AnimatePresence mode="popLayout" initial={false}>
				<motion.span
					key={dark ? "moon" : "sun"}
					initial={{ rotate: -90, scale: 0, opacity: 0 }}
					animate={{ rotate: 0, scale: 1, opacity: 1 }}
					exit={{ rotate: 90, scale: 0, opacity: 0 }}
					transition={spring}
					className="inline-flex"
				>
					{dark ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
				</motion.span>
			</AnimatePresence>
		</Button>
	);
}
