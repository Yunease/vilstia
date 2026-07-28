# CSS 加载机制与一次布局破损复盘

> 2026-07-28 性能优化任务中遇到的事故复盘。结论:`src/styles/*.css` 的全部 CSS 实际通过 `ImageWrapper.astro` 的 `import.meta.glob` **副作用**加载,不是显式 import。这层脆弱依赖是导致"回退才能恢复"的根因。
>
> 关联 memory:`project_css_loading.md`

---

## 1. 现象

在一次本地性能优化(13 项 P0+P1)之后,用户报告:

- 导航栏所有 dropdown 全部展开
- 文字被挤压
- Heatmap 显示异常

`pnpm dev` 和 `pnpm preview`(本地构建)都坏,但用户已有的 Vercel 部署版本正常。

---

## 2. 我最初(错误)的诊断

回退到 5 个 commit 之前后页面恢复,所以破损确认与我的改动有关。第一轮诊断我做了:

```bash
grep -rn "main.css\|transition.css" src/
# 只匹配到 message-board.astro: import "../styles/twikoo.css"
```

`grep` 的结果让我判断:`src/styles/main.css` 没有任何 source file import,而 HTML 里大量使用 `.card-base`、`.float-panel-closed`、`.btn-plain`、`.onload-animation` 等类,所以是 main.css 没被加载 → 自定义类没有 CSS 规则 → 布局破。

我当时**没意识到这是错的**,还据此提了一个修法(给 `Layout.astro` 加 `import "../styles/main.css"`)。用户立刻否决,要求整体回退。

---

## 3. 真正的根因

回退之后我重新分析。关键证据来自一次 Vite 调试日志(`DEBUG=vite:* npx astro dev`):

```
14:38:15.664Z vite:transform [193ms] /src/components/misc/ImageWrapper.astro
14:38:15.646Z vite:resolve ../../styles/main.css -> D:/Astro/Virstia/src/styles/main.css
14:38:15.646Z vite:resolve ../../styles/expressive-code.css -> ...
14:38:15.646Z vite:resolve ../../styles/transition.css -> ...
... (transition / markdown / scrollbar / photoswipe / twikoo / variables.styl / markdown-extend.styl 全部齐了)
```

路径是 `../../styles/main.css` —— 来自深度 2 的文件(即 `src/components/<sub>/<file>`),而此时只有 `ImageWrapper.astro` 在被 transform。看 transform 之后的产物:

```js
// 由 Vite 注入到 ImageWrapper.astro 客户端代码里
import("/src/styles/main.css")
import("/src/styles/transition.css")
import("/src/styles/markdown.css")
import("/src/styles/scrollbar.css")
import("/src/styles/photoswipe.css")
import("/src/styles/expressive-code.css")
import("/src/styles/twikoo.css")
import("/src/styles/variables.styl")
import("/src/styles/markdown-extend.styl")
```

`ImageWrapper.astro:51` 写的是:

```ts
const files = import.meta.glob<ImageMetadata>("../../**", { import: "default" });
```

这是给图片用的动态加载。但 Vite 的 `import.meta.glob` 在**编译时**展开成对**所有匹配文件**的 `import()` 调用。`../../**` 从 `src/components/misc/` 出发,实际匹配整个 `src/` 下的全部文件 —— 包括 CSS。TypeScript 的 `<ImageMetadata>` 泛型只是类型提示,**不会运行时过滤**。

CSS 文件被作为 side-effect 模块导入,触发 Vite 注入 `<style data-vite-dev-id="...">` + `<script type="module" src="...">` 标签到 HTML head。

### 3.1 验证

把 `import.meta.glob` 那行注释掉(其他代码不动),`pnpm dev` 重新加载:

| 状态 | `<style data-vite-dev-id="D:/Astro/Virstia/src/styles/...">` 数量 | `src="/src/styles/*.css"` script 数量 |
|---|---|---|
| 有 `import.meta.glob` | 9 | 9 |
| 注释掉 `import.meta.glob` | **0** | **0** |

恢复 glob,数字回到 9 / 9。结论:这是项目里**唯一**的全局 CSS 加载器。

---

## 4. 显式 import 清单(对比)

`src/styles/*.css` 里**只有 `twikoo.css` 被显式 import**:

| 文件 | 显式 import 位置 |
|---|---|
| `twikoo.css` | `src/pages/message-board.astro:3` |
| `main.css` | ❌(靠 glob 副作用) |
| `transition.css` | ❌(靠 glob 副作用) |
| `markdown.css` | ❌(靠 glob 副作用) |
| `scrollbar.css` | ❌(靠 glob 副作用) |
| `photoswipe.css` | ❌(靠 glob 副作用) |
| `expressive-code.css` | ❌(靠 glob 副作用) |
| `variables.styl` | ❌(靠 glob 副作用) |
| `markdown-extend.styl` | ❌(靠 glob 副作用) |

