import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import type { ParameterDeclaration, SignatureDeclaration, TypeNode } from "typescript/unstable/ast";
import { SyntaxKind } from "typescript/unstable/ast";
import {
	isIntersectionTypeNode,
	isObjectBindingPattern,
	isTypeAliasDeclaration,
	isTypeReferenceNode,
} from "typescript/unstable/ast/is";
import {
	API,
	type NodeHandle,
	SignatureKind,
	SymbolFlags,
	type Symbol as TsSymbol,
} from "typescript/unstable/sync";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "src");
const OUT = join(SRC, "site", "api.generated.json");

type Prop = {
	name: string;
	type: string;
	required: boolean;
	default?: string;
	description?: string;
};
type Entry =
	| { kind: "component"; name: string; props: Prop[]; extends?: string; description?: string }
	| { kind: "function"; name: string; signature: string; description?: string };

// lib/ too, the CLI shows hook signatures (`labsui view use-hotkey`).
const files = ["components/ui", "components/blocks", "lib"].flatMap((dir) =>
	readdirSync(join(SRC, dir))
		.filter((file) => /\.tsx?$/.test(file))
		.map((file) => join(SRC, dir, file)),
);

const tsApi = new API({ cwd: ROOT });
const project = tsApi
	.updateSnapshot({ openProjects: [join(ROOT, "tsconfig.json")] })
	.getProject(join(ROOT, "tsconfig.json"));

if (!project) throw new Error("api: tsconfig.json did not load");

const { checker, emitter, program } = project;
// TypeFormatFlags / NodeBuilderFlags: NoTruncation | UseAliasDefinedOutsideCurrentScope.
const FORMAT = 1 | 16384;

// Paths come back normalized (forward slashes, lowercase on case-insensitive disks).
const SRC_PATH = SRC.replaceAll("\\", "/").toLowerCase();

const ours = (decl: NodeHandle) => {
	const path = decl.path.toLowerCase();

	return path.startsWith(SRC_PATH) && !path.includes("node_modules");
};

const docs = (symbol: TsSymbol) =>
	checker.getDocumentationCommentOfSymbol(symbol).trim() || undefined;

/** The inherited props: `<nav>` for `ComponentProps<"nav">`, `Button` for `ComponentProps<typeof Button>`, through one alias. */
function inherits(node: TypeNode | undefined, depth = 0): string | undefined {
	if (!node) return;

	const text = node.getText();
	const tag = /ComponentProps(?:WithoutRef)?<"(\w+)">/.exec(text);

	if (tag) return `<${tag[1]}>`;

	const comp = /ComponentProps<typeof (\w+)>/.exec(text);

	if (comp) return comp[1];
	if (depth > 1) return;

	if (isTypeReferenceNode(node)) {
		const decl = checker.getSymbolAtLocation(node.typeName)?.declarations[0]?.resolve();

		if (decl && isTypeAliasDeclaration(decl)) return inherits(decl.type, depth + 1);
	}

	for (const child of isIntersectionTypeNode(node) ? node.types : []) {
		const hit = inherits(child, depth + 1);

		if (hit) return hit;
	}
}

function defaults(param: ParameterDeclaration | undefined) {
	const out = new Map<string, string>();

	if (param && isObjectBindingPattern(param.name))
		for (const element of param.name.elements)
			if (element.initializer && !element.dotDotDotToken) {
				const key = (element.propertyName ?? element.name)?.getText();

				if (key) out.set(key, element.initializer.getText().replace(/\s+/g, " "));
			}

	return out;
}

/** Drops `| undefined` (shown as optional) and the parens TS keeps around a lone function type. */
function clean(type: string) {
	const bare = type.replace(/ \| undefined$/, "").replace(/^undefined \| /, "");

	if (!bare.startsWith("((") || !bare.endsWith(")")) return bare;

	// Only unwrap when the first paren closes at the very end.
	let depth = 0;

	for (let i = 0; i < bare.length; i++) {
		depth += bare[i] === "(" ? 1 : bare[i] === ")" ? -1 : 0;
		if (depth === 0 && i < bare.length - 1) return bare;
	}

	return bare.slice(1, -1);
}

/**
 * TS 7 sorts string-literal unions. We want source order: the prop's own, else the file's first
 * mention (`keyof typeof sizes`).
 */
const fileText = new Map<string, string>();

function sourceOrder(type: string, decls: NodeHandle[], fallback: string) {
	if (!/^"[^"]*"( \| "[^"]*")+$/.test(type)) return type;

	const path = decls[0]?.path ?? fallback;
	const text = fileText.get(path) ?? readFileSync(path, "utf8");

	fileText.set(path, text);

	const own = decls
		.map((decl) => decl.resolve())
		.sort((a, b) => (a?.pos ?? 0) - (b?.pos ?? 0))
		.map((declaration) => declaration?.getText() ?? "")
		.join(" ");

	const at = (literal: string) => {
		const word = literal.slice(1, -1).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const find = (text: string) => new RegExp(`["']${word}["']|\\b${word}:`).exec(text)?.index;

		return find(own) ?? text.length + (find(text) ?? text.length);
	};

	return type
		.split(" | ")
		.map((literal) => ({ literal, pos: at(literal) }))
		.sort((a, b) => a.pos - b.pos)
		.map((member) => member.literal)
		.join(" | ");
}

