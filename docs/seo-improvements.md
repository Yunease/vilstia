# SEO / GEO 优化清单

> 基于开源 GEO 审计工具对 https://vilstia.org/ 的诊断结果（最终分 49/100）。
> 本文件用于跟踪优化进度，可直接复制到 GitHub Issue 跟踪。

## 审计概览

| 维度 | 原始分 | 最终分 | 失败上限原因 |
|---|---|---|---|
| 总分 | 61 | **49** | major 失败上限 49 |
| SEO | 70 | **49** | canonical / h1 / schema / LCP / performance |
| GEO | 50 | **50** | entity_identity |

**根域名**：`vilstia.org`
**被测页面**：首页 `/`
**被测页面语言**：`zh-CN`
**业务模式**：content（个人博客）
**识别置信度**：62%（个人博客画像证据不足）

## 总体执行策略

按 ROI 分四档执行。P0 + P1 修完总分可到 90+；P2 修完到 95+；P3 决定 GEO 在 LLM 答案里的引用率。

---

## P0 — Major 项（解锁 49 → 60+）

### [ ] 1. 添加首页 H1
**对应审计项**：`seo.h1`

- **现状**：`src/pages/[...page].astro` 是首页，渲染 PostCard 列表，**没有 `<h1>`**。全站 h1 出现在 anthology / photo / gallery / memory / message-board 等内页。
- **修复**：在 `src/pages/[...page].astro` `<MainGridLayout>` 内第一行加一个语义明确的 `<h1>`，可视觉克制（如 `sr-only`）或顶部一行小标题，不要影响现有 banner 设计。
  - 建议文案：「琴泠的博客 · 文章与碎念」或「樟庭徊路 晶栏处 —— 记录、笔记与杂思」

### [ ] 2. 添加首页 / 全站结构化数据
**对应审计项**：`seo.schema_presence` / `seo.schema_fit` / `geo.entity_identity`

- **现状**：
  - `src/pages/posts/[...slug].astro:36-55` 仅有 `BlogPosting` JSON-LD
  - 首页、归档页、profile 组件、about 页**完全无任何 JSON-LD**
  - 抓不到 `Person` / `Organization` / `WebSite` / `WebPage`
- **修复**（缺一不可，必须和页面可见内容一致，不要编造）：
  1. 在 `src/layouts/Layout.astro` 的 `<head>` 里加全站通用 `WebSite` + `Person` JSON-LD（用 `siteConfig.title` / `profileConfig.name` / `Astro.site` 注入，避免硬编码）
  2. 首页 `src/pages/[...page].astro` 额外补 `WebPage` + `Blog`，可选 `ItemList` 把当页 post 列出
  3. `src/pages/posts/[...slug].astro` 现有 JSON-LD 补字段：
     - `publisher`（指向 `Person` 锚点，用 `@id` 跨页面同源）
     - `mainEntityOfPage: { "@id": "${Astro.site}posts/${slug}/" }`
     - `image`
     - `url`
  4. About 页加 `AboutPage` schema

### [ ] 3. 添加 canonical
**对应审计项**：`seo.canonical`

- **现状**：`src/layouts/Layout.astro:82-115` 整个 `<head>` 里**没有 `<link rel="canonical">`**
- **修复**：在 `src/layouts/Layout.astro` `<head>` 中添加：
  ```html
  <link rel="canonical" href={new URL(Astro.url.pathname, Astro.site).href} />
  ```
- **注意**：因为 `trailingSlash: "always"`，`Astro.url.pathname` 会自动带尾斜杠，正好对齐
- **注意**：分页（`/page/2/`）要单独处理避免被合并到首页——首页的 canonical 固定成 `https://vilstia.org/`，其他页用 `Astro.url.pathname`

### [ ] 4. LCP 性能优化
**对应审计项**：`seo.lab_lcp` / `seo.lab_performance`

- **现状**：
  - 首页首屏是 `topImg.png`（`src/assets/images/topImg.png`）
  - 加载 Vercount + Umami + Twikoo 三个第三方脚本（`src/layouts/Layout.astro:155-161`）
  - Swup 客户端路由 + `transition-swup-fade` 动画（`astro.config.mjs:37-50`）让首屏出现明显延迟
  - `YearHeatmap` 用 `client:load`（`src/pages/[...page].astro:49-54`）阻塞主线程 hydrate
