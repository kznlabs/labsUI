"use client";

import { Check, Loader2 } from "lucide-react";
import { AnimatePresence, type HTMLMotionProps, motion } from "motion/react";
import {
	type KeyboardEvent,
	type MouseEvent,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";
import { spring } from "@/lib/utils";
import { buttonVariants, type VariantProps } from "./button-variants";

type ButtonStatus = "idle" | "loading" | "success";
/** Direction the old label slides out toward. The new label comes from the opposite side. */
type SwapDirection = "left" | "right" | "up" | "down";
type Phase = "idle" | "armed" | "loading" | "success";

type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> &
	VariantProps & {
		/** Disables the button and shows a spinner before the label. */
		loading?: boolean;
		/** In-place feedback: `loading` spins, `success` swaps the label to `successLabel`. */
		status?: ButtonStatus;
		/** Text shown on `status="success"`, with a check icon. Defaults to "Done". */
		successLabel?: ReactNode;
		/** Label shown while loading, with the spinner. Defaults to `children`. */
		loadingLabel?: ReactNode;
		/** Two-step action: first click swaps the label to this, second click runs `onClick`. */
		confirmLabel?: ReactNode;
		/** Ms before an armed confirm step resets. Also resets on blur or Esc. */
		confirmTimeout?: number;
		/** Where the old label slides out to on a swap. Default "left". */
		swap?: SwapDirection;
		children?: ReactNode;
	};

const vectors: Record<SwapDirection, { x: number; y: number }> = {
	left: { x: -1, y: 0 },
	right: { x: 1, y: 0 },
	up: { x: 0, y: -1 },
	down: { x: 0, y: 1 },
};

const DISTANCE = 16;
/** Ignore a second click this soon after arming, so a double click can't confirm. */
const DOUBLE_CLICK_GUARD = 400;

function slideProps(direction: SwapDirection) {
	const { x, y } = vectors[direction];
	return {
		initial: { x: -x * DISTANCE, y: -y * DISTANCE, opacity: 0 },
		animate: { x: 0, y: 0, opacity: 1 },
		exit: { x: x * DISTANCE, y: y * DISTANCE, opacity: 0 },
	};
}

/** Invisible width reserver: same grid cell as the visible label, so the widest one wins. */
function SizerLabel({ children }: { children: ReactNode }) {
	return (
		<span
			aria-hidden="true"
			className="invisible col-start-1 row-start-1 inline-flex items-center gap-2"
		>
			{children}
		</span>
	);
}

export function Button({
	variant,
	size,
	loading = false,
	status = "idle",
	successLabel,
	loadingLabel,
	confirmLabel,
	confirmTimeout = 3000,
	swap = "left",
	disabled,
	className,
	type = "button",
	children,
	onClick,
	onBlur,
	onKeyDown,
	...props
}: ButtonProps) {
	const [armed, setArmed] = useState(false);
	/** True while an async `onClick` is pending, so the button shows loading until it settles. */
	const [pending, setPending] = useState(false);
	const armedAt = useRef(0);
	const busy = loading || status === "loading" || pending;
	const done = status === "success";
	const phase: Phase = done ? "success" : busy ? "loading" : armed ? "armed" : "idle";
	const motionProps = slideProps(swap);

	useEffect(() => {
		if (!armed) return;
		const timer = setTimeout(() => setArmed(false), confirmTimeout);
		return () => clearTimeout(timer);
	}, [armed, confirmTimeout]);

	const run = (e: MouseEvent<HTMLButtonElement>) => {
		const result: unknown = onClick?.(e);
		if (result instanceof Promise) {
			setPending(true);
			result.finally(() => setPending(false));
		}
	};

	const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
		if (done || busy) return e.preventDefault();
		if (confirmLabel === undefined) return run(e);
		if (!armed) {
			armedAt.current = Date.now();
			return setArmed(true);
		}
		if (Date.now() - armedAt.current < DOUBLE_CLICK_GUARD) return;
		setArmed(false);
		run(e);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
		if (e.key === "Escape") setArmed(false);
		onKeyDown?.(e);
	};

	return (
		<motion.button
			type={type}
			whileTap={busy ? undefined : { scale: 0.97 }}
			transition={spring}
			disabled={disabled}
			// aria-disabled, not disabled, while busy: a disabled button drops keyboard focus.
			aria-disabled={busy || undefined}
			aria-busy={busy || undefined}
			data-state={phase}
			className={buttonVariants({ variant, size, className })}
			onClick={handleClick}
			onBlur={(e) => {
				setArmed(false);
				onBlur?.(e);
			}}
			onKeyDown={handleKeyDown}
			{...props}
		>
			{/* Hidden copies of every label reserve the widest one, so swaps never resize the button. */}
			<span className="inline-grid justify-items-center">
				{children !== undefined && <SizerLabel>{children}</SizerLabel>}
				{loadingLabel !== undefined && <SizerLabel>{loadingLabel}</SizerLabel>}
				{confirmLabel !== undefined && <SizerLabel>{confirmLabel}</SizerLabel>}
				{successLabel !== undefined && (
					<SizerLabel>
						<Check />
						{successLabel}
					</SizerLabel>
				)}
				<AnimatePresence mode="wait" initial={false}>
					{phase === "success" && (
						<motion.span
							key="success"
							role="status"
							{...motionProps}
							transition={spring}
							className="col-start-1 row-start-1 inline-flex items-center gap-2"
						>
							<motion.span
								initial={{ scale: 0, rotate: -90 }}
								animate={{ scale: 1, rotate: 0 }}
								transition={spring}
								className="inline-flex"
							>
								<Check aria-hidden="true" />
							</motion.span>
							{successLabel ?? "Done"}
						</motion.span>
					)}
					{phase === "armed" && (
						<motion.span
							key="armed"
							role="status"
							{...motionProps}
							transition={spring}
							className="col-start-1 row-start-1 inline-flex items-center gap-2"
						>
							{confirmLabel}
						</motion.span>
					)}
					{phase === "loading" && (
						<motion.span
							key="loading"
							{...motionProps}
							transition={spring}
							className="col-start-1 row-start-1 inline-flex items-center gap-2"
						>
							<AnimatePresence initial={false}>
								<motion.span
									key="spinner"
									initial={{ width: 0, opacity: 0, scale: 0.5 }}
									animate={{ width: "auto", opacity: 1, scale: 1 }}
									exit={{ width: 0, opacity: 0, scale: 0.5 }}
									transition={spring}
									className="-mr-2 inline-flex overflow-hidden pr-2"
								>
									<Loader2 className="animate-spin" aria-hidden="true" />
								</motion.span>
							</AnimatePresence>
							{loadingLabel ?? children}
						</motion.span>
					)}
					{phase === "idle" && (
						<motion.span
							key="idle"
							{...motionProps}
							transition={spring}
							className="col-start-1 row-start-1 inline-flex items-center gap-2"
						>
							{children}
						</motion.span>
					)}
				</AnimatePresence>
			</span>
		</motion.button>
	);
}
