"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion, useIsPresent } from "motion/react";
import {
	type ComponentProps,
	createContext,
	type ReactNode,
	use,
	useEffect,
	useEffectEvent,
	useId,
	useRef,
} from "react";
import { createPortal } from "react-dom";
import { useMounted } from "@/lib/platform";
import { useControllableState } from "@/lib/use-controllable-state";
import { cn, spring } from "@/lib/utils";
import { Button } from "./button";

type Ctx = { open: boolean; setOpen: (open: boolean) => void; titleId: string; descId: string };
const DialogContext = createContext<Ctx | null>(null);

export function useDialog() {
	const ctx = use(DialogContext);
	if (!ctx) throw new Error("Dialog parts must be used inside <Dialog>");
	return ctx;
}

type DialogProps = {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	children: ReactNode;
};

/** State root. Controlled (`open` + `onOpenChange`) or uncontrolled. */
export function Dialog({
	open: controlled,
	defaultOpen = false,
	onOpenChange,
	children,
}: DialogProps) {
	const [open, setOpen] = useControllableState(controlled, defaultOpen, onOpenChange);
	const id = useId();
	return (
		<DialogContext value={{ open, setOpen, titleId: `${id}-title`, descId: `${id}-desc` }}>
			{children}
		</DialogContext>
	);
}

type ButtonProps = ComponentProps<typeof Button>;

export function DialogTrigger({ onClick, ...props }: ButtonProps) {
	const { open, setOpen } = useDialog();
	return (
		<Button
			aria-haspopup="dialog"
			aria-expanded={open}
			onClick={(e) => {
				onClick?.(e);
				setOpen(true);
			}}
			{...props}
		/>
	);
}

export function DialogClose({ onClick, variant = "outline", ...props }: ButtonProps) {
	const { setOpen } = useDialog();
	return (
		<Button
			variant={variant}
			onClick={(e) => {
				onClick?.(e);
				setOpen(false);
			}}
			{...props}
		/>
	);
}

/** Open dialogs, innermost last: only the top one answers Esc and Tab. */
const stack: HTMLElement[] = [];

const FOCUSABLE =
	'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Modal behavior shared by Dialog and Drawer: focus first field, trap Tab, restore focus,
 * lock page scroll, close on Esc (topmost modal only). Attach the returned ref to the panel.
 */
export function useModal() {
	const { open, setOpen } = useDialog();
	const ref = useRef<HTMLDivElement>(null);
	// An effect event, not a dependency: an inline onOpenChange would otherwise restore and
	// re-grab focus on every parent render.
	const close = useEffectEvent(() => setOpen(false));

	useEffect(() => {
		if (!open) return;
		const node = ref.current;
		if (node) stack.push(node);
		const prev = document.activeElement as HTMLElement | null;
		const html = document.documentElement;
		const overflow = html.style.overflow;
		html.style.overflow = "hidden";
		const focusables = () => [...(node?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
		(focusables()[0] ?? node)?.focus();

		const onKey = (e: KeyboardEvent) => {
			if (stack.at(-1) !== node) return;
			// A field that already used Esc (e.g. clearing a search) keeps the dialog open.
			if (e.key === "Escape") return e.defaultPrevented || close();
			if (e.key !== "Tab") return;
			const f = focusables();
			const first = f[0];
			const last = f.at(-1);
			if (!first || !last) return e.preventDefault();
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		};
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("keydown", onKey);
			if (node) stack.splice(stack.indexOf(node), 1);
			html.style.overflow = overflow;
			prev?.focus();
		};
	}, [open]);
	return ref;
}

/** Portal + blurred backdrop + spring scale-in. Esc/backdrop close, focus trap, scroll lock. */
export function DialogContent({
	className,
	children,
	alert = false,
	showClose = !alert,
}: {
	className?: string;
	children: ReactNode;
	/** Confirm-a-destructive-action mode: role="alertdialog", backdrop click does not close. */
	alert?: boolean;
	showClose?: boolean;
}) {
	const { open, setOpen, titleId, descId } = useDialog();
	const mounted = useMounted();
	const ref = useModal();

	if (!mounted) return null;

	return createPortal(
		<AnimatePresence>
			{open && (
				<Layer key="dialog">
					<motion.div
						className="absolute inset-0 bg-black/40 backdrop-blur-sm"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={spring}
						onClick={alert ? undefined : () => setOpen(false)}
					/>
					<motion.div
						ref={ref}
						role={alert ? "alertdialog" : "dialog"}
						aria-modal="true"
						aria-labelledby={titleId}
						aria-describedby={descId}
						tabIndex={-1}
						initial={{ opacity: 0, scale: 0.94, y: 8 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.96, y: 4 }}
						transition={spring}
						className={cn(
							"relative grid w-full max-w-lg gap-4 rounded-2xl border bg-background p-6 shadow-xl outline-none",
							className,
						)}
					>
						{children}
						{showClose && (
							<button
								type="button"
								onClick={() => setOpen(false)}
								className="absolute top-4 right-4 cursor-pointer rounded-md p-1 text-muted-foreground outline-none transition-colors duration-400 ease-in-out hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
							>
								<X className="size-4" aria-hidden="true" />
								<span className="sr-only">Close</span>
							</button>
						)}
					</motion.div>
				</Layer>
			)}
		</AnimatePresence>,
		document.body,
	);
}

/** Overlay root; click-through while exiting so the fading backdrop never blocks the page. */
function Layer({ children }: { children: ReactNode }) {
	const present = useIsPresent();
	return (
		<div
			className={cn(
				"fixed inset-0 z-50 grid place-items-center p-4",
				!present && "pointer-events-none",
			)}
		>
			{children}
		</div>
	);
}

export function DialogHeader({ className, ...props }: ComponentProps<"div">) {
	return <div className={cn("flex flex-col gap-1.5 pr-6", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
			{...props}
		/>
	);
}

export function DialogTitle({ className, ...props }: ComponentProps<"h2">) {
	const { titleId } = useDialog();
	return (
		<h2 id={titleId} className={cn("font-semibold text-lg leading-none", className)} {...props} />
	);
}

export function DialogDescription({ className, ...props }: ComponentProps<"p">) {
	const { descId } = useDialog();
	return <p id={descId} className={cn("text-muted-foreground text-sm", className)} {...props} />;
}
