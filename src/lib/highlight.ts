import type { BundledLanguage } from "shiki";

/** A run of text in one color: `light-dark()` holds both themes, so the page's color scheme picks. */
export type CodeToken = { content: string; color?: string; fontStyle?: number };

/**
 * Lines of colored tokens, with Shiki loaded on demand. Runs anywhere: Code calls it in the
 * browser, and a Server Component or a build can call it ahead of time and pass the result as
 * `tokens`, so the browser never loads Shiki. Null for unknown languages.
 */
export async function highlightCode(code: string, language: string): Promise<CodeToken[][] | null> {
	try {
		const { codeToTokens } = await import("shiki");
		const { tokens } = await codeToTokens(code, {
			lang: language as BundledLanguage,
			// "-default" is the AA-tuned pair (the classic one has 3.5:1 strings and comments).
			themes: { light: "github-light-default", dark: "github-dark-default" },
			// Its light comment gray is 4.1:1 on the muted code surface, this one clears 4.5:1.
			colorReplacements: { "github-light-default": { "#6e7781": "#59636e" } },
			defaultColor: false,
		});

		return tokens.map((line) =>
			line.map(({ content, htmlStyle, fontStyle }) => {
				const light = htmlStyle?.["--shiki-light"];
				const dark = htmlStyle?.["--shiki-dark"];

				return {
					content,
					...(light && dark && { color: `light-dark(${light}, ${dark})` }),
					...(fontStyle && { fontStyle }),
				};
			}),
		);
	} catch {
		return null;
	}
}

const LANGUAGES: Record<string, string> = {
	ts: "ts",
	tsx: "tsx",
	js: "js",
	jsx: "jsx",
	mjs: "js",
	cjs: "js",
	css: "css",
	html: "html",
	json: "json",
	md: "md",
	mdx: "mdx",
	yml: "yaml",
	yaml: "yaml",
	toml: "toml",
	sql: "sql",
	py: "python",
	go: "go",
	rs: "rust",
	sh: "bash",
	bash: "bash",
	env: "dotenv",
};

/** Language from a file name's extension. Falls back to tsx. */
export function languageOf(name: string) {
	const ext = name.split(".").pop()?.toLowerCase();

	return (ext && LANGUAGES[ext]) || "tsx";
}
