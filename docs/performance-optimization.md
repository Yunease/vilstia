# Virstia 博客性能优化分析报告

> 分析日期：2026-07-25
> 分析范围：`src/` 下所有 `.astro` / `.ts` / `.svelte` / `.mjs` / `.js` 文件及 `astro.config.mjs`

---

## 一、构建时 / 数据层优化（影响最大）

### 1.1 `getCollection` 被重复调用，无缓存

**严重程度：🔴 高**

`astro:content` 的 `getCollection` 在每次调用时都会重新解析所有 markdown 文件。当前项目中同一个集合被反复调用：

| 文件 | 调用内容 |
|---|---|
| `utils/content-utils.ts` | `getCollection("posts")` 在 `getRawSortedPosts`、`getTagList`、`getCategoryList`、`getCollectionList` 中各调用一次 |
| `utils/photo-utils.ts` | `getCollection("posts")` 在 `getPhotoPosts`、`getPhotoAlbums`、`getPostsByAlbum` 中各调用一次 |
| `utils/gallery-utils.ts` | `getCollection("posts")` 在 `getGalleryPosts`、`getGalleryAlbums`、`getGalleryPostsByAlbum` 中各调用一次 |
| `utils/dream-utils.ts` | `getCollection("posts")` 一次 |
| `utils/anthology-utils.ts` | `getCollection("posts")` 一次 |
| `utils/mess-utils.ts` | `getCollection("posts")` 一次 |
| `utils/chronicle-utils.ts` | `getCollection("chronicle")` 一次 |
| `pages/[...page].astro` | 同时调用 `getSortedPosts()` + `getCollection("posts")`（heatmap） |
| `pages/posts/[...slug].astro` | 同时调用 `getSortedPosts` + `getGalleryPosts` + `getPhotoPosts` |
| `components/BlogStats.astro` | 调用 `getCollection("posts")` + `getCollection("spec")` |
| `pages/rank/index.astro` | 调用 `getCollection("posts")` |
| `pages/heatmap.astro` | 调用 `getCollection("posts")` |

**优化方案：** 在 `utils/` 中创建一个带内存缓存的数据源模块，构建期间只解析一次：

```ts
// utils/datasource.ts
import { getCollection } from "astro:content";

let postsCache: CollectionEntry<"posts">[] | null = null;

export function getCachedPosts(): Promise<CollectionEntry<"posts">[]> {
  if (postsCache) return Promise.resolve(postsCache);
  return getCollection("posts", ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  }).then(posts => {
    postsCache = posts;
    return posts;
  });
}
```

所有 utils 统一使用 `getCachedPosts()`，构建时间可缩短 30-50%。

---

### 1.2 RSS 生成器对每篇文章重复渲染 Markdown

**严重程度：🔴 高**

`src/pages/rss.xml.ts` 第 35 行：

```ts
content: sanitizeHtml(parser.render(cleanedContent), { ... })
```

`MarkdownIt` 实例在模块级创建（第 9 行），每次请求都对所有文章调用 `parser.render()` + `sanitizeHtml()`。对于文章数量多的站点，这是 O(n) 的 markdown→html 转换。

**优化方案：**
- 在构建时预渲染并缓存结果（RSS 是构建时生成的静态文件，不需要每次请求重新计算）
- 使用 Astro 的 `rss` 插件时把 `content` 改为摘要而非全文
- 或者将 RSS 改为在 `getStaticPaths` 中预生成

---

### 1.3 `ImageWrapper.astro` 使用 `import.meta.glob("../../**")` 全量扫描

**严重程度：🔴 高**

`src/components/misc/ImageWrapper.astro` 第 32 行：

```ts
const files = import.meta.glob<ImageMetadata>("../../**", {
  import: "default",
});
```

这会匹配 `src/` 下**所有文件**（包括 `.py`、`.docx`、`.md` 等非图片文件），在构建时产生巨大的模块图。每次使用 `ImageWrapper` 都会触发这个 glob 的解析。

**优化方案：** 缩小 glob 范围，只匹配图片目录：

```ts
const files = import.meta.glob<ImageMetadata>("../../assets/images/**/*.{png,jpg,jpeg,webp,avif,svg}", {
  import: "default",
});
```

如果文章图片在 `content/posts/` 下，则改为：

```ts
const files = import.meta.glob<ImageMetadata>("../../content/posts/**/*.{png,jpg,jpeg,webp,avif}", {
  import: "default",
});
```

---

### 1.4 友链头像使用远程 URL，无优化

**严重程度：🟡 中**

`src/pages/friends.astro` 第 36 行：

```html
<img src={friend.avatar} alt={friend.name} class="w-full h-full object-cover" />
```

