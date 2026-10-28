"use client";

import {
	Children,
	type ComponentProps,
	createContext,
	type KeyboardEvent,
	type ReactNode,
	use,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SearchInput } from "@/components/ui/search-input";
import { Separator } from "@/components/ui/separator";
import { listKeyTarget, scrollIntoList } from "@/lib/list";
import { useControllableState } from "@/lib/use-controllable-state";
import { useHotkey } from "@/lib/use-hotkey";
import { cn, material } from "@/lib/utils";

type CommandCtx = {
	query: string;
	setQuery: (query: string) => void;
	active: string | undefined;
	setActive: (value: string) => void;
	listId: string;
	/** Set by CommandDialog: selecting an item closes the palette. */
	close?: () => void;
};

const CommandContext = createContext<CommandCtx | null>(null);

function useCommand() {
	const ctx = use(CommandContext);

	if (!ctx) throw new Error("Command parts must be used inside <Command>");

	return ctx;
}

const optionId = (listId: string, value: string) => `${listId}-${value.replace(/\s+/g, "-")}`;
const OPTIONS = "[role='option']:not([aria-disabled='true'])";

const textOf = (children: ReactNode) =>
	Children.toArray(children)
		.filter((child) => typeof child === "string" || typeof child === "number")
		.join(" ")
		.trim();

const match = (query: string, value: string, keywords: readonly string[] = []) => {
	const hay = [value, ...keywords].join(" ").toLowerCase();

	return query
		.toLowerCase()
		.split(/\s+/)
		.filter(Boolean)
		.every((word) => hay.includes(word));
};

/** Filterable, keyboard-driven list. Arrows/Home/End move, Enter selects. Use inline or in CommandDialog. */
export function Command({
	className,
	children,
	close,
}: {
	className?: string;
	/** `CommandInput` and `CommandList`. */
	children: ReactNode;
	/** Called after a selection; CommandDialog passes its own close. */
	close?: () => void;
}) {
	const root = useRef<HTMLDivElement>(null);
	const listId = useId();
	const [query, setQuery] = useState("");
	const [active, setActive] = useState<string>();

	// biome-ignore lint/correctness/useExhaustiveDependencies: re-run on query change only
	useEffect(() => {
		const first = root.current?.querySelector<HTMLElement>(OPTIONS);

		setActive(first?.dataset.value);
	}, [query]);

	useEffect(() => {
		if (!active) return;

		const element = document.getElementById(optionId(listId, active));
		const box = element?.closest<HTMLElement>("[role='listbox']");

		if (element && box) scrollIntoList(box, element, 6);
	}, [active, listId]);

	const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		const options = [...(root.current?.querySelectorAll<HTMLElement>(OPTIONS) ?? [])];

		if (options.length === 0) return;

		const i = options.findIndex((element) => element.dataset.value === active);
		const next = listKeyTarget(options, i, event, { orientation: "vertical", homeEnd: "ctrl" });

		if (next) {
			event.preventDefault();
			setActive(next.dataset.value ?? "");
		} else if (event.key === "Enter" && i >= 0) {
			event.preventDefault();
			options[i]?.click();
		}
	};

	return (
		<CommandContext value={{ query, setQuery, active, setActive, listId, close }}>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: keys bubble from the combobox input */}
			<div
				ref={root}
				onKeyDown={onKeyDown}
				className={cn(
					"flex w-full flex-col overflow-hidden rounded-xl border bg-popover text-popover-foreground",
					className,
				)}
			>
				{children}
			</div>
		</CommandContext>
	);
}

export function CommandInput({
	placeholder = "Type a command or search…",
	label = "Search commands",
}: {
	/** Input placeholder. */
	placeholder?: string;
	/** Accessible name of the input. */
	label?: string;
}) {
	const { query, setQuery, active, listId } = useCommand();

	return (
		<SearchInput
			variant="ghost"
			value={query}
			onValueChange={setQuery}
			label={label}
			placeholder={placeholder}
			role="combobox"
			aria-expanded={true}
			aria-controls={listId}
			aria-autocomplete="list"
			aria-activedescendant={active ? optionId(listId, active) : undefined}
			autoComplete="off"
			spellCheck={false}
			className="border-b [&_input]:h-12"
		/>
	);
}

/** Scrollable results. Shows `CommandEmpty` only when no option matches. */
export function CommandList({
	label = "Results",
	className,
	children,
}: {
	/** Accessible name of the listbox. */
	label?: string;
	className?: string;
	/** Groups, items, separators and `CommandEmpty`. */
	children: ReactNode;
}) {
	const { listId } = useCommand();

	return (
		<div
			role="listbox"
			id={listId}
			aria-label={label}
			className={cn(
				"relative max-h-80 overflow-y-auto overscroll-contain p-1.5 [&:has([role=option])>[data-command-empty]]:hidden",
				className,
			)}
		>
			{children}
		</div>
	);
}

