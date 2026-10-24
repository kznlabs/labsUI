import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Server-safe (no "use client"). */

type EmptyProps = Omit<ComponentProps<"div">, "title"> & {
	/** Shown in a rounded tile, like an app icon. */
	icon?: ReactNode;
	title: ReactNode;
	description?: ReactNode;
	/** Dashed outline, for an empty area inside a page (drop zone, empty list). */
	bordered?: boolean;
};

/** Empty state: icon tile, title, one helpful sentence, and the next action as children. */
export function Empty({
	icon,
	title,
	description,
	bordered = false,
	className,
	children,
	...props
}: EmptyProps) {
	return (
		<div
			className={cn(
				"flex w-full flex-col items-center gap-4 px-6 py-10 text-center",
				bordered && "rounded-2xl border border-dashed",
				className,
			)}
			{...props}
		>
			{icon && (
				<span
					aria-hidden="true"
					className="grid size-12 place-items-center rounded-2xl bg-card text-muted-foreground shadow-sm ring-[0.5px] ring-border [&_svg]:size-5"
				>
					{icon}
				</span>
			)}
			<div className="grid max-w-sm gap-1.5">
				<p className="font-semibold text-base tracking-tight">{title}</p>
				{description && (
					<p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
				)}
			</div>
			{children && <div className="flex flex-wrap justify-center gap-2">{children}</div>}
		</div>
	);
}
