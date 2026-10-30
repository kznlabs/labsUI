const CANDIDATES = "a[href],button,input,select,textarea,[tabindex]";

/**
 * What Tab reaches inside `root`, in order. Skips disabled and hidden fields, tabIndex -1 (a
 * FormValue helper) and all but one radio per group, so the first and last are real stops.
 */
export function tabbables(root: HTMLElement | null) {
	const all = [...(root?.querySelectorAll<HTMLElement>(CANDIDATES) ?? [])];

	return all.filter((element) => {
		if (element.tabIndex < 0 || element.matches(":disabled, [type=hidden]")) return false;
		if (element.closest("[hidden], [inert]")) return false;
		if (!(element instanceof HTMLInputElement) || element.type !== "radio" || !element.name)
			return true;

		const group = all.filter(
			(other): other is HTMLInputElement =>
				other instanceof HTMLInputElement && other.type === "radio" && other.name === element.name,
		);

		return element === (group.find((radio) => radio.checked) ?? group[0]);
	});
}
