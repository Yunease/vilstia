# Virstia PageSpeed 优化实战计划

> 来源：PageSpeed / Lighthouse 报告（vilstia.org 首页，当前评分 80）
> 目标：通过修复报告列出的具体问题，把评分提到 95+
> 文档定位：按「报告发现 → 根因 → 具体改动」逐一落地，所有改动点都标注了对应源码位置，可直接审查。

---

## 报告问题清单（按对 LCP / 评分影响排序）

| # | Lighthouse 发现 | 预估收益 | 影响指标 |
|---|---|---|---|
| 1 | 渲染阻塞请求 | 缩短 ~880ms | LCP |
| 2 | 网络依赖关系树过长 / 关键链 | 关键路径上限 1796ms | LCP |
| 3 | 预连接候选项 | 节省 ~300ms | LCP |
| 4 | 图片传送优化（topImg） | 省 45.8 KiB | LCP |
| 5 | 旧版 JavaScript（仅第三方） | 省 10.5 KiB | TBT |
| 6 | 缓存生命周期 | 省 8 KiB | TTFB/重访 |
| 7 | 强制自动重排 | 7ms + 3ms | TBT |

---

## 一、渲染阻塞请求 —— 缩短 ~880ms（P0，收益最大）

### 报告现象
CSS 全部渲染阻塞，累计 `63.3 KiB / 3910ms`，且被拆成 **6 个文件**：

```
/_astro/index.bVOvd2bu.css      11.0 KiB   750ms
/_astro/_page_.HF6y4Fdz.css     11.0 KiB   750ms
/_astro/Layout.y4KPJ9hc.css      3.4 KiB   450ms
/_astro/message-board.BwNyoBex.css 3.0 KiB 150ms
/_astro/_page_.B8GKxBa7.css     27.0 KiB  1050ms
/_astro/Layout.DSulWsr7.css      2.1 KiB   150ms
/_astro/_slug_.DXLnSzSq.css      5.7 KiB   600ms
```

### 根因
1. `src/layouts/Layout.astro` 里 `import "katex/dist/katex.css"`（第 24 行）把 **KaTeX 全量样式打进 Layout**，每一页都带，即使页面没有公式。
2. `src/layouts/Layout.astro` 第 2-4 行引入 **Roboto 400/500/700 三个权重**，且 700 只用于极少数强调场景。
3. 首页路由 `[...page].astro` + `MainGridLayout` + 各组件把样式切成多块，每块都阻塞。

### 改动方案
1. **KaTeX 样式按需**：`Layout.astro` 里删除 `import "katex/dist/katex.css"`。KaTeX 的样式已在 `rehype-katex` 产出的 HTML 中通过 `class="katex"` 引用，但 CSS 需要手动引入。改为只在真正包含数学公式的文章页引入，或在 `Markdown.astro` / `[...slug].astro` 里用条件加载。
   - 折中：保留全局引入，但确认 `katex.css` 是否真的被绝大多数页面用到；若不是，这 11KB 是纯浪费。
2. **Roboto 降权重**：700 权重全站几乎不用，删掉 `import "@fontsource/roboto/700.css"`。三个 woff2（各 ~21KB）都是关键路径资源（见报告网络树），砍一个就少一个关键请求。
3. **拆分 CSS 而非阻塞**：当前 CSS 阻塞首屏渲染。对首屏真正必要的样式内联，其余用 `media="print" onload` 技术或 `<link rel="preload" as="style">` 二次加载，避免阻塞。重点对象是 `index.bVOvd2bu.css`（Tailwind 基座，无法避免，但可优先）。

### 验证
- 重新跑 PageSpeed，观察「渲染阻塞请求」这一项的时间是否从 3910ms 下降。
- 确保页面无样式闪烁（FOUC）。

---

## 二、网络依赖关系树 / 关键路径过长 —— 上限 1796ms（P0）

### 报告现象
关键链上串了太多 JS，很多是**每个页面都需要的重型库**：

```
Layout.astro_oJT9AsOR.js  16.35 KiB  197ms
PetCat.BbAuciT4.js         3.15 KiB  434ms   ← client:load，非首屏功能
this.Dgu1C_uM.js           0.96 KiB  500ms
pagefind/pagefind.js      11.08 KiB  887ms   ← 搜索，非首屏
photoswipe.esm…           18.56 KiB  890ms   ← 图片放大，非首屏
Swup… (6 个插件)          ~20 KiB   1.3~1.4s  ← 整站 SPA 切换
render.BdgbRPEN.js        11.83 KiB  444ms
```

### 根因
1. **`PetCat.svelte` 用了 `client:load`**（`Layout.astro` 第 235 行）：像素小猫只是装饰，却在首屏就 hydration。它依赖的 Svelte runtime + render 模块全部进入关键路径。
2. **Pagefind、PhotoSwipe、Swup 全套插件** 都在初始导航时下载执行，尽管首屏用不到。