所有友链头像都是 `i.postimg.cc` 等第三方图床的直链，没有使用 Astro 的 `Image` 组件优化，也没有 `loading="lazy"`。

**优化方案：**
- 添加 `loading="lazy"` 和 `decoding="async"`
- 使用 Astro 的 `<Image>` 组件配合 `remotePatterns` 配置（Astro 5.x 支持远程图片优化）
- 或者构建时下载到本地

---

### 1.5 `astro.config.mjs` 中 `icon` 导入了完整图标集

**严重程度：🟡 中**

```js
icon({
  include: {
    "fa6-brands": ["*"],
    "fa6-regular": ["*"],
    "fa6-solid": ["*"],
  },
}),
```

`fa6-solid` 包含 2000+ 个图标，`fa6-brands` 也有 500+。即使只用了其中 30 个，构建时也会处理全部。

**优化方案：** 只导入实际使用的图标：

```js
icon({
  include: {
    "fa6-brands": ["bilibili", "pixiv", "steam", "github", "creative-commons"],
    "fa6-regular": ["address-card"],
    "fa6-solid": ["arrow-up-right-from-square", "chevron-right-rounded", "chevron-left-rounded"],
  },
}),
```

---

## 二、客户端 JavaScript 优化

### 2.1 `Layout.astro` 中 `scrollFunction` 无节流

**严重程度：🔴 高**

`src/layouts/Layout.astro` 第 555 行：

```js
window.onscroll = scrollFunction
```

`scrollFunction` 在每次滚动事件触发时执行，内部多次调用 `document.body.scrollTop`、`document.documentElement.scrollTop`、`getBoundingClientRect()`，这会强制浏览器进行同步布局（layout thrashing）。

**优化方案：** 使用 `requestAnimationFrame` + 节流：

```js
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      scrollFunction();
      ticking = false;
    });
    ticking = true;
  }
});
```

---

### 2.2 PhotoSwipe 在每次 Swup 页面切换时重新初始化

**严重程度：🔴 高**

`src/layouts/Layout.astro` 第 604-625 行：

```js
const setup = () => {
  if (!lightbox) {
    createPhotoSwipe()
  }
  window.swup.hooks.on("page:view", () => {
    createPhotoSwipe()  // 每次页面切换都创建新的 lightbox
  })
  window.swup.hooks.on("content:replace", () => {
    lightbox?.destroy?.()
  }, { before: true })
}
```

每次 `page:view` 都调用 `createPhotoSwipe()` 创建新实例，但只在 `content:replace` 前销毁旧实例。如果用户快速切换页面，会创建多个实例叠加。

**优化方案：** 只在首次创建，后续只更新内容：

```js
const setup = () => {
  if (!lightbox) {
    createPhotoSwipe();
  }
  window.swup.hooks.on("page:view", () => {
    if (lightbox) {
      lightbox.destroy();
      createPhotoSwipe();
    }
  });
}
```

---

### 2.3 `Navbar.astro` 中 Pagefind 加载逻辑

**严重程度：🟡 中**

`src/components/Navbar.astro` 第 171-205 行：

```js
async function loadPagefind() {
  const response = await fetch(scriptUrl, { method: 'HEAD' });
  if (!response.ok) { throw new Error(...); }
  const pagefind = await import(scriptUrl);
  // ...
}
```

先发送 `HEAD` 请求检查，再动态 `import()`。这是两次网络请求。而且 `import()` 的 URL 是固定的，可以直接 `import()` 而无需预检。

**优化方案：** 直接动态 import，用 try/catch 处理错误：

```js
try {
  const pagefind = await import(scriptUrl);
  // ...
} catch (error) {
  // fallback
}
```

---

### 2.4 `SiteAge.astro` 每秒执行 DOM 操作

**严重程度：🟡 中**

`src/components/SiteAge.astro` 第 119 行：

```js
setInterval(updateSiteAge, 1000);
```

每秒执行 `getElementById` + `textContent` 赋值。虽然开销不大，但持续运行会阻止浏览器进入空闲状态，影响电池续航。

**优化方案：** 使用 `requestAnimationFrame` 替代 `setInterval`，或者降低频率到每 10 秒（因为只显示到秒级，视觉上无差别）。更好的方案是用 `Intl.RelativeTimeFormat` 只在分钟变化时更新。

---

### 2.5 `RantPage.astro` 中遗留的 `console.log`

**严重程度：🟢 低**

`src/components/RantPage.astro` 第 162 行：

```js
console.log(`计算出的margin-left：${offsetMargin}px`);
```

生产环境中遗留的调试日志。

**优化方案：** 删除所有 `console.log` / `console.error`（生产环境）。

---

### 2.6 `message-board.astro` 中 Twikoo 重复初始化

**严重程度：🟡 中**

