import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe as describeItem, viewMarkdown } from "../packages/cli/src/commands/view";
import { componentPath, site } from "../src/site/config";
import { registry } from "../src/site/registry";
import { ROOT, stem } from "./imports";

/** `/components/<id>.md` beside each page: the same content `labsui view` prints, for agents. */
const OUT = join(ROOT, "public", "components");

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

for (const entry of registry) {
	const names = entry.file.split("·").map((file) => stem(file.trim()));
	const views = await Promise.all(names.map((name) => describeItem(undefined, name)));
	// One file: its card already carries the description and install line.
	const summary =
		names.length > 1
			? [entry.description, "", `- Install all: \`npx labsui add ${names.join(" ")}\``]
			: [];
	const md = [
		`# ${entry.name}`,
		"",
		...summary,
		`- Page: <${site.url}${componentPath(entry.id)}>`,
		"",
		...views.map(viewMarkdown),
	].join("\n");

	writeFileSync(join(OUT, `${entry.id}.md`), `${md.trimEnd()}\n`);
}

console.log(`docs: ${registry.length} pages → ${relative(ROOT, OUT)}/*.md`);
