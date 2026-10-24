"use client";

import { useCallback, useSyncExternalStore } from "react";

const noop = () => () => {};
const mac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/** False on the server and during hydration, true after: gates portals and other client-only output. */
export function useMounted() {
	return useSyncExternalStore(
		noop,
		() => true,
		() => false,
	);
}

/** True on Apple platforms. Server render assumes Mac, then corrects after hydration. */
export function useIsMac() {
	return useSyncExternalStore(noop, mac, () => true);
}

/** Live media-query match. Server render assumes no match. */
export function useMediaQuery(query: string) {
	const subscribe = useCallback(
		(cb: () => void) => {
			const mq = matchMedia(query);
			mq.addEventListener("change", cb);
			return () => mq.removeEventListener("change", cb);
		},
		[query],
	);
	return useSyncExternalStore(
		subscribe,
		() => matchMedia(query).matches,
		() => false,
	);
}