### 改动方案
1. **PetCat 降级为 `client:visible` 或 `client:lazy`**：小猫在视口底部/角落，改为 `client:visible` 即可推迟到接近滚动到时才 hydration，把它的 3.15KB + Svelte render 11.83KB 移出首屏关键链。
2. **Swup 插件瘦身**：报告显示 6 个 Swup 插件每个 1.3~1.4s 串行下载（`SwupPreloadPlugin`、`SwupScrollPlugin`、`SwupHeadPlugin`、`SwupScriptsPlugin`、`SwupA11yPlugin`、`Swup` 主包 8.25KB）。确认 `astro.config.mjs` 中 `swup` 集成配置，关闭非必要的插件（如 `SwupA11yPlugin`、按需关闭 `preload` 减少悬停预取）。
3. **PhotoSwipe / Pagefind 确认懒加载**：
   - PhotoSwipe：`Layout.astro` 第 621 行 `let pswp = import("photoswipe")` 已是动态导入，但 `photoswipe.esm` 仍出现在初始网络树——确认 `createPhotoSwipe()` 是否在 setup 时立刻执行了 `lightbox.init()`。应改为只在用户首次点击图片时才 `init()`。
   - Pagefind：`Navbar.astro` 里是动态 `import()`，但报告显示它在关键链。确认调用时机，避免在首屏触发。

### 验证
- 重新看「网络依赖关系树」，关键链上应只剩：HTML → 关键 CSS → 首屏 JS。

---

## 三、预连接候选项 —— 节省 ~300ms（P1）

### 报告现象
- 预连接候选：`https://events.vercount.one`（预计省 300ms）。
- 当前**未预连接任何源**。

### 根因
`Layout.astro` 第 242 行有 `<script defer src="https://events.vercount.one/js">`（Vercount 统计），但没有 `preconnect`，浏览器要先 DNS + TCP + TLS 才能发起请求。

### 改动方案
在 `Layout.astro` 的 `<head>` 里为统计域名加 `preconnect` 提示：

```html
<link rel="preconnect" href="https://events.vercount.one" crossorigin>
<link rel="preconnect" href="https://analytics.hxcn.dev" crossorigin>
```

（`crossorigin` 对跨域脚本/CDN 是必要的，否则 preconnect 的 TLS 会话无法复用。）

> 注意：报告建议最多 4 个。目前只需 2 个统计域名即可，不要把友链图床也加进去。

### 验证
- 该「预连接候选项」项消失，LCP 上统计脚本的启动不再拖慢首屏。

---

## 四、图片传送优化 —— 省 45.8 KiB（P1）

### 报告现象
`/_astro/topImg…Z19Esw2.webp`（60.5 KiB）可再压缩 45.8 KiB（约 76% 冗余）。

### 根因
`src/assets/images/topImg.webp` 源文件 `338 KB`（见 assets 目录）。`MainGridLayout.astro` 第 69 行：

```astro
width={1920} height={1080} widths={[640, 960, 1280, 1920]} sizes="100vw"
```

它生成的最大档 1920w 依然偏大，且 `object-cover` 在首屏高度只有 `BANNER_HEIGHT_HOME`（65vh），横向 banner 实际展示宽度远小于 1920。同时 `decoding="async"` + `fetchpriority="high"` 的 eager 加载，若压缩率不够就是纯浪费带宽。

### 改动方案
1. **提高压缩因子**：在 `astro.config.mjs` 配置 `image` 的默认 `quality`，或在源图生成时用更激进的 webp 质量（如 quality 70-75）。首屏是 LCP 图，带宽越小 LCP 越快。
2. **缩小最大档位**：banner 是 `sizes="100vw"`，但对 1080p 以下设备 1920w 明显过剩。把 `widths` 改为 `[640, 960, 1280, 1600]`，并同步 `width={1600}`。
3. **源图降分辨率**：直接处理 `topImg.webp` 源文件，1080p 的横图 banner 上限 1600px 足够，省下的源文件体积会传导到所有生成的响应式档位。

### 验证
- 重新生成后确认 LCP 图传输体积从 60.5 → ~15 KiB 以下。

---

## 五、旧版 JavaScript —— 省 10.5 KiB（P3，仅第三方）

### 报告现象
`static.cloudflareinsights.com/beacon.min.js`（10.5 KiB）使用了 `Array.prototype.at`、`findLast`、`includes` 等，被判定为「可为现代浏览器省掉」。

### 结论
这是 **Cloudflare 官方统计脚本**（`/beacon.min.js`），不是本项目打包产物，**无法通过改构建配置消除**。属于第三方维护，忽略即可。若想彻底消除，可在 Cloudflare 后台关闭 Web Analytics，或用不转译现代特性的统计替代（如自托管 Umami）。

> 本项目自身的产物没有出现在此列表中——说明构建已正确输出 ES2017+（Astro/Vite 默认 baseline），无需额外处理。这条**不需要改动**。

---

## 六、缓存生命周期 —— 省 8 KiB（P2）

