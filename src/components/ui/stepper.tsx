"use client";

import { Check } from "lucide-react";
import { motion } from "motion/react";
import {
	type ComponentProps,
	createContext,
	type ReactNode,
	type SubmitEvent,
	use,
	useEffect,
	useRef,
} from "react";
import { Button } from "@/components/ui/button";
import { useControllableState } from "@/lib/use-controllable-state";
import { cn, spring } from "@/lib/utils";

type StepInfo = { value: string; title: string; description?: string };
type Guard = () => boolean | undefined | Promise<boolean | undefined>;

type StepperCtx = {
	steps: StepInfo[];
	index: number;
	go: (i: number) => void;
	next: () => Promise<void>;
	back: () => void;
	fieldsets: Map<string, HTMLFieldSetElement>;
	guards: Map<string, Guard>;
};

const StepperContext = createContext<StepperCtx | null>(null);

function useStepper() {
	const ctx = use(StepperContext);

	if (!ctx) throw new Error("Stepper parts must be used inside <Stepper>");

	return ctx;
}

const FIELDS = "input:not([type='hidden']),select,textarea";
const FOCUSABLE =
	"input:not([type='hidden']):not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),[tabindex]:not([tabindex='-1'])";

function check(fieldset: HTMLFieldSetElement | undefined) {
	const bad = [...(fieldset?.querySelectorAll<HTMLInputElement>(FIELDS) ?? [])].find(
		(element) => !element.checkValidity(),
	);

	bad?.reportValidity();

	return !bad;
}

type StepperProps = Omit<ComponentProps<"form">, "defaultValue" | "onChange"> & {
	/** Steps in order: `value`, `title` and an optional `description` for the header. */
	steps: StepInfo[];
	/** Current step's `value`. Controlled with `onValueChange`, or start at `defaultValue`. */
	value?: string;
	/** Step shown at first render (uncontrolled). */
	defaultValue?: string;
	/** Called with the new step's `value`. */
	onValueChange?: (value: string) => void;
};

/**
 * Multi-step form. Every step stays mounted (hidden), so values survive Back and submit
 * together; Continue checks only the current step's native constraints, and the last step
 * submits the form (`onSubmit`, or a Server Action through `action`).
 */
export function Stepper({
	steps,
	value: valueProp,
	defaultValue,
	onValueChange,
	onSubmit,
	className,
	children,
	...props
}: StepperProps) {
	const [value, setValue] = useControllableState(
		valueProp,
		defaultValue ?? steps[0]?.value ?? "",
		onValueChange,
	);
	const index = Math.max(
		0,
		steps.findIndex((step) => step.value === value),
	);
	const fieldsets = useRef(new Map<string, HTMLFieldSetElement>()).current;
	const guards = useRef(new Map<string, Guard>()).current;
	const moved = useRef(false);

	const go = (i: number) => {
		const step = steps[i];

		if (!step || i === index) return;
		moved.current = true;
		setValue(step.value);
	};

	const next = async () => {
		const step = steps[index];

		if (!step || !check(fieldsets.get(step.value))) return;

		const guard = guards.get(step.value);

		if (guard && (await guard()) === false) return;
		go(index + 1);
	};

	// After Continue/Back (not on load) focus goes to the new step's first field.
	useEffect(() => {
		if (!moved.current) return;
		moved.current = false;

		const step = steps[index];
		const fs = step && fieldsets.get(step.value);

		(fs?.querySelector<HTMLElement>(FOCUSABLE) ?? fs)?.focus();
	}, [index, steps, fieldsets]);

	const submit = (event: SubmitEvent<HTMLFormElement>) => {
		// Enter on an earlier step means Continue, not submit.
		if (index < steps.length - 1) {
			event.preventDefault();
			void next();

			return;
		}

		// A step changed after it was passed (via the progress list) is brought back and reported.
		const bad = steps.findIndex((step) => !check(fieldsets.get(step.value)));

		if (bad >= 0) {
			event.preventDefault();
			go(bad);

			return;
		}

		onSubmit?.(event);
	};

	return (
		<StepperContext
			value={{ steps, index, go, next, back: () => go(index - 1), fieldsets, guards }}
		>
			<form noValidate onSubmit={submit} className={cn("grid gap-6", className)} {...props}>
				{children}
			</form>
		</StepperContext>
	);
}

