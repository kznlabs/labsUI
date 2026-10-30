"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type KeyboardEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFieldControl } from "@/components/ui/field";
import { fieldClass } from "@/components/ui/input";
import { FormValue } from "@/lib/form-value";
import { listKeyTarget, scrollIntoList } from "@/lib/list";
import { useMounted } from "@/lib/platform";
import { useAnchor } from "@/lib/use-anchor";
import { useControllableState } from "@/lib/use-controllable-state";
import { useDismiss } from "@/lib/use-dismiss";
import { cn, material, spring } from "@/lib/utils";

export type SelectOption = { value: string; label: string; icon?: ReactNode; disabled?: boolean };
export type SelectGroup = { label: string; options: SelectOption[] };

type SelectProps = {
	/** Flat options, or labeled groups of options. */
	options: SelectOption[] | SelectGroup[];
	/** Controlled value; pair with `onValueChange`. */
	value?: string;
	/** Value at first render (uncontrolled). */
	defaultValue?: string;
	/** Called with the picked value. */
	onValueChange?: (value: string) => void;
	/** Trigger text when nothing is picked. */
	placeholder?: string;
	/** Form field name for the picked value. */
	name?: string;
	/** Pair with <Label htmlFor>, or let <Field> fill it in. */
	id?: string;
	/** Blocks opening; the value isn't submitted. */
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

const isGroups = (options: SelectProps["options"]): options is SelectGroup[] =>
	options.length > 0 && "options" in (options[0] as object);

/**
 * Single-choice listbox styled like Input. Keyboard matches a native select: Up, Down, Home, End,
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
	const [invalid, setInvalid] = useState(false);
	const [active, setActive] = useState<string>();
	const pos = useAnchor(open, trigger, list);
	const mounted = useMounted();

	const groups = isGroups(options) ? options : [{ label: "", options }];
	const flat = groups.flatMap((group) => group.options);
	const enabled = flat.filter((option) => !option.disabled);
	const selected = flat.find((option) => option.value === value);
	const optionId = (value: string) => `${listId}-${value.replace(/\s+/g, "-")}`;

	const pick = (next: string) => {
		if (next !== value) setValue(next);
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

	useEffect(() => {
		if (!open || !active) return;

		const element = document.getElementById(optionId(active));

		if (element && list.current) scrollIntoList(list.current, element);
	});

	const typeahead = (key: string, from: string | undefined) => {
		const i = enabled.findIndex((option) => option.value === from);
		const order = [...enabled.slice(i + 1), ...enabled.slice(0, i + 1)];

		return order.find((option) => option.label.toLowerCase().startsWith(key.toLowerCase()));
	};

	const onTriggerKey = (event: KeyboardEvent<HTMLButtonElement>) => {
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			show();
		} else if (event.key.length === 1 && /\S/.test(event.key)) {
			const hit = typeahead(event.key, value);

			if (hit) pick(hit.value);
		}
	};

	const onListKey = (event: KeyboardEvent<HTMLDivElement>) => {
		const i = enabled.findIndex((option) => option.value === active);
		const step = listKeyTarget(enabled, i, event, { orientation: "vertical", loop: false });

		if (step) {
			event.preventDefault();

			return setActive(step.value);
		}

		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			if (active) pick(active);

			return hide();
		}

		if (event.key === "Escape") {
			event.preventDefault();

			return hide();
		}

		if (event.key === "Tab") return setOpen(false);
		if (event.key.length === 1 && /\S/.test(event.key))
			setActive(typeahead(event.key, active)?.value ?? active);
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
				aria-invalid={aria["aria-invalid"] || (invalid && !value) || undefined}
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

			<FormValue
				name={name}
				value={value}
				required={required}
				disabled={disabled}
				anchor={trigger}
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
								{groups.map((group, groupIndex) => (
									// biome-ignore lint/a11y/useSemanticElements: ARIA group inside a listbox; fieldset is not valid there
									<div
										key={group.label || groupIndex}
										role="group"
										aria-label={group.label || undefined}
									>
										{groupIndex > 0 && (
											<div aria-hidden="true" className="-mx-1 my-1 h-px bg-border" />
										)}

										{group.label && (
											<div
												aria-hidden="true"
												className="px-2 pt-1.5 pb-1 font-medium text-muted-foreground text-xs"
											>
												{group.label}
											</div>
										)}

										{group.options.map((option) => (
											// biome-ignore lint/a11y/useKeyWithClickEvents: keys handled on the listbox (aria-activedescendant)
											<div
												key={option.value}
												id={optionId(option.value)}
												role="option"
												aria-selected={option.value === value}
												aria-disabled={option.disabled || undefined}
												tabIndex={-1}
												onPointerMove={() => !option.disabled && setActive(option.value)}
												onClick={() => {
													if (option.disabled) return;
													pick(option.value);
													hide();
												}}
												className={cn(
													"flex h-8 cursor-default select-none items-center gap-2 rounded-lg pr-8 pl-2 text-sm [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
													"relative aria-disabled:opacity-50",
													active === option.value &&
														"bg-primary text-primary-foreground [&_svg]:text-primary-foreground",
												)}
											>
												{option.icon}

												{option.label}

												{option.value === value && (
													<Check className="!text-current absolute right-2" aria-hidden="true" />
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
