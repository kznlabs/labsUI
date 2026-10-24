"use client";

import { type FocusEvent, type PointerEvent, useEffect, useRef, useState } from "react";

/**
 * Open-on-hover state with intent delays, shared by Tooltip and HoverCard. Mouse only (touch
 * taps go to the trigger's own action); keyboard focus opens it too. Spread `trigger` on the
 * anchor and `floating` on the panel so moving between them keeps it open.
 */
export function useHoverOpen({
	openDelay,
	closeDelay,
	/** Open at once when this returns true (e.g. another tooltip just closed). */
	instant,
	onClose,
}: {
	openDelay: number;
	closeDelay: number;
	instant?: () => boolean;
	onClose?: () => void;
}) {
	const [open, setOpen] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const onCloseRef = useRef(onClose);
	onCloseRef.current = onClose;

	useEffect(() => () => clearTimeout(timer.current), []);

	const schedule = (next: boolean, delay: number) => {
		clearTimeout(timer.current);
		if (delay <= 0) {
			setOpen(next);
			if (!next) onCloseRef.current?.();
			return;
		}
		timer.current = setTimeout(() => {
			setOpen(next);
			if (!next) onCloseRef.current?.();
		}, delay);
	};
	const show = () => schedule(true, instant?.() ? 0 : openDelay);
	const hide = () => schedule(false, closeDelay);
	const mouse = (e: PointerEvent) => e.pointerType === "mouse";

	return {
		open,
		close: () => schedule(false, 0),
		trigger: {
			onPointerEnter: (e: PointerEvent) => mouse(e) && show(),
			onPointerLeave: (e: PointerEvent) => mouse(e) && hide(),
			// Only keyboard focus: a mouse click also focuses, and should not pop a tooltip.
			onFocus: (e: FocusEvent) => {
				if ((e.target as HTMLElement).matches(":focus-visible")) schedule(true, 0);
			},
			onBlur: () => schedule(false, 0),
		},
		floating: {
			onPointerEnter: (e: PointerEvent) => mouse(e) && schedule(true, 0),
			onPointerLeave: (e: PointerEvent) => mouse(e) && hide(),
		},
	};
}
