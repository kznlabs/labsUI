"use client";

import { ChevronDown } from "lucide-react";
import {
	AnimatePresence,
	animate,
	motion,
	useIsPresent,
	useMotionValue,
	useReducedMotion,
} from "motion/react";
import {
	type ComponentProps,
	createContext,
	type KeyboardEvent,
	type PointerEvent,
	type ReactNode,
	type RefObject,
	use,
	useEffect,
	useEffectEvent,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { useControllableState } from "@/lib/use-controllable-state";
import { useDismiss } from "@/lib/use-dismiss";
import { useIndicator } from "@/lib/use-indicator";
import { cn, material, spring } from "@/lib/utils";

// Site nav on the APG disclosure pattern (buttons + links, not role="menu"). All panels render into
// one shared viewport that springs to the next panel's size and position, panels slide in from the
// side you moved toward.

const OPEN_DELAY = 120;
const CLOSE_DELAY = 250;
const MARGIN = 8;

const FOCUSABLE =
	'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

type NavCtx = {
	value: string;
	setValue: (value: string) => void;
	/** −1 / 1: the side the next panel comes from; 0 when opening from closed or closing. */
	dir: number;
	/** Highlighted top-level item: the open one, else the hovered one. */
	setHovered: (value: string | null) => void;
	/** Mouse intent: open after a beat when closed, at once when another panel is open. */
	enter: (value: string) => void;
	leave: () => void;
	cancelClose: () => void;
	/** Moves focus into the panel once it mounts. */
	focusPanel: RefObject<boolean>;
	/** Opened by hover a moment ago, so the click that usually follows keeps it open. */
	hoverOpenedAt: RefObject<number>;
	items: Map<string, HTMLElement>;
	viewport: HTMLDivElement | null;
	setSize: (size: { w: number; h: number }) => void;
	list: RefObject<HTMLUListElement | null>;
};

const NavContext = createContext<NavCtx | null>(null);
const ItemContext = createContext<{ value: string; id: string } | null>(null);
const InPanel = createContext(false);

function useNav() {
	const ctx = use(NavContext);

	if (!ctx) throw new Error("NavigationMenu parts must be used inside <NavigationMenu>");

	return ctx;
}

/** Horizontal room for the viewport: the window, narrowed by the nearest clipping ancestor. */
function clipBounds(element: HTMLElement | null) {
	for (let parent = element?.parentElement; parent; parent = parent.parentElement) {
		if (getComputedStyle(parent).overflowX === "visible") continue;

		const rect = parent.getBoundingClientRect();

		return { left: Math.max(rect.left, 0), right: Math.min(rect.right, innerWidth) };
	}

	return { left: 0, right: innerWidth };
}

const order = (list: HTMLElement | null) =>
	[...(list?.querySelectorAll<HTMLElement>("[data-nav-item]") ?? [])]
		// Items hidden by a responsive class drop out of the slide order and Left/Right.
		.filter((element) => element.offsetParent !== null)
		.map((element) => element.dataset.navItem ?? "");

/**
 * Top navigation for a website: links and hover/click panels. Hover opens after a beat, then
 * sliding along the bar switches panels at once; click and Enter toggle, Down opens into the panel,
 * Left/Right walk the bar, Esc closes. Controlled with `value`/`onValueChange` ("" = closed).
 */
export function NavigationMenu({
	value: valueProp,
	defaultValue = "",
	onValueChange,
	className,
	children,
	...props
}: Omit<ComponentProps<"nav">, "defaultValue"> & {
	/** Controlled open item; "" = all closed. */
	value?: string;
	/** Item open at first render (uncontrolled). */
	defaultValue?: string;
	/** Called with the opened item's value, or "". */
	onValueChange?: (value: string) => void;
}) {
	const [value, setValueRaw] = useControllableState(valueProp, defaultValue, onValueChange);
	const [dir, setDir] = useState(0);
	const [hovered, setHovered] = useState<string | null>(null);
	const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
	const [size, setSize] = useState<{ w: number; h: number } | null>(null);
	const root = useRef<HTMLElement>(null);
	const list = useRef<HTMLUListElement>(null);
	const items = useRef(new Map<string, HTMLElement>()).current;
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const focusPanel = useRef(false);
	const hoverOpenedAt = useRef(0);
	const reduced = useReducedMotion();
	const open = value !== "";

	const setValue = (next: string) => {
		clearTimeout(timer.current);

		const values = order(list.current);
		const from = values.indexOf(value);
		const to = values.indexOf(next);

		setDir(open && next && from >= 0 && to >= 0 ? Math.sign(to - from) : 0);
		if (!next) setSize(null);
		setValueRaw(next);
	};

	useEffect(() => () => clearTimeout(timer.current), []);
	useDismiss(open, [root], () => setValue(""));

	// Esc also closes a hover-opened panel while focus is elsewhere.
	const onEscape = useEffectEvent((event: globalThis.KeyboardEvent) => {
		if (event.key === "Escape" && !root.current?.contains(document.activeElement)) setValue("");
	});

	useEffect(() => {
		if (!open) return;
		document.addEventListener("keydown", onEscape);

		return () => document.removeEventListener("keydown", onEscape);
	}, [open]);

	const enter = (next: string) => {
		clearTimeout(timer.current);
		if (next === value) return;

		const go = () => {
			hoverOpenedAt.current = Date.now();
			setValue(next);
		};

		if (open) go();
		else timer.current = setTimeout(go, OPEN_DELAY);
	};

	const leave = () => {
		clearTimeout(timer.current);
		if (open) timer.current = setTimeout(() => setValue(""), CLOSE_DELAY);
	};

	const cancelClose = () => clearTimeout(timer.current);

	// Viewport geometry in MotionValues: jump into place on open, spring between panels.
	const x = useMotionValue(0);
	const width = useMotionValue(0);
	const height = useMotionValue(0);
	const shown = useRef(false);

	useLayoutEffect(() => {
		if (!open || !size) {
			shown.current = false;

			return;
		}

		const place = (morph: boolean) => {
			const trigger = items.get(value);
			const nav = root.current?.getBoundingClientRect();

			if (!trigger || !nav) return;

			const triggerRect = trigger.getBoundingClientRect();
			const bounds = clipBounds(root.current);
			// Centered under the trigger, kept inside the screen and any clipping scroller. Wider than
			// that room = centered in it.
			const room = bounds.right - bounds.left;
			const left =
				size.w > room - 2 * MARGIN
					? bounds.left + (room - size.w) / 2
					: Math.min(
							Math.max(triggerRect.left + triggerRect.width / 2 - size.w / 2, bounds.left + MARGIN),
							bounds.right - size.w - MARGIN,
						);
			const to = { x: left - nav.left, width: size.w, height: size.h };

			for (const [motionValue, target] of [
				[x, to.x],
				[width, to.width],
				[height, to.height],
			] as const) {
				if (morph && !reduced) animate(motionValue, target, spring);
				else motionValue.jump(target);
			}
		};

		place(shown.current);
		shown.current = true;

		const onResize = () => place(false);

		addEventListener("resize", onResize);

		return () => removeEventListener("resize", onResize);
	}, [open, value, size, items, x, width, height, reduced]);

	const pill = useIndicator(items, open ? value : (hovered ?? undefined));

	const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
		if (event.key === "Escape" && open) {
			event.preventDefault();
			items.get(value)?.focus();
			setValue("");

			return;
		}

		if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

		const element = event.target as HTMLElement;
		const current = element.dataset.navItem;

		if (current === undefined || !list.current?.contains(element)) return;

		const values = order(list.current);
		const i = values.indexOf(current);
		const next =
			event.key === "Home"
				? values[0]
				: event.key === "End"
					? values.at(-1)
					: values[(i + (event.key === "ArrowRight" ? 1 : -1) + values.length) % values.length];

		if (next === undefined) return;
		event.preventDefault();
		items.get(next)?.focus();
	};

	return (
		<NavContext
			value={{
				value,
				setValue,
				dir,
				setHovered,
				enter,
				leave,
				cancelClose,
				focusPanel,
				hoverOpenedAt,
				items,
				viewport,
				setSize,
				list,
			}}
		>
			<nav
				ref={root}
				onKeyDown={onKeyDown}
				onPointerLeave={(event) => {
					if (event.pointerType !== "mouse") return;
					setHovered(null);
					leave();
				}}
				onPointerEnter={(event) => event.pointerType === "mouse" && cancelClose()}
				onBlur={(event) => {
					// Focus left the whole menu (Tab past the end or a click elsewhere).
					const to = event.relatedTarget as Node | null;

					if (open && to && !root.current?.contains(to)) setValue("");
				}}
				className={cn("relative isolate z-20 h-fit", className)}
				{...props}
			>
				<div className="relative">
					{pill.width > 0 && (
						<motion.span
							aria-hidden="true"
							initial={false}
							animate={{ x: pill.x, width: pill.width, opacity: open || hovered !== null ? 1 : 0 }}
							transition={spring}
							className="-z-10 absolute inset-y-0 left-0 rounded-lg bg-foreground/[0.06]"
						/>
					)}

					{children}
				</div>

				<motion.div
					ref={setViewport}
					data-floating=""
					initial={false}
					animate={{ opacity: open && size ? 1 : 0, scale: open && size ? 1 : 0.97 }}
					transition={spring}
					style={{ x, width, height, transformOrigin: "top center" }}
					className={cn(
						"absolute top-full left-0 mt-2 overflow-hidden rounded-xl border text-popover-foreground shadow-lg",
						material,
						// Solid: headers usually blur too, and a nested backdrop-filter has nothing to blur.
						"bg-popover",
						!(open && size) && "pointer-events-none",
					)}
				/>
			</nav>
		</NavContext>
	);
}

