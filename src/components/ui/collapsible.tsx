"use client";

import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { type ComponentProps, createContext, type ReactNode, use, useId } from "react";
import { useControllableState } from "@/lib/use-controllable-state";
import { cn, spring } from "@/lib/utils";

type CollapsibleCtx = { open: boolean; setOpen: (open: boolean) => void; id: string };

const CollapsibleContext = createContext<CollapsibleCtx | null>(null);

function useCollapsible() {
	const ctx = use(CollapsibleContext);
	if (!ctx) throw new Error("Collapsible parts must be used inside <Collapsible>");
	return ctx;
}

type CollapsibleProps = {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	className?: string;
	children: ReactNode;
};

/** One show/hide region. Controlled (`open` + `onOpenChange`) or uncontrolled (`defaultOpen`). */
export function Collapsible({
	open: openProp,
	defaultOpen = false,
	onOpenChange,
	className,
	children,
}: CollapsibleProps) {
	const id = useId();
	const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
	return (
		<CollapsibleContext value={{ open, setOpen, id }}>
			<div data-state={open ? "open" : "closed"} className={className}>
				{children}
			</div>
		</CollapsibleContext>
	);
}

type CollapsibleTriggerProps = Omit<ComponentProps<"button">, "type"> & {
	/** Show a rotating chevron after the label (default: true). */
	chevron?: boolean;
};

export function CollapsibleTrigger({
	chevron = true,
	className,
	children,
	onClick,
	...props
}: CollapsibleTriggerProps) {
	const { open, setOpen, id } = useCollapsible();
	return (
		<button
			type="button"
			id={`${id}-trigger`}
			aria-expanded={open}
			aria-controls={`${id}-content`}
			onClick={(e) => {
				onClick?.(e);
				if (!e.defaultPrevented) setOpen(!open);
			}}
			className={cn(
				"inline-flex cursor-pointer items-center gap-2 rounded-md text-left font-medium text-sm outline-none transition-colors duration-400 ease-in-out focus-visible:ring-[3px] focus-visible:ring-ring/50",
				className,
			)}
			{...props}
		>
			{children}
			{chevron && (
				<motion.span
					animate={{ rotate: open ? 180 : 0 }}
					transition={spring}
					className="ml-auto text-muted-foreground"
				>
					<ChevronDown className="size-4" aria-hidden="true" />
				</motion.span>
			)}
		</button>
	);
}

/** Stays mounted when closed (inert, height 0) so content remains crawlable. */
export function CollapsibleContent({
	className,
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	const { open, id } = useCollapsible();
	return (
		<motion.div
			id={`${id}-content`}
			role="region"
			aria-labelledby={`${id}-trigger`}
			inert={!open}
			initial={false}
			animate={open ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
			transition={spring}
			className="overflow-hidden"
		>
			<div className={className}>{children}</div>
		</motion.div>
	);
}
