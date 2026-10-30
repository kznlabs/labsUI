import { type RefObject, useEffect, useEffectEvent } from "react";

type FormValueProps = {
	/** Form field name; without it the value only takes part in validation. */
	name?: string;
	/** The value to submit, "" when nothing is picked. */
	value: string;
	/** An empty value blocks submit. */
	required?: boolean;
	/** Skips validation and leaves the value out of the submit, like a disabled input. */
	disabled?: boolean;
	/** The visible control that gets focus when the value is invalid. */
	anchor: RefObject<HTMLElement | null>;
	/** Called when a submit finds the value invalid. */
	onInvalid?: () => void;
};

/**
 * Submits a custom control's value and takes part in native validation, which a hidden input
 * can't: an empty `required` value blocks submit, shows the browser's message and focuses `anchor`.
 */
export function FormValue({ name, value, required, disabled, anchor, onInvalid }: FormValueProps) {
	if (!name && !required) return null;

	return (
		<input
			aria-hidden="true"
			tabIndex={-1}
			name={name}
			value={value}
			required={required}
			disabled={disabled}
			onChange={() => undefined}
			onInvalid={onInvalid}
			onFocus={() => anchor.current?.focus()}
			className="pointer-events-none absolute size-px opacity-0"
		/>
	);
}

/**
 * Calls `onReset` when the control's form resets: a reset button, or React after a `<form action>`
 * succeeds. Custom state goes back to its default there, as a native control's does; a controlled
 * control reports the default through its `onValueChange`, so the parent's state resets too.
 */
export function useFormReset(field: RefObject<HTMLElement | null>, onReset: () => void) {
	const reset = useEffectEvent(onReset);

	useEffect(() => {
		const form = field.current?.closest("form");

		if (!form) return;

		const listener = () => reset();

		form.addEventListener("reset", listener);

		return () => form.removeEventListener("reset", listener);
	}, [field]);
}
