# GeoScore 完整修复报告: vilstia.org

## 审计信息

- 生成时间: 2026-07-29T06:18:28.078Z
- 评分版本: 2.4.7
- 审计模式: site
- 目标: https://vilstia.org/

## 站点画像

- 站点类型: 个人博客
- 实体: 琴泠
- 行业方向: 未知
- 业务模式: content
- 页面语言: zh-CN
- 根域名: vilstia.org

### 分类证据

- [site_structure] - https://vilstia.org/ - site_structure: Blog and Person JSON-LD with site identity evidence
- [json_ld] - https://vilstia.org/ - json_ld: Person: 琴泠

## 分数与评分限制

### 总分
- 最终分: 59/100
- 原始加权分: 88/100
- 覆盖率: 88%
- 置信度: 98%
- 最高分上限: 59/100
- 限制原因: major 失败上限 59/100 (seo.canonical, seo.lab_performance, seo.lab_lcp); minor 失败上限 94/100 (seo.cross_page_titles, seo.meta_description_length, seo.heading_hierarchy, seo.responsive_images, seo.dom_size, seo.skip_navigation); 证据覆盖率上限 89/100

### SEO
- 最终分: 59/100
- 原始加权分: 79/100
- 覆盖率: 86%
- 置信度: 99%
- 最高分上限: 59/100
- 限制原因: major 失败上限 59/100 (seo.canonical, seo.lab_performance, seo.lab_lcp); minor 失败上限 94/100 (seo.cross_page_titles, seo.meta_description_length, seo.heading_hierarchy, seo.responsive_images, seo.dom_size, seo.skip_navigation); 证据覆盖率上限 89/100

### GEO
- 最终分: 100/100
- 原始加权分: 100/100
- 覆盖率: 93%
- 置信度: 94%
- 最高分上限: 100/100
- 限制原因: 无

## 抽样页面

- **首页** - https://vilstia.org/ - 完成 - http
- **关于页** - https://vilstia.org/about/ - 完成 - http
- **文章页** - https://vilstia.org/posts/%E5%90%8C%E4%BA%BA%E6%96%87/%E5%BF%83%E4%B9%8B%E8%BD%A8%E8%BF%B9/%E7%B3%96%E6%9E%9C%E7%9A%84%E5%9B%9B%E5%AD%A3/%E6%98%A5%E4%B9%8B%E7%AB%A0/%E5%B7%AB%E5%A5%B3/ - 完成 - http
- **category** - https://vilstia.org/archive/ - 完成 - http
- **other** - https://vilstia.org/2/ - 完成 - http

## 按页面与根因聚合的修复组

### 1. repair-retrieval-1ya5mjd
- 阶段: retrieval
- 页面: https://vilstia.org/
- 严重度: major
- 检查项: `seo.canonical`
- 原始证据:
  - `seo.canonical` @ https://vilstia.org/: No canonical link found
- 修复任务:
  - **为目标页添加 canonical** — 在 head 中添加指向最终公开 URL 的 rel="canonical"。 — 复验步骤: 查看渲染后的 head，并重新审计该 URL。
- 复验步骤:
  - 查看渲染后的 head，并重新审计该 URL。

### 2. repair-parse-fwxd8w
- 阶段: parse
- 页面: https://vilstia.org/
- 严重度: minor
- 检查项: `seo.heading_hierarchy`, `seo.meta_description_length`, `seo.dom_size`, `seo.skip_navigation`, `seo.responsive_images`
- 原始证据:
  - `seo.heading_hierarchy` @ https://vilstia.org/: A heading level is skipped
  - `seo.meta_description_length` @ https://vilstia.org/: 136 chars; target 24-120
  - `seo.dom_size` @ https://vilstia.org/: 1522 DOM elements
  - `seo.skip_navigation` @ https://vilstia.org/: Skip navigation link failed
  - `seo.responsive_images` @ https://vilstia.org/: 0/3 content images expose srcset/sizes
  - `seo.responsive_images` @ https://vilstia.org/: mobile responsive image signal=not detected
