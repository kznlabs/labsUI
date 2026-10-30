import { useEffect, useEffectEvent } from "react";

/** True while typing in a field, where single-key shortcuts must not fire. */
const isEditable = (target: EventTarget | null) =>
	target instanceof HTMLElement &&
	(target.isContentEditable ||
		!!target.closest("input, textarea, select, [contenteditable='true']"));

/** `"mod+k"`: ⌘K on Mac, Ctrl+K elsewhere, without Alt. `"/"`: the key alone, no modifiers. */
export function matchesHotkey(
	event: Pick<KeyboardEvent, "key" | "metaKey" | "ctrlKey" | "altKey">,
	shortcut: string,
) {
	const mod = shortcut.startsWith("mod+");
	const key = mod ? shortcut.slice(4) : shortcut;

	if (event.key.toLowerCase() !== key.toLowerCase() || event.altKey) return false;

	return mod ? event.metaKey || event.ctrlKey : !event.metaKey && !event.ctrlKey;
}

export type HotkeyOptions = {
	/** Ignore the shortcut while typing in a field. Default: only for single keys. */
	skipInFields?: boolean;
};

/**
 * Window-wide keyboard shortcut. The handler returns false to leave the key to the browser
 * (no preventDefault). Pass `false` or `undefined` as the shortcut to disable it.
 */
export function useHotkey(
	shortcut: string | false | undefined,
	handler: (event: KeyboardEvent) => unknown,
	{ skipInFields }: HotkeyOptions = {},
) {
	const run = useEffectEvent(handler);

	useEffect(() => {
		if (!shortcut) return;

		const skip = skipInFields ?? !shortcut.startsWith("mod+");

		const onKey = (event: KeyboardEvent) => {
			if (!matchesHotkey(event, shortcut) || (skip && isEditable(event.target))) return;
			if (run(event) !== false) event.preventDefault();
		};

		window.addEventListener("keydown", onKey);

		return () => window.removeEventListener("keydown", onKey);
	}, [shortcut, skipInFields]);
}
