export type Theme = "light" | "dark";

const KEY = "theme";
const EVENT = "themechange";
const media = () => matchMedia("(prefers-color-scheme: dark)");

function stored(): Theme | null {
	try {
		const value = localStorage.getItem(KEY);

		return value === "light" || value === "dark" ? value : null;
	} catch {
		return null;
	}
}

function apply() {
	const dark = (stored() ?? (media().matches ? "dark" : "light")) === "dark";

	document.documentElement.classList.toggle("dark", dark);
	window.dispatchEvent(new Event(EVENT));
}

export const isDark = () => document.documentElement.classList.contains("dark");

export function setTheme(theme: Theme) {
	try {
		localStorage.setItem(KEY, theme);
	} catch {}

	const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

	if (!reduce && "startViewTransition" in document) document.startViewTransition(apply);
	else apply();
}

export function subscribeTheme(callback: () => void) {
	const query = media();

	window.addEventListener(EVENT, callback);
	window.addEventListener("storage", apply);
	query.addEventListener("change", apply);

	return () => {
		window.removeEventListener(EVENT, callback);
		window.removeEventListener("storage", apply);
		query.removeEventListener("change", apply);
	};
}

/** Accent colors, in spectrum order. "blue" is the default (no attribute). */
export const accents = [
	"red",
	"orange",
	"yellow",
	"green",
	"blue",
	"purple",
	"pink",
	"slate",
] as const;
export type Accent = (typeof accents)[number];

const ACCENT_KEY = "accent";

export const getAccent = (): Accent =>
	(document.documentElement.dataset.accent as Accent | undefined) ?? "blue";

/** Retints primary, focus rings, selection and switches app-wide. Persists like the theme. */
export function setAccent(accent: Accent) {
	try {
		localStorage.setItem(ACCENT_KEY, accent);
	} catch {}

	const root = document.documentElement;

	if (accent === "blue") delete root.dataset.accent;
	else root.dataset.accent = accent;
	window.dispatchEvent(new Event(EVENT));
}

/** Inline pre-paint script for <head>: prevents a light/dark (and accent) flash. */
export const themeScript = `(function(){try{var t=localStorage.getItem("${KEY}");var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);var a=localStorage.getItem("${ACCENT_KEY}");if(a&&a!=="blue")document.documentElement.dataset.accent=a}catch(e){}})()`;
