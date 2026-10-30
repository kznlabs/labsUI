"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion, type PanInfo, useDragControls, useIsPresent } from "motion/react";
import type { ComponentProps, PointerEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import {
	Dialog,
	DialogClose,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
	useDialog,
	useModal,
} from "@/components/ui/dialog";
import { useMounted } from "@/lib/platform";
import { cn, spring } from "@/lib/utils";

// Shares Dialog's state, focus trap and Esc, only the panel differs.

export const Drawer = Dialog;
export const DrawerTrigger = DialogTrigger;
export const DrawerClose = DialogClose;
export const DrawerTitle = DialogTitle;
export const DrawerDescription = DialogDescription;

export type DrawerSide = "left" | "right" | "top" | "bottom";

const offscreen: Record<DrawerSide, { x?: string; y?: string }> = {
	left: { x: "-100%" },
	right: { x: "100%" },
	top: { y: "-100%" },
	bottom: { y: "100%" },
};

// The `after:` bleed paints past the screen edge, so overshoot or dragging inward never shows a
// gap.
const placement: Record<DrawerSide, string> = {
	left: "inset-y-0 left-0 h-full w-[min(20rem,85vw)] border-r after:right-full after:inset-y-0 after:w-[50vw]",
	right:
		"inset-y-0 right-0 h-full w-[min(24rem,90vw)] border-l after:left-full after:inset-y-0 after:w-[50vw]",
	top: "inset-x-0 top-0 max-h-[85dvh] rounded-b-2xl border-b after:bottom-full after:inset-x-0 after:h-[50vh]",
	bottom:
		"inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl border-t after:top-full after:inset-x-0 after:h-[50vh]",
};

/** Drag at least this share of the panel (or flick) to dismiss. */
const DISMISS = 0.3;
const FLICK = 500;

/**
 * Panel that slides in from an edge on a spring. Swipe toward the edge to dismiss: side drawers
 * drag from anywhere, top/bottom drawers from the handle or header so their content can scroll.
 */
export function DrawerContent({
	side = "right",
	showClose = side === "left" || side === "right",
	className,
	children,
}: {
	/** Edge it slides in from. */
	side?: DrawerSide;
	/** Close button in the corner. On by default for side drawers. */
	showClose?: boolean;
	className?: string;
	/** Header, body and footer. */
	children: ReactNode;
}) {
	const { open, setOpen, titleId, descId } = useDialog();
	const mounted = useMounted();
	const ref = useModal();
	const controls = useDragControls();
	const axis = side === "left" || side === "right" ? "x" : "y";
	const sign = side === "right" || side === "bottom" ? 1 : -1;
	const vertical = axis === "y";

	const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
		const element = event.target as HTMLElement;

		if (element.closest("input, textarea, select, [contenteditable='true'], [data-drawer-no-drag]"))
			return;
		if (vertical && !element.closest("[data-drawer-grab]")) return;
		// Skip the browser's native drag on links and images, it cancels the swipe. Clicks still fire.
		if (event.pointerType === "mouse" && element.closest("a, img")) event.preventDefault();
		controls.start(event);
	};

	const onDragEnd = (_: unknown, info: PanInfo) => {
		const box = ref.current?.getBoundingClientRect();
		const size = (vertical ? box?.height : box?.width) ?? 1;
		const moved = info.offset[axis] * sign;
		const speed = info.velocity[axis] * sign;

		if (moved > size * DISMISS || speed > FLICK) setOpen(false);
	};

	if (!mounted) return null;

	return createPortal(
		<AnimatePresence>
			{open && (
				<Layer key="drawer">
					<motion.div
						className="absolute inset-0 bg-black/40 backdrop-blur-sm"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={spring}
						onClick={() => setOpen(false)}
					/>
					<motion.div
						ref={ref}
						role="dialog"
						aria-modal="true"
						data-axis={axis}
						aria-labelledby={titleId}
						aria-describedby={descId}
						tabIndex={-1}
						initial={offscreen[side]}
						animate={{ x: 0, y: 0 }}
						exit={offscreen[side]}
						transition={spring}
						drag={axis}
						dragListener={false}
						dragControls={controls}
						dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
						// Free toward the edge, stiff away from it.
						dragElastic={
							axis === "x"
								? { left: sign < 0 ? 1 : 0.05, right: sign > 0 ? 1 : 0.05 }
								: { top: sign < 0 ? 1 : 0.05, bottom: sign > 0 ? 1 : 0.05 }
						}
						dragMomentum={false}
						onDragEnd={onDragEnd}
						onPointerDown={onPointerDown}
						className={cn(
							"group/drawer absolute flex flex-col bg-background shadow-xl outline-none after:absolute after:bg-inherit after:content-['']",
							vertical ? "touch-pan-x" : "touch-pan-y",
							placement[side],
							className,
						)}
					>
						{side === "bottom" && <Handle />}
						{children}
						{side === "top" && <Handle />}
						{showClose && (
							<button
								type="button"
								data-drawer-no-drag=""
								onClick={() => setOpen(false)}
								className="absolute top-4 right-4 cursor-pointer rounded-md p-1 text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
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

function Handle() {
	return (
		<div
			data-drawer-grab=""
			aria-hidden="true"
			className="flex shrink-0 cursor-grab justify-center py-3"
		>
			<span className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
		</div>
	);
}

/**
 * Click-through while exiting so the fading backdrop never blocks the page. overflow-clip, not
 * hidden: focusing a panel that's still sliding in would scroll the layer sideways.
 */
function Layer({ children }: { children: ReactNode }) {
	const present = useIsPresent();

	return (
		<div className={cn("fixed inset-0 z-50 overflow-clip", !present && "pointer-events-none")}>
			{children}
		</div>
	);
}

/** Also a drag handle on top/bottom drawers. */
export function DrawerHeader({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-drawer-grab=""
			className={cn("flex shrink-0 flex-col gap-1.5 p-5 pr-12", className)}
			{...props}
		/>
	);
}

/** Scrolls when content is taller than the drawer. */
export function DrawerBody({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			// py-1: a scroll container clips its children, leave room for focus rings.
			// touch-action stops at the nearest scroll container, so pan-y is repeated here. Otherwise
			// the browser takes a sideways swipe and swipe-to-close breaks.
			className={cn(
				"min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-1 group-data-[axis=x]/drawer:touch-pan-y",
				className,
			)}
			{...props}
		/>
	);
}

export function DrawerFooter({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"mt-auto flex shrink-0 flex-col-reverse gap-2 p-5 sm:flex-row sm:justify-end",
				className,
			)}
			{...props}
		/>
	);
}
