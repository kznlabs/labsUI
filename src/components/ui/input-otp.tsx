"use client";

import { AnimatePresence, motion } from "motion/react";
import { type ComponentProps, Fragment, useState } from "react";
import { useFieldControl } from "@/components/ui/field";
import { useControllableState } from "@/lib/use-controllable-state";
import { cn, spring } from "@/lib/utils";

const charsets = {
	numeric: { strip: /[^0-9]/g, pattern: "[0-9]", inputMode: "numeric" },
	alphanumeric: { strip: /[^A-Za-z0-9]/g, pattern: "[A-Za-z0-9]", inputMode: "text" },
} as const;

type InputOTPProps = Omit<
	ComponentProps<"input">,
	"value" | "defaultValue" | "onChange" | "maxLength" | "pattern" | "type" | "size"
> & {
	/** Number of slots. */
	length?: number;
	/** Slot counts per visual group, e.g. `[3, 3]`; a dash sits between groups. */
	groups?: number[];
	charset?: keyof typeof charsets;
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	/** Fires once every slot is filled, e.g. to submit. */
	onComplete?: (value: string) => void;
};

/**
 * One-time code: a single real input (paste, SMS autofill via autocomplete="one-time-code",
 * one label for screen readers) laid transparently over the slots it draws. Alphanumeric is uppercased.
 */
export function InputOTP({
	length = 6,
	groups,
	charset = "numeric",
	value: valueProp,
	defaultValue = "",
	onValueChange,
	onComplete,
	className,
	onFocus,
	onBlur,
	...rest
}: InputOTPProps) {
	const props = useFieldControl(rest);
	const [value, setValue] = useControllableState(valueProp, defaultValue, onValueChange);
	const [focused, setFocused] = useState(false);
	const set = charsets[charset];

	const sizes = groups ?? [length];
	const starts = sizes.map((_, g) => sizes.slice(0, g).reduce((a, b) => a + b, 0));
	const active = Math.min(value.length, length - 1);

	// The caret always sits at the end: codes are typed and erased from the right.
	const pinCaret = (el: HTMLInputElement) => {
		const end = el.value.length;
		if (el.selectionStart !== end || el.selectionEnd !== end) el.setSelectionRange(end, end);
	};

	return (
		<div
			className={cn(
				"group/otp relative inline-flex min-w-0 max-w-full items-center gap-2 has-disabled:cursor-not-allowed has-disabled:opacity-50",
				className,
			)}
		>
			{sizes.map((count, g) => (
				<Fragment key={starts[g]}>
					{g > 0 && (
						<span aria-hidden="true" className="h-px w-2.5 shrink-0 bg-muted-foreground/50" />
					)}
					<div className="flex min-w-0 gap-1.5" aria-hidden="true">
						{Array.from({ length: count }, (_, k) => {
							const i = starts[g] + k;
							const char = value[i];
							const isActive = focused && i === active && !(i === length - 1 && char);
							return (
								<div
									key={i}
									className={cn(
										"relative grid h-10 w-9 min-w-0 shrink place-items-center overflow-hidden rounded-lg border border-input font-medium text-base shadow-xs transition-[border-color,box-shadow] duration-200 dark:bg-input/30",
										"group-has-[[aria-invalid=true]]/otp:border-destructive group-has-[:user-invalid]/otp:border-destructive",
										isActive && "border-ring ring-[3px] ring-ring/50",
									)}
								>
									<AnimatePresence initial={false} mode="popLayout">
										{char && (
											<motion.span
												key={char}
												initial={{ opacity: 0, y: 8, scale: 0.8 }}
												animate={{ opacity: 1, y: 0, scale: 1 }}
												exit={{ opacity: 0, scale: 0.8 }}
												transition={spring}
											>
												{char}
											</motion.span>
										)}
									</AnimatePresence>
									{isActive && !char && (
										<span className="absolute h-4 w-px animate-caret-blink bg-foreground motion-reduce:animate-none" />
									)}
								</div>
							);
						})}
					</div>
				</Fragment>
			))}
			<input
				type="text"
				autoComplete="one-time-code"
				inputMode={set.inputMode}
				pattern={`${set.pattern}{${length}}`}
				maxLength={length}
				spellCheck={false}
				data-slot="input-otp"
				{...props}
				value={value}
				onChange={(e) => {
					let next = e.target.value.replace(set.strip, "").slice(0, length);
					if (charset === "alphanumeric") next = next.toUpperCase();
					if (next === value) return;
					setValue(next);
					if (next.length === length) onComplete?.(next);
				}}
				onFocus={(e) => {
					setFocused(true);
					pinCaret(e.currentTarget);
					onFocus?.(e);
				}}
				onBlur={(e) => {
					setFocused(false);
					onBlur?.(e);
				}}
				onSelect={(e) => pinCaret(e.currentTarget)}
				className="absolute inset-0 size-full cursor-text bg-transparent text-transparent caret-transparent outline-none selection:bg-transparent disabled:cursor-not-allowed"
			/>
		</div>
	);
}