- 修复任务:
  - **改进标题层级** — 按 H1→H2→H3 顺序组织标题，并从正文中加入指向真实相关页面的描述性内部链接。 — 复验步骤: 检查渲染后的 heading outline 和内部链接目标，再重新审计。
  - **修复Meta description 长度** — 只修改证据指向的字段：标题保持唯一且简洁，description 与可见内容一致，Open Graph 补齐核心字段，多语言页添加互相对应的 hreflang。 — 复验步骤: 检查最终 HTML head 中的对应标签和值，并重新审计目标页。
  - **优化DOM 规模** — 根据证据处理对应瓶颈：缓存或优化后端、为脚本添加 defer/async、启用 Brotli/Gzip、缩减初始 HTML 与不必要 DOM。 — 复验步骤: 重新抓取最终响应并比较响应时间、编码、文档体积、DOM 数或阻塞脚本数量。
  - **修复跳过导航链接** — 为输入控件关联 label/ARIA 标签，使用 main/nav 地标，替换“点击这里”等泛化链接文字，并添加可聚焦的跳过导航链接。 — 复验步骤: 用键盘遍历页面并检查可访问性树，确认对应规则通过后重新审计。
  - **修复响应式图片** — 为信息型图片写与内容一致的 alt，为装饰图使用空 alt；声明 width/height，并为大图提供 srcset/sizes。 — 复验步骤: 检查证据列出的 img 元素，确认属性已输出到最终 HTML 后重新审计。
- 复验步骤:
  - 检查渲染后的 heading outline 和内部链接目标，再重新审计。
  - 检查最终 HTML head 中的对应标签和值，并重新审计目标页。
  - 重新抓取最终响应并比较响应时间、编码、文档体积、DOM 数或阻塞脚本数量。
  - 用键盘遍历页面并检查可访问性树，确认对应规则通过后重新审计。
  - 检查证据列出的 img 元素，确认属性已输出到最终 HTML 后重新审计。

### 3. repair-retrieval-1lz4wey
- 阶段: retrieval
- 页面: 无
- 严重度: minor
- 检查项: `seo.cross_page_titles`
- 原始证据:
  - `seo.cross_page_titles`: https://vilstia.org/: 樟庭徊路 晶栏处 - 琴泠（Lumina）的个人博客网站
  - `seo.cross_page_titles`: https://vilstia.org/about/: 关于 - 樟庭徊路 晶栏处
  - `seo.cross_page_titles`: https://vilstia.org/posts/%E5%90%8C%E4%BA%BA%E6%96%87/%E5%BF%83%E4%B9%8B%E8%BD%A8%E8%BF%B9/%E7%B3%96%E6%9E%9C%E7%9A%84%E5%9B%9B%E5%AD%A3/%E6%98%A5%E4%B9%8B%E7%AB%A0/%E5%B7%AB%E5%A5%B3/: 巫女 - 樟庭徊路 晶栏处
  - `seo.cross_page_titles`: https://vilstia.org/archive/: 归档 - 樟庭徊路 晶栏处
  - `seo.cross_page_titles`: https://vilstia.org/2/: 樟庭徊路 晶栏处 - 琴泠（Lumina）的个人博客网站
- 修复任务:
  - **跨页面标题一致性** — 根据检测证据修复对应页面，并保持内容与结构化数据一致。 — 复验步骤: 重新审计该 URL，确认检查状态变为 pass。
- 复验步骤:
  - 重新审计该 URL，确认检查状态变为 pass。

## 全部失败项与修复方案

### 1. [MAJOR] Canonical URL (`seo.canonical`)
- 页面: https://vilstia.org/
- 检测来源: technical_seo
- 置信度: 100%
- 原始证据:
  - No canonical link found
