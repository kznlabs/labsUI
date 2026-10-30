"use client";

import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { createContext, type ReactNode, use, useId } from "react";
import { useControllableState } from "@/lib/use-controllable-state";
import { cn, spring } from "@/lib/utils";

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
	/** single only: allow closing the open panel. */
	collapsible?: boolean;
	className?: string;
	/** `AccordionItem`s. */
	children: ReactNode;
} & (
	| {
			/** "single": one panel at a time. "multiple": independent panels. */
			type?: "single";
			/** Controlled open item ("" = none), or items when `type="multiple"`. */
			value?: string;
			/** Open at first render (uncontrolled): an item, or items when `type="multiple"`. */
			defaultValue?: string;
			/** Called with the open item ("" when it closes), or every open item when `type="multiple"`. */
			onValueChange?: (value: string) => void;
	  }
	| {
			type: "multiple";
			value?: string[];
			defaultValue?: string[];
			onValueChange?: (value: string[]) => void;
	  }
);

const toList = (value: string | string[] | undefined) =>
	value === undefined ? [] : [value].flat().filter(Boolean);

/** Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`). */
export function Accordion(props: AccordionProps) {
	const { type = "single", collapsible = true, className, children } = props;
	const [raw, setRaw] = useControllableState<string | string[] | undefined>(
		props.value,
		props.defaultValue,
		props.onValueChange as ((value: string | string[] | undefined) => void) | undefined,
	);
	const open = toList(raw);

	const toggle = (value: string) => {
		const next = open.includes(value)
			? type === "single" && !collapsible
				? open
				: open.filter((x) => x !== value)
			: type === "single"
				? [value]
				: [...open, value];

		setRaw(type === "multiple" ? next : (next[0] ?? ""));
	};

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
	/** Unique id within the Accordion, matched by `value`/`defaultValue`. */
	value: string;
	className?: string;
	/** `AccordionTrigger` and `AccordionContent`. */
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
	as: Heading = "h3",
	className,
	children,
}: {
	/** Wrapping heading level; match the page outline (default h3). */
	as?: "h2" | "h3" | "h4" | "h5" | "h6";
	className?: string;
	/** Question or heading text. */
	children: ReactNode;
}) {
	const toggle = use(AccordionContext)?.toggle;
	const { value, open, id } = useItem();

	return (
		<Heading className="flex">
			<button
				type="button"
				id={`${id}-trigger`}
				aria-expanded={open}
				aria-controls={`${id}-content`}
				onClick={() => toggle?.(value)}
				className={cn(
					"flex flex-1 cursor-pointer items-center justify-between gap-4 rounded-md py-4 text-left font-medium text-sm outline-none transition-colors hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50",
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
		</Heading>
	);
}

/** Stays mounted when closed (inert, height 0) so content remains crawlable. */
export function AccordionContent({
	className,
	children,
}: {
	className?: string;
	/** Panel content; stays in the HTML while closed. */
	children: ReactNode;
}) {
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
