export const lines = (text: string) => text.replace(/\r\n/g, "\n").replace(/\n$/, "").split("\n");

/** The same code apart from blank lines and indentation. */
export function sameCode(a: string, b: string) {
	const strip = (text: string) =>
		lines(text)
			.map((line) => line.trim())
			.filter(Boolean)
			.join("\n");

	return strip(a) === strip(b);
}
