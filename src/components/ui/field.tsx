"use client";

import { AnimatePresence, motion } from "motion/react";
import { createContext, type ReactNode, use, useId } from "react";
import { Label } from "@/components/ui/label";
import { cn, spring } from "@/lib/utils";

type FieldCtx = {
	id: string;
	labelId: string | undefined;
	describedBy: string | undefined;
	invalid: boolean;
	required: boolean;
	disabled: boolean;
};

const FieldContext = createContext<FieldCtx | null>(null);

type ControlProps = {
	id?: string;
	"aria-describedby"?: string;
	"aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling";
	required?: boolean;
	disabled?: boolean;
};

/**
 * For controls: fills id, aria-describedby, aria-invalid, required and disabled from the
 * enclosing <Field>. Explicit props win. Outside a Field it returns the props unchanged.
 */
export function useFieldControl<Props extends ControlProps>(props: Props): Props {
	const field = use(FieldContext);

	if (!field) return props;

	return {
		...props,
		id: props.id ?? field.id,
		"aria-describedby":
			[field.describedBy, props["aria-describedby"]].filter(Boolean).join(" ") || undefined,
		"aria-invalid": props["aria-invalid"] ?? (field.invalid || undefined),
		required: props.required ?? (field.required || undefined),
		disabled: props.disabled ?? (field.disabled || undefined),
	};
}

/** Id of the enclosing Field's label: names a group control (a fieldset can't be a label's target). */
export function useFieldLabel() {
	return use(FieldContext)?.labelId;
}

type FieldProps = {
	/** Label wired to the control's id; names RadioGroup and Rating, which have no single input. */
	label?: ReactNode;
	/** Hint under the control. */
	description?: ReactNode;
	/** Shown under the control and marks it aria-invalid. Springs in and out. */
	error?: ReactNode;
	/** Marks the label and makes the control required. */
	required?: boolean;
	/** Dims the label and disables the control. */
	disabled?: boolean;
	/** "horizontal": control first, label beside it (Checkbox, Switch). */
	orientation?: "vertical" | "horizontal";
	/** Use when the control renders its own id (it must match). */
	id?: string;
	className?: string;
	/** One form control; it picks up id, aria and state from the Field. */
	children: ReactNode;
};

/** Label, control, description and error as one unit, with ids and ARIA wired automatically. */
export function Field({
	label,
	description,
	error,
	required = false,
	disabled = false,
	orientation = "vertical",
	id: idProp,
	className,
	children,
}: FieldProps) {
	const auto = useId();
	const id = idProp ?? auto;
	const descId = description ? `${id}-description` : undefined;
	const errorId = error ? `${id}-error` : undefined;
	const labelId = label ? `${id}-label` : undefined;
	const horizontal = orientation === "horizontal";

	const labelEl = label && (
		<Label id={labelId} htmlFor={id} className={cn(disabled && "cursor-not-allowed opacity-50")}>
			{label}

			{required && (
				<span aria-hidden="true" className="text-destructive-ink">
					*
				</span>
			)}
		</Label>
	);

	return (
		<FieldContext
			value={{
				id,
				labelId,
				describedBy: [descId, errorId].filter(Boolean).join(" ") || undefined,
				invalid: !!error,
				required,
				disabled,
			}}
		>
			<div data-invalid={error ? "" : undefined} className={cn("grid gap-2", className)}>
				{horizontal ? (
					<div className="flex items-center gap-2.5">
						{children}

						{labelEl}
					</div>
				) : (
					<>
						{labelEl}

						{children}
					</>
				)}

				{description && (
					<p
						id={descId}
						className={cn("text-muted-foreground text-xs leading-relaxed", horizontal && "pl-6.5")}
					>
						{description}
					</p>
				)}

				{/* Persistent live region, so a new error is announced. */}
				{/* -mt-2 cancels the grid gap while empty; the error brings its own pt-2. */}
				<div aria-live="polite" className={cn("-mt-2", horizontal && "pl-6.5")}>
					<AnimatePresence initial={false}>
						{error && (
							<motion.p
								key="error"
								id={errorId}
								initial={{ height: 0, opacity: 0, y: -4 }}
								animate={{ height: "auto", opacity: 1, y: 0 }}
								exit={{ height: 0, opacity: 0, y: -4 }}
								transition={spring}
								className="overflow-hidden pt-2 text-destructive-ink text-xs"
							>
								{error}
							</motion.p>
						)}
					</AnimatePresence>
				</div>
			</div>
		</FieldContext>
	);
}
