"use client";

import { RotateCcw } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Preview canvas. `replay` adds a corner button that remounts the demo, for components whose
 * point is a first impression (entrance, count-up, typing); everywhere else it would be noise.
 */
export function Playground({
	replay = false,
	previewClassName,
	children,
}: {
	replay?: boolean;
	previewClassName?: string;
	children: ReactNode;
}) {
	const [run, setRun] = useState(0);

	return (
		<div className="relative flex min-h-0 flex-col">
			{replay && (
				<Button
					size="sm"
					variant="ghost"
					onClick={() => setRun((n) => n + 1)}
					className="absolute top-2.5 right-2.5 z-10 h-7 gap-1.5 px-2 text-muted-foreground text-xs"
				>
					<RotateCcw aria-hidden="true" />
					Replay
				</Button>
			)}
			<div
				className={cn(
					// safe center: a demo taller than the stage scrolls from its top instead of being cut off.
					"flex min-h-56 flex-wrap justify-center gap-4 overflow-auto overscroll-contain bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[16px_16px] px-6 py-12 [align-content:safe_center] [align-items:safe_center] sm:px-10 sm:py-16",
					previewClassName,
				)}
			>
				<div key={run} className="contents">
					{children}
				</div>
			</div>
		</div>
	);
}
