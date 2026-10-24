"use client";

import { Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ComponentProps, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { useIsMac } from "@/lib/platform";
import { useControllableState } from "@/lib/use-controllable-state";
import { cn, spring } from "@/lib/utils";

type SearchInputProps = Omit<
	ComponentProps<"input">,
	"type" | "value" | "defaultValue" | "onChange"
> & {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	/**
	 * Focuses the field from anywhere: a single key ("/") or "mod+f" (⌘ on Mac, Ctrl elsewhere).
	 * Steps aside while the field is hidden or already focused, so e.g. a second Ctrl+F still
	 * opens the browser's own find.
	 */
	shortcut?: string;
	/** Accessible name (default: "Search"). Skipped when you pass `id` for a `<Label htmlFor>`. */
	label?: string;
	/** "ghost": no border, ring or shadow; for inputs embedded in a surface (Command palette). */
	variant?: "default" | "ghost";
};

const isEditable = (t: EventTarget | null) =>
	t instanceof HTMLElement &&
	(t.isContentEditable || !!t.closest("input, textarea, select, [contenteditable='true']"));

function matches(e: KeyboardEvent, shortcut: string) {
	const [mod, key] = shortcut.includes("+") ? shortcut.split("+") : [undefined, shortcut];
	if (e.key.toLowerCase() !== key?.toLowerCase()) return false;
	return mod === "mod" ? e.metaKey || e.ctrlKey : !e.metaKey && !e.ctrlKey && !e.altKey;
}

const hint = (shortcut: string, mac: boolean) =>
	shortcut.startsWith("mod+")
		? `${mac ? "⌘" : "Ctrl "}${shortcut.slice(4).toUpperCase()}`
		: shortcut;

/** Search field: icon, spring clear button, Esc clears, optional focus shortcut with a Kbd hint. */
export function SearchInput({
	value: valueProp,
	defaultValue = "",
	onValueChange,
	shortcut,
	label = "Search",
	variant = "default",
	className,
	ref,
	onKeyDown,
	...props
}: SearchInputProps) {
	const mac = useIsMac();
	const input = useRef<HTMLInputElement | null>(null);
	const [value, setValue] = useControllableState(valueProp, defaultValue, onValueChange);

	useEffect(() => {
		if (!shortcut) return;
		const onKey = (e: KeyboardEvent) => {
			const el = input.current;
			if (!el || !matches(e, shortcut)) return;
			if (!shortcut.startsWith("mod+") && isEditable(e.target)) return;
			// Hidden (e.g. a collapsed sidebar) or already focused: leave the key to the browser.
			if (el.getClientRects().length === 0 || document.activeElement === el) return;
			e.preventDefault();
			el.focus();
			el.select();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [shortcut]);

	return (
		<div className={cn("relative w-full", className)}>
			<Search
				aria-hidden="true"
				className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground"
			/>
			<Input
				ref={(el) => {
					input.current = el;
					if (typeof ref === "function") ref(el);
					else if (ref) ref.current = el;
				}}
				type="search"
				aria-label={props["aria-labelledby"] || props.id ? undefined : label}
				aria-keyshortcuts={shortcut?.replace("mod", mac ? "Meta" : "Control")}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={(e) => {
					onKeyDown?.(e);
					if (e.defaultPrevented || e.key !== "Escape") return;
					if (value) {
						e.preventDefault();
						setValue("");
					} else e.currentTarget.blur();
				}}
				className={cn(
					"pr-9 pl-9 [&::-webkit-search-cancel-button]:appearance-none",
					variant === "ghost" &&
						"rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent",
				)}
				{...props}
			/>
			<span className="-translate-y-1/2 absolute top-1/2 right-2 flex">
				<AnimatePresence mode="popLayout" initial={false}>
					{value ? (
						<motion.button
							key="clear"
							type="button"
							aria-label="Clear search"
							initial={{ scale: 0.5, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.5, opacity: 0 }}
							transition={spring}
							onClick={() => {
								setValue("");
								input.current?.focus();
							}}
							className="grid size-6 cursor-pointer place-items-center rounded-md text-muted-foreground outline-none transition-colors duration-400 ease-in-out hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
						>
							<X className="size-3.5" aria-hidden="true" />
						</motion.button>
					) : (
						shortcut && (
							<motion.span
								key="hint"
								aria-hidden="true"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={spring}
								className="pointer-events-none flex"
							>
								<Kbd>{hint(shortcut, mac)}</Kbd>
							</motion.span>
						)
					)}
				</AnimatePresence>
			</span>
		</div>
	);
}
