"use client";

import { motion } from "motion/react";
import {
	type ComponentProps,
	createContext,
	type KeyboardEvent,
	type ReactNode,
	use,
	useId,
	useLayoutEffect,
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
import { useIndicator } from "@/lib/use-indicator";
import { cn, spring } from "@/lib/utils";

/* Same panel, items and keyboard as DropdownMenu; the bar adds one-open-at-a-time and ← →. */

export const MenubarContent = DropdownMenuContent;
export const MenubarItem = DropdownMenuItem;
export const MenubarCheckboxItem = DropdownMenuCheckboxItem;
export const MenubarRadioGroup = DropdownMenuRadioGroup;
export const MenubarRadioItem = DropdownMenuRadioItem;
export const MenubarLabel = DropdownMenuLabel;
export const MenubarSeparator = DropdownMenuSeparator;

type Focus = "first" | "last" | "menu";

type BarCtx = {
	/** The open menu, or null. */
	active: string | null;
	open: (value: string | null, focus?: Focus) => void;
	focus: Focus;
	/** The one trigger in the Tab order (roving tabindex). */
	tabStop: string | null;
	setTabStop: (value: string) => void;
	triggers: Map<string, HTMLButtonElement>;
};

/** Trigger values in document order: the Map's insertion order drifts when menus re-mount. */
const order = (root: HTMLElement | null) =>
	[...(root?.querySelectorAll<HTMLButtonElement>("[data-menubar-trigger]") ?? [])]
		.map((el) => el.dataset.value)
		.filter((v): v is string => !!v);

const BarContext = createContext<BarCtx | null>(null);
const ValueContext = createContext<string | null>(null);

function useBar() {
	const ctx = use(BarContext);
	if (!ctx) throw new Error("Menubar parts must be used inside <Menubar>");
	return ctx;
}

/**
 * macOS-style menu bar: one menu open at a time, hovering another title while one is open
 * switches to it, ← → move between menus (open or not). One highlight springs between titles.
 */
export function Menubar({ className, children, ...props }: ComponentProps<"div">) {
	const [active, setActive] = useState<string | null>(null);
	// Last opened, so the highlight fades out where it was instead of collapsing to the left.
	const [last, setLast] = useState<string>();
	const [focus, setFocus] = useState<Focus>("menu");
	const [tabStop, setTabStop] = useState<string | null>(null);
	const triggers = useRef(new Map<string, HTMLButtonElement>()).current;
	const root = useRef<HTMLDivElement>(null);
	const pill = useIndicator(triggers, last);

	useLayoutEffect(() => {
		setTabStop((t) => t ?? order(root.current)[0] ?? null);
	}, []);

	const open = (value: string | null, f: Focus = "menu") => {
		setFocus(f);
		setActive(value);
		if (value) {
			setLast(value);
			setTabStop(value);
		}
	};

	// React events bubble out of portals, so keys pressed inside an open menu arrive here too.
	const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Home" && e.key !== "End")
			return;
		const values = order(root.current);
		const from = active ?? (document.activeElement as HTMLElement | null)?.dataset.value;
		const i = from ? values.indexOf(from) : -1;
		if (i < 0 || values.length === 0) return;
		// Home/End only move along the bar; inside a menu they belong to the menu.
		if (active && (e.key === "Home" || e.key === "End")) return;
		e.preventDefault();
		const next =
			e.key === "Home"
				? values[0]
				: e.key === "End"
					? values.at(-1)
					: values[(i + (e.key === "ArrowRight" ? 1 : -1) + values.length) % values.length];
		if (!next) return;
		if (active) open(next, "first");
		else {
			setTabStop(next);
			triggers.get(next)?.focus();
		}
	};

	return (
		<BarContext value={{ active, open, focus, tabStop, setTabStop, triggers }}>
			<div
				ref={root}
				role="menubar"
				aria-orientation="horizontal"
				onKeyDown={onKeyDown}
				className={cn(
					"relative isolate flex h-9 w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-xl border bg-card p-1 shadow-xs",
					className,
				)}
				{...props}
			>
				{pill.width > 0 && (
					<motion.span
						aria-hidden="true"
						initial={false}
						animate={{ x: pill.x, width: pill.width, opacity: active ? 1 : 0 }}
						transition={spring}
						className="-z-10 absolute inset-y-1 left-0 rounded-md bg-foreground/[0.08]"
					/>
				)}
				{children}
			</div>
		</BarContext>
	);
}

/** One title and its menu. `value` is optional; give one to tell menus apart in tests or analytics. */
export function MenubarMenu({ value, children }: { value?: string; children: ReactNode }) {
	const bar = useBar();
	const auto = useId();
	const v = value ?? auto;
	const trigger = useRef<HTMLElement | null>(null);
	return (
		<ValueContext value={v}>
			<MenuContext
				value={{
					open: bar.active === v,
					show: (f) => bar.open(v, f),
					close: (restoreFocus = true) => {
						bar.open(null);
						if (restoreFocus) trigger.current?.focus();
					},
					focus: bar.focus,
					trigger,
					id: auto,
				}}
			>
				{children}
			</MenuContext>
		</ValueContext>
	);
}

/** A menu title. Click toggles; ↓ Enter Space open on the first item, ↑ on the last. */
export function MenubarTrigger({
	className,
	onClick,
	onKeyDown,
	onPointerEnter,
	...props
}: ComponentProps<"button">) {
	const bar = useBar();
	const menu = use(MenuContext);
	const value = use(ValueContext);
	if (!menu || !value) throw new Error("<MenubarTrigger> must be inside <MenubarMenu>");
	return (
		<button
			ref={(el) => {
				menu.trigger.current = el;
				if (el) bar.triggers.set(value, el);
				else bar.triggers.delete(value);
			}}
			type="button"
			role="menuitem"
			id={`${menu.id}-trigger`}
			data-menubar-trigger=""
			data-value={value}
			aria-haspopup="menu"
			aria-expanded={menu.open}
			aria-controls={menu.open ? `${menu.id}-menu` : undefined}
			tabIndex={bar.tabStop === value ? 0 : -1}
			onFocus={() => bar.setTabStop(value)}
			onClick={(e) => {
				onClick?.(e);
				if (e.defaultPrevented) return;
				// detail 0: activated by keyboard, so land on the first item.
				if (menu.open) menu.close(false);
				else menu.show(e.detail === 0 ? "first" : "menu");
			}}
			onPointerEnter={(e) => {
				onPointerEnter?.(e);
				// macOS: with one menu open, sliding along the bar opens the next.
				if (bar.active !== null && bar.active !== value) menu.show("menu");
			}}
			onKeyDown={(e) => {
				onKeyDown?.(e);
				if (e.key === "ArrowDown" || e.key === "ArrowUp") {
					e.preventDefault();
					menu.show(e.key === "ArrowDown" ? "first" : "last");
				}
			}}
			className={cn(
				"h-7 cursor-default select-none rounded-md px-2.5 font-medium text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
				className,
			)}
			{...props}
		/>
	);
}
