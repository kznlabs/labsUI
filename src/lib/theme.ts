type Theme = "light" | "dark";

const KEY = "theme";
const EVENT = "themechange";
const media = () => matchMedia("(prefers-color-scheme: dark)");

/** Explicit user choice, or null when following the OS. */
function stored(): Theme | null {
	try {
		const v = localStorage.getItem(KEY);
		return v === "light" || v === "dark" ? v : null;
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

export function subscribeTheme(cb: () => void) {
	const mq = media();
	window.addEventListener(EVENT, cb);
	window.addEventListener("storage", apply);
	mq.addEventListener("change", apply);
	return () => {
		window.removeEventListener(EVENT, cb);
		window.removeEventListener("storage", apply);
		mq.removeEventListener("change", apply);
	};
}

/** Inline pre-paint script for <head>: prevents a light/dark flash. */
export const themeScript = `(function(){try{var t=localStorage.getItem("${KEY}");var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;
