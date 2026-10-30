"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ComponentProps, type ReactNode, useRef, useState } from "react";
import { useFieldControl } from "@/components/ui/field";
import { FormValue } from "@/lib/form-value";
import { useControllableState } from "@/lib/use-controllable-state";
import { cn, spring } from "@/lib/utils";

/** Field chrome shared by TagInput and multi Combobox: the box draws the border and focus ring. */
export const tagFieldClass =
	"flex min-h-9 w-full min-w-0 cursor-text flex-wrap items-center gap-1 rounded-lg border border-input bg-field px-1.5 py-1 text-sm shadow-xs transition-[color,box-shadow,border-color] duration-200 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 has-[[aria-invalid=true]]:border-destructive has-[[aria-invalid=true]]:ring-destructive/20 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50";

/** Removable chip. Springs in and out when rendered inside AnimatePresence (`mode="popLayout"`). */
export function Tag({
	children,
	onRemove,
	disabled,
	className,
}: {
	/** Tag text. */
	children: ReactNode;
	/** Shows a remove button; its accessible name is "Remove <children>". */
	onRemove?: () => void;
	/** Hides the remove button. */
	disabled?: boolean;
	className?: string;
}) {
	return (
		<motion.span
			layout
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.8 }}
			transition={spring}
			className={cn(
				"inline-flex h-6 max-w-full items-center gap-1 rounded-md bg-secondary pl-2 font-medium text-secondary-foreground text-xs",
				onRemove ? "pr-0.5" : "pr-2",
				className,
			)}
		>
			<span className="truncate">{children}</span>

			{onRemove && (
				<button
					type="button"
					tabIndex={-1}
					disabled={disabled}
					onClick={(event) => {
						event.stopPropagation();
						onRemove();
					}}
					aria-label={typeof children === "string" ? `Remove ${children}` : "Remove"}
					className="grid size-5 shrink-0 place-items-center rounded text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
				>
					<X className="size-3" aria-hidden="true" />
				</button>
			)}
		</motion.span>
	);
}

type TagInputProps = Omit<
	ComponentProps<"input">,
	"value" | "defaultValue" | "onChange" | "type" | "size"
> & {
	/** Controlled tags; pair with `onValueChange`. */
	value?: string[];
	/** Tags at first render (uncontrolled). */
	defaultValue?: string[];
	/** Called with every tag after an add or remove. */
	onValueChange?: (tags: string[]) => void;
	/** Most tags allowed; typing stops at the limit. */
	max?: number;
	/** Keys that commit the typed text, besides Enter. Pasted text is split on these too. */
	separators?: string[];
	/** Return false to reject a tag (it stays in the input). Runs after trimming. */
	validate?: (tag: string) => boolean;
};

/**
 * Free-form tags: type and press Enter or a separator; paste a list to add many; Backspace in an
 * empty input removes the last tag. `name` submits one value per tag; `required` needs at least one.
 */
export function TagInput({
	value: valueProp,
	defaultValue = [],
	onValueChange,
	max,
	separators = [","],
	validate,
	name,
	placeholder,
	className,
	onKeyDown,
	onPaste,
	onBlur,
	...rest
}: TagInputProps) {
	const { required, ...props } = useFieldControl(rest);
	const [invalid, setInvalid] = useState(false);
	const input = useRef<HTMLInputElement>(null);
	const [tags, set] = useControllableState(valueProp, defaultValue, onValueChange);
	const [draft, setDraft] = useState("");
	const full = max !== undefined && tags.length >= max;

	const add = (raw: string[]) => {
		const next = [...tags];
		let ok = true;

		for (const part of raw) {
			const tag = part.trim();

			if (!tag) continue;
			if (
				next.includes(tag) ||
				(max !== undefined && next.length >= max) ||
				validate?.(tag) === false
			)
				ok = false;
			else next.push(tag);
		}

		if (next.length !== tags.length) set(next);

		return ok;
	};

	const split = (text: string) =>
		separators.reduce<string[]>(
			(parts, separator) => parts.flatMap((part) => part.split(separator)),
			[text],
		);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: forwards pointer clicks to the input; keyboard users focus it directly
		// biome-ignore lint/a11y/useKeyWithClickEvents: same as above
		<div className={cn(tagFieldClass, className)} onClick={() => input.current?.focus()}>
			<AnimatePresence initial={false} mode="popLayout">
				{tags.map((tag) => (
					<Tag
						key={tag}
						disabled={props.disabled}
						onRemove={() => set(tags.filter((x) => x !== tag))}
					>
						{tag}
					</Tag>
				))}
			</AnimatePresence>

			<input
				ref={input}
				type="text"
				data-slot="tag-input"
				{...props}
				aria-required={required}
				aria-invalid={props["aria-invalid"] || (invalid && !tags.length) || undefined}
				// readOnly, not disabled: Backspace still has to remove tags at the limit.
				readOnly={full || props.readOnly}
				placeholder={full ? undefined : placeholder}
				value={draft}
				onChange={(event) => setDraft(event.target.value)}
				onKeyDown={(event) => {
					onKeyDown?.(event);
					if (event.defaultPrevented) return;

					if (event.key === "Enter" || separators.includes(event.key)) {
						// Enter with an empty draft still submits the form.
						if (!draft.trim()) return event.key === "Enter" ? undefined : event.preventDefault();
						event.preventDefault();
						if (add([draft])) setDraft("");
					} else if (event.key === "Backspace" && !draft && tags.length) {
						set(tags.slice(0, -1));
					}
				}}
				onPaste={(event) => {
					onPaste?.(event);

					const text = event.clipboardData.getData("text");
					const parts = split(text);

					if (parts.length < 2) return;
					event.preventDefault();
					add(parts);
				}}
				onBlur={(event) => {
					onBlur?.(event);
					if (draft.trim() && add([draft])) setDraft("");
				}}
				className="h-6 min-w-20 flex-1 bg-transparent px-1 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
			/>

			{name &&
				tags.map((tag) => (
					<input key={tag} type="hidden" name={name} value={tag} disabled={props.disabled} />
				))}

			<FormValue
				value={tags.join(",")}
				required={required}
				disabled={props.disabled}
				anchor={input}
				onInvalid={() => setInvalid(true)}
			/>
		</div>
	);
}