- 失败原因: 页面没有声明首选 URL，重复内容信号可能被拆分。
- 修改方法: 在 head 中添加指向最终公开 URL 的 rel="canonical"。
- 复验步骤: 查看渲染后的 head，并重新审计该 URL。

### 2. [MAJOR] 实验室性能：LCP (`seo.lab_lcp`)
- 页面: https://vilstia.org
- 检测来源: Google PageSpeed Insights API
- 置信度: 90%
- 原始证据:
  - 17701ms; <= 2500ms
- 失败原因: CrUX 现场数据或 PageSpeed 实验室数据超过了良好体验阈值。
- 修改方法: 以证据中的具体指标为目标：优化首屏关键资源与 LCP 元素，预留媒体尺寸减少 CLS，拆分长任务并降低主线程阻塞。
- 复验步骤: 重新运行 PageSpeed，并在有足够真实流量后复查 CrUX p75；确认该指标进入良好阈值。

### 3. [MAJOR] PageSpeed 实验室性能 (`seo.lab_performance`)
- 页面: https://vilstia.org
- 检测来源: Google PageSpeed Insights API
- 置信度: 90%
- 原始证据:
  - 72/100; >= 90/100
- 失败原因: CrUX 现场数据或 PageSpeed 实验室数据超过了良好体验阈值。
- 修改方法: 以证据中的具体指标为目标：优化首屏关键资源与 LCP 元素，预留媒体尺寸减少 CLS，拆分长任务并降低主线程阻塞。
- 复验步骤: 重新运行 PageSpeed，并在有足够真实流量后复查 CrUX p75；确认该指标进入良好阈值。

### 4. [MINOR] 跨页面标题一致性 (`seo.cross_page_titles`)
- 页面: https://vilstia.org/
- 检测来源: site_sampler
- 置信度: 100%
- 原始证据:
  - https://vilstia.org/: 樟庭徊路 晶栏处 - 琴泠（Lumina）的个人博客网站
  - https://vilstia.org/about/: 关于 - 樟庭徊路 晶栏处
  - https://vilstia.org/posts/%E5%90%8C%E4%BA%BA%E6%96%87/%E5%BF%83%E4%B9%8B%E8%BD%A8%E8%BF%B9/%E7%B3%96%E6%9E%9C%E7%9A%84%E5%9B%9B%E5%AD%A3/%E6%98%A5%E4%B9%8B%E7%AB%A0/%E5%B7%AB%E5%A5%B3/: 巫女 - 樟庭徊路 晶栏处
  - https://vilstia.org/archive/: 归档 - 樟庭徊路 晶栏处
  - https://vilstia.org/2/: 樟庭徊路 晶栏处 - 琴泠（Lumina）的个人博客网站
- 失败原因: 该检查基于当前页面的可验证证据失败，会影响搜索引擎或 AI 系统理解页面。
- 修改方法: 根据检测证据修复对应页面，并保持内容与结构化数据一致。
- 复验步骤: 重新审计该 URL，确认检查状态变为 pass。

### 5. [MINOR] DOM 规模 (`seo.dom_size`)
- 页面: https://vilstia.org/
- 检测来源: technical_seo
- 置信度: 100%
- 原始证据:
  - 1522 DOM elements
- 失败原因: 服务器响应或 HTML 交付证据超过了本检查的明确阈值。
- 修改方法: 根据证据处理对应瓶颈：缓存或优化后端、为脚本添加 defer/async、启用 Brotli/Gzip、缩减初始 HTML 与不必要 DOM。
- 复验步骤: 重新抓取最终响应并比较响应时间、编码、文档体积、DOM 数或阻塞脚本数量。

### 6. [MINOR] 标题层级 (`seo.heading_hierarchy`)
- 页面: https://vilstia.org/
- 检测来源: on_page_seo
- 置信度: 100%
- 原始证据:
  - A heading level is skipped
- 失败原因: 当前页面结构让主题层级或站内关系难以被稳定解析。
- 修改方法: 按 H1→H2→H3 顺序组织标题，并从正文中加入指向真实相关页面的描述性内部链接。
- 复验步骤: 检查渲染后的 heading outline 和内部链接目标，再重新审计。

