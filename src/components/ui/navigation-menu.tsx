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

/*
 * Site navigation on the APG disclosure pattern (buttons + links, not role="menu"). Every panel
 * renders into one shared viewport that springs to the next panel's size and position, while
 * the panels slide in from the side you moved toward.
 */

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
/** Links inside a panel get the rich row style and close the menu when followed. */
const InPanel = createContext(false);

function useNav() {
	const ctx = use(NavContext);
	if (!ctx) throw new Error("NavigationMenu parts must be used inside <NavigationMenu>");
	return ctx;
}

/** Horizontal room for the viewport: the window, narrowed by the nearest ancestor that clips. */
function clipBounds(el: HTMLElement | null) {
	for (let p = el?.parentElement; p; p = p.parentElement) {
		if (getComputedStyle(p).overflowX === "visible") continue;
		const r = p.getBoundingClientRect();
		return { left: Math.max(r.left, 0), right: Math.min(r.right, innerWidth) };
	}
	return { left: 0, right: innerWidth };
}

/** Top-level values in document order, for the slide direction and ← →. */
const order = (list: HTMLElement | null) =>
	[...(list?.querySelectorAll<HTMLElement>("[data-nav-item]") ?? [])]
		// Items hidden by a responsive class drop out of the slide order and ← →.
		.filter((el) => el.offsetParent !== null)
		.map((el) => el.dataset.navItem ?? "");

/**
 * Top navigation for a website: links and hover/click panels. Hover opens after a beat, then
 * sliding along the bar switches panels at once; click and Enter toggle, ↓ opens into the panel,
 * ← → walk the bar, Esc closes. Controlled with `value`/`onValueChange` ("" = closed).
 */
