import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Server-safe (no "use client"). */

/** Ordered list of events, newest or oldest first; the order is yours. */
export function Timeline({ className, ...props }: ComponentProps<"ol">) {
	return <ol className={cn("grid", className)} {...props} />;
}

const markers = {
	default: "border-border bg-card text-muted-foreground",
	active: "border-primary bg-primary text-primary-foreground",
	success: "border-success/30 bg-success/10 text-success-ink",
	warning: "border-warning/30 bg-warning/10 text-warning-ink",
	destructive: "border-destructive/30 bg-destructive/10 text-destructive-ink",
};

type TimelineItemProps = Omit<ComponentProps<"li">, "title"> & {
	/** Event headline. */
	title: ReactNode;
	/** Shown above the title. Pair with `dateTime` to render a machine-readable <time>. */
	time?: ReactNode;
	/** Machine-readable date for `<time>`, e.g. "2026-10-21". */
	dateTime?: string;
	/** Icon inside the marker; without one the marker is a small dot. */
	icon?: ReactNode;
	/** Marker color. */
	variant?: keyof typeof markers;
};

/** One event: marker on the rail, then time, title and optional body (children). */
export function TimelineItem({
	title,
	time,
	dateTime,
	icon,
	variant = "default",
	className,
	children,
	...props
}: TimelineItemProps) {
	return (
		<li
			className={cn(
				"group/item relative grid grid-cols-[1.5rem_1fr] gap-x-3 pb-6 last:pb-0",
				className,
			)}
			{...props}
		>
			<span
				aria-hidden="true"
				className="absolute top-7 bottom-1 left-3 w-px -translate-x-1/2 bg-border group-last/item:hidden"
			/>

			<span
				aria-hidden="true"
				className={cn(
					"relative grid place-items-center rounded-full border [&_svg]:size-3.5",
					icon ? "size-6" : "m-[7px] size-2.5",
					markers[variant],
					!icon && variant === "default" && "bg-muted-foreground/40 border-transparent",
				)}
			>
				{icon}
			</span>

			<div className="grid min-w-0 gap-1 pt-0.5">
				{time &&
					(dateTime ? (
						<time dateTime={dateTime} className="text-muted-foreground text-xs tabular-nums">
							{time}
						</time>
					) : (
						<span className="text-muted-foreground text-xs tabular-nums">{time}</span>
					))}

				<p className="font-medium text-sm leading-snug">{title}</p>

				{children && (
					<div className="text-muted-foreground text-sm leading-relaxed">{children}</div>
				)}
			</div>
		</li>
	);
}
