// A blank line between JSX siblings, like @stylistic/jsx-newline, except inside prose: a newline
// there would eat the spaces around inline elements.
const comment = (node) =>
	node.type === "JSXExpressionContainer" && node.expression.type === "JSXEmptyExpression";

const jsxNewline = {
	meta: { type: "layout", fixable: "whitespace" },
	create(context) {
		const check = (node) => {
			// Text, a space on one line ("{count} {label}") or {" "} renders.
			const prose = node.children.some(
				(child) =>
					(child.type === "JSXText" && (child.value.trim() || !child.value.includes("\n"))) ||
					(child.type === "JSXExpressionContainer" && typeof child.expression.value === "string"),
			);

			if (prose) return;

			const siblings = node.children.filter((child) => child.type !== "JSXText");

			for (let i = 1; i < siblings.length; i++) {
				const prev = siblings[i - 1];
				const next = siblings[i];

				if (comment(prev) || next.loc.start.line - prev.loc.end.line > 1) continue;

				context.report({
					node: next,
					message: "Separate JSX siblings with a blank line.",
					fix: (fixer) => fixer.insertTextAfter(prev, "\n"),
				});
			}
		};

		return { JSXElement: check, JSXFragment: check };
	},
};

export default { meta: { name: "labsui" }, rules: { "jsx-newline": jsxNewline } };
