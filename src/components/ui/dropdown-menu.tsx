"use client";

import { Check, Circle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
	type ComponentProps,
	createContext,
	type KeyboardEvent,
	type ReactNode,
	type RefObject,
	use,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { listKeyTarget } from "@/lib/list";
import { useMounted } from "@/lib/platform";
import { useAnchor } from "@/lib/use-anchor";
import { useControllableState } from "@/lib/use-controllable-state";
import { useDismiss } from "@/lib/use-dismiss";
import { cn, material, spring } from "@/lib/utils";

type Focus = "first" | "last" | "menu";

type MenuCtx = {
	open: boolean;
	/** Open, choosing what gets focus; or close, optionally returning focus to the trigger. */
	show: (focus: Focus) => void;
	close: (restoreFocus?: boolean) => void;
	focus: Focus;
	/** Focus returns here on close. */
	trigger: RefObject<HTMLElement | null>;
	/** Positions the menu; the trigger, or a pointer point for ContextMenu. Defaults to trigger. */
	anchor?: RefObject<HTMLElement | null>;
	id: string;
};

/** Shared with ContextMenu, which reuses Content and every item type. */
export const MenuContext = createContext<MenuCtx | null>(null);

function useMenu() {
	const ctx = use(MenuContext);

	if (!ctx) throw new Error("DropdownMenu parts must be used inside <DropdownMenu>");

	return ctx;
}

const ITEMS = "[role^='menuitem']:not([aria-disabled='true'])";

/** Action menu anchored to a button. Controlled (`open` + `onOpenChange`) or uncontrolled. */
export function DropdownMenu({
	open: openProp,
	defaultOpen = false,
	onOpenChange,
	children,
}: {
	/** Controlled state; pair with `onOpenChange`. */
	open?: boolean;
	/** Open at first render (uncontrolled). */
	defaultOpen?: boolean;
	/** Called on the trigger, Esc, outside click or a selection. */
	onOpenChange?: (open: boolean) => void;
	/** Trigger and content. */
	children: ReactNode;
}) {
	const id = useId();
	const trigger = useRef<HTMLElement | null>(null);
	const [open, set] = useControllableState(openProp, defaultOpen, onOpenChange);
	const [focus, setFocus] = useState<Focus>("menu");

	const show = (focus: Focus) => {
		setFocus(focus);
		set(true);
	};

	const close = (restoreFocus = true) => {
		set(false);
		if (restoreFocus) trigger.current?.focus();
	};

	return <MenuContext value={{ open, show, close, focus, trigger, id }}>{children}</MenuContext>;
}

/** A Button. Keyboard: Enter, Space or Down opens on the first item, Up on the last. */
export function DropdownMenuTrigger({
	onClick,
	onKeyDown,
	ref,
	...props
}: ComponentProps<typeof Button>) {
	const { open, show, close, trigger, id } = useMenu();

	return (
		<Button
			ref={(element: HTMLButtonElement | null) => {
				trigger.current = element;
				if (typeof ref === "function") ref(element);
				else if (ref) ref.current = element;
			}}
			id={`${id}-trigger`}
			aria-haspopup="menu"
			aria-expanded={open}
			aria-controls={open ? `${id}-menu` : undefined}
			onClick={(event) => {
				onClick?.(event);
				if (event.defaultPrevented) return;
				// detail 0 = keyboard, so land on the first item.
				if (open) close(false);
				else show(event.detail === 0 ? "first" : "menu");
			}}
			onKeyDown={(event) => {
				onKeyDown?.(event);

				if (event.key === "ArrowDown" || event.key === "ArrowUp") {
					event.preventDefault();
					show(event.key === "ArrowDown" ? "first" : "last");
				}
			}}
			{...props}
		/>
	);
}

export function DropdownMenuContent({
	align = "start",
	className,
	children,
}: {
	/** Edge of the trigger the menu lines up with. */
	align?: "start" | "end";
	className?: string;
	/** Items, labels, groups and separators. */
	children: ReactNode;
}) {
	const { open, close, focus, trigger, anchor, id } = useMenu();
	const menu = useRef<HTMLDivElement>(null);
	const pos = useAnchor(open, anchor ?? trigger, menu, { align, offset: anchor ? 2 : 6 });
	const mounted = useMounted();

	useDismiss(open, [menu, trigger], () => close(false));

	useEffect(() => {
		if (!open) return;

		const items = [...(menu.current?.querySelectorAll<HTMLElement>(ITEMS) ?? [])];

		(focus === "first" ? items[0] : focus === "last" ? items.at(-1) : menu.current)?.focus();
	}, [open, focus]);

	const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		const items = [...(menu.current?.querySelectorAll<HTMLElement>(ITEMS) ?? [])];
		const i = items.indexOf(document.activeElement as HTMLElement);

		if (event.key === "Escape") {
			// Handled here so an enclosing Dialog stays open.
			event.preventDefault();

			return close();
		}

		if (event.key === "Tab") return close();

		const next = listKeyTarget(items, i, event, { orientation: "vertical" });

		if (next) {
			event.preventDefault();

			return next.focus();
		}

		if (event.key.length === 1 && /\S/.test(event.key)) {
			const pressed = event.key.toLowerCase();
			const order = [...items.slice(i + 1), ...items.slice(0, i + 1)];

			order
				.find((element) => element.textContent?.trim().toLowerCase().startsWith(pressed))
				?.focus();
		}
	};

	if (!mounted) return null;

	return createPortal(
		<AnimatePresence>
			{open && (
				<motion.div
					key="menu"
					ref={menu}
					role="menu"
					data-floating=""
					id={`${id}-menu`}
					aria-labelledby={`${id}-trigger`}
					tabIndex={-1}
					onKeyDown={onKeyDown}
					onPointerLeave={() => menu.current?.focus()}
					initial={{ opacity: 0, scale: 0.96, y: pos.side === "bottom" ? -4 : 4 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.96, transition: { ...spring, stiffness: 600 } }}
					transition={spring}
					style={{
						top: pos.top,
						left: pos.left,
						transformOrigin: `${pos.side === "bottom" ? "top" : "bottom"} ${align === "end" ? "right" : "left"}`,
					}}
					className={cn(
						"fixed z-50 min-w-48 max-w-[calc(100vw-1rem)] rounded-xl border p-1 text-popover-foreground shadow-lg outline-none",
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

const itemClass =
	"relative flex h-8 w-full cursor-default select-none items-center gap-2 rounded-md px-2 text-sm outline-none focus:bg-primary focus:text-primary-foreground focus:[&_svg]:text-primary-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground";

type ItemProps = {
	/** Called on click or Enter; the menu then closes. */
	onSelect?: () => void;
	/** Shown but not selectable. */
	disabled?: boolean;
	/** "destructive": red, for irreversible actions. */
	variant?: "default" | "destructive";
	/** Right-aligned hint, e.g. "⌘S". */
	shortcut?: string;
	className?: string;
	/** Label, optionally with a leading icon. */
	children: ReactNode;
};

/** Hover moves focus like desktop menus, Enter or Space runs it. */
function useItem(disabled: boolean | undefined, run: () => void) {
	return {
		"aria-disabled": disabled || undefined,
		onPointerMove: (event: { currentTarget: HTMLElement }) => {
			if (!disabled && document.activeElement !== event.currentTarget) event.currentTarget.focus();
		},
		onClick: () => !disabled && run(),
		onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				if (!disabled) run();
			}
		},
	};
}

function Shortcut({ children }: { children?: string }) {
	return children ? (
		<span className="ml-auto pl-4 text-muted-foreground text-xs tracking-widest">{children}</span>
	) : null;
}

export function DropdownMenuItem({
	onSelect,
	disabled,
	variant = "default",
	shortcut,
	className,
	children,
}: ItemProps) {
	const { close } = useMenu();

	return (
		<div
			role="menuitem"
			tabIndex={-1}
			{...useItem(disabled, () => {
				onSelect?.();
				close();
			})}
			className={cn(
				itemClass,
				variant === "destructive" &&
					"text-destructive-ink focus:bg-destructive focus:text-white [&_svg]:text-destructive-ink focus:[&_svg]:text-white",
				className,
			)}
		>
			{children}
			<Shortcut>{shortcut}</Shortcut>
		</div>
	);
}

/** Toggles without closing the menu. */
export function DropdownMenuCheckboxItem({
	checked,
	onCheckedChange,
	disabled,
	shortcut,
	className,
	children,
}: Omit<ItemProps, "onSelect" | "variant"> & {
	/** Shows the check mark. */
	checked: boolean;
	/** Called with the new state. */
	onCheckedChange: (checked: boolean) => void;
}) {
	return (
		<div
			role="menuitemcheckbox"
			tabIndex={-1}
			aria-checked={checked}
			{...useItem(disabled, () => onCheckedChange(!checked))}
			className={cn(itemClass, "pl-8", className)}
		>
			<span className="absolute left-2 flex size-4 items-center justify-center">
				{checked && <Check className="!text-current" aria-hidden="true" />}
			</span>
			{children}
			<Shortcut>{shortcut}</Shortcut>
		</div>
	);
}

type RadioCtx = {
	/** Value of the checked item. */
	value: string;
	/** Called with the picked item's value. */
	onValueChange: (value: string) => void;
};

const RadioContext = createContext<RadioCtx | null>(null);

export function DropdownMenuRadioGroup({
	value,
	onValueChange,
	children,
}: RadioCtx & {
	/** `DropdownMenuRadioItem`s. */
	children: ReactNode;
}) {
	return (
		// biome-ignore lint/a11y/useSemanticElements: ARIA group inside a menu; fieldset is not valid there
		<div role="group">
			<RadioContext value={{ value, onValueChange }}>{children}</RadioContext>
		</div>
	);
}

/** One choice of a RadioGroup; picking it keeps the menu open. */
export function DropdownMenuRadioItem({
	value,
	disabled,
	className,
	children,
}: Omit<ItemProps, "onSelect" | "variant" | "shortcut"> & {
	/** Checked when it equals the group's `value`. */ value: string;
}) {
	const ctx = use(RadioContext);

	if (!ctx) throw new Error("<DropdownMenuRadioItem> must be inside <DropdownMenuRadioGroup>");

	const checked = ctx.value === value;

	return (
		<div
			role="menuitemradio"
			tabIndex={-1}
			aria-checked={checked}
			{...useItem(disabled, () => ctx.onValueChange(value))}
			className={cn(itemClass, "pl-8", className)}
		>
			<span className="absolute left-2 flex size-4 items-center justify-center">
				{checked && <Circle className="!size-2 !text-current fill-current" aria-hidden="true" />}
			</span>
			{children}
		</div>
	);
}

export function DropdownMenuLabel({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			role="presentation"
			className={cn("px-2 pt-1.5 pb-1 font-medium text-muted-foreground text-xs", className)}
			{...props}
		/>
	);
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
	return <hr className={cn("-mx-1 my-1 h-px border-0 bg-border", className)} />;
}