### 7. [MINOR] Meta description 长度 (`seo.meta_description_length`)
- 页面: https://vilstia.org/
- 检测来源: technical_seo
- 置信度: 100%
- 原始证据:
  - 136 chars; target 24-120
- 失败原因: 当前 metadata 的长度、完整性或语言映射没有满足已验证条件，可能导致搜索摘要截断或页面关系不清晰。
- 修改方法: 只修改证据指向的字段：标题保持唯一且简洁，description 与可见内容一致，Open Graph 补齐核心字段，多语言页添加互相对应的 hreflang。
- 复验步骤: 检查最终 HTML head 中的对应标签和值，并重新审计目标页。

### 8. [MINOR] 响应式图片 (`seo.responsive_images`)
- 页面: https://vilstia.org/
- 检测来源: mobile_audit
- 置信度: 100%
- 原始证据:
  - 0/3 content images expose srcset/sizes
  - mobile responsive image signal=not detected
- 失败原因: 已发现图片缺少替代文本、稳定尺寸或响应式候选，影响可访问性与加载稳定性。
- 修改方法: 为信息型图片写与内容一致的 alt，为装饰图使用空 alt；声明 width/height，并为大图提供 srcset/sizes。
- 复验步骤: 检查证据列出的 img 元素，确认属性已输出到最终 HTML 后重新审计。

### 9. [MINOR] 跳过导航链接 (`seo.skip_navigation`)
- 页面: https://vilstia.org/
- 检测来源: accessibility
- 置信度: 100%
- 原始证据:
  - Skip navigation link failed
- 失败原因: WCAG 结构证据显示表单、地标、链接文本或键盘跳转信息不完整。
- 修改方法: 为输入控件关联 label/ARIA 标签，使用 main/nav 地标，替换“点击这里”等泛化链接文字，并添加可聚焦的跳过导航链接。
- 复验步骤: 用键盘遍历页面并检查可访问性树，确认对应规则通过后重新审计。

## 未知与错误检查

这些项目没有计为失败，也没有按 0 分处理；它们只影响证据覆盖率。

- [error] `seo.html_conformance` - HTML 规范性 - W3C Nu HTML Checker - W3C_REQUEST_REJECTED: W3C Nu HTML Checker returned HTTP 403
- [unknown] `seo.cwv_lcp` - Core Web Vitals：LCP - Chrome UX Report - CrUX API error: 400
- [unknown] `seo.cwv_cls` - Core Web Vitals：CLS - Chrome UX Report - CrUX API error: 400
- [unknown] `seo.cwv_inp` - Core Web Vitals：INP - Chrome UX Report - CrUX API error: 400
- [unknown] `seo.cwv_fcp` - 现场性能：FCP - Chrome UX Report - CrUX API error: 400
- [unknown] `seo.cwv_ttfb` - 现场性能：TTFB - Chrome UX Report - CrUX API error: 400
- [unknown] `geo.knowledge_graph` - 已验证知识图谱实体 - authority - No domain-verified entity found
- [unknown] `geo.common_crawl_presence` - Common Crawl 收录证据 - Common Crawl Index - No matching HTTP 200 HTML capture was found in the latest collection CC-MAIN-2026-30

## 不适用与信息项

- [pass] `seo.sample_coverage` - 整站抽样覆盖 - site_sampler - 5/5 pages fetched
- [not_applicable] `seo.hreflang` - 多语言 hreflang - technical_seo - One sampled language detected: zh
- [fail] `seo.security_headers` - 安全响应头覆盖 - technical_seo - Header coverage score 33/100
- [pass] `geo.ai_crawler_policy` - AI 爬虫策略 - technical_seo - No supported search/index crawler block was detected
- [not_applicable] `geo.direct_answer` - 直接回答结构 - page_structure - No sampled page type or query-shaped content requires a direct answer
- [not_applicable] `geo.claim_source_support` - 声明与来源关联 - content_sources - No source-dependent claims were detected in sampled content
- [not_applicable] `geo.statistic_provenance` - 统计数据来源 - content_sources - No numeric or statistical claims were detected
- [not_applicable] `geo.source_links` - 来源与外部引用 - content_quality - No source-dependent claims require outbound citations
- [pass] `geo.llms_txt` - llms.txt - technical_seo - llms.txt found

