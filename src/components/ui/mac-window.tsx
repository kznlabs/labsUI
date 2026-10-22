import { Maximize2, Minus, X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type MacWindowProps = Omit<ComponentProps<"div">, "title"> & {
	/** Centered titlebar text. */
	title?: ReactNode;
	/** Custom titlebar content (tabs, navbar, search); replaces the centered title. */
	header?: ReactNode;
	/** Right-aligned titlebar slot. */
	actions?: ReactNode;
	/** Passing a handler turns the matching dot into a button. */
	onClose?: () => void;
	onMinimize?: () => void;
	onMaximize?: () => void;
	glass?: boolean;
	bodyClassName?: string;
};

export function MacWindow({
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
}: MacWindowProps) {
	const dots = [
		{ label: "Close", color: "bg-mac-red", Icon: X, on: onClose },
		{ label: "Minimize", color: "bg-mac-yellow", Icon: Minus, on: onMinimize },
		{ label: "Zoom", color: "bg-mac-green", Icon: Maximize2, on: onMaximize },
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
				<div className="group/dots flex items-center gap-2">
					{dots.map(({ label, color, Icon, on }) => {
						const cls = cn(
							"grid size-3 cursor-pointer place-items-center rounded-full ring-[0.5px] ring-black/10 outline-none focus-visible:ring-2 focus-visible:ring-ring",
							color,
						);
						const icon = (
							<Icon
								key="icon"
								className="size-2 text-black/60 opacity-0 transition-opacity group-hover/dots:opacity-100"
								strokeWidth={3}
								aria-hidden="true"
							/>
						);
						return on ? (
							<button key={label} type="button" aria-label={label} onClick={on} className={cls}>
								{icon}
							</button>
						) : (
							<span key={label} aria-hidden="true" className={cls}>
								{icon}
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