- **修复**：
  1. **首屏 LCP 图片**改成 `<link rel="preload" as="image" href={bannerUrl}>`，并加 `fetchpriority="high"`
  2. **`ImageWrapper.astro` 里给 `topImg.png` 显式 `width` `height`**（CLS 也会受益）
  3. **Twikoo 限定加载**：`src/pages/posts/[...slug].astro` 才引入，其它页不加载
  4. **Umami 改 `async`** 而非 `defer`；考虑迁到同域子路径减少 DNS 解析
  5. **`YearHeatmap` 改 `client:visible`**：当前 `client:load` 让它一上来就 hydrate
  6. **字体精简**：`src/layouts/Layout.astro:2-4` 引入了 400/500/700 三个字重，500 用得少，建议只保留 400 / 700

---

## P1 — Minor 项（解锁 60+ → 90+）

### [ ] 5. meta description 长度与质量
**对应审计项**：`seo.meta_description_length`

- **现状**：`src/layouts/Layout.astro:87` 用 `description || pageTitle` 做兜底，pageTitle 形如 `"樟庭徊路 晶栏处 - 琴泠的个人博客网站"`，**长度偏长且内容是站点名重复**
- **修复**：
  1. 在 `src/config.ts` 的 `siteConfig` 里加 `description: "琴泠的个人博客 —— 学习笔记 / 折腾记录 / 偶尔碎念"`
  2. `src/layouts/Layout.astro` 的 meta description 优先级改为：
     `props.description → frontmatter.description → siteConfig.description`
  3. **永远不要** fallback 到 title
  4. 文章页在 `src/pages/posts/[...slug].astro` 已有 `description={entry.data.description}`，但 `content/config.ts:9` 默认 `""`，要回退到 `remarkExcerpt` 自动生成的首段摘要（`astro.config.mjs:24` 已引入但未使用其输出）

### [ ] 6. Open Graph 补全
**对应审计项**：`seo.open_graph`

- **现状**：`src/layouts/Layout.astro:90-103` 有 `og:site_name` / `og:url` / `og:title` / `og:description` / `og:type` + `twitter:card`。**缺**：
  - `og:image`（最关键，分享无预览图）
  - `og:locale`（zh_CN）
  - `og:image:width` / `og:image:height` / `og:image:alt`
  - `og:article:author` / `og:article:published_time`（文章页）
  - `twitter:image` / `twitter:site`
- **修复**：
  1. `src/config.ts` 的 `siteConfig` 加 `ogImage: "assets/images/og-default.png"`，宽高 1200×630
  2. `src/layouts/Layout.astro` 在 `og:type === "article"` 时根据 `entry.data` 加 `article:published_time` / `article:author` / `article:tag`
  3. `og:url` 用 `new URL(Astro.url.pathname, Astro.site).href` 而非 `Astro.url`（避免 query string）
  4. OG 图放 `public/og/`，Astro build 时输出 1200×630 webp

### [ ] 7. 补全 Schema 字段
**对应审计项**：`seo.schema_fit`

- **现状**：`src/pages/posts/[...slug].astro:36-52` 的 `BlogPosting` JSON-LD 缺 `publisher` / `mainEntityOfPage` / `image` / `url`
- **修复**（见 P0-2）

### [ ] 8. 响应式图片
**对应审计项**：`seo.responsive_images`

- **现状**：`src/components/misc/ImageWrapper.astro` 没用 Astro 原生 `<Image>`，丢失 `srcset` / `sizes` / `width` / `height`
- **修复**：
  1. `src/components/misc/ImageWrapper.astro` 内部改用 `getImage()` + `<Image>`，自动获得 webp/avif / `srcset` / `sizes`
  2. 文章封面（`src/pages/posts/[...slug].astro:113`）和 banner 必须给显式 `width` / `height`
  3. 友链头像（`friendsConfig`）用 `<img loading="lazy" decoding="async" width="40" height="40">`，防止 CLS

---

## P2 — 体验与无障碍（解锁 90+ → 95+）

### [ ] 9. ARIA 地标与 Skip Navigation
**对应审计项**：`seo.aria_landmarks` / `seo.skip_navigation`

- **现状**：
  - 已有 `<main id="swup-container">`（地标存在）
  - `src/components/Navbar.astro` 的 `<div id="navbar">` **不是 `<nav>`**
  - `src/components/Footer.astro` 是 `<div class="footer">` **不是 `<footer>`**
  - **完全没有"跳到正文"链接**
