import { visit } from "unist-util-visit";

/**
 * Rehype plugin that shifts every heading down by one level.
 *
 * h1 -> h2, h2 -> h3, ..., h5 -> h6, h6 stays h6.
 *
 * Use case: a page already renders the article title as the single h1,
 * so headings inside the Markdown body must start at h2 to keep a valid
 * document outline.
 */
export function rehypeShiftHeadings() {
	return (tree) => {
		visit(tree, "element", (node) => {
			if (!node.tagName) return;
			const match = /^h([1-6])$/.exec(node.tagName);
			if (!match) return;
			const level = Number.parseInt(match[1], 10);
			node.tagName = `h${Math.min(level + 1, 6)}`;
		});
	};
}
