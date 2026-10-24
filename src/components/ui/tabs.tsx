"use client";

import { motion } from "motion/react";
import {
	type ComponentProps,
	createContext,
	type KeyboardEvent,
	type ReactNode,
	use,
	useId,
	useRef,
} from "react";
import { useControllableState } from "@/lib/use-controllable-state";
import { useIndicator } from "@/lib/use-indicator";
import { cn, spring } from "@/lib/utils";

type TabsCtx = {
	value: string;
	setValue: (value: string) => void;
	id: string;
	variant: "segmented" | "underline";
	triggers: Map<string, HTMLButtonElement>;
};

const TabsContext = createContext<TabsCtx | null>(null);

function useTabs() {
	const ctx = use(TabsContext);
	if (!ctx) throw new Error("Tabs parts must be used inside <Tabs>");
	return ctx;
}

const slug = (value: string) => value.replace(/\s+/g, "-");

type TabsProps = Omit<ComponentProps<"div">, "defaultValue"> & {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	/** "segmented": pill in a muted track. "underline": bar under the active tab. */
	variant?: "segmented" | "underline";
};

/** WAI-ARIA tabs. Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`). */
export function Tabs({
	value: valueProp,
	defaultValue = "",
	onValueChange,
	variant = "segmented",
	className,
	children,
	...props
}: TabsProps) {
	const id = useId();
	const triggers = useRef(new Map<string, HTMLButtonElement>()).current;
	const [value, setValue] = useControllableState(valueProp, defaultValue, onValueChange);
	return (
		<TabsContext value={{ value, setValue, id, variant, triggers }}>
			<div className={cn("flex flex-col gap-3", className)} {...props}>
				{children}
			</div>
		</TabsContext>
	);
}

/** One indicator springs to the active tab, always behind the labels. Arrows, Home and End move focus. */
export function TabsList({ className, children, ...props }: ComponentProps<"div">) {
	const { value, setValue, variant, triggers } = useTabs();
	const box = useIndicator(triggers, value);

	const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		const tabs = [
			...e.currentTarget.querySelectorAll<HTMLButtonElement>("[role='tab']:not(:disabled)"),
		];
		const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
		if (i < 0) return;
		const next = {
			ArrowRight: tabs[(i + 1) % tabs.length],
			ArrowLeft: tabs[(i - 1 + tabs.length) % tabs.length],
			Home: tabs[0],
			End: tabs.at(-1),
		}[e.key];
		if (!next) return;
		e.preventDefault();
		next.focus();
		if (next.dataset.value) setValue(next.dataset.value);
	};

	const segmented = variant === "segmented";
	return (
		<div
			role="tablist"
			aria-orientation="horizontal"
			onKeyDown={onKeyDown}
			className={cn(
				"relative isolate flex w-fit max-w-full items-center overflow-x-auto",
				segmented ? "gap-1 rounded-lg bg-foreground/[0.06] p-0.5" : "gap-4 border-b",
				className,
			)}
			{...props}
		>
			{box.width > 0 && (
				<motion.span
					aria-hidden="true"
					initial={false}
					animate={{ x: box.x, width: box.width }}
					transition={spring}
					className={cn(
						"-z-10 absolute left-0",
						segmented
							? "inset-y-0.5 rounded-md bg-card shadow-sm ring-[0.5px] ring-black/5 dark:bg-white/20 dark:ring-white/10"
							: "bottom-0 h-0.5 rounded-full bg-foreground",
					)}
				/>
			)}
			{children}
		</div>
	);
}

type TabsTriggerProps = Omit<ComponentProps<"button">, "value"> & { value: string };

export function TabsTrigger({ value, className, onClick, ...props }: TabsTriggerProps) {
	const { value: active, setValue, id, variant, triggers } = useTabs();
	const selected = value === active;
	return (
		<button
			ref={(el) => {
				if (el) triggers.set(value, el);
				else triggers.delete(value);
			}}
			type="button"
			role="tab"
			id={`${id}-tab-${slug(value)}`}
			aria-selected={selected}
			aria-controls={`${id}-panel-${slug(value)}`}
			tabIndex={selected ? 0 : -1}
			data-value={value}
			data-state={selected ? "active" : "inactive"}
			onClick={(e) => {
				onClick?.(e);
				if (!e.defaultPrevented) setValue(value);
			}}
			className={cn(
				"inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap font-medium text-sm outline-none transition-colors duration-400 ease-in-out focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
				variant === "segmented" ? "h-7 rounded-md px-3" : "h-9 rounded-sm px-0.5",
				selected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
				className,
			)}
			{...props}
		/>
	);
}

/** Inactive panels stay in the DOM (`hidden`) so their content remains crawlable. */
export function TabsContent({
	value,
	className,
	children,
}: {
	value: string;
	className?: string;
	children: ReactNode;
}) {
	const { value: active, id } = useTabs();
	const selected = value === active;
	return (
		<motion.div
			role="tabpanel"
			id={`${id}-panel-${slug(value)}`}
			aria-labelledby={`${id}-tab-${slug(value)}`}
			tabIndex={0}
			hidden={!selected}
			initial={false}
			animate={selected ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
			transition={spring}
			className={cn(
				"rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
				className,
			)}
		>
			{children}
		</motion.div>
	);
}
