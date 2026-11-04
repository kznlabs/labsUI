"use client";

import { motion } from "motion/react";
import { type ComponentProps, useId, useRef, useState, useSyncExternalStore } from "react";
import { type Accent, accents, getAccent, setAccent, subscribeTheme } from "@/lib/theme";
import { useDismiss } from "@/lib/use-dismiss";
import { cn, material, spring } from "@/lib/utils";

/** Fixed swatch colors, not the current accent. */
const swatch: Record<Accent, string> = {
	red: "oklch(0.6 0.21 24)",
	orange: "oklch(0.7 0.17 50)",
	yellow: "oklch(0.84 0.17 96)",
	green: "oklch(0.64 0.17 156)",
	blue: "oklch(0.6 0.21 250)",
	purple: "oklch(0.6 0.2 300)",
	pink: "oklch(0.63 0.21 350)",
	slate: "oklch(0.5 0.025 250)",
};

const useCurrentAccent = () =>
	useSyncExternalStore(subscribeTheme, getAccent, () => "blue" as Accent);

const accentName = (accent: Accent) => accent[0]?.toUpperCase() + accent.slice(1);

function Swatches({ className, ...props }: ComponentProps<"fieldset">) {
	// Per instance, two pickers on a page can't share a radio group or a dot.
	const id = useId();
	const current = useCurrentAccent();

	return (
		<fieldset className={cn("flex items-center gap-1.5", className)} {...props}>
			<legend className="sr-only">Accent color</legend>

			{accents.map((accent) => (
				<label
					key={accent}
					title={accentName(accent)}
					className="relative grid size-5 cursor-pointer place-items-center rounded-full"
				>
					<input
						type="radio"
						name={`${id}-accent`}
						value={accent}
						checked={current === accent}
						onChange={() => setAccent(accent)}
						className="peer sr-only"
					/>

					<span className="sr-only">{accent}</span>

					<span
						aria-hidden="true"
						style={{ backgroundColor: swatch[accent] }}
						className="size-4 rounded-full inset-ring inset-ring-foreground/10 transition-transform duration-200 peer-hover:scale-110 peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50"
					/>

					{current === accent && (
						<motion.span
							aria-hidden="true"
							layoutId={`${id}-dot`}
							transition={spring}
							className="absolute size-1.5 rounded-full bg-white"
						/>
					)}
				</label>
			))}
		</fieldset>
	);
}

function FoldedPicker({ className }: { className?: string }) {
	const id = useId();
	const current = useCurrentAccent();
	const [open, setOpen] = useState(false);
	const panel = useRef<HTMLDivElement>(null);
	const trigger = useRef<HTMLButtonElement>(null);
	// An arrow key clicks the radio it lands on, and that click must not count as a pick.
	const walking = useRef(false);
	const lastPick = useRef(current);

	// Focus goes first: inert would drop it from a radio.
	const closeToDot = () => {
		trigger.current?.focus();
		setOpen(false);
	};

	const dismiss = () => {
		setAccent(lastPick.current);
		setOpen(false);
	};

	useDismiss(open, [panel, trigger], () => {
		dismiss();

		// The press moves focus after this: back on the dot, unless it landed on a control.
		requestAnimationFrame(() => {
			if (document.activeElement === document.body) trigger.current?.focus({ preventScroll: true });
		});
	});

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: Esc and focus leaving, from the button or a radio inside
		<div
			className={cn("relative inline-flex", className)}
			onKeyDown={(event) => {
				if (!open || event.key !== "Escape" || event.defaultPrevented) return;

				// Handled here so an enclosing Dialog stays open.
				event.preventDefault();
				setAccent(lastPick.current);
				closeToDot();
			}}
			onBlur={(event) => {
				// No target means the window lost focus, or a press that useDismiss handles.
				if (open && event.relatedTarget && !event.currentTarget.contains(event.relatedTarget))
					dismiss();
			}}
		>
			<button
				ref={trigger}
				type="button"
				aria-label={`Accent color: ${accentName(current)}`}
				title={accentName(current)}
				aria-expanded={open}
				aria-controls={`${id}-colors`}
				onClick={(event) => {
					// Safari doesn't focus a button on click, and Esc needs focus in here.
					event.currentTarget.focus();

					if (open) return dismiss();

					lastPick.current = current;
					setOpen(true);
				}}
				className="group grid size-6 cursor-pointer place-items-center rounded-full outline-none"
			>
				<span
					aria-hidden="true"
					style={{ backgroundColor: swatch[current] }}
					className="size-4 rounded-full inset-ring inset-ring-foreground/10 transition-transform duration-200 group-hover:scale-110 group-focus-visible:ring-[3px] group-focus-visible:ring-ring/50"
				/>
			</button>

			{/* Out of the flow and clipped at the dot, so nothing beside it moves. */}
			<div
				ref={panel}
				id={`${id}-colors`}
				inert={!open}
				className="absolute top-1/2 right-full z-30 mr-1 -translate-y-1/2 overflow-hidden"
			>
				<motion.div
					initial={false}
					animate={open ? { x: 0, opacity: 1 } : { x: "100%", opacity: 0 }}
					transition={spring}
					className={cn("rounded-2xl border p-1 sm:rounded-full sm:p-1.5", material)}
				>
					<Swatches
						className="grid grid-cols-[repeat(4,1.25rem)] gap-1 sm:flex sm:gap-1.5"
						onPointerDown={() => {
							walking.current = false;
						}}
						onKeyDown={(event) => {
							walking.current = event.key.startsWith("Arrow");

							if (event.key !== "Enter" || !(event.target instanceof HTMLInputElement)) return;

							// Enter would submit a surrounding form.
							event.preventDefault();
							setAccent(event.target.value as Accent);
							closeToDot();
						}}
						onKeyUp={() => {
							walking.current = false;
						}}
						onClick={(event) => {
							// A press on a label comes back as a click on its radio, act on that one.
							if (event.target instanceof HTMLInputElement && !walking.current) closeToDot();
						}}
					/>
				</motion.div>
			</div>
		</div>
	);
}

/** Accent color radios that retint the whole app via `setAccent()`: a row, or folded behind a dot. */
export function AccentPicker({
	folded = false,
	className,
}: {
	/**
	 * Fold the row behind a dot in the current color, for tight spots like a header. A click slides
	 * the colors out over whatever sits left of the dot, so nothing moves. Arrow keys try a color, a
	 * click or Enter keeps it and closes; Esc, an outside click or tabbing away go back to the last pick.
	 */
	folded?: boolean;
	className?: string;
}) {
	return folded ? <FoldedPicker className={className} /> : <Swatches className={className} />;
}
