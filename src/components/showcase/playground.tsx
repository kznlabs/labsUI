"use client";

import { RotateCcw } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Preview canvas with an interactive toolbar.
 * Supports a Replay button to restart animations, and optional component-specific prop controls.
 */
export function Playground({
	controls,
	previewClassName,
	children,
}: {
	controls?: ReactNode;
	previewClassName?: string;
	children: ReactNode;
}) {
	const [run, setRun] = useState(0);

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-b bg-muted/30 px-4 py-2.5">
				<Button
					size="sm"
					variant="outline"
					onClick={() => setRun((n) => n + 1)}
					className="h-8 gap-1.5 text-xs"
				>
					<RotateCcw className="size-3.5" /> Replay
				</Button>

				{controls && <div className="flex flex-wrap items-center gap-4 text-xs">{controls}</div>}
			</div>

			<div
				className={cn(
					"flex min-h-44 flex-wrap items-center justify-center gap-4 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[16px_16px] p-6 sm:p-10",
					previewClassName,
				)}
			>
				<div key={run} className="contents">
					{children}
				</div>
			</div>
		</>
	);
}
