"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type KeyboardEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFieldControl } from "@/components/ui/field";
import { Tag, tagFieldClass } from "@/components/ui/tag-input";
import { FormValue } from "@/lib/form-value";
import { listKeyTarget, scrollIntoList } from "@/lib/list";
import { useMounted } from "@/lib/platform";
import { useAnchor } from "@/lib/use-anchor";
import { useControllableState } from "@/lib/use-controllable-state";
import { useDismiss } from "@/lib/use-dismiss";
import { cn, material, spring } from "@/lib/utils";

export type ComboboxOption = {
	/** Submitted and matched value. */
	value: string;
	/** Text shown and searched. */
	label: string;
	/** Leading icon. */
	icon?: ReactNode;
	/** Extra words that match the query (aliases, handles). */
	keywords?: string[];
	/** Shown but not selectable. */
	disabled?: boolean;
};

type BaseProps = {
	/** Choices; filtered as the user types. */
	options: ComboboxOption[];
	/** Field text when nothing is picked. */
	placeholder?: string;
	/** Shown in the list when nothing matches. */
	emptyText?: ReactNode;
	/** Form field name: one entry per picked value. */
	name?: string;
	/** Id of the input; Field fills it in. */
	id?: string;
	/** Blocks typing and opening; the value isn't submitted. */
	disabled?: boolean;
	/** Form submit needs a value. */
	required?: boolean;
	/** Error styling; Field sets it from `error`. */
	"aria-invalid"?: boolean;
	/** Accessible name when there is no visible label. */
	"aria-label"?: string;
	/** Ids of hint or error text; Field fills it in. */
	"aria-describedby"?: string;
	className?: string;
};

type ComboboxProps = BaseProps &
	(
		| {
				/** Picks stay open and show as removable tags; Backspace removes the last one. */
				multiple?: false;
				/** Controlled value, or values when `multiple`; pair with `onValueChange`. */
				value?: string;
				/** Value, or values when `multiple`, at first render (uncontrolled). */
				defaultValue?: string;
				/** Called with the picked value, or every picked value when `multiple`. */
				onValueChange?: (value: string) => void;
		  }
		| {
				multiple: true;
				value?: string[];
				defaultValue?: string[];
				onValueChange?: (value: string[]) => void;
		  }
	);

function filter(options: ComboboxOption[], query: string) {
	const needle = query.trim().toLowerCase();

	if (!needle) return options;

	const hits = options.filter(
		(option) =>
			option.label.toLowerCase().includes(needle) ||
			option.keywords?.some((key) => key.toLowerCase().includes(needle)),
	);
	const starts = (option: ComboboxOption) => option.label.toLowerCase().startsWith(needle);

	return [...hits.filter(starts), ...hits.filter((hit) => !starts(hit))];
}

/**
 * Select you can type into: the input filters the list, Up and Down move, Enter picks, Esc closes.
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
	const [invalid, setInvalid] = useState(false);
	// Public shape (string or string[]), "" = nothing picked.
	const [raw, setRaw] = useControllableState<string | string[] | undefined>(
		valueProp,
		defaultValue,
		onValueChange as ((value: string | string[] | undefined) => void) | undefined,
	);
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [active, setActive] = useState<string>();
	const values = raw === undefined ? [] : [raw].flat().filter(Boolean);
	const pos = useAnchor(open, box, list);
	const mounted = useMounted();

	const shown = filter(options, query);
	const enabled = shown.filter((option) => !option.disabled);
	// Highlight follows the filter: keep it if still listed, else first enabled match.
	const current = enabled.some((option) => option.value === active) ? active : enabled[0]?.value;
	const selected = options.filter((option) => values.includes(option.value));
	const optionId = (value: string) => `${listId}-${value.replace(/\s+/g, "-")}`;

	const commit = (next: string[]) => setRaw(multiple ? next : (next[0] ?? ""));

	const pick = (value: string) => {
		if (multiple) {
			commit(values.includes(value) ? values.filter((x) => x !== value) : [...values, value]);
			setQuery("");
			setActive(value);
		} else {
			if (value !== values[0]) commit([value]);
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

	useEffect(() => {
		if (!open || !current) return;

		const element = document.getElementById(optionId(current));

		if (element && list.current) scrollIntoList(list.current, element);
	});

	const onKey = (event: KeyboardEvent<HTMLInputElement>) => {
		const i = enabled.findIndex((option) => option.value === current);
		const step = listKeyTarget(enabled, i, event, {
			orientation: "vertical",
			loop: false,
			homeEnd: false,
		});

		if (step || event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			if (!open) return show();
			if (step) setActive(step.value);
		} else if (event.key === "Enter") {
			if (!open || !current) return;
			event.preventDefault();
			pick(current);
		} else if (event.key === "Escape") {
			if (!open && !query) return;
			event.preventDefault();
			setOpen(false);
			setQuery("");
		} else if (event.key === "Tab") {
			setOpen(false);
			setQuery("");
		} else if (event.key === "Backspace" && multiple && !query && values.length) {
			commit(values.slice(0, -1));
		}
	};

	// Single: closed shows the pick, open holds the query with the pick as placeholder.
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
						{selected.map((option) => (
							<Tag key={option.value} disabled={disabled} onRemove={() => pick(option.value)}>
								{option.label}
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
					aria-invalid={aria["aria-invalid"] || (invalid && !values.length) || undefined}
					value={text}
					placeholder={hint}
					onChange={(event) => {
						setQuery(event.target.value);
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
				(multiple ? values : values.slice(0, 1)).map((picked) => (
					<input key={picked} type="hidden" name={name} value={picked} disabled={disabled} />
				))}

			<FormValue
				value={values.join(",")}
				required={required}
				disabled={disabled}
				anchor={input}
				onInvalid={() => setInvalid(true)}
			/>

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
								// Keep focus in the input when clicking the list.
								onPointerDown={(event) => event.preventDefault()}
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
									shown.map((option) => (
										// biome-ignore lint/a11y/useKeyWithClickEvents: keys handled on the input (aria-activedescendant)
										<div
											key={option.value}
											id={optionId(option.value)}
											role="option"
											aria-selected={values.includes(option.value)}
											aria-disabled={option.disabled || undefined}
											tabIndex={-1}
											onPointerMove={() => !option.disabled && setActive(option.value)}
											onClick={() => !option.disabled && pick(option.value)}
											className={cn(
												"relative flex h-8 cursor-default select-none items-center gap-2 rounded-lg pr-2 pl-8 text-sm aria-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
												current === option.value &&
													"bg-primary text-primary-foreground [&_svg]:text-primary-foreground",
											)}
										>
											{values.includes(option.value) && (
												<Check className="!text-current absolute left-2" aria-hidden="true" />
											)}

											{option.icon}

											<span className="truncate">{option.label}</span>
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