- **修复**：
  1. `src/layouts/Layout.astro` `<body>` 第一行加：
     ```html
     <a href="#swup-container" class="sr-only focus:not-sr-only ...">跳到主要内容</a>
     ```
  2. `src/components/Navbar.astro` 包裹层改成 `<nav id="navbar" aria-label="主导航">`
  3. `src/components/Footer.astro` 两个 `<div class="footer">` 改成 `<footer role="contentinfo">`
  4. 侧边栏 `src/components/widget/SideBar.astro` 包成 `<aside aria-label="侧边栏">`

---

## P3 — GEO 增强（提升 LLM 引用率）

### [ ] 10. 实体同源信号
**对应审计项**：`geo.entity_identity`（隐藏关键）

- LLM 抓站判断"你是不是 琴泠"主要靠**跨页面同源信号**
- **修复**：
  1. 全站 `Person` JSON-LD 都用同一个 `@id`（如 `https://vilstia.org/#person`）
  2. `src/components/widget/Profile.astro` 里给 `<a href="/about/" rel="author">` 加 `rel="author"`
  3. 社交链接保留 `rel="me"`（`Profile.astro:32` 已做 ✅）
  4. `Person` JSON-LD 加 `sameAs` 数组，把 GitHub / BiliBili / Bangumi / Pixiv 全列进去，AI 会做实体对齐

### [ ] 11. robots.txt
**对应审计项**：基础抓取健康

- **现状**：`public/` 下无 `robots.txt`
- **修复**：新增 `public/robots.txt`：
  ```
  User-agent: *
  Allow: /
  Sitemap: https://vilstia.org/sitemap-index.xml
  ```

### [ ] 12. sitemap 增强
**对应审计项**：抓取效率

- **现状**：已集成 `@astrojs/sitemap` ✅
- **修复**：在 `astro.config.mjs` 给 sitemap integration 加 `serialize` 函数，自定义 `lastmod` 用 `entry.data.updated || entry.data.published`（`content/config.ts:7` 有 `updated` 字段但 sitemap 可能未使用）

### [ ] 13. 图片懒加载与 alt
- 文章列表 `PostCard` 封面用 `loading="lazy" decoding="async"`
- 首屏 banner 反过来要 `loading="eager" fetchpriority="high"`
- `topImg.png` 在 `src/layouts/MainGridLayout.astro:59` 的 alt 固定为 "Banner image of the blog"，对 LLM 没用——改为 `alt="${siteConfig.subtitle}"` 等与站点主题相关的描述

### [ ] 14. 首页"自描述"内容
- 审计给"个人博客"识别置信度仅 62%，说明页面文本里"博客""文章"等关键词密度不足
- 在首页最显眼区域（视觉上很轻）加一句自描述：
  > "这是一个记录学习、生活和原创内容的个人博客。"
- 同步帮 H1、补 description、补 LLM 识别

---

## 验收方式

1. 重新跑同一份 GEO 审计，预期：
   - P0 + P1 完成后总分 ≥ 90
   - P2 完成后 ≥ 95
   - P3 完成后个人博客识别置信度 ≥ 90%，GEO 分 ≥ 80
2. Google Rich Results Test / Schema.org Validator 验证所有 JSON-LD 通过
3. PageSpeed Insights 验证 LCP ≤ 2.5s（移动端）/ 1.5s（桌面端）
4. 在秘塔 / Kimi / Perplexity 搜"樟庭徊路"或"琴泠 博客"，验证被引用

## 相关文件索引

| 路径 | 涉及改动 |
|---|---|
| `src/layouts/Layout.astro` | canonical / 全局 JSON-LD / og:image / skip link / 脚本加载策略 |
| `src/layouts/MainGridLayout.astro` | banner alt |
| `src/pages/[...page].astro` | 首页 H1 / ItemList schema / 自描述 |
| `src/pages/posts/[...slug].astro` | BlogPosting schema 字段补全 / Twikoo 限定 |
| `src/components/ImageWrapper.astro` | 响应式图片 |
| `src/components/Navbar.astro` | `<nav>` 包裹 |
| `src/components/Footer.astro` | `<footer>` 包裹 |
| `src/components/widget/Profile.astro` | `rel="author"` |
| `src/config.ts` | `description` / `ogImage` 字段 |
| `astro.config.mjs` | sitemap serialize / 字体精简 |
| `public/robots.txt` | 新增 |
