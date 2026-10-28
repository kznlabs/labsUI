"use client";

import { type RefObject, useEffect, useEffectEvent } from "react";

type Refs = readonly RefObject<HTMLElement | null>[];

/**
 * Inside one of `refs` (panel first, then its trigger), or inside a floating child opened from
 * the panel: a Select list or menu portals out, but it is marked `data-floating`.
 */
export function isWithin(refs: Refs, target: Node | null) {
	if (!target) return false;
	if (refs.some((ref) => ref.current?.contains(target))) return true;

	const floating = target instanceof Element ? target.closest("[data-floating]") : null;

	return !!floating && !floating.contains(refs[0]?.current ?? null);
}

/** Closes a floating panel on a pointerdown outside it, its trigger and its floating children. */
export function useDismiss(open: boolean, refs: Refs, onDismiss: () => void) {
	// Effect events, an inline refs array or callback can't re-subscribe every render.
	const outside = useEffectEvent((event: PointerEvent) => {
		if (!isWithin(refs, event.target as Node)) onDismiss();
	});

	useEffect(() => {
		if (!open) return;
		document.addEventListener("pointerdown", outside);

		return () => document.removeEventListener("pointerdown", outside);
	}, [open]);
}