## 匿名审计未运行的可选能力

- `geo_predicted` - Deprecated for new audits: dated Evidence Map snapshots are separate from factual scoring
- `keywords` - Deprecated for new audits: dated Evidence Map snapshots are separate from factual scoring
- `ai_content_insights` - Deprecated for new audits: dated Evidence Map snapshots are separate from factual scoring
- `off_page_seo` - Skipped in the v2 anonymous audit to keep the Cloudflare Workers Free request budget deterministic
- `site_intel` - Skipped in the v2 anonymous audit to keep the Cloudflare Workers Free request budget deterministic
- `redirect_chain` - Skipped in the v2 anonymous audit to keep the Cloudflare Workers Free request budget deterministic
- `security_audit` - Skipped in the v2 anonymous audit to keep the Cloudflare Workers Free request budget deterministic
- `ssl_cert` - Skipped in the v2 anonymous audit to keep the Cloudflare Workers Free request budget deterministic
- `domain_intel` - Skipped in the v2 anonymous audit to keep the Cloudflare Workers Free request budget deterministic
- `broken_links` - Skipped in the v2 anonymous audit to keep the Cloudflare Workers Free request budget deterministic

## 查询证据地图

- 尚未生成快照

## API 回答快照

- 尚未生成快照

## 监控历史

- 尚无监控历史

## 限制说明

- 这是基于抽样页面的预测模拟，不是真实的 ChatGPT、Perplexity 或 Google AI 引用监控。
- 预测结果不会计入 SEO、GEO 或总分。

## 内容 AI 简报

### 目标页面

- https://vilstia.org/

### 已验证问题

#### 1. [MINOR] 标题层级 (`seo.heading_hierarchy`)
- 页面: https://vilstia.org/
- 检测来源: on_page_seo
- 原始证据:
  - A heading level is skipped
- 失败原因: 当前页面结构让主题层级或站内关系难以被稳定解析。

### 具体修改任务

1. `seo.heading_hierarchy` @ https://vilstia.org/: 按 H1→H2→H3 顺序组织标题，并从正文中加入指向真实相关页面的描述性内部链接。

### 禁止虚构项

- 不得虚构价格、套餐、服务、地址、实体、作者、统计来源或站点未公开的业务事实。不得自动发布。
- 不要把 not_applicable、unknown 或 error 项改写成内容任务，也不要为了评分强行添加 FAQ、作者或商业信息。

### 内容复验步骤

- `seo.heading_hierarchy`: 检查渲染后的 heading outline 和内部链接目标，再重新审计。

### 交给内容 AI 的 Prompt

```text
请只根据下面已验证的内容失败项，为列出的页面准备候选修改。保留原有事实、语气和页面目的，不重写无关段落，不自动发布。每项输出目标页面、建议替换或结构调整、需要人工确认的事实，以及复验方法。

1. `seo.heading_hierarchy` @ https://vilstia.org/: 按 H1→H2→H3 顺序组织标题，并从正文中加入指向真实相关页面的描述性内部链接。

不得虚构价格、套餐、服务、地址、实体、作者、统计来源或站点未公开的业务事实。不得自动发布。
```

## 开发 AI 简报

### 技术失败项

#### 1. [MAJOR] Canonical URL (`seo.canonical`)
- 页面: https://vilstia.org/
- 检测来源: technical_seo
- 原始证据:
  - No canonical link found
- 失败原因: 页面没有声明首选 URL，重复内容信号可能被拆分。

