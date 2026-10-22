"use client";

import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { createContext, type ReactNode, use, useCallback, useId, useState } from "react";
import { useSpringConfig } from "@/lib/spring-config";
import { cn } from "@/lib/utils";

type AccordionCtx = { open: string[]; toggle: (value: string) => void };
type ItemCtx = { value: string; open: boolean; id: string };

const AccordionContext = createContext<AccordionCtx | null>(null);
const ItemContext = createContext<ItemCtx | null>(null);

function useItem() {
	const ctx = use(ItemContext);
	if (!ctx) throw new Error("Accordion parts must be used inside <AccordionItem>");
	return ctx;
}

type AccordionProps = {
	/** "single": one panel at a time. "multiple": independent panels. */
	type?: "single" | "multiple";
	/** single only: allow closing the open panel. */
	collapsible?: boolean;
	defaultValue?: string | string[];
	className?: string;
	children: ReactNode;
};

export function Accordion({
	type = "single",
	collapsible = true,
	defaultValue,
	className,
	children,
}: AccordionProps) {
	const [open, setOpen] = useState<string[]>(defaultValue ? [defaultValue].flat() : []);
	const toggle = useCallback(
		(v: string) =>
			setOpen((prev) => {
				if (prev.includes(v))
					return type === "single" && !collapsible ? prev : prev.filter((x) => x !== v);
				return type === "single" ? [v] : [...prev, v];
			}),
		[type, collapsible],
	);
	return (
		<AccordionContext value={{ open, toggle }}>
			<div className={cn("w-full", className)}>{children}</div>
		</AccordionContext>
	);
}

export function AccordionItem({
	value,
	className,
	children,
}: {
	value: string;
	className?: string;
	children: ReactNode;
}) {
	const ctx = use(AccordionContext);
	if (!ctx) throw new Error("<AccordionItem> must be used inside <Accordion>");
	const id = useId();
	const open = ctx.open.includes(value);
	return (
		<ItemContext value={{ value, open, id }}>
			<div
				data-state={open ? "open" : "closed"}
				className={cn("border-b last:border-b-0", className)}
			>
				{children}
			</div>
		</ItemContext>
	);
}

export function AccordionTrigger({
	className,
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	const spring = useSpringConfig();
	const toggle = use(AccordionContext)?.toggle;
	const { value, open, id } = useItem();
	return (
		<h3 className="flex">
			<button
				type="button"
				id={`${id}-trigger`}
				aria-expanded={open}
				aria-controls={`${id}-content`}
				onClick={() => toggle?.(value)}
				className={cn(
					"flex flex-1 cursor-pointer items-center justify-between gap-4 rounded-md py-4 text-left font-medium text-sm outline-none transition-colors duration-400 ease-in-out hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50",
					className,
				)}
			>
				{children}
				<motion.span
					animate={{ rotate: open ? 180 : 0 }}
					transition={spring}
					className="text-muted-foreground"
				>
					<ChevronDown className="size-4" aria-hidden="true" />
				</motion.span>
			</button>
		</h3>
	);
}

/** Stays mounted when closed (inert, height 0) so content remains crawlable. */
export function AccordionContent({
	className,
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	const spring = useSpringConfig();
	const { open, id } = useItem();
	return (
		<motion.section
			id={`${id}-content`}
			aria-labelledby={`${id}-trigger`}
			inert={!open}
			initial={false}
			animate={open ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
			transition={spring}
			className="overflow-hidden"
		>
			<div className={cn("pb-4 text-muted-foreground text-sm leading-relaxed", className)}>
				{children}
			</div>
		</motion.section>
	);
}
