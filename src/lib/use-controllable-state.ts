"use client";

import { useCallback, useState } from "react";

/**
 * State a parent may own. Controlled while `value` is defined; otherwise kept here, seeded from
 * `defaultValue`. The setter always reports through `onChange`, so both modes stay observable.
 */
export function useControllableState<T>(
	value: T | undefined,
	defaultValue: T | (() => T),
	onChange?: (next: T) => void,
) {
	const [inner, setInner] = useState(defaultValue);
	const controlled = value !== undefined;
	const set = useCallback(
		(next: T) => {
			if (!controlled) setInner(() => next);
			onChange?.(next);
		},
		[controlled, onChange],
	);

	return [controlled ? (value as T) : inner, set] as const;
}