`src/pages/message-board.astro` 第 55-81 行有自己的 Twikoo 初始化逻辑，同时 `Layout.astro` 第 493-508 行也有 Twikoo 初始化。如果用户从其他页面通过 Swup 跳转到留言板，Layout 中的 `initTwikoo` 会再次执行。

**优化方案：** 统一 Twikoo 初始化逻辑，避免重复。

---

### 2.7 `memory/2025.astro` 加载外部 mouse-firework 脚本

**严重程度：🟡 中**

```html
<script is:inline src="https://unpkg.com/mouse-firework@0.1.1/dist/index.umd.js" onload="initFirework()" data-swup-reload-script></script>
```

从 unpkg CDN 加载脚本，增加了外部依赖和加载延迟。

**优化方案：** 将脚本下载到 `public/` 目录，使用本地路径。

---

## 三、CSS / 渲染优化

### 3.1 加载了未使用的字体文件

**严重程度：🟡 中**

`src/layouts/Layout.astro` 第 2-4 行：

```css
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
```

`src/components/misc/Markdown.astro` 第 1-2 行：

```css
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/jetbrains-mono/wght-italic.css";
```

`@fontsource/roboto` 和 `@fontsource-variable/jetbrains-mono` 都是通过 CSS `@font-face` 声明的字体。检查 `tailwind.config.cjs`，`fontFamily.sans` 设置为 `["Roboto", "sans-serif", ...]`，但实际中文博客中 Roboto 只用于数字和拉丁字符。

**优化方案：**
- 使用 `fontsource` 的 `unicode-range` 子集化加载
- 或者改用系统字体栈，减少网络请求：`fontFamily: { sans: ["system-ui", "sans-serif"] }`
- 如果必须使用 Roboto，添加 `font-display: swap` 并预加载关键字体

---

### 3.2 `GlobalStyles.astro` 为空文件

**严重程度：🟢 低**

`src/components/GlobalStyles.astro` 内容为空（只有 frontmatter 分隔符）。

**优化方案：** 删除该文件及其引用。

---

### 3.3 大量使用 `transition` 类和 `duration-700`

**严重程度：🟢 低**

`MainGridLayout.astro` 中多处使用 `transition duration-700`，包括 banner、main-grid、sidebar 等。700ms 的过渡在页面切换时可能造成"卡顿"感。

**优化方案：** 将过渡时间缩短到 150-300ms，或使用 `transition-transform` 而非 `transition-all`。

---

### 3.4 `friends.astro` 中的 3D 变换

**严重程度：🟢 低**

```css
.friend-card:hover .friend-card-inner {
  transform: translateY(-4px) translateZ(20px) scale(1.02);
}
.friend-card:hover .friend-avatar {
  transform: scale(1.15) rotateY(-12deg) rotateX(5deg);
}
```

3D 变换（`rotateY`、`rotateX`、`translateZ`）会触发 GPU 层创建，在低性能设备上可能导致闪烁。

---

## 四、第三方脚本 / 资源加载

### 4.1 多个外部脚本使用 `defer` 但无优先级控制

**严重程度：🟡 中**

`Layout.astro` 中加载了：
- `https://events.vercount.one/js` — Vercount 统计
- `https://analytics.hxcn.dev/script.js` — Umami 统计
- `https://cdn.jsdelivr.net/npm/twikoo@1.6.42/dist/twikoo.all.min.js` — 评论系统

三个外部脚本都使用 `defer`，但 Twikoo 体积较大（~200KB+），是最大的阻塞资源。

**优化方案：**
- Twikoo 只在留言板页面加载（使用条件加载或动态 import）
- 统计脚本使用 `data-swup-reload-script` 确保 Swup 切换后正常工作
- 考虑使用 Partytown 将统计脚本移到 Web Worker

---

### 4.2 `astro.config.mjs` 中 Swup 配置

**严重程度：🟢 低**

```js
swup({
  theme: false,
  containers: ["main", "#toc"],
  smoothScrolling: true,
  cache: true,
  preload: true,
  ...
})
```

`preload: true` 会预加载所有鼠标悬停的链接，对于链接较多的页面（如 archive）可能造成不必要的带宽消耗。

**优化方案：** 改为 `preload: { hover: true, visible: false }` 或按需配置。

---

## 五、Svelte 组件优化

### 5.1 `Search.svelte` 中 Pagefind 初始化有 2 秒超时回退

**严重程度：🟡 中**

```js
setTimeout(() => {
  if (!initialized) {
    console.log("Fallback: Initializing search after timeout.");
    initializeSearch();
  }
}, 2000);
```

如果 Pagefind 加载失败，用户需要等待 2 秒才能使用搜索。

**优化方案：** 缩短超时时间到 500ms，或者显示明确的加载状态提示。