/** Progress header. Finished steps are links back; the connector fills on a spring. */
export function StepperList({ className, ...props }: ComponentProps<"ol">) {
	const { steps, index, go } = useStepper();
	const current = steps[index];

	return (
		<div className={cn("grid gap-2", className)}>
			<ol aria-label="Progress" className="flex items-start" {...props}>
				{steps.map((step, i) => {
					const done = i < index;
					const active = i === index;
					const mark = (
						<span
							className={cn(
								"flex size-7 shrink-0 items-center justify-center rounded-full border font-medium text-xs tabular-nums transition-colors",
								done && "border-primary bg-primary text-primary-foreground",
								active && "border-primary text-primary-ink ring-[3px] ring-primary/20",
								!done && !active && "text-muted-foreground",
							)}
						>
							{done ? <Check className="size-3.5" aria-hidden="true" /> : i + 1}
						</span>
					);
					const label = (
						<span
							className={cn(
								"hidden text-sm sm:block",
								active ? "font-medium text-foreground" : "text-muted-foreground",
							)}
						>
							{step.title}
						</span>
					);

					return (
						<li
							key={step.value}
							aria-current={active ? "step" : undefined}
							className={cn("flex items-center", i < steps.length - 1 && "flex-1")}
						>
							{done ? (
								<button
									type="button"
									onClick={() => go(i)}
									className="flex cursor-pointer items-center gap-2 rounded-full pr-1 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
								>
									{mark}
									{label}
									<span className="sr-only"> (completed, go back)</span>
								</button>
							) : (
								<span className="flex items-center gap-2 pr-1">
									{mark}
									{label}
								</span>
							)}
							{i < steps.length - 1 && (
								<span aria-hidden="true" className="relative mx-2 h-px flex-1 bg-border">
									<motion.span
										initial={false}
										animate={{ scaleX: done ? 1 : 0 }}
										transition={spring}
										className="absolute inset-0 origin-left bg-primary"
									/>
								</span>
							)}
						</li>
					);
				})}
			</ol>
			{/* Small screens hide the titles; this keeps the current one (and announces moves). */}
			<p aria-live="polite" className="text-muted-foreground text-xs sm:sr-only">
				Step {index + 1} of {steps.length}
				{current ? `: ${current.title}` : ""}
			</p>
		</div>
	);
}

/**
 * One step's fields. Hidden, not unmounted, while inactive. `onNext` runs after its native
 * constraints pass; return false (or resolve false) to stay, e.g. after a server check.
 */
export function StepperStep({
	value,
	onNext,
	className,
	children,
}: {
	/** Matches a step in `steps`. */
	value: string;
	/** Runs on Continue after the native checks; return false to stay. */
	onNext?: Guard;
	className?: string;
	/** The step's fields. */
	children: ReactNode;
}) {
	const { steps, index, fieldsets, guards } = useStepper();
	const i = steps.findIndex((step) => step.value === value);
	const step = steps[i];
	const active = i === index;

	useEffect(() => {
		if (!onNext) return;
		guards.set(value, onNext);

		return () => {
			guards.delete(value);
		};
	}, [guards, value, onNext]);

	return (
		<motion.fieldset
			ref={(element) => {
				if (element) fieldsets.set(value, element);
				else fieldsets.delete(value);
			}}
			hidden={!active}
			tabIndex={-1}
			// Waits off to the side it enters from, springs in when it becomes current.
			initial={false}
			animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: i < index ? -16 : 16 }}
			transition={spring}
			className={cn("grid min-w-0 gap-4 outline-none", className)}
		>
			{step && (
				<legend className="mb-4 grid gap-1">
					<span className="font-semibold text-lg leading-none">{step.title}</span>
					{step.description && (
						<span className="text-muted-foreground text-sm">{step.description}</span>
					)}
				</legend>
			)}
			{children}
		</motion.fieldset>
	);
}

/** Back and Continue; the last step's button submits. Continue shows a spinner while `onNext` runs. */
export function StepperFooter({
	backLabel = "Back",
	nextLabel = "Continue",
	submitLabel = "Submit",
	className,
}: {
	/** Back button text. */
	backLabel?: ReactNode;
	/** Continue button text. */
	nextLabel?: ReactNode;
	/** Submit button text on the last step. */
	submitLabel?: ReactNode;
	className?: string;
}) {
	const { steps, index, next, back } = useStepper();
	const last = index === steps.length - 1;

	return (
		<div className={cn("flex items-center justify-between gap-2 border-t pt-4", className)}>
			<Button variant="ghost" onClick={back} className={cn(index === 0 && "invisible")}>
				{backLabel}
			</Button>
			{last ? (
				<Button type="submit">{submitLabel}</Button>
			) : (
				// The form's default button: Enter in a field clicks it, same path, same spinner.
				<Button
					type="submit"
					onClick={(event) => {
						event.preventDefault();

						return next();
					}}
				>
					{nextLabel}
				</Button>
			)}
		</div>
	);
}
