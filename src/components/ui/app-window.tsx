import { Maximize2, Minus, X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type AppWindowProps = Omit<ComponentProps<"div">, "title"> & {
	/** Centered titlebar text. */
	title?: ReactNode;
	/** Custom titlebar content (tabs, navbar, search); replaces the centered title. */
	header?: ReactNode;
	/** Right-aligned titlebar slot. */
	actions?: ReactNode;
	/** Passing a handler turns the matching dot into a button. */
	onClose?: () => void;
	/** Shows the minimize control; called when it is pressed. */
	onMinimize?: () => void;
	/** Shows the maximize control; called when it is pressed. */
	onMaximize?: () => void;
	/** Translucent, blurred surface. */
	glass?: boolean;
	/** Classes for the content area under the title bar. */
	bodyClassName?: string;
};

export function AppWindow({
	title,
	header,
	actions,
	onClose,
	onMinimize,
	onMaximize,
	glass,
	className,
	bodyClassName,
	children,
	...props
}: AppWindowProps) {
	const dots = [
		{ label: "Close", color: "bg-window-close", Icon: X, on: onClose },
		{ label: "Minimize", color: "bg-window-minimize", Icon: Minus, on: onMinimize },
		{ label: "Maximize", color: "bg-window-maximize", Icon: Maximize2, on: onMaximize },
	];

	return (
		<div
			className={cn(
				"flex flex-col overflow-hidden rounded-xl border text-card-foreground shadow-md",
				glass ? "bg-card/70 backdrop-blur-xl backdrop-saturate-150" : "bg-card",
				className,
			)}
			{...props}
		>
			<div className="relative flex h-10 shrink-0 items-center gap-3 border-b bg-muted/40 px-3.5">
				<div className="group/dots -mx-1.5 flex items-center">
					{dots.map(({ label, color, Icon, on }) => {
						// 24px target (WCAG 2.5.8) around the 12px dot.
						const box = "group/dot grid size-6 shrink-0 place-items-center outline-none";
						const dot = (
							<span
								key="dot"
								className={cn(
									"grid size-3 place-items-center rounded-full ring-[0.5px] ring-black/10 group-focus-visible/dot:ring-2 group-focus-visible/dot:ring-ring",
									color,
								)}
							>
								<Icon
									className="size-2 text-black/60 opacity-0 transition-opacity group-focus-within/dots:opacity-100 group-hover/dots:opacity-100"
									strokeWidth={3}
									aria-hidden="true"
								/>
							</span>
						);

						return on ? (
							<button
								key={label}
								type="button"
								aria-label={label}
								onClick={on}
								className={cn(box, "cursor-pointer")}
							>
								{dot}
							</button>
						) : (
							<span key={label} aria-hidden="true" className={box}>
								{dot}
							</span>
						);
					})}
				</div>

				{header ??
					(title && (
						<p className="pointer-events-none absolute inset-x-24 truncate text-center font-medium text-muted-foreground text-xs">
							{title}
						</p>
					))}

				{actions && <div className="ml-auto flex items-center gap-1.5">{actions}</div>}
			</div>

			<div className={cn("flex-1", bodyClassName)}>{children}</div>
		</div>
	);
}
