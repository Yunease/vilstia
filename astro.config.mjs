import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import swup from "@swup/astro";
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeComponents from "rehype-components"; /* Render the custom directive content */
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive"; /* Handle directives */
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";
import remarkMath from "remark-math";
import remarkSectionize from "remark-sectionize";
import { expressiveCodeConfig } from "./src/config.ts";
import { pluginCustomCopyButton } from "./src/plugins/expressive-code/custom-copy-button.js";
import { pluginLanguageBadge } from "./src/plugins/expressive-code/language-badge.ts";
import { AdmonitionComponent } from "./src/plugins/rehype-component-admonition.mjs";
import { GithubCardComponent } from "./src/plugins/rehype-component-github-card.mjs";
import { parseDirectiveNode } from "./src/plugins/remark-directive-rehype.js";
import { remarkExcerpt } from "./src/plugins/remark-excerpt.js";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";
import { rehypeShiftHeadings } from "./src/plugins/rehype-shift-headings.mjs";

// Build a URL -> lastmod map from every post's frontmatter so the sitemap
// can use `updated || published` as `lastmod` for each article. Slugs mirror
// Astro's collection ids: the path relative to `src/content/posts`, minus the
// `.md` extension, with backslashes normalized to `/`.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

function collectPostFiles(dir) {
	const out = [];
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		if (statSync(full).isDirectory()) {
			out.push(...collectPostFiles(full));
		} else if (name.endsWith(".md")) {
			out.push(full);
		}
	}
	return out;
}

function frontmatterDate(fm, key) {
	const line = fm.split(/\r?\n/).find((l) => l.trim().startsWith(`${key}:`));
	if (!line) return undefined;
	const raw = line.split(":").slice(1).join(":").trim().replace(/["']/g, "");
	if (!raw) return undefined;
	const d = new Date(raw);
	return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

const postLastmodByUrl = new Map();
const postsRoot = join(process.cwd(), "src", "content", "posts");
for (const file of collectPostFiles(postsRoot)) {
	const content = readFileSync(file, "utf8");
	const match = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
	if (!match) continue;
	const date = frontmatterDate(match[1], "updated") || frontmatterDate(match[1], "published");
	if (!date) continue;
	const rel = relative(postsRoot, file).replace(/\.md$/, "").split(sep).join("/");
	// Match the sitemap's URL-encoded paths (e.g. Chinese slugs) by encoding
	// each path segment, mirroring how Astro/Node URL-encode the route.
	const encoded = rel.split("/").map(encodeURIComponent).join("/");
	postLastmodByUrl.set(`https://vilstia.org/posts/${encoded}/`, date);
}

// https://astro.build/config
export default defineConfig({
	// site: "https://fuwari.vercel.app/",
	site: "https://vilstia.org/",
	base: "/",
	trailingSlash: "always",
	integrations: [
		tailwind({
			nesting: true,
		}),
		swup({
			theme: false,
			animationClass: "transition-swup-", // see https://swup.js.org/options/#animationselector
			// the default value `transition-` cause transition delay
			// when the Tailwind class `transition-all` is used
			containers: ["main", "#toc"],
			smoothScrolling: true,
			cache: true,
			preload: true,
			accessibility: true,
			updateHead: true,
			updateBodyClass: false,
			globalInstance: true,
		}),
		icon({
			include: {
				"preprocess: vitePreprocess(),": ["*"],
				// 按需打包 fa6: 仅引入实际用到的图标,不再 ["*"] 拉整个集合 (合计 2700+ 图标)
				"fa6-brands": [
					"bilibili",
					"creative-commons",
					"github",
					"pixiv",
					"steam",
				],
				"fa6-regular": ["address-card"],
				"fa6-solid": [
					"arrow-rotate-left",
					"arrow-up-right-from-square",
					"chevron-right",
				],
			},
		}),
		expressiveCode({
			themes: [expressiveCodeConfig.theme, expressiveCodeConfig.theme],
			shiki: expressiveCodeConfig.shiki,
			plugins: [
				pluginCollapsibleSections(),
				pluginLineNumbers(),
				pluginLanguageBadge(),
				pluginCustomCopyButton(),
			],
			defaultProps: {
				wrap: true,
				overridesByLang: {
					shellsession: {
						showLineNumbers: false,
					},
				},
			},
			styleOverrides: {
				codeBackground: "var(--codeblock-bg)",
				borderRadius: "0.75rem",
				borderColor: "none",
				codeFontSize: "0.875rem",
				codeFontFamily:
					"'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
				codeLineHeight: "1.5rem",
				frames: {
					editorBackground: "var(--codeblock-bg)",
					terminalBackground: "var(--codeblock-bg)",
					terminalTitlebarBackground: "var(--codeblock-topbar-bg)",
					editorTabBarBackground: "var(--codeblock-topbar-bg)",
					editorActiveTabBackground: "none",
					editorActiveTabIndicatorBottomColor: "var(--primary)",
					editorActiveTabIndicatorTopColor: "none",
					editorTabBarBorderBottomColor: "var(--codeblock-topbar-bg)",
					terminalTitlebarBorderBottomColor: "none",
				},
				textMarkers: {
					delHue: 0,
					insHue: 180,
					markHue: 250,
				},
			},
			frames: {
				showCopyToClipboardButton: false,
			},
		}),
		svelte(),
		sitemap({
			// Customize `lastmod` for blog posts: prefer the `updated` field,
			// fall back to `published`, so search engines see accurate freshness.
			serialize(item) {
				const date = postLastmodByUrl.get(item.url);
				if (date) {
					return { ...item, lastmod: date };
				}
				return item;
			},
		}),
	],
	markdown: {
		remarkPlugins: [
			remarkMath,
			remarkReadingTime,
			remarkExcerpt,
			remarkGithubAdmonitionsToDirectives,
			remarkDirective,
			remarkSectionize,
			parseDirectiveNode,
		],
		rehypePlugins: [
			[rehypeKatex, { strict: "ignore" }],
			rehypeSlug,
			rehypeShiftHeadings,
			[
				rehypeComponents,
				{
					components: {
						github: GithubCardComponent,
						note: (x, y) => AdmonitionComponent(x, y, "note"),
						tip: (x, y) => AdmonitionComponent(x, y, "tip"),
						important: (x, y) => AdmonitionComponent(x, y, "important"),
						caution: (x, y) => AdmonitionComponent(x, y, "caution"),
						warning: (x, y) => AdmonitionComponent(x, y, "warning"),
					},
				},
			],
			[
				rehypeAutolinkHeadings,
				{
					behavior: "append",
					properties: {
						className: ["anchor"],
					},
					content: {
						type: "element",
						tagName: "span",
						properties: {
							className: ["anchor-icon"],
							"data-pagefind-ignore": true,
						},
						children: [
							{
								type: "text",
								value: "#",
							},
						],
					},
				},
			],
		],
	},
	vite: {
		build: {
			rollupOptions: {
				onwarn(warning, warn) {
					// temporarily suppress this warning
					if (
						warning.message.includes("is dynamically imported by") &&
						warning.message.includes("but also statically imported by")
					) {
						return;
					}
					warn(warning);
				},
			},
		},
		assetsInclude: ["**/*.py", "**/*.docx"],
	},
});
