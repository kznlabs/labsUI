"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type KeyboardEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFieldControl } from "@/components/ui/field";
import { fieldClass } from "@/components/ui/input";
import { useMounted } from "@/lib/platform";
import { useAnchor } from "@/lib/use-anchor";
import { useControllableState } from "@/lib/use-controllable-state";
import { useDismiss } from "@/lib/use-dismiss";
import { cn, material, spring } from "@/lib/utils";

type SelectOption = { value: string; label: string; icon?: ReactNode; disabled?: boolean };
type SelectGroup = { label: string; options: SelectOption[] };

type SelectProps = {
	/** Flat options, or labeled groups of options. */
	options: SelectOption[] | SelectGroup[];
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	placeholder?: string;
	/** Submits the value with a form, through a hidden input. */
	name?: string;
	/** Pair with <Label htmlFor>, or let <Field> fill it in. */
	id?: string;
	disabled?: boolean;
	required?: boolean;
	"aria-invalid"?: boolean;
	"aria-label"?: string;
	"aria-describedby"?: string;
	className?: string;
};

const isGroups = (o: SelectProps["options"]): o is SelectGroup[] =>
	o.length > 0 && "options" in (o[0] as object);

/**
 * Single-choice listbox styled like Input. Keyboard matches a native select: ↑ ↓ Home End,
 * typeahead (also while closed), Enter or Space to pick, Esc to cancel.
 */
export function Select(allProps: SelectProps) {
	const {
		options,
		value: valueProp,
		defaultValue = "",
		onValueChange,
		placeholder = "Select…",
		name,
		id,
		disabled,
		required,
		className,
		...aria
	} = useFieldControl(allProps);
	const listId = useId();
	const trigger = useRef<HTMLButtonElement>(null);
	const list = useRef<HTMLDivElement>(null);
	const [value, setValue] = useControllableState(valueProp, defaultValue, onValueChange);
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState<string>();
	const pos = useAnchor(open, trigger, list);
	const mounted = useMounted();

	const groups = isGroups(options) ? options : [{ label: "", options }];
	const flat = groups.flatMap((g) => g.options);
	const enabled = flat.filter((o) => !o.disabled);
	const selected = flat.find((o) => o.value === value);
	const optionId = (v: string) => `${listId}-${v.replace(/\s+/g, "-")}`;

	const pick = (v: string) => {
		if (v !== value) setValue(v);
	};
	const show = () => {
		setActive(selected && !selected.disabled ? selected.value : enabled[0]?.value);
		setOpen(true);
	};
	const hide = () => {
		setOpen(false);
		trigger.current?.focus();
	};

	useEffect(() => {
		if (!open) return;
		list.current?.focus();
	}, [open]);
	useDismiss(open, [list, trigger], () => setOpen(false));

	// Keep the highlighted option visible inside the list.
	useEffect(() => {
		if (!open || !active) return;
		const el = document.getElementById(optionId(active));
		const box = list.current;
		if (!el || !box) return;
		if (el.offsetTop < box.scrollTop) box.scrollTop = el.offsetTop - 4;
		else if (el.offsetTop + el.offsetHeight > box.scrollTop + box.clientHeight)
			box.scrollTop = el.offsetTop + el.offsetHeight - box.clientHeight + 4;
	});

	/** Next enabled option whose label starts with `key`, after `from`. */
	const typeahead = (key: string, from: string | undefined) => {
		const i = enabled.findIndex((o) => o.value === from);
		const order = [...enabled.slice(i + 1), ...enabled.slice(0, i + 1)];
		return order.find((o) => o.label.toLowerCase().startsWith(key.toLowerCase()));
	};

	const onTriggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
		if (e.key === "ArrowDown" || e.key === "ArrowUp") {
			e.preventDefault();
			show();
		} else if (e.key.length === 1 && /\S/.test(e.key)) {
			const hit = typeahead(e.key, value);
			if (hit) pick(hit.value);
		}
	};

	const onListKey = (e: KeyboardEvent<HTMLDivElement>) => {
		const i = enabled.findIndex((o) => o.value === active);
		const step = {
			ArrowDown: enabled[Math.min(i + 1, enabled.length - 1)],
			ArrowUp: enabled[Math.max(i - 1, 0)],
			Home: enabled[0],
			End: enabled.at(-1),
		}[e.key];
		if (step) {
			e.preventDefault();
			return setActive(step.value);
		}
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			if (active) pick(active);
			return hide();
		}
		if (e.key === "Escape") {
			e.preventDefault();
			return hide();
		}
		if (e.key === "Tab") return setOpen(false);
		if (e.key.length === 1 && /\S/.test(e.key))
			setActive(typeahead(e.key, active)?.value ?? active);
	};

	return (
		<>
			<button
				ref={trigger}
				type="button"
				id={id}
				role="combobox"
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-controls={open ? listId : undefined}
				disabled={disabled}
				aria-required={required}
				onClick={() => (open ? setOpen(false) : show())}
				onKeyDown={onTriggerKey}
				className={cn(
					fieldClass,
					"flex h-9 cursor-pointer items-center justify-between gap-2 px-3 text-left [&_svg]:size-4 [&_svg]:shrink-0",
					className,
				)}
				{...aria}
			>
				<span
					className={cn(
						"flex min-w-0 items-center gap-2 truncate",
						!selected && "text-muted-foreground",
					)}
				>
					{selected?.icon}
					{selected?.label ?? placeholder}
				</span>
				<ChevronsUpDown className="text-muted-foreground" aria-hidden="true" />
			</button>
			{name && <input type="hidden" name={name} value={value} />}
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
								tabIndex={-1}
								aria-labelledby={id}
								aria-label={id ? undefined : aria["aria-label"]}
								aria-activedescendant={active ? optionId(active) : undefined}
								onKeyDown={onListKey}
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
								{groups.map((g, gi) => (
									// biome-ignore lint/a11y/useSemanticElements: ARIA group inside a listbox; fieldset is not valid there
									<div key={g.label || gi} role="group" aria-label={g.label || undefined}>
										{gi > 0 && <div aria-hidden="true" className="-mx-1 my-1 h-px bg-border" />}
										{g.label && (
											<div
												aria-hidden="true"
												className="px-2 pt-1.5 pb-1 font-medium text-muted-foreground text-xs"
											>
												{g.label}
											</div>
										)}
										{g.options.map((o) => (
											// biome-ignore lint/a11y/useKeyWithClickEvents: keys handled on the listbox (aria-activedescendant)
											<div
												key={o.value}
												id={optionId(o.value)}
												role="option"
												aria-selected={o.value === value}
												aria-disabled={o.disabled || undefined}
												tabIndex={-1}
												onPointerMove={() => !o.disabled && setActive(o.value)}
												onClick={() => {
													if (o.disabled) return;
													pick(o.value);
													hide();
												}}
												className={cn(
													"flex h-8 cursor-default select-none items-center gap-2 rounded-lg pr-8 pl-2 text-sm [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
													"relative aria-disabled:opacity-50",
													active === o.value &&
														"bg-primary text-primary-foreground [&_svg]:text-primary-foreground",
												)}
											>
												{o.icon}
												{o.label}
												{o.value === value && (
													<Check className="!text-current absolute left-2" aria-hidden="true" />
												)}
											</div>
										))}
									</div>
								))}
							</motion.div>
						)}
					</AnimatePresence>,
					document.body,
				)}
		</>
	);
}
