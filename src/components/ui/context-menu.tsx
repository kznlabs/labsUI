"use client";

import {
	type ComponentProps,
	createContext,
	type KeyboardEvent,
	type ReactNode,
	use,
	useId,
	useRef,
	useState,
} from "react";
import {
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	MenuContext,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/* Same panel, items and keyboard as DropdownMenu; only the trigger and the anchor differ. */

export const ContextMenuContent = DropdownMenuContent;
export const ContextMenuItem = DropdownMenuItem;
export const ContextMenuCheckboxItem = DropdownMenuCheckboxItem;
export const ContextMenuRadioGroup = DropdownMenuRadioGroup;
export const ContextMenuRadioItem = DropdownMenuRadioItem;
export const ContextMenuLabel = DropdownMenuLabel;
export const ContextMenuSeparator = DropdownMenuSeparator;

type Focus = "first" | "last" | "menu";

/** Right-click menu for an area. The trigger is the area; the menu opens at the pointer. */
export function ContextMenu({
	onOpenChange,
	children,
}: {
	onOpenChange?: (open: boolean) => void;
	children: ReactNode;
}) {
	const id = useId();
	const trigger = useRef<HTMLElement | null>(null);
	// A zero-size stand-in element at the pointer, so the menu positions (and flips) from there.
	const point = useRef({ x: 0, y: 0 });
	const anchor = useRef<HTMLElement | null>({
		getBoundingClientRect: () => DOMRect.fromRect({ ...point.current, width: 0, height: 0 }),
	} as HTMLElement);
	const [open, setOpen] = useState(false);
	const [focus, setFocus] = useState<Focus>("menu");
	const set = (next: boolean) => {
		setOpen(next);
		onOpenChange?.(next);
	};
	return (
		<MenuContext
			value={{
				open,
				show: (f) => {
					setFocus(f);
					set(true);
				},
				close: (restoreFocus = true) => {
					set(false);
					if (restoreFocus) trigger.current?.focus();
				},
				focus,
				trigger,
				anchor,
				id,
			}}
		>
			<PointContext value={point}>{children}</PointContext>
		</MenuContext>
	);
}

const PointContext = createContext<{ current: { x: number; y: number } } | null>(null);

/**
 * The right-clickable area. Keyboard: focus it (it is focusable) and press the Menu key or
 * Shift+F10; the menu opens at its center on the first item.
 */
export function ContextMenuTrigger({
	className,
	onContextMenu,
	onKeyDown,
	children,
	...props
}: ComponentProps<"div">) {
	const menu = use(MenuContext);
	const point = use(PointContext);
	if (!menu || !point) throw new Error("<ContextMenuTrigger> must be inside <ContextMenu>");
	const openAt = (x: number, y: number, focus: "first" | "menu") => {
		point.current = { x, y };
		// Already open elsewhere: close, then reopen next frame so it re-measures at the new point.
		if (menu.open) {
			menu.close(false);
			requestAnimationFrame(() => menu.show(focus));
		} else menu.show(focus);
	};
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: a plain area whose only interaction is its context menu
		<div
			ref={(el) => {
				menu.trigger.current = el;
			}}
			id={`${menu.id}-trigger`}
			// biome-ignore lint/a11y/noNoninteractiveTabindex: focusable so keyboard users can open the menu
			tabIndex={0}
			aria-keyshortcuts="Shift+F10"
			onContextMenu={(e) => {
				onContextMenu?.(e);
				if (e.defaultPrevented) return;
				e.preventDefault();
				openAt(e.clientX, e.clientY, "menu");
			}}
			onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
				onKeyDown?.(e);
				// Menu key / Shift+F10: browsers report odd coordinates, so open at the area's center.
				if (e.key !== "ContextMenu" && !(e.shiftKey && e.key === "F10")) return;
				e.preventDefault();
				const r = e.currentTarget.getBoundingClientRect();
				openAt(r.left + r.width / 2, r.top + r.height / 2, "first");
			}}
			className={cn(
				"rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}