所以"我之前 grep 没找到 = main.css 没被加载"的推理**前提是对的,但结论错** —— main.css 是被加载的,只是 source-level grep 看不到,因为 `import.meta.glob` 在编译时展开。

---

## 5. 事故时间线

1. **原始状态**:`ImageWrapper.astro` 的 glob = `"../../**"`,所有 CSS 被正常加载,页面正常。
2. **性能优化**:我做了 13 项改动,其中包括调整 `ImageWrapper.astro` 的 glob 范围(为了减少 Vite 扫描的目录大小、提升 dev 启动速度)。
3. **glob 范围改了之后**:`src/styles/*.css` 不再被该 glob 匹配,Vite 不为它们生成 `import()` 调用,全部 CSS 从 HTML 消失。
4. **页面破损**:导航 dropdown 全展开、文字挤压、heatmap 异常 —— 都是因为 `.card-base` / `.float-panel-closed` / `.btn-plain` / `.onload-animation` 等类没有 CSS 规则。
5. **回退**:把全部改动撤掉,glob 恢复,`src/styles/*.css` 重新被副作用加载,页面恢复。

---

## 6. 教训

### 6.1 项目本身的脆弱性

这是一个**坏味道**:关键 CSS 全部依靠一个图片加载器的副作用来加载,不是显式 import。后果:

- 改 `ImageWrapper.astro` 的 glob / 替换图片加载方案 / 升级 Vite 版本改 `import.meta.glob` 行为,都可能让整套自定义 CSS 消失
- 任何 `.astro` 文件里写了类似的 `import.meta.glob("../../**", ...)` 都会复现这个陷阱
- 新人接手不容易看出来 —— grep 找不到任何 `import "main.css"`

### 6.2 诊断方法上的错误

我前两轮诊断时:

- 只看 source-level import,没看 Vite 编译后产物
- 没看 dev server 的 module graph
- 看到 HTML 里 CSS 缺失就直接推论"main.css 没被加载",没去验证 HTML 的 `<style data-vite-dev-id>` 列表 —— 那一列其实很说明问题,如果当初对比了 broken vs working 的 `<style>` 数量(13 vs 36+),就能更快定位到"加载机制出问题"而不是"某个文件没加载"

### 6.3 反馈优先级

用户报告"页面破了"时,我应该先 git checkout + clean 验证是否能恢复(已经做了),而不是在恢复之前继续坚持自己的诊断。**用户已经失去耐心时,增量修复 vs 整体回退,优先回退**。这一点 memory 里已存(`feedback_revert_first.md`)。

---

## 7. 建议(待用户决定再动)

按代价从小到大:

### 方案 A:不动,加注释

在 `ImageWrapper.astro:51` 上方加一段显眼注释,说明这个 glob 同时是项目的 CSS 加载器,不要改范围:

```ts
// ⚠️ 警告:这个 glob 同时是项目自定义 CSS 的隐式加载器。
// 不要把它改成更深/更浅的路径,否则 src/styles/*.css 会从 HTML 消失,
// 导致 .card-base / .float-panel-closed / .btn-plain / .onload-animation
// 全部失效,布局破损。详见 docs/css-loading-mechanism.md。
const files = import.meta.glob<ImageMetadata>("../../**", { import: "default" });
```

代价:0 风险,只是文档化脆弱性。

### 方案 B:显式 import CSS + 收紧 glob

1. 在 `Layout.astro` 顶部加 `import "../styles/main.css"` 等(把 9 个 CSS 文件全显式 import)
2. 验证页面无变化后,再改 `ImageWrapper.astro` 的 glob 为更精确的(比如 `["../../assets/**/*.{png,jpg,webp,avif,svg}"]`),让性能优化生效

代价:中等,需要测试。但这是**正确的**修法 —— 把"图片加载"和"CSS 加载"解耦。

### 方案 C:什么都不动

接受脆弱性,只在 memory 里记录(已经做了)。代价:未来同样的坑还会绊到。

---

## 8. 关联资料

- memory:`project_css_loading.md` (本次更新后的结论)
- memory:`feedback_revert_first.md` (回退优先的教训)
- 相关源码:
  - `src/components/misc/ImageWrapper.astro:51` —— 隐式 CSS 加载器
  - `src/styles/*.css` —— 自定义类(`.card-base`、`.float-panel-closed`、`.btn-plain`、`.onload-animation` 等)
  - `src/layouts/Layout.astro:211-214` —— 全局变量 `<style>` 块(含 `--bannerOffset` 等 CSS 变量)
  - `src/layouts/Layout.astro:282` —— `import 'overlayscrollbars/overlayscrollbars.css'` (显式)
  - `src/layouts/Layout.astro:24` —— `import "katex/dist/katex.css"` (显式)
  - `src/pages/message-board.astro:3` —— `import "../styles/twikoo.css"` (显式)
