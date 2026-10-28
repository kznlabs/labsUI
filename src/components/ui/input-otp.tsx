"use client";

import { Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ComponentProps, Fragment, type ReactNode, useEffect, useRef, useState } from "react";
import { useFieldControl } from "@/components/ui/field";
import { useControllableState } from "@/lib/use-controllable-state";
import { cn, spring } from "@/lib/utils";

const charsets = {
	numeric: { strip: /[^0-9]/g, pattern: "[0-9]", inputMode: "numeric" },
	alphanumeric: { strip: /[^A-Za-z0-9]/g, pattern: "[A-Za-z0-9]", inputMode: "text" },
} as const;

/** Seconds between slots turning into checks. */
const STAGGER = 0.05;

/** A typed char leaves upward; on verify, slot by slot (`custom` = its delay). */
const charExit = {
	out: (delay: number) => ({ opacity: 0, y: -14, transition: { ...spring, delay } }),
};

type InputOTPProps = Omit<
	ComponentProps<"input">,
	"value" | "defaultValue" | "onChange" | "maxLength" | "pattern" | "type" | "size"
> & {
	/** Number of slots. */
	length?: number;
	/** Slot counts per visual group, e.g. `[3, 3]`; a dash sits between groups. */
	groups?: number[];
	/** Allowed characters; others are dropped as typed or pasted. */
	charset?: keyof typeof charsets;
	/** Controlled code; pair with `onValueChange`. */
	value?: string;
	/** Code at first render (uncontrolled). */
	defaultValue?: string;
	/** Called with the code on every change. */
	onValueChange?: (value: string) => void;
	/** Fires once every slot is filled, e.g. to submit. */
	onComplete?: (value: string) => void;
	/**
	 * The code was accepted: each character slides up into a check, then the slots merge into one
	 * mark with `verifiedLabel`. The input turns read-only; set it back to false to edit again.
	 */
	verified?: boolean;
	/** Shown beside the merged mark and announced to screen readers. */
	verifiedLabel?: ReactNode;
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
	verified = false,
	verifiedLabel = "Verified",
	className,
	onFocus,
	onBlur,
	...rest
}: InputOTPProps) {
	const props = useFieldControl(rest);
	const [value, setValue] = useControllableState(valueProp, defaultValue, onValueChange);
	const [focused, setFocused] = useState(false);
	const set = charsets[charset];
	const root = useRef<HTMLDivElement>(null);
	const slots = useRef<(HTMLDivElement | null)[]>([]);
	const [merge, setMerge] = useState<number[] | null>(null);

	useEffect(() => {
		if (!verified) {
			setMerge(null);

			return;
		}

		const timer = setTimeout(
			() => {
				const box = root.current?.getBoundingClientRect();

				if (!box) return;

				const center = box.left + box.width / 2;

				setMerge(
					slots.current.map((element) => {
						const rect = element?.getBoundingClientRect();

						return rect ? center - (rect.left + rect.width / 2) : 0;
					}),
				);
			},
			(length * STAGGER + 0.45) * 1000,
		);

		return () => clearTimeout(timer);
	}, [verified, length]);

	const sizes = groups ?? [length];
	const starts = sizes.map((_, group) => sizes.slice(0, group).reduce((a, b) => a + b, 0));
	const active = Math.min(value.length, length - 1);

	// Caret always at the end, codes are typed and erased from the right.
	const pinCaret = (element: HTMLInputElement) => {
		const end = element.value.length;

		if (element.selectionStart !== end || element.selectionEnd !== end)
			element.setSelectionRange(end, end);
	};

	return (
		<div
			ref={root}
			data-verified={verified || undefined}
			className={cn(
				"group/otp relative inline-flex min-w-0 max-w-full items-center gap-2 has-disabled:cursor-not-allowed has-disabled:opacity-50",
				className,
			)}
		>
			{sizes.map((count, group) => (
				<Fragment key={starts[group]}>
					{group > 0 && (
						<motion.span
							aria-hidden="true"
							animate={{ opacity: merge ? 0 : 1 }}
							transition={spring}
							className="h-px w-2.5 shrink-0 bg-muted-foreground/50"
						/>
					)}
					<div className="flex min-w-0 gap-1.5" aria-hidden="true">
						{Array.from({ length: count }, (_, slot) => {
							const i = starts[group] + slot;
							const char = value[i];
							const isActive = !verified && focused && i === active && !(i === length - 1 && char);

							return (
								<motion.div
									key={i}
									ref={(element) => {
										slots.current[i] = element;
									}}
									initial={false}
									animate={
										merge ? { x: merge[i], scale: 0.4, opacity: 0 } : { x: 0, scale: 1, opacity: 1 }
									}
									transition={spring}
									className={cn(
										"relative grid h-10 w-9 min-w-0 shrink place-items-center overflow-hidden rounded-lg border border-input bg-field font-medium text-base shadow-xs transition-[border-color,box-shadow] duration-200",
										"group-has-[[aria-invalid=true]]/otp:border-destructive group-has-[:user-invalid]/otp:border-destructive",
										isActive && "border-ring ring-[3px] ring-ring/50",
										verified && "border-success",
									)}
								>
									<AnimatePresence
										initial={false}
										mode="popLayout"
										custom={verified ? i * STAGGER : 0}
									>
										{verified ? (
											<motion.span
												key="check"
												initial={{ opacity: 0, y: 14 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ ...spring, delay: i * STAGGER }}
												className="text-success-ink"
											>
												<Check className="size-4" strokeWidth={3} />
											</motion.span>
										) : (
											char && (
												<motion.span
													key={char}
													initial={{ opacity: 0, y: 8, scale: 0.8 }}
													animate={{ opacity: 1, y: 0, scale: 1 }}
													variants={charExit}
													exit="out"
													transition={spring}
												>
													{char}
												</motion.span>
											)
										)}
									</AnimatePresence>
									{isActive && !char && (
										<span className="absolute h-4 w-px animate-caret-blink bg-foreground motion-reduce:animate-none" />
									)}
								</motion.div>
							);
						})}
					</div>
				</Fragment>
			))}
			<AnimatePresence>
				{merge && (
					// Slots fold into one bar of the same size: a finished field, not a new widget.
					<motion.div
						aria-hidden="true"
						initial={{ opacity: 0, scaleX: 0.2 }}
						animate={{ opacity: 1, scaleX: 1 }}
						exit={{ opacity: 0, scaleX: 0.2 }}
						transition={spring}
						className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 rounded-lg border border-success/60 bg-[color-mix(in_oklch,var(--color-success)_10%,var(--color-card))] shadow-xs"
					>
						<span className="relative grid size-5 shrink-0 place-items-center">
							<motion.span
								initial={{ scale: 1, opacity: 0.5 }}
								animate={{ scale: 2.4, opacity: 0 }}
								transition={{ ...spring, stiffness: 120, delay: 0.15 }}
								className="absolute inset-0 rounded-full border-2 border-success"
							/>
							<motion.span
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ ...spring, delay: 0.08 }}
								className="grid size-5 place-items-center rounded-full bg-success text-success-foreground"
							>
								<svg viewBox="0 0 24 24" className="size-3.5" fill="none" aria-hidden="true">
									<motion.path
										d="M5 12.5l4.5 4.5L19 7.5"
										stroke="currentColor"
										strokeWidth={3.5}
										strokeLinecap="round"
										strokeLinejoin="round"
										initial={{ pathLength: 0 }}
										animate={{ pathLength: 1 }}
										transition={{ ...spring, delay: 0.18 }}
									/>
								</svg>
							</motion.span>
						</span>
						<motion.span
							initial={{ opacity: 0, x: -6 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ ...spring, delay: 0.22 }}
							className="truncate font-medium text-sm text-success-ink"
						>
							{verifiedLabel}
						</motion.span>
					</motion.div>
				)}
			</AnimatePresence>
			<span role="status" className="sr-only">
				{verified ? verifiedLabel : null}
			</span>
			<input
				type="text"
				autoComplete="one-time-code"
				inputMode={set.inputMode}
				pattern={`${set.pattern}{${length}}`}
				maxLength={length}
				spellCheck={false}
				data-slot="input-otp"
				{...props}
				readOnly={verified || props.readOnly}
				value={value}
				onChange={(event) => {
					let next = event.target.value.replace(set.strip, "").slice(0, length);

					if (charset === "alphanumeric") next = next.toUpperCase();
					if (next === value) return;
					setValue(next);
					if (next.length === length) onComplete?.(next);
				}}
				onFocus={(event) => {
					setFocused(true);
					pinCaret(event.currentTarget);
					onFocus?.(event);
				}}
				onBlur={(event) => {
					setFocused(false);
					onBlur?.(event);
				}}
				onSelect={(event) => pinCaret(event.currentTarget)}
				className="absolute inset-0 size-full cursor-text bg-transparent text-transparent caret-transparent outline-none selection:bg-transparent read-only:cursor-default disabled:cursor-not-allowed"
			/>
		</div>
	);
}
