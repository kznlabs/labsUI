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

/** True where shortcuts use ⌘, not Ctrl. SSR assumes ⌘, then corrects after hydration. */
export function useIsMac() {
	return useSyncExternalStore(noop, mac, () => true);
}

/** Live media-query match. Server render assumes no match. */
export function useMediaQuery(query: string) {
	const subscribe = useCallback(
		(callback: () => void) => {
			const media = matchMedia(query);

			media.addEventListener("change", callback);

			return () => media.removeEventListener("change", callback);
		},
		[query],
	);

	return useSyncExternalStore(
		subscribe,
		() => matchMedia(query).matches,
		() => false,
	);
}
