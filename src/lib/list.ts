import { clamp } from "@/lib/utils";

export type ListKeyOptions = {
	/** Which arrows move: Left/Right for "horizontal", Up/Down for "vertical". */
	orientation: "horizontal" | "vertical";
	/** Wrap past the last item to the first and back. Default true. */
	loop?: boolean;
	/** Home/End jump to the ends. "ctrl" requires Ctrl, leaving plain Home/End to a text field. */
	homeEnd?: boolean | "ctrl";
};

/**
 * The item a navigation key moves to in a list, from the item at `index` (-1: none active).
 * Undefined when the key doesn't navigate.
 */
export function listKeyTarget<T>(
	items: readonly T[],
	index: number,
	event: Pick<KeyboardEvent, "key" | "ctrlKey">,
	{ orientation, loop = true, homeEnd = true }: ListKeyOptions,
): T | undefined {
	const last = items.length - 1;

	if (last < 0) return;

	if (homeEnd === true || (homeEnd === "ctrl" && event.ctrlKey)) {
		if (event.key === "Home") return items[0];
		if (event.key === "End") return items[last];
	}

	const [back, forward] =
		orientation === "horizontal" ? ["ArrowLeft", "ArrowRight"] : ["ArrowUp", "ArrowDown"];
	const step = event.key === forward ? 1 : event.key === back ? -1 : 0;

	if (step === 0) return;
	if (index < 0) return items[step > 0 || !loop ? 0 : last];

	const next = index + step;

	return items[loop ? (next + items.length) % items.length : clamp(next, 0, last)];
}

/** Scrolls `box` just enough to show `el`, without moving the page the way scrollIntoView can. */
export function scrollIntoList(box: HTMLElement, element: HTMLElement, pad = 4) {
	if (element.offsetTop < box.scrollTop) box.scrollTop = element.offsetTop - pad;
	else if (element.offsetTop + element.offsetHeight > box.scrollTop + box.clientHeight)
		box.scrollTop = element.offsetTop + element.offsetHeight - box.clientHeight + pad;
}