export function CommandEmpty({ className, children = "No results." }: ComponentProps<"div">) {
	return (
		<div
			data-command-empty=""
			role="presentation"
			className={cn("py-8 text-center text-muted-foreground text-sm", className)}
		>
			{children}
		</div>
	);
}

/** Hides itself when none of its items match. */
export function CommandGroup({
	heading,
	className,
	children,
}: {
	/** Visible group title. */
	heading?: string;
	className?: string;
	/** `CommandItem`s. */
	children: ReactNode;
}) {
	const id = useId();

	return (
		// biome-ignore lint/a11y/useSemanticElements: ARIA group inside a listbox; fieldset is not valid there
		<div
			role="group"
			aria-labelledby={heading ? id : undefined}
			className={cn("[&:not(:has([role=option]))]:hidden", className)}
		>
			{heading && (
				<div id={id} className="px-2 pt-2 pb-1 font-medium text-muted-foreground text-xs">
					{heading}
				</div>
			)}
			{children}
		</div>
	);
}

/** Hidden while filtering, when groups collapse and separators would stack up. */
export function CommandSeparator({ className }: { className?: string }) {
	const { query } = useCommand();

	if (query) return null;

	return <Separator className={cn("-mx-1.5 my-1.5 w-auto", className)} />;
}

type CommandItemProps = {
	/** Matched against the query and used for selection. Defaults to the item's text. */
	value?: string;
	/** Extra search terms, e.g. ["settings", "preferences"]. */
	keywords?: readonly string[];
	/** Called with the item's `value` on click or Enter. */
	onSelect?: (value: string) => void;
	/** Shown but not selectable. */
	disabled?: boolean;
	/** Inside CommandDialog: stay open after selecting. */
	keepOpen?: boolean;
	className?: string;
	/** Item content, e.g. an icon and a label. */
	children: ReactNode;
};

export function CommandItem({
	value: valueProp,
	keywords,
	onSelect,
	disabled,
	keepOpen,
	className,
	children,
}: CommandItemProps) {
	const { query, active, setActive, listId, close } = useCommand();
	const value = valueProp ?? textOf(children);

	if (!match(query, value, keywords)) return null;

	const selected = active === value;

	return (
		// biome-ignore lint/a11y/useFocusableInteractive: focus stays on the combobox (aria-activedescendant)
		// biome-ignore lint/a11y/useKeyWithClickEvents: Enter is handled by the Command root for the active option
		<div
			role="option"
			id={optionId(listId, value)}
			data-value={value}
			aria-selected={selected}
			aria-disabled={disabled || undefined}
			onPointerMove={() => !disabled && !selected && setActive(value)}
			onClick={() => {
				if (disabled) return;
				onSelect?.(value);
				if (!keepOpen) close?.();
			}}
			className={cn(
				"flex h-9 cursor-pointer select-none items-center gap-2.5 rounded-lg px-2 text-sm outline-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
				selected && "bg-primary text-primary-foreground [&_svg]:text-primary-foreground",
				disabled && "pointer-events-none opacity-50",
				className,
			)}
		>
			{children}
		</div>
	);
}

type CommandDialogProps = {
	/** Controlled state; pair with `onOpenChange`. */
	open?: boolean;
	/** Called on the shortcut, Esc, outside click or a selection. */
	onOpenChange?: (open: boolean) => void;
	/** Global toggle, e.g. "mod+k" (⌘ on Mac, Ctrl elsewhere). Pass false to disable. */
	shortcut?: `mod+${string}` | false;
	/** Accessible dialog title (visually hidden). */
	title?: string;
	/** `CommandInput` and `CommandList`. */
	children: ReactNode;
};

/** Command palette: Command in a Dialog, toggled by a global shortcut. Selecting closes it. */
export function CommandDialog({
	open: openProp,
	onOpenChange,
	shortcut = "mod+k",
	title = "Command palette",
	children,
}: CommandDialogProps) {
	const [open, setOpen] = useControllableState(openProp, false, onOpenChange);

	useHotkey(shortcut, () => setOpen(!open));

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent
				showClose={false}
				className={cn(
					"mt-[12vh] max-w-xl gap-0 self-start overflow-hidden rounded-2xl p-0",
					material,
				)}
			>
				<DialogTitle className="sr-only">{title}</DialogTitle>
				<Command close={() => setOpen(false)} className="rounded-none border-0 bg-transparent">
					{children}
				</Command>
			</DialogContent>
		</Dialog>
	);
}
