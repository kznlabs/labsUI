import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// Server-safe. The infinite fade is the one allowed tween (loader), see animate-spinner in
// labsui.css.

const sizes = { sm: "size-3.5", default: "size-4", lg: "size-6" };
const spokes = [0, 1, 2, 3, 4, 5, 6, 7];

type SpinnerProps = Omit<ComponentProps<"span">, "children"> & {
	/** Diameter. */
	size?: keyof typeof sizes;
	/** Accessible name. Pass "" when a parent already announces the busy state. */
	label?: string;
};

/** Activity indicator: eight spokes in `currentColor`. Under reduced motion it holds still. */
export function Spinner({
	size = "default",
	label = "Loading",
	className,
	...props
}: SpinnerProps) {
	return (
		<span
			role={label ? "status" : undefined}
			aria-hidden={label ? undefined : true}
			className={cn(
				"relative inline-block shrink-0 align-middle text-muted-foreground",
				sizes[size],
				className,
			)}
			{...props}
		>
			{label && <span className="sr-only">{label}</span>}

			{spokes.map((i) => (
				<span
					key={i}
					aria-hidden="true"
					className="absolute inset-0 animate-spinner motion-reduce:animate-none"
					// Inline opacity is the static (reduced-motion) trail, the animation overrides it.
					style={{
						rotate: `${i * 45}deg`,
						animationDelay: `${(i - 8) * 0.1}s`,
						opacity: 0.15 + (i / 7) * 0.85,
					}}
				>
					<span className="absolute top-0 left-1/2 h-[30%] w-[12%] -translate-x-1/2 rounded-full bg-current" />
				</span>
			))}
		</span>
	);
}