#### 2. [MAJOR] 实验室性能：LCP (`seo.lab_lcp`)
- 页面: https://vilstia.org
- 检测来源: Google PageSpeed Insights API
- 原始证据:
  - 17701ms; <= 2500ms
- 失败原因: CrUX 现场数据或 PageSpeed 实验室数据超过了良好体验阈值。

#### 3. [MAJOR] PageSpeed 实验室性能 (`seo.lab_performance`)
- 页面: https://vilstia.org
- 检测来源: Google PageSpeed Insights API
- 原始证据:
  - 72/100; >= 90/100
- 失败原因: CrUX 现场数据或 PageSpeed 实验室数据超过了良好体验阈值。

#### 4. [MINOR] 跨页面标题一致性 (`seo.cross_page_titles`)
- 页面: https://vilstia.org/
- 检测来源: site_sampler
- 原始证据:
  - https://vilstia.org/: 樟庭徊路 晶栏处 - 琴泠（Lumina）的个人博客网站
  - https://vilstia.org/about/: 关于 - 樟庭徊路 晶栏处
  - https://vilstia.org/posts/%E5%90%8C%E4%BA%BA%E6%96%87/%E5%BF%83%E4%B9%8B%E8%BD%A8%E8%BF%B9/%E7%B3%96%E6%9E%9C%E7%9A%84%E5%9B%9B%E5%AD%A3/%E6%98%A5%E4%B9%8B%E7%AB%A0/%E5%B7%AB%E5%A5%B3/: 巫女 - 樟庭徊路 晶栏处
  - https://vilstia.org/archive/: 归档 - 樟庭徊路 晶栏处
  - https://vilstia.org/2/: 樟庭徊路 晶栏处 - 琴泠（Lumina）的个人博客网站
- 失败原因: 该检查基于当前页面的可验证证据失败，会影响搜索引擎或 AI 系统理解页面。

#### 5. [MINOR] DOM 规模 (`seo.dom_size`)
- 页面: https://vilstia.org/
- 检测来源: technical_seo
- 原始证据:
  - 1522 DOM elements
- 失败原因: 服务器响应或 HTML 交付证据超过了本检查的明确阈值。

#### 6. [MINOR] Meta description 长度 (`seo.meta_description_length`)
- 页面: https://vilstia.org/
- 检测来源: technical_seo
- 原始证据:
  - 136 chars; target 24-120
- 失败原因: 当前 metadata 的长度、完整性或语言映射没有满足已验证条件，可能导致搜索摘要截断或页面关系不清晰。

#### 7. [MINOR] 响应式图片 (`seo.responsive_images`)
- 页面: https://vilstia.org/
- 检测来源: mobile_audit
- 原始证据:
  - 0/3 content images expose srcset/sizes
  - mobile responsive image signal=not detected
- 失败原因: 已发现图片缺少替代文本、稳定尺寸或响应式候选，影响可访问性与加载稳定性。

#### 8. [MINOR] 跳过导航链接 (`seo.skip_navigation`)
- 页面: https://vilstia.org/
- 检测来源: accessibility
- 原始证据:
  - Skip navigation link failed
- 失败原因: WCAG 结构证据显示表单、地标、链接文本或键盘跳转信息不完整。

### 具体修改任务

