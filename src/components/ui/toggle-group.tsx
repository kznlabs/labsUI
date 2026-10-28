"use client";

import { motion } from "motion/react";
import { type ComponentProps, createContext, type KeyboardEvent, use, useRef } from "react";
import { listKeyTarget } from "@/lib/list";
import { useControllableState } from "@/lib/use-controllable-state";
import { useIndicator } from "@/lib/use-indicator";
import { cn, spring } from "@/lib/utils";

type GroupCtx = {
	pressed: (value: string) => boolean;
	toggle: (value: string) => void;
	items: Map<string, HTMLButtonElement>;
	size: "sm" | "default";
	/** Multiple mode: no sliding pill, each pressed item gets its own surface. */
	multiple: boolean;
};

const GroupContext = createContext<GroupCtx | null>(null);

type ToggleGroupProps = Omit<ComponentProps<"div">, "defaultValue" | "onChange"> & {
	/** Item height. */
	size?: "sm" | "default";
} & (
		| {
				/** "single": one choice at a time (view mode, billing period), a pill slides between items. "multiple": independent toggles (bold, italic, filters). */
				type?: "single";
				/** Controlled value, or values when `type="multiple"`; pair with `onValueChange`. */
				value?: string;
				/** Value, or values when `type="multiple"`, at first render (uncontrolled). */
				defaultValue?: string;
				/** Called with the pressed item's value, or every pressed value when `type="multiple"`. */
				onValueChange?: (value: string) => void;
		  }
		| {
				type: "multiple";
				value?: string[];
				defaultValue?: string[];
				onValueChange?: (value: string[]) => void;
		  }
	);

/**
 * Segmented control as a set of toggle buttons (aria-pressed). Arrow keys, Home and End
 * move between items. Single mode: one pill springs to the pressed item, always behind labels.
 */
export function ToggleGroup(props: ToggleGroupProps) {
	const {
		type = "single",
		size = "default",
		value: _value,
		defaultValue,
		onValueChange: _onValueChange,
		className,
		children,
		...rest
	} = props;
	const items = useRef(new Map<string, HTMLButtonElement>()).current;
	const [raw, setRaw] = useControllableState<string | string[] | undefined>(
		props.value,
		defaultValue,
		props.onValueChange as ((value: string | string[] | undefined) => void) | undefined,
	);
	const current = raw === undefined ? [] : [raw].flat();
	const single = type === "single";

	const toggle = (value: string) => {
		const next = single
			? [value] // a segmented control always keeps one selected
			: current.includes(value)
				? current.filter((x) => x !== value)
				: [...current, value];

		setRaw(single ? value : next);
	};

	const pill = useIndicator(items, single ? current[0] : undefined);

	const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		const all = [
			...event.currentTarget.querySelectorAll<HTMLButtonElement>(
				"button[data-value]:not(:disabled)",
			),
		];
		const i = all.indexOf(document.activeElement as HTMLButtonElement);

		if (i < 0) return;

		const next = listKeyTarget(all, i, event, { orientation: "horizontal" });

		if (!next) return;
		event.preventDefault();
		next.focus();
	};

	return (
		<GroupContext
			value={{
				pressed: (value) => current.includes(value),
				toggle,
				items,
				size,
				multiple: !single,
			}}
		>
			{/* biome-ignore lint/a11y/useSemanticElements: ARIA toolbar-style group of toggle buttons */}
			<div
				role="group"
				onKeyDown={onKeyDown}
				className={cn(
					"relative isolate inline-flex w-fit items-center gap-0.5 rounded-lg bg-foreground/[0.06] p-0.5",
					className,
				)}
				{...rest}
			>
				{single && pill.width > 0 && (
					<motion.span
						aria-hidden="true"
						initial={false}
						animate={{ x: pill.x, width: pill.width }}
						transition={spring}
						className="-z-10 absolute inset-y-0.5 left-0 rounded-md bg-raised shadow-sm ring-[0.5px] ring-raised-ring"
					/>
				)}
				{children}
			</div>
		</GroupContext>
	);
}

/** One segment. Icon-only items need an aria-label. */
export function ToggleGroupItem({
	value,
	className,
	onClick,
	...props
}: Omit<ComponentProps<"button">, "value"> & {
	/** Value reported when pressed. */ value: string;
}) {
	const ctx = use(GroupContext);

	if (!ctx) throw new Error("<ToggleGroupItem> must be used inside <ToggleGroup>");

	const on = ctx.pressed(value);

	return (
		<button
			ref={(element) => {
				if (element) ctx.items.set(value, element);
				else ctx.items.delete(value);
			}}
			type="button"
			data-value={value}
			data-state={on ? "on" : "off"}
			aria-pressed={on}
			onClick={(event) => {
				onClick?.(event);
				if (!event.defaultPrevented) ctx.toggle(value);
			}}
			className={cn(
				"inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
				ctx.size === "sm" ? "h-6 px-2 text-xs" : "h-7 px-2.5 text-sm",
				on ? "text-foreground" : "text-muted-foreground hover:text-foreground",
				on && ctx.multiple && "bg-raised shadow-sm ring-[0.5px] ring-raised-ring",
				className,
			)}
			{...props}
		/>
	);
}
