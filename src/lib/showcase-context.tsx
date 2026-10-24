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

type NavItem = { id: string; name: string; description: string };
type NavGroup = { label: string; items: NavItem[] };

type FilterCtx = {
	groups: NavGroup[];
	query: string;
	setQuery: (q: string) => void;
	/** Groups trimmed to the matching items; empty groups dropped. */
	shown: NavGroup[];
	/** Ids that match, or null when there is no query (everything shows). */
	matches: Set<string> | null;
};

const FilterContext = createContext<FilterCtx>({
	groups: [],
	query: "",
	setQuery: () => {},
	shown: [],
	matches: null,
});

/** One search for the docs: the nav lists and the page shows only matching components. */
export function ComponentFilterProvider({
	groups,
	children,
}: {
	groups: NavGroup[];
	children: ReactNode;
}) {
	const [query, setQuery] = useState("");
	const q = query.trim().toLowerCase();
	const shown = q
		? groups
				.map((g) => ({
					...g,
					items: g.items.filter(
						(i) =>
							i.name.toLowerCase().includes(q) ||
							i.description.toLowerCase().includes(q) ||
							g.label.toLowerCase().includes(q),
					),
				}))
				.filter((g) => g.items.length > 0)
		: groups;
	const matches = q ? new Set(shown.flatMap((g) => g.items.map((i) => i.id))) : null;
	return (
		<FilterContext.Provider value={{ groups, query, setQuery, shown, matches }}>
			{children}
		</FilterContext.Provider>
	);
}

export function useComponentFilter() {
	return useContext(FilterContext);
}
