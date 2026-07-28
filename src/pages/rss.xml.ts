import rss from "@astrojs/rss";
import { getSortedPosts } from "@utils/content-utils";
import { url } from "@utils/url-utils";
import type { APIContext } from "astro";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@/config";

const parser = new MarkdownIt();

function stripInvalidXmlChars(str: string): string {
	return str.replace(
		// biome-ignore lint/suspicious/noControlCharactersInRegex: https://www.w3.org/TR/xml/#charsets
		/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g,
		"",
	);
}

type RssItem = {
	title: string;
	pubDate: Date;
	description: string;
	link: string;
	content: string;
};

let itemsCache: Promise<RssItem[]> | null = null;

// \u4E00\u6B21\u6027\u628A\u6240\u6709 post \u7684 markdown \u6E32\u67D3 + sanitize \u7ED3\u679C\u7B97\u597D,\u540E\u7EED GET \u76F4\u63A5\u590D\u7528\u3002
// \u9759\u6001\u6784\u5EFA\u65F6 GET \u53EA\u8C03\u4E00\u6B21,\u6240\u4EE5\u8FD9\u4E2A cache \u4E3B\u8981\u5E2E dev / HMR \u573A\u666F;\u751F\u4EA7\u6784\u5EFA\u672C\u8EAB\u4E0D\u4F1A\u591A\u7B97\u3002
function getItems(): Promise<RssItem[]> {
	if (!itemsCache) {
		itemsCache = (async () => {
			const blog = await getSortedPosts();
			return blog.map((post) => {
				const content =
					typeof post.body === "string" ? post.body : String(post.body || "");
				const cleanedContent = stripInvalidXmlChars(content);
				return {
					title: post.data.title,
					pubDate: post.data.published,
					description: post.data.description || "",
					link: url(`/posts/${post.slug}/`),
					content: sanitizeHtml(parser.render(cleanedContent), {
						allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
					}),
				};
			});
		})();
	}
	return itemsCache;
}

export async function GET(context: APIContext) {
	const items = await getItems();

	return rss({
		title: siteConfig.title,
		description: siteConfig.subtitle || "No description",
		site: context.site ?? "https://fuwari.vercel.app",
		items,
		customData: `<language>${siteConfig.lang}</language>`,
	});
}