const api: Record<string, { entries: Entry[]; types: Record<string, string> }> = {};
const unexported: string[] = [];

for (const file of files) {
	const source = program.getSourceFile(file);

	if (!source) continue;

	const moduleSymbol = checker.getSymbolAtLocation(source);

	if (!moduleSymbol) continue;

	const entries: Entry[] = [];
	// Exports table comes back unordered, sort by source.
	const exports = checker
		.getExportsOfModule(moduleSymbol)
		.map((exp) => ({ exp, pos: exp.declarations[0]?.resolve()?.pos ?? 0 }))
		.sort((a, b) => a.pos - b.pos);

	for (const { exp } of exports) {
		const symbol = exp.flags & SymbolFlags.Alias ? checker.getAliasedSymbol(exp) : exp;
		const decl = symbol.valueDeclaration?.resolve();

		if (!decl) continue;

		const type = checker.getTypeOfSymbolAtLocation(symbol, decl);
		const [signature] = checker.getSignaturesOfType(type, SignatureKind.Call);

		if (!signature) continue;

		const name = exp.name;

		if (name.endsWith("Context")) continue;

		const description = docs(symbol);

		if (!/^[A-Z]/.test(name)) {
			const node = checker.signatureToSignatureDeclaration(
				signature,
				SyntaxKind.FunctionType,
				undefined,
				FORMAT,
			);

			if (!node) continue;
			entries.push({
				kind: "function",
				name,
				signature: `${name}${emitter.printNode(node, { neverAsciiEscape: true }).replace(/^<[^>]*>/, "")}`,
				description,
			});
			continue;
		}

		const callback = signature.declaration?.resolve() as SignatureDeclaration | undefined;
		const param = callback?.parameters?.[0];
		const paramSymbol = signature.getParameters()[0];
		const props: Prop[] = [];

		if (paramSymbol && param) {
			const propsType = checker.getTypeOfSymbolAtLocation(paramSymbol, param);
			const defs = defaults(param);

			for (const prop of checker.getPropertiesOfType(propsType)) {
				// Every component takes className; Getting started says so once.
				if (!prop.declarations.some(ours) || prop.name === "className") continue;

				const propType = checker.getTypeOfSymbolAtLocation(prop, param);

				props.push({
					name: prop.name,
					type: sourceOrder(
						clean(checker.typeToString(propType, undefined, FORMAT)),
						prop.declarations.filter(ours),
						file,
					),
					required: !(prop.flags & SymbolFlags.Optional),
					...(defs.has(prop.name) && { default: defs.get(prop.name) }),
					...(docs(prop) && { description: docs(prop) }),
				});
			}
		}

		props.sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name));

		const base = inherits(param?.type);

		entries.push({ kind: "component", name, props, ...(base && { extends: base }), description });
	}

	const key = relative(SRC, file)
		.replaceAll("\\", "/")
		.replace(/^components\//, "")
		.replace(/\.tsx?$/, "");

	if (!entries.length) continue;

	// Local type aliases the documented types mention (`SiteLink`), spelled out once per file.
	const mentioned = JSON.stringify(entries);
	const types: Record<string, string> = {};

	for (const statement of source.statements)
		if (
			isTypeAliasDeclaration(statement) &&
			new RegExp(`\\b${statement.name.text}\\b`).test(mentioned)
		) {
			types[statement.name.text] = statement.type
				.getText()
				.replace(/\/\*[\s\S]*?\*\//g, "")
				.replace(/\s+/g, " ");

			if (!/^export\b/.test(statement.getText())) unexported.push(`${key}: ${statement.name.text}`);
		}

	api[key] = { entries, types };
}

tsApi.close();

writeFileSync(OUT, `${JSON.stringify(api, null, "\t")}\n`);

const count = Object.values(api).flatMap((file) => file.entries).length;

console.log(`api: ${count} exports from ${Object.keys(api).length} files → ${relative(ROOT, OUT)}`);

// A prop's JSDoc is its public description: every own prop needs one.
const undocumented = Object.entries(api).flatMap(([file, { entries }]) =>
	entries.flatMap((entry) =>
		entry.kind === "component"
			? entry.props
					.filter((prop) => !prop.description)
					.map((prop) => `${file}: <${entry.name}> ${prop.name}`)
			: [],
	),
);

if (undocumented.length) {
	console.error(`api: ${undocumented.length} props without JSDoc:\n  ${undocumented.join("\n  ")}`);
	process.exit(1);
}

if (unexported.length) {
	console.error(
		`api: ${unexported.length} documented types not exported:\n  ${unexported.join("\n  ")}`,
	);
	process.exit(1);
}