export function NavigationMenu({
	value: valueProp,
	defaultValue = "",
	onValueChange,
	className,
	children,
	...props
}: Omit<ComponentProps<"nav">, "defaultValue"> & {
	value?: string;
	defaultValue?: string;
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

	// Esc also closes a hover-opened panel while focus is elsewhere on the page.
	const onEscape = useEffectEvent((e: globalThis.KeyboardEvent) => {
		if (e.key === "Escape" && !root.current?.contains(document.activeElement)) setValue("");
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

	// Viewport geometry lives in MotionValues: jump into place on open, spring between panels.
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
			const t = trigger.getBoundingClientRect();
			const bounds = clipBounds(root.current);
			// Centered under its trigger, kept inside the screen and any scroller that clips it;
			// a panel wider than that room is centered in it instead.
			const room = bounds.right - bounds.left;
			const left =
				size.w > room - 2 * MARGIN
					? bounds.left + (room - size.w) / 2
					: Math.min(
							Math.max(t.left + t.width / 2 - size.w / 2, bounds.left + MARGIN),
							bounds.right - size.w - MARGIN,
						);
			const to = { x: left - nav.left, width: size.w, height: size.h };
			for (const [mv, v] of [
				[x, to.x],
				[width, to.width],
				[height, to.height],
			] as const) {
				if (morph && !reduced) animate(mv, v, spring);
				else mv.jump(v);
			}
		};
		place(shown.current);
		shown.current = true;
		const onResize = () => place(false);
		addEventListener("resize", onResize);
		return () => removeEventListener("resize", onResize);
	}, [open, value, size, items, x, width, height, reduced]);

	const pill = useIndicator(items, open ? value : (hovered ?? undefined));

	// ← → Home End walk the top-level items (a trigger, or a link with no panel).
	const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
		if (e.key === "Escape" && open) {
			e.preventDefault();
			items.get(value)?.focus();
			setValue("");
			return;
		}
		if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
		const el = e.target as HTMLElement;
		const current = el.dataset.navItem;
		if (current === undefined || !list.current?.contains(el)) return;
		const values = order(list.current);
		const i = values.indexOf(current);
		const next =
			e.key === "Home"
				? values[0]
				: e.key === "End"
					? values.at(-1)
					: values[(i + (e.key === "ArrowRight" ? 1 : -1) + values.length) % values.length];
		if (next === undefined) return;
		e.preventDefault();
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
				onPointerLeave={(e) => {
					if (e.pointerType !== "mouse") return;
					setHovered(null);
					leave();
				}}
				onPointerEnter={(e) => e.pointerType === "mouse" && cancelClose()}
				onBlur={(e) => {
					// Focus left the whole menu (Tab past the end, or a click elsewhere).
					const to = e.relatedTarget as Node | null;
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
						// Solid: headers usually blur too, and a backdrop-filter nested in one has nothing to blur.
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
}: ComponentProps<"li"> & { value?: string }) {
	const auto = useId();
	return (
		<ItemContext value={{ value: value ?? auto, id: auto }}>
			<li className={className} {...props} />
		</ItemContext>
	);
}

const topLevel =
	"inline-flex h-9 cursor-pointer select-none items-center gap-1 rounded-lg px-3 font-medium text-muted-foreground text-sm outline-none transition-colors duration-200 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[current=page]:text-foreground aria-expanded:text-foreground";

/** Shared registration for anything that sits on the bar: the hover pill and ← → find it here. */
function useBarItem(value: string) {
	const nav = useNav();
	return {
		ref: (el: HTMLElement | null) => {
			if (el) nav.items.set(value, el);
			else nav.items.delete(value);
		},
		"data-nav-item": value,
		onPointerEnter: (e: PointerEvent) => {
			if (e.pointerType !== "mouse") return;
			nav.setHovered(value);
		},
		onFocus: () => {
			// Tabbing onto another item closes the panel it walked past.
			if (nav.value && nav.value !== value) nav.setValue("");
		},
	};
}

/** Opens its panel: hover (mouse), click, Enter / Space; ↓ opens and focuses the first link. */
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
			onPointerEnter={(e) => {
				bar.onPointerEnter(e);
				if (e.pointerType === "mouse") nav.enter(item.value);
			}}
			onClick={(e) => {
				onClick?.(e);
				if (e.defaultPrevented) return;
				// The click that follows a hover-open would otherwise close it straight away.
				if (open && Date.now() - nav.hoverOpenedAt.current < 400) return;
				nav.setValue(open ? "" : item.value);
			}}
			onKeyDown={(e) => {
				onKeyDown?.(e);
				if (e.defaultPrevented) return;
				// The panel lives in the viewport after the bar, so Tab and ↓ hand focus over by hand.
				if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey && open)) {
					e.preventDefault();
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
	enter: (d: number) => ({ opacity: 0, x: d * 40 }),
	center: { opacity: 1, x: 0 },
	exit: (d: number) => ({ opacity: 0, x: d * -40, transition: { ...spring, stiffness: 600 } }),
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
		const el = ref.current;
		if (!el) return;
		// offsetWidth ignores the slide transform: the panel's real size. A panel sliding out
		// no longer sizes the viewport.
		const measure = () => {
			if (presentRef.current) setSize({ w: el.offsetWidth, h: el.offsetHeight });
		};
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		if (focusPanel.current) {
			focusPanel.current = false;
			focusFirst(el);
		}
		return () => ro.disconnect();
	}, [setSize, focusPanel]);

	const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if (e.key !== "Tab") return;
		const focusables = [...(ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
		const trigger = nav.items.get(nav.value);
		if (e.shiftKey && document.activeElement === focusables[0]) {
			e.preventDefault();
			trigger?.focus();
		} else if (!e.shiftKey && document.activeElement === focusables.at(-1)) {
			// Past the last link: on to whatever follows the trigger on the bar.
			const bar = [...(nav.list.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])];
			const next = trigger ? bar[bar.indexOf(trigger) + 1] : undefined;
			if (next) {
				e.preventDefault();
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
	title?: string;
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
				onPointerEnter={(e) => {
					bar.onPointerEnter(e);
					// Hovering a plain link while a panel is open means "not that panel".
					if (e.pointerType === "mouse") nav.leave();
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
			onClick={(e) => {
				onClick?.(e);
				nav.setValue("");
			}}
			className={cn(
				"group flex gap-3 rounded-lg p-2.5 text-sm outline-none transition-colors duration-200 hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-[current=page]:bg-accent",
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
