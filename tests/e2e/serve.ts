// Serves out/ like GitHub Pages: under the base path, `.html` optional.
import { statSync } from "node:fs";
import { join, normalize } from "node:path";

const OUT = join(import.meta.dirname, "..", "..", "out");
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "/labsUI";
const PORT = Number(process.env.PORT ?? 4173);

function find(path: string) {
	for (const candidate of [path, `${path.replace(/\/$/, "")}.html`, join(path, "index.html")])
		if (statSync(join(OUT, candidate), { throwIfNoEntry: false })?.isFile())
			return Bun.file(join(OUT, candidate));

	return null;
}

Bun.serve({
	port: PORT,
	fetch(req) {
		const { pathname } = new URL(req.url);

		if (pathname === "/") return Response.redirect(`${BASE}/`, 302);
		if (!pathname.startsWith(`${BASE}/`) && pathname !== BASE)
			return new Response(null, { status: 404 });

		const path = normalize(decodeURIComponent(pathname.slice(BASE.length)) || "/");
		const file = find(path);

		if (file) return new Response(file);

		return new Response(Bun.file(join(OUT, "404.html")), { status: 404 });
	},
});

console.log(`serving out/ at http://localhost:${PORT}${BASE}/`);
