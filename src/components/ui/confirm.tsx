"use client";

import { type ReactNode, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export type ConfirmOptions = {
	/** Question in the dialog heading. */
	title: ReactNode;
	/** Consequences, under the title. */
	description?: ReactNode;
	/** Default "Continue", or "Delete" when `destructive`. */
	confirmLabel?: ReactNode;
	cancelLabel?: ReactNode;
	/** Red confirm button. Cancel keeps the initial focus either way. */
	destructive?: boolean;
};

// ---------- store (module-level, like toast) ----------

type State = { open: boolean; options: ConfirmOptions; resolve?: (ok: boolean) => void };

// Options outlive the answer so the dialog animates out with its text.
let state: State = { open: false, options: { title: "" } };
const SERVER: State = state;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
};

const settle = (ok: boolean) => {
	if (!state.open) return;
	state.resolve?.(ok);
	state = { open: false, options: state.options };
	for (const listener of listeners) listener();
};

/**
 * Asks before acting; resolves true on confirm, false on cancel, Esc or a newer `confirm()`.
 * `if (await confirm({ title: "Delete project?", destructive: true })) remove()`.
 * Needs `<Confirmer />` mounted once (root layout).
 */
export function confirm(options: ConfirmOptions) {
	settle(false);

	return new Promise<boolean>((resolve) => {
		state = { open: true, options, resolve };
		for (const listener of listeners) listener();
	});
}

/** Host for `confirm()`. Mount once, next to `<Toaster />`. */
export function Confirmer() {
	const { open, options } = useSyncExternalStore(
		subscribe,
		() => state,
		() => SERVER,
	);
	const { title, description, destructive, cancelLabel = "Cancel" } = options;

	return (
		<Dialog open={open} onOpenChange={(open) => !open && settle(false)}>
			<DialogContent alert className="max-w-md">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>
				<DialogFooter>
					<DialogClose>{cancelLabel}</DialogClose>
					<Button variant={destructive ? "destructive" : "default"} onClick={() => settle(true)}>
						{options.confirmLabel ?? (destructive ? "Delete" : "Continue")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
