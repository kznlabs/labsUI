"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type KeyboardEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFieldControl } from "@/components/ui/field";
import { Tag, tagFieldClass } from "@/components/ui/tag-input";
import { useMounted } from "@/lib/platform";
import { useAnchor } from "@/lib/use-anchor";
import { useControllableState } from "@/lib/use-controllable-state";
import { useDismiss } from "@/lib/use-dismiss";
import { cn, material, spring } from "@/lib/utils";

type ComboboxOption = {
	value: string;
	label: string;
	icon?: ReactNode;
	/** Extra words that match the query (aliases, handles). */
	keywords?: string[];
	disabled?: boolean;
};

type BaseProps = {
	options: ComboboxOption[];
	placeholder?: string;
	/** Shown in the list when nothing matches. */
	emptyText?: ReactNode;
	/** Submits the value(s) through hidden inputs (one per value when multiple). */
	name?: string;
	id?: string;
	disabled?: boolean;
	required?: boolean;
	"aria-invalid"?: boolean;
	"aria-label"?: string;
	"aria-describedby"?: string;
	className?: string;
};

type ComboboxProps = BaseProps &
	(
		| {
				multiple?: false;
				value?: string;
				defaultValue?: string;
				onValueChange?: (value: string) => void;
		  }
		| {
				/** Picks stay open and show as removable tags; Backspace removes the last one. */
				multiple: true;
				value?: string[];
				defaultValue?: string[];
				onValueChange?: (value: string[]) => void;
		  }
	);

/** Matches label or keywords; options whose label starts with the query come first. */
function filter(options: ComboboxOption[], query: string) {
	const q = query.trim().toLowerCase();
	if (!q) return options;
	const hits = options.filter(
		(o) =>
			o.label.toLowerCase().includes(q) || o.keywords?.some((k) => k.toLowerCase().includes(q)),
	);
	const starts = (o: ComboboxOption) => o.label.toLowerCase().startsWith(q);
	return [...hits.filter(starts), ...hits.filter((o) => !starts(o))];
}

/**
 * Select you can type into: the input filters the list, ↑ ↓ move, Enter picks, Esc closes.
 * Single shows the pick in the input; `multiple` shows picks as tags and keeps the list open.
 */
