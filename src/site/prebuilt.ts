import type { CodeToken } from "@/lib/highlight";
import built from "@/site/snippets.formatted.json";

/**
 * Tokens highlighted at build time for code the site shows as-is. Server-side only: pass the
 * result to Code or CodePanel as `tokens`, so the JSON never reaches the browser bundle.
 */
export function tokensFor(code: string, language: string): CodeToken[][] | undefined {
	return (built.prebuilt as Record<string, Record<string, CodeToken[][]>>)[language]?.[code];
}

/** A section's files, formatted and highlighted at build time. */
export const sectionFiles = (id: string) => built.sections[id as keyof typeof built.sections];