/** The row of items. Its padding is the hover pill's inset. */
export function NavigationMenuList({ className, ...props }: ComponentProps<"ul">) {
	const nav = useNav();

	return <ul ref={nav.list} className={cn("flex items-center gap-0.5", className)} {...props} />;
}

/** One top-level entry: a Trigger + Content pair, or a single Link. */
export function NavigationMenuItem({
	value,
	className,
	...props
}: ComponentProps<"li"> & {
	/** Stable id matched by `value`; one is generated if omitted. */ value?: string;
}) {
	const auto = useId();

	return (
		<ItemContext value={{ value: value ?? auto, id: auto }}>
			<li className={className} {...props} />
		</ItemContext>
	);
}

const topLevel =
	"inline-flex h-9 cursor-pointer select-none items-center gap-1 rounded-lg px-3 font-medium text-muted-foreground text-sm outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[current=page]:text-foreground aria-expanded:text-foreground";

function useBarItem(value: string) {
	const nav = useNav();

	return {
		ref: (element: HTMLElement | null) => {
			if (element) nav.items.set(value, element);
			else nav.items.delete(value);
		},
		"data-nav-item": value,
		onPointerEnter: (event: PointerEvent) => {
			if (event.pointerType !== "mouse") return;
			nav.setHovered(value);
		},
		onFocus: () => {
			// Tabbing onto another item closes the panel it walked past.
			if (nav.value && nav.value !== value) nav.setValue("");
		},
	};
}

