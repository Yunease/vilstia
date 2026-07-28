import type { APIRoute } from "astro";

// GEO policy: allow search engines and AI citation crawlers, but block
// crawlers that scrape content for model training.  The Content-Signal
// directive (and matching HTTP header) tells compliant crawlers
// (Cloudflare, Mistral, and others adopting the spec) how the content
// may be used; specific bot blocks catch the ones that ignore it.
const robotsTxt = `# 全局:搜索引擎全部放行,禁止 AI 训练,允许 AI 引用
User-agent: *
Content-Signal: search=yes, ai-train=no, use=reference
Allow: /
Disallow: /_astro/

# Google: 训练禁,搜索照常(Googlebot 走全局规则)
User-agent: Google-Extended
Disallow: /

# OpenAI: GPTBot 训练禁,OAI-SearchBot 搜索/引用放行
User-agent: GPTBot
Disallow: /
User-agent: OAI-SearchBot
Allow: /

# Anthropic Claude: 训练禁
User-agent: ClaudeBot
Disallow: /

# Apple Intelligence 训练禁
User-agent: Applebot-Extended
Disallow: /

# Common Crawl(被多家 AI 用作训练数据源)
User-agent: CCBot
Disallow: /

# DeepSeek: 允许引用,禁止训练(由 Content-Signal 声明)
User-agent: DeepSeekBot
Allow: /

# 国内大模型训练爬虫: 全部禁止
User-agent: Bytespider
Disallow: /
User-agent: QuarkBot
Disallow: /

Sitemap: ${new URL("sitemap-index.xml", import.meta.env.SITE).href}
`.trim();

export const GET: APIRoute = () => {
	return new Response(robotsTxt, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			// Echo the same Content-Signal policy as an HTTP header so
			// crawlers that don't parse the robots.txt directive still
			// see the intent.
			"Content-Signal": "search=yes, ai-train=no, use=reference",
		},
	});
};