export function Combobox(allProps: ComboboxProps) {
	const {
		options,
		placeholder = "Search…",
		emptyText = "No results.",
		name,
		id,
		disabled,
		required,
		className,
		multiple,
		value: valueProp,
		defaultValue,
		onValueChange,
		...aria
	} = useFieldControl(allProps);
	const listId = useId();
	const box = useRef<HTMLDivElement>(null);
	const input = useRef<HTMLInputElement>(null);
	const list = useRef<HTMLDivElement>(null);
	// Kept in the public shape (string or string[]); "" is "nothing picked".
	const [raw, setRaw] = useControllableState<string | string[] | undefined>(
		valueProp,
		defaultValue,
		onValueChange as ((v: string | string[] | undefined) => void) | undefined,
	);
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [active, setActive] = useState<string>();
	const values = raw === undefined ? [] : [raw].flat().filter(Boolean);
	const pos = useAnchor(open, box, list);
	const mounted = useMounted();

	const shown = filter(options, query);
	const enabled = shown.filter((o) => !o.disabled);
	// The highlight follows the filter: keep it if still listed, else the first enabled match.
	const current = enabled.some((o) => o.value === active) ? active : enabled[0]?.value;
	const selected = options.filter((o) => values.includes(o.value));
	const optionId = (v: string) => `${listId}-${v.replace(/\s+/g, "-")}`;

	const commit = (next: string[]) => setRaw(multiple ? next : (next[0] ?? ""));
	const pick = (v: string) => {
		if (multiple) {
			commit(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
			setQuery("");
			setActive(v);
		} else {
			if (v !== values[0]) commit([v]);
			setOpen(false);
			setQuery("");
		}
	};
	const show = () => {
		if (open || disabled) return;
		setActive(values[0]);
		setOpen(true);
	};

	useDismiss(open, [list, box], () => {
		setOpen(false);
		setQuery("");
	});

	// Keep the highlighted option visible inside the list.
	useEffect(() => {
		if (!open || !current) return;
		const el = document.getElementById(optionId(current));
		const l = list.current;
		if (!el || !l) return;
		if (el.offsetTop < l.scrollTop) l.scrollTop = el.offsetTop - 4;
		else if (el.offsetTop + el.offsetHeight > l.scrollTop + l.clientHeight)
			l.scrollTop = el.offsetTop + el.offsetHeight - l.clientHeight + 4;
	});

	const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
		const i = enabled.findIndex((o) => o.value === current);
		const step = {
			ArrowDown: enabled[Math.min(i + 1, enabled.length - 1)],
			ArrowUp: enabled[Math.max(i - 1, 0)],
		}[e.key];
		if (step || e.key === "ArrowDown" || e.key === "ArrowUp") {
			e.preventDefault();
			if (!open) return show();
			if (step) setActive(step.value);
		} else if (e.key === "Enter") {
			if (!open || !current) return;
			e.preventDefault();
			pick(current);
		} else if (e.key === "Escape") {
			if (!open && !query) return;
			e.preventDefault();
			setOpen(false);
			setQuery("");
		} else if (e.key === "Tab") {
			setOpen(false);
			setQuery("");
		} else if (e.key === "Backspace" && multiple && !query && values.length) {
			commit(values.slice(0, -1));
		}
	};

	// Single: closed, the input reads the pick; open, it holds the query with the pick as placeholder.
	const text = multiple || open ? query : (selected[0]?.label ?? "");
	const hint = multiple
		? selected.length
			? undefined
			: placeholder
		: open
			? (selected[0]?.label ?? placeholder)
			: placeholder;

	return (
		<>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: forwards pointer clicks to the input; keyboard users focus it directly */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: same as above */}
			<div
				ref={box}
				onClick={() => {
					input.current?.focus();
					show();
				}}
				className={cn(tagFieldClass, !multiple && "h-9 flex-nowrap py-0 pl-3", "pr-2", className)}
			>
				{multiple && (
					<AnimatePresence initial={false} mode="popLayout">
						{selected.map((o) => (
							<Tag key={o.value} disabled={disabled} onRemove={() => pick(o.value)}>
								{o.label}
							</Tag>
						))}
					</AnimatePresence>
				)}
				{!multiple && !open && selected[0]?.icon && (
					<span className="mr-2 flex shrink-0 text-muted-foreground [&_svg]:size-4">
						{selected[0].icon}
					</span>
				)}
				<input
					ref={input}
					id={id}
					type="text"
					role="combobox"
					autoComplete="off"
					aria-autocomplete="list"
					aria-expanded={open}
					aria-controls={open ? listId : undefined}
					aria-activedescendant={open && current ? optionId(current) : undefined}
					aria-required={required}
					disabled={disabled}
					{...aria}
					value={text}
					placeholder={hint}
					onChange={(e) => {
						setQuery(e.target.value);
						setOpen(true);
					}}
					onKeyDown={onKey}
					className={cn(
						"h-6 min-w-16 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
						multiple && "px-1",
					)}
				/>
				<ChevronsUpDown
					className="ml-1 size-4 shrink-0 self-center text-muted-foreground"
					aria-hidden="true"
				/>
			</div>
			{name &&
				(multiple ? values : values.slice(0, 1)).map((v) => (
					<input key={v} type="hidden" name={name} value={v} />
				))}
			{mounted &&
				createPortal(
					<AnimatePresence>
						{open && (
							<motion.div
								key="list"
								ref={list}
								role="listbox"
								data-floating=""
								id={listId}
								aria-multiselectable={multiple || undefined}
								aria-labelledby={id}
								aria-label={id ? undefined : aria["aria-label"]}
								// Keep focus in the input when the list is clicked.
								onPointerDown={(e) => e.preventDefault()}
								initial={{ opacity: 0, scale: 0.97, y: pos.side === "bottom" ? -4 : 4 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.97, transition: { ...spring, stiffness: 600 } }}
								transition={spring}
								style={{
									top: pos.top,
									left: pos.left,
									minWidth: pos.width,
									transformOrigin: pos.side === "bottom" ? "top" : "bottom",
								}}
								className={cn(
									"fixed z-50 max-h-72 max-w-[calc(100vw-1rem)] overflow-y-auto overscroll-contain rounded-xl border p-1 text-popover-foreground shadow-lg outline-none",
									material,
								)}
							>
								{shown.length === 0 ? (
									<div className="px-2 py-5 text-center text-muted-foreground text-sm">
										{emptyText}
									</div>
								) : (
									shown.map((o) => (
										// biome-ignore lint/a11y/useKeyWithClickEvents: keys handled on the input (aria-activedescendant)
										<div
											key={o.value}
											id={optionId(o.value)}
											role="option"
											aria-selected={values.includes(o.value)}
											aria-disabled={o.disabled || undefined}
											tabIndex={-1}
											onPointerMove={() => !o.disabled && setActive(o.value)}
											onClick={() => !o.disabled && pick(o.value)}
											className={cn(
												"relative flex h-8 cursor-default select-none items-center gap-2 rounded-lg pr-2 pl-8 text-sm aria-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
												current === o.value &&
													"bg-primary text-primary-foreground [&_svg]:text-primary-foreground",
											)}
										>
											{values.includes(o.value) && (
												<Check className="!text-current absolute left-2" aria-hidden="true" />
											)}
											{o.icon}
											<span className="truncate">{o.label}</span>
										</div>
									))
								)}
							</motion.div>
						)}
					</AnimatePresence>,
					document.body,
				)}
		</>
	);
}