/** Opens its panel: hover (mouse), click, Enter or Space; Down opens and focuses the first link. */
export function NavigationMenuTrigger({
	className,
	children,
	onClick,
	onKeyDown,
	...props
}: ComponentProps<"button">) {
	const nav = useNav();
	const item = use(ItemContext);

	if (!item) throw new Error("<NavigationMenuTrigger> must be inside <NavigationMenuItem>");

	const bar = useBarItem(item.value);
	const open = nav.value === item.value;

	return (
		<button
			{...bar}
			type="button"
			id={`${item.id}-trigger`}
			aria-expanded={open}
			aria-controls={open ? `${item.id}-content` : undefined}
			onPointerEnter={(event) => {
				bar.onPointerEnter(event);
				if (event.pointerType === "mouse") nav.enter(item.value);
			}}
			onClick={(event) => {
				onClick?.(event);
				if (event.defaultPrevented) return;
				// The click after a hover-open would close it right away.
				if (open && Date.now() - nav.hoverOpenedAt.current < 400) return;
				nav.setValue(open ? "" : item.value);
			}}
			onKeyDown={(event) => {
				onKeyDown?.(event);
				if (event.defaultPrevented) return;

				// The panel lives in the viewport after the bar, so Tab and Down move focus by hand.
				if (event.key === "ArrowDown" || (event.key === "Tab" && !event.shiftKey && open)) {
					event.preventDefault();
					nav.focusPanel.current = true;
					if (open) focusFirst(nav.viewport);
					else nav.setValue(item.value);
				}
			}}
			className={cn(topLevel, className)}
			{...props}
		>
			{children}

			<motion.span
				aria-hidden="true"
				animate={{ rotate: open ? 180 : 0 }}
				transition={spring}
				className="inline-flex"
			>
				<ChevronDown className="size-3.5 opacity-60" />
			</motion.span>
		</button>
	);
}

function focusFirst(scope: HTMLElement | null) {
	scope?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
}

const slide = {
	enter: (direction: number) => ({ opacity: 0, x: direction * 40 }),
	center: { opacity: 1, x: 0 },
	exit: (direction: number) => ({
		opacity: 0,
		x: direction * -40,
		transition: { ...spring, stiffness: 600 },
	}),
};

/**
 * The panel. Size it with `className` (e.g. `w-[32rem]`); the viewport springs to it. While
 * closed, its links stay in the HTML (hidden) so crawlers and no-JS readers still find them.
 */