1. `seo.canonical` @ https://vilstia.org/: 在 head 中添加指向最终公开 URL 的 rel="canonical"。
2. `seo.lab_lcp` @ https://vilstia.org: 以证据中的具体指标为目标：优化首屏关键资源与 LCP 元素，预留媒体尺寸减少 CLS，拆分长任务并降低主线程阻塞。
3. `seo.lab_performance` @ https://vilstia.org: 以证据中的具体指标为目标：优化首屏关键资源与 LCP 元素，预留媒体尺寸减少 CLS，拆分长任务并降低主线程阻塞。
4. `seo.cross_page_titles` @ https://vilstia.org/: 根据检测证据修复对应页面，并保持内容与结构化数据一致。
5. `seo.dom_size` @ https://vilstia.org/: 根据证据处理对应瓶颈：缓存或优化后端、为脚本添加 defer/async、启用 Brotli/Gzip、缩减初始 HTML 与不必要 DOM。
6. `seo.meta_description_length` @ https://vilstia.org/: 只修改证据指向的字段：标题保持唯一且简洁，description 与可见内容一致，Open Graph 补齐核心字段，多语言页添加互相对应的 hreflang。
7. `seo.responsive_images` @ https://vilstia.org/: 为信息型图片写与内容一致的 alt，为装饰图使用空 alt；声明 width/height，并为大图提供 srcset/sizes。
8. `seo.skip_navigation` @ https://vilstia.org/: 为输入控件关联 label/ARIA 标签，使用 main/nav 地标，替换“点击这里”等泛化链接文字，并添加可聚焦的跳过导航链接。

### 验收条件

- `seo.canonical`: 查看渲染后的 head，并重新审计该 URL。
- `seo.lab_lcp`: 重新运行 PageSpeed，并在有足够真实流量后复查 CrUX p75；确认该指标进入良好阈值。
- `seo.lab_performance`: 重新运行 PageSpeed，并在有足够真实流量后复查 CrUX p75；确认该指标进入良好阈值。
- `seo.cross_page_titles`: 重新审计该 URL，确认检查状态变为 pass。
- `seo.dom_size`: 重新抓取最终响应并比较响应时间、编码、文档体积、DOM 数或阻塞脚本数量。
- `seo.meta_description_length`: 检查最终 HTML head 中的对应标签和值，并重新审计目标页。
- `seo.responsive_images`: 检查证据列出的 img 元素，确认属性已输出到最终 HTML 后重新审计。
- `seo.skip_navigation`: 用键盘遍历页面并检查可访问性树，确认对应规则通过后重新审计。

### 交给开发 AI 的 Prompt

```text
请在网站代码库中只处理下面的技术失败项。先定位生成目标 URL 的源文件，保留现有框架，只修改证据支持的代码或配置。

1. `seo.canonical` @ https://vilstia.org/: 在 head 中添加指向最终公开 URL 的 rel="canonical"。
2. `seo.lab_lcp` @ https://vilstia.org: 以证据中的具体指标为目标：优化首屏关键资源与 LCP 元素，预留媒体尺寸减少 CLS，拆分长任务并降低主线程阻塞。
3. `seo.lab_performance` @ https://vilstia.org: 以证据中的具体指标为目标：优化首屏关键资源与 LCP 元素，预留媒体尺寸减少 CLS，拆分长任务并降低主线程阻塞。
4. `seo.cross_page_titles` @ https://vilstia.org/: 根据检测证据修复对应页面，并保持内容与结构化数据一致。
5. `seo.dom_size` @ https://vilstia.org/: 根据证据处理对应瓶颈：缓存或优化后端、为脚本添加 defer/async、启用 Brotli/Gzip、缩减初始 HTML 与不必要 DOM。
6. `seo.meta_description_length` @ https://vilstia.org/: 只修改证据指向的字段：标题保持唯一且简洁，description 与可见内容一致，Open Graph 补齐核心字段，多语言页添加互相对应的 hreflang。
7. `seo.responsive_images` @ https://vilstia.org/: 为信息型图片写与内容一致的 alt，为装饰图使用空 alt；声明 width/height，并为大图提供 srcset/sizes。
8. `seo.skip_navigation` @ https://vilstia.org/: 为输入控件关联 label/ARIA 标签，使用 main/nav 地标，替换“点击这里”等泛化链接文字，并添加可聚焦的跳过导航链接。

不得虚构价格、套餐、服务、地址、实体、作者、统计来源或站点未公开的业务事实。不得自动发布。
完成后运行项目现有测试或构建，并逐项说明修改文件、证据对应关系与复验结果。
```