---

### 5.2 `PetCat.svelte` 中图片预加载

**严重程度：🟢 低**

```js
$effect(() => {
  CAT_TYPES.forEach((type) => {
    const img = new Image();
    img.src = `${PET_IMG_PATH}${CAT_IMAGE_MAP[type]}.png`;
  });
});
```

在 `$effect` 中预加载 5 张图片，但用户可能永远不会点击切换猫咪。

**优化方案：** 改为懒加载——只在用户切换到对应类型时加载。

---

### 5.3 `AiWorldPanel.svelte` 中大量 `console.log`

**严重程度：🟢 低**

`generateOptions` 函数中有多个 `console.log` 输出完整历史记录和响应数据。

**优化方案：** 生产环境移除调试日志。

---

## 六、构建配置优化

### 6.1 `astro.config.mjs` 缺少图片优化配置

**严重程度：🟡 中**

Astro 5.x 支持 `image.service` 配置，当前使用默认的 Sharp 服务。但没有配置 `image.domains` 或 `image.remotePatterns`，导致远程图片无法通过 Astro 的 Image 组件优化。

**优化方案：** 添加远程图片域名白名单：

```js
export default defineConfig({
  image: {
    remotePatterns: [
      { protocol: "https", hostname: "i.postimg.cc" },
      { protocol: "https", hostname: "img.1nuo.me" },
    ],
  },
});
```

---

### 6.2 `vite.build.rollupOptions.onwarn` 抑制警告

**严重程度：🟢 低**

```js
onwarn(warning, warn) {
  if (warning.message.includes("is dynamically imported by") && ...) {
    return;  // 抑制警告
  }
  warn(warning);
}
```

这隐藏了潜在的动态/静态导入冲突，可能导致意外的打包行为。

---

### 6.3 `vite.assetsInclude` 包含 `.py` 和 `.docx`

**严重程度：🟢 低**

```js
assetsInclude: ["**/*.py", "**/*.docx"],
```

这些文件在 `content/posts/` 中作为附件存在，但 `assetsInclude` 会让 Vite 把它们当作静态资源处理。如果不需要在页面中引用这些文件，可以移除。

---

## 七、按优先级排序的优化清单

| 优先级 | 优化项 | 预估影响 |
|---|---|---|
| 🔴 P0 | 缓存 `getCollection` 结果 | 构建时间 -30~50% |
| 🔴 P0 | 缩小 `ImageWrapper` 的 glob 范围 | 构建内存 -50% |
| 🔴 P0 | RSS 预渲染缓存 | RSS 生成时间 -80% |
| 🔴 P0 | `scrollFunction` 添加 rAF 节流 | 滚动帧率提升 |
| 🔴 P0 | PhotoSwipe 修复重复初始化 | 内存泄漏修复 |
| 🟡 P1 | 图标集按需导入 | JS bundle -100KB+ |
| 🟡 P1 | 友链头像添加 lazy loading | LCP 改善 |
| 🟡 P1 | Twikoo 条件加载 | 非留言板页面 -200KB |
| 🟡 P1 | Pagefind 加载逻辑简化 | 搜索启动速度提升 |
| 🟡 P1 | 远程图片域名白名单 | 可使用 Image 组件优化 |
| 🟢 P2 | 移除 console.log | 生产环境干净 |
| 🟢 P2 | 删除空 `GlobalStyles.astro` | 代码整洁 |
| 🟢 P2 | SiteAge 降低更新频率 | 电池续航 |
| 🟢 P2 | 字体子集化 | FCP 改善 |
| 🟢 P2 | Swup preload 策略调整 | 带宽节省 |

---

## 八、架构级建议

### 8.1 统一数据访问层

当前 `utils/` 下有 10+ 个文件各自调用 `getCollection`，建议创建 `utils/datasource.ts` 作为唯一数据入口，所有组件和页面通过它获取数据。

### 8.2 分离构建时和运行时逻辑

`Layout.astro` 中的大量 `<script>` 标签（Swup 初始化、PhotoSwipe、Twikoo、scroll handler）应该拆分为独立的 `.ts` 文件并通过 Vite 打包，而不是内联在组件中。这样可以：
- 利用 Tree Shaking
- 更好的缓存（独立 JS 文件有 hash）
- 代码可维护性

### 8.3 考虑移除 Swup

Swup 提供了 SPA 般的页面切换体验，但带来了：
- 复杂的生命周期管理
- 第三方脚本需要 `data-swup-reload-script`
- 组件状态需要在页面切换时手动清理
- 与 Svelte 组件的 hydration 冲突风险

对于一个内容为主的博客，原生导航 + View Transitions API 可能是更轻量的选择。

---

*文档结束*