export function NavigationMenuContent({
	className,
	children,
	...props
}: Omit<ComponentProps<"div">, "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd">) {
	const nav = useNav();
	const item = use(ItemContext);

	if (!item) throw new Error("<NavigationMenuContent> must be inside <NavigationMenuItem>");

	const open = nav.value === item.value;

	return (
		<InPanel value>
			{!open && <div hidden>{children}</div>}

			{nav.viewport &&
				createPortal(
					<AnimatePresence custom={nav.dir} initial={false}>
						{open && (
							<Panel key="panel" itemId={item.id} className={className} {...props}>
								{children}
							</Panel>
						)}
					</AnimatePresence>,
					nav.viewport,
				)}
		</InPanel>
	);
}

function Panel({
	className,
	children,
	itemId,
	...props
}: Omit<ComponentProps<"div">, "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"> & {
	itemId: string;
}) {
	const nav = useNav();
	const ref = useRef<HTMLDivElement>(null);
	const present = useIsPresent();
	const presentRef = useRef(present);
	const { setSize, focusPanel } = nav;

	useLayoutEffect(() => {
		presentRef.current = present;
	}, [present]);

	useLayoutEffect(() => {
		const element = ref.current;

		if (!element) return;

		// offsetWidth ignores the slide transform. A panel sliding out no longer sizes the viewport.
		const measure = () => {
			if (presentRef.current) setSize({ w: element.offsetWidth, h: element.offsetHeight });
		};

		measure();

		const observer = new ResizeObserver(measure);

		observer.observe(element);

		if (focusPanel.current) {
			focusPanel.current = false;
			focusFirst(element);
		}

		return () => observer.disconnect();
	}, [setSize, focusPanel]);

	const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key !== "Tab") return;

		const focusables = [...(ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
		const trigger = nav.items.get(nav.value);

		if (event.shiftKey && document.activeElement === focusables[0]) {
			event.preventDefault();
			trigger?.focus();
		} else if (!event.shiftKey && document.activeElement === focusables.at(-1)) {
			// Past the last link: on to whatever follows the trigger on the bar.
			const bar = [...(nav.list.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
			const next = trigger ? bar[bar.indexOf(trigger) + 1] : undefined;

			if (next) {
				event.preventDefault();
				next.focus();
			}
		}
	};

	return (
		<motion.div
			ref={ref}
			id={`${itemId}-content`}
			role="region"
			aria-labelledby={`${itemId}-trigger`}
			custom={nav.dir}
			variants={slide}
			initial="enter"
			animate="center"
			exit="exit"
			transition={spring}
			onKeyDown={onKeyDown}
			className={cn("absolute top-0 left-0 w-max max-w-[calc(100vw-1rem)] p-2", className)}
			{...props}
		>
			{children}
		</motion.div>
	);
}

type LinkProps = ComponentProps<"a"> & {
	/** Current page: `aria-current="page"` and the selected look. */
	active?: boolean;
	/** In a panel: rich row with a tile icon, title and one-line description. */
	icon?: ReactNode;
	/** Bold first line of a panel link. */
	title?: string;
	/** Muted line under the title. */
	description?: ReactNode;
};

/**
 * On the bar: a plain top-level link. In a panel: a row with optional icon, title and
 * description (or your own children). Following it closes the menu.
 */
export function NavigationMenuLink({
	active,
	icon,
	title,
	description,
	className,
	children,
	href,
	onClick,
	...props
}: LinkProps) {
	const inPanel = use(InPanel);
	const nav = useNav();
	const item = use(ItemContext);
	const value = item?.value ?? "";
	const bar = useBarItem(value);

	if (!inPanel) {
		return (
			<a
				{...bar}
				href={href}
				aria-current={active ? "page" : undefined}
				onPointerEnter={(event) => {
					bar.onPointerEnter(event);
					// Hovering a plain link while a panel is open means "not that panel".
					if (event.pointerType === "mouse") nav.leave();
				}}
				onClick={onClick}
				className={cn(topLevel, className)}
				{...props}
			>
				{children}
			</a>
		);
	}

	return (
		<a
			href={href}
			aria-current={active ? "page" : undefined}
			onClick={(event) => {
				onClick?.(event);
				nav.setValue("");
			}}
			className={cn(
				"group flex gap-3 rounded-lg p-2.5 text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[current=page]:bg-accent",
				className,
			)}
			{...props}
		>
			{children ?? (
				<>
					{icon && (
						<span
							aria-hidden="true"
							className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card text-primary-ink shadow-xs [&_svg]:size-4"
						>
							{icon}
						</span>
					)}

					<span className="flex min-w-0 flex-col gap-0.5">
						<span className="font-medium text-foreground">{title}</span>

						{description && (
							<span className="line-clamp-2 text-muted-foreground text-xs leading-snug">
								{description}
							</span>
						)}
					</span>
				</>
			)}
		</a>
	);
}
