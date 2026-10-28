"use client";

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

type ShowcaseCtx = {
	dynamicCode: string | null;
	setDynamicCode: (code: string | null) => void;
};

const ShowcaseContext = createContext<ShowcaseCtx>({
	dynamicCode: null,
	setDynamicCode: () => {},
});

export function ShowcaseProvider({ children }: { children: ReactNode }) {
	const [dynamicCode, setDynamicCode] = useState<string | null>(null);

	return (
		<ShowcaseContext.Provider value={{ dynamicCode, setDynamicCode }}>
			{children}
		</ShowcaseContext.Provider>
	);
}

export function useShowcaseContext() {
	return useContext(ShowcaseContext);
}

/** Hook to update the CodePanel snippet in the current showcase section in real time. */
export function useSetDynamicCode(code: string) {
	const { setDynamicCode } = useContext(ShowcaseContext);

	useEffect(() => {
		setDynamicCode(code);

		return () => setDynamicCode(null);
	}, [code, setDynamicCode]);
}