### 报告现象
| 请求 | 当前 TTL | 体积 |
|---|---|---|
| `static.cloudflareinsights.com/beacon.min.js` | 1 天 | 10 KiB |
| `analytics.hxcn.dev/script.js` | 1 分钟 | 3 KiB |
| `events.vercount.one/js` | 1 天 | 2 KiB |

### 根因
- 三个都是**第三方脚本**，TTL 由对方服务器返回，本项目改不了。`vercel.json` 已经给 `/_astro/*` 配了 `immutable` 一年缓存，本地资源这块已达标。

### 改动方案
- **非本项目的，无需改动**。
- 若 Umami 支持自托管 + 自定义 `Cache-Control`，可把 `analytics.hxcn.dev` 的 `script.js` TTL 从 1 分钟提到 1 天以上（该脚本为版本化静态文件）。这是唯一可操作的项，但收益很小（3 KiB），**优先级低**。

---

## 七、强制自动重排 —— 7ms + 3ms + 59ms（P1）

### 报告现象
```
/_astro/Layout.astro…oJT9AsOR.js:9:5176   7ms
/_astro/Layout.astro…oJT9AsOR.js:9:4359   3ms
[未归因]                                  59ms
```

### 根因（对应源码）
1. `Layout.astro` 第 207-210 行（内联 theme 脚本）：
   ```js
   let offset = Math.floor(window.innerHeight * (BANNER_HEIGHT_EXTEND / 100));
   document.documentElement.style.setProperty('--banner-height-extend', `${offset}px`);
   ```
   在 `<head>` 中同步读取 `window.innerHeight`（触发布局读取）。
2. `Layout.astro` 第 607-612 行 `window.onresize`：`Math.floor(window.innerHeight * …)` 后写 CSS 变量，resize 高频时读写交替。
3. `initCustomScrollbar()`（第 375 行）大量 `document.querySelector` + OverlayScrollbars 初始化，以及在 `swup content:replace` 时反复执行（第 493 行）。

### 改动方案
1. **banner-height 计算避免强制同步布局**：读取 `window.innerHeight` 本身会强制布局。把该脚本改为「先读、再统一写」，并只在窗口实际尺寸变化时触发；用 `requestAnimationFrame` 合并多次 resize：
   ```js
   window.addEventListener('resize', () => {
     requestAnimationFrame(() => {
       const offset = Math.floor(window.innerHeight * (BANNER_HEIGHT_EXTEND / 100));
       document.documentElement.style.setProperty('--banner-height-extend', `${offset - offset % 4}px`);
     });
   }, { passive: true });
   ```
2. **OverlayScrollbars 初始化缓存 DOM 查询**：`initCustomScrollbar` 里 `querySelector('body')` 等查询在每次 `content:replace` 都跑。可改为缓存 body 引用，仅新插入的 `.katex-display` 需要重新查询。
3. **明确读写分离**：所有「读几何 → 写样式」的代码（scrollFunction 第 560 行读 `window.innerHeight`、onScroll 等）确认都用 rAF 节流（第 597-604 行已有），保持即可。

### 验证
- 重新跑 Lighthouse，观察「强制自动重排」项从 7ms+3ms+59ms 显著下降。

---

## 八、落地顺序建议（建议一次性合并）

| 批次 | 改动 | 对应章节 |
|---|---|---|
| 第 1 批（收益最大，风险低） | PetCat 改 `client:visible`；preconnect 两个统计域；Roboto 去掉 700 | 二、三、一 |
| 第 2 批 | KaTeX CSS 按需；banner 图 quality/档位调整 | 一、四 |
| 第 3 批 | banner-height 读写分离 + resize rAF；Swup 插件瘦身；PhotoSwipe/Pagefind 确认懒加载 | 七、二 |
| 评估项 | 统计脚本 TTL（第三方，收益小） | 六 |
| 不处理 | Cloudflare beacon legacy JS（第三方） | 五 |

---

## 风险与回滚
- **PetCat `client:visible`**：小猫在移动端本来就是 `hidden md:block`，桌面端在角落，改成 visible 几乎无感知。若担心首屏不见，可回退为 `client:load`。
- **Roboto 去 700**：全站搜索确认无 `font-bold` 使用 `Roboto` 700 的关键场景（Tailwind 默认 `font-bold` 会 fallback 到 sans-serif 栈里的下一个字体）。若有页面依赖，保留 500 即可。
- **KaTeX CSS 按需**：务必在含公式的文章页验证公式仍正确渲染，否则出现「公式无样式」回归。若无法干净拆分，可保留全局引入（收益次之）。
- **图片质量下调**：属于主观项，banner 是背景装饰图，quality 70 视觉损失可忽略；若在意，可单独对 topImg 用比全局更高的 quality。

---

## 预估结果
- 解决 1+2+3+4：LCP 预计从当前（约 1.8s 关键链 + 880ms 阻塞）显著缩短，评分可上 90+。
- 叠加 7（TBT 下降）：分数可稳定在 95+。
- 6、5 为第三方项，不影响本项目可控制的上限。

*文档结束*