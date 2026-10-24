"use client";

import { type RefObject, useEffect, useEffectEvent } from "react";

type Refs = readonly RefObject<HTMLElement | null>[];

/**
 * Inside one of `refs` (panel first, then its trigger), or inside a floating child opened from
 * the panel: a Select list or menu portals out, but it is marked `data-floating`.
 */
export function isWithin(refs: Refs, t: Node | null) {
	if (!t) return false;
	if (refs.some((r) => r.current?.contains(t))) return true;
	const floating = t instanceof Element ? t.closest("[data-floating]") : null;
	return !!floating && !floating.contains(refs[0]?.current ?? null);
}

/** Closes a floating panel on a pointerdown outside it, its trigger and its floating children. */
export function useDismiss(open: boolean, refs: Refs, onDismiss: () => void) {
	// Effect events: an inline refs array or callback must not re-subscribe every render.
	const outside = useEffectEvent((e: PointerEvent) => {
		if (!isWithin(refs, e.target as Node)) onDismiss();
	});
	useEffect(() => {
		if (!open) return;
		document.addEventListener("pointerdown", outside);
		return () => document.removeEventListener("pointerdown", outside);
	}, [open]);
}
