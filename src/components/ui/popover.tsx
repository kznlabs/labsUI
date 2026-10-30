"use client";

import { AnimatePresence, motion } from "motion/react";
import {
	type ComponentProps,
	createContext,
	type ReactNode,
	type RefObject,
	use,
	useEffect,
	useEffectEvent,
	useId,
	useRef,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/lib/platform";
import { useAnchor } from "@/lib/use-anchor";
import { useControllableState } from "@/lib/use-controllable-state";
import { isWithin, useDismiss } from "@/lib/use-dismiss";
import { cn, material, spring } from "@/lib/utils";

type PopoverCtx = {
	open: boolean;
	setOpen: (open: boolean) => void;
	trigger: RefObject<HTMLButtonElement | null>;
	id: string;
};

const PopoverContext = createContext<PopoverCtx | null>(null);

function usePopover() {
	const ctx = use(PopoverContext);

	if (!ctx) throw new Error("Popover parts must be used inside <Popover>");

	return ctx;
}

/** Non-modal panel anchored to a button: filters, pickers, quick edits. Controlled or uncontrolled. */
export function Popover({
	open: openProp,
	defaultOpen = false,
	onOpenChange,
	children,
}: {
	/** Controlled state; pair with `onOpenChange`. */
	open?: boolean;
	/** Open at first render (uncontrolled). */
	defaultOpen?: boolean;
	/** Called on the trigger, Esc or an outside click. */
	onOpenChange?: (open: boolean) => void;
	/** `PopoverTrigger` and `PopoverContent`. */
	children: ReactNode;
}) {
	const id = useId();
	const trigger = useRef<HTMLButtonElement | null>(null);
	const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);

	return <PopoverContext value={{ open, setOpen, trigger, id }}>{children}</PopoverContext>;
}

export function PopoverTrigger({ onClick, ref, ...props }: ComponentProps<typeof Button>) {
	const { open, setOpen, trigger, id } = usePopover();

	return (
		<Button
			ref={(element: HTMLButtonElement | null) => {
				trigger.current = element;
				if (typeof ref === "function") ref(element);
				else if (ref) ref.current = element;
			}}
			id={`${id}-trigger`}
			aria-haspopup="dialog"
			aria-expanded={open}
			aria-controls={open ? `${id}-content` : undefined}
			onClick={(event) => {
				onClick?.(event);
				if (!event.defaultPrevented) setOpen(!open);
			}}
			{...props}
		/>
	);
}

const FOCUSABLE =
	'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Focus moves in on open. Esc or an outside click closes it; Esc returns focus to the trigger.
 * Not a focus trap: Tab past the end closes it and moves on, like any non-modal popup.
 */
export function PopoverContent({
	align = "center",
	side = "bottom",
	className,
	children,
}: {
	/** Alignment with the trigger. */
	align?: "start" | "center" | "end";
	/** Preferred side; flips when there is no room. */
	side?: "top" | "bottom";
	className?: string;
	/** Panel content. */
	children: ReactNode;
}) {
	const { open, setOpen, trigger, id } = usePopover();
	const panel = useRef<HTMLDivElement>(null);
	const pos = useAnchor(open, trigger, panel, { align, side, offset: 8 });
	const mounted = useMounted();
	const close = useEffectEvent(() => setOpen(false));

	useDismiss(open, [panel, trigger], () => setOpen(false));

	useEffect(() => {
		if (!open) return;

		const node = panel.current;

		// data-autofocus claims first focus (a Calendar's selected day), else the first field.
		(
			node?.querySelector<HTMLElement>("[data-autofocus]") ??
			node?.querySelector<HTMLElement>(FOCUSABLE) ??
			node
		)?.focus();

		// Focus leaving the panel (Tab past the end, clicking elsewhere) closes it.
		const focusOut = (event: FocusEvent) => {
			const to = event.relatedTarget as Node | null;

			if (to && !isWithin([panel, trigger], to)) close();
		};

		node?.addEventListener("focusout", focusOut);

		return () => node?.removeEventListener("focusout", focusOut);
	}, [open, trigger]);

	if (!mounted) return null;

	const edge = align === "start" ? "left" : align === "end" ? "right" : "center";

	return createPortal(
		<AnimatePresence>
			{open && (
				<motion.div
					key="popover"
					ref={panel}
					role="dialog"
					data-floating=""
					id={`${id}-content`}
					aria-labelledby={`${id}-trigger`}
					tabIndex={-1}
					onKeyDown={(event) => {
						// The panel sits at the end of body: Tab past its last field goes on from the trigger.
						if (event.key === "Tab" && !event.shiftKey) {
							const last = [...(panel.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].at(
								-1,
							);

							if (last && event.target !== last) return;
							setOpen(false);
							trigger.current?.focus();

							return;
						}

						if (event.key !== "Escape" || event.defaultPrevented) return;
						// Handled here so an enclosing Dialog stays open.
						event.preventDefault();
						setOpen(false);
						trigger.current?.focus();
					}}
					initial={{ opacity: 0, scale: 0.96, y: pos.side === "bottom" ? -4 : 4 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.97, transition: { ...spring, stiffness: 600 } }}
					transition={spring}
					style={{
						top: pos.top,
						left: pos.left,
						transformOrigin: `${pos.side === "bottom" ? "top" : "bottom"} ${edge}`,
					}}
					className={cn(
						"fixed z-50 w-72 max-w-[calc(100vw-1rem)] rounded-xl border p-4 text-popover-foreground shadow-lg outline-none",
						material,
						className,
					)}
				>
					{children}
				</motion.div>
			)}
		</AnimatePresence>,
		document.body,
	);
}
