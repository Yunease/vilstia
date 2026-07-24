# `astro check` 剩余问题清单

> 由 `pnpm astro check` 报告，**22 errors + 9 hints**（2026-07-24 状态）。
> 与 SEO 任务无关；不阻塞 `pnpm build`（构建已通过）。`pnpm dev` 也不受影响。
>
> Heatmap 命名冲突（ts2440）已在本次提交修复：把 `src/components/Heatmap.astro` 改名为 `PostHeatmap.astro`，并把 page 里的 import 同步改名 — 原因疑似 TS 把同文件里的 JSX `<Heatmap />` 当作"局部声明"与 import 冲突。

---

## 总览

| 类别 | 数量 | 严重度 | 修复方式 |
|---|---|---|---|
| Page\<\> 类型不匹配 | 7 | low | 给子组件的 props 用 `Omit<Page<...>, ...>` 或者展开成 `data + url` |
| BlogStats 字段访问 | 2 | low | 用类型守卫把 spec post 排除，或在 prop 上加类型断言 |
| Svelte `client:only` prop | 2 | low | 在 Svelte 组件 props type 里加 `client:only?: string` |
| i18n 缺 `friends` key | 8 | low | 8 个语言文件各加一行 `[I18nKey.friends]: "..."` |
| DOM `.style` 类型 | 2 | low | `querySelector` 返回类型强转 `HTMLElement` |
| archive.astro PostForList[] | 1 | low | `ArchivePanel` 组件 props type 修正 |

---

## 1. Page\<\> 类型不匹配（7 errors）

**问题**：`paginate()` 返回的 `Page<T>` 包含 `start / end / total / size / url.prev / url.next`，但子组件 `*Page.astro` 的 `Props.page` 类型签名只取了 `data` 和 `url`，缺其他字段。Astro 5 推断的 `Page<T>` 在传递时会"精确"匹配，导致 url.prev `string | undefined` vs `string | null` 不兼容。

| 文件 | 行 | 报错 |
|---|---|---|
| `src/components/AnthologyPage.astro` | 79:3 | `Page<>` 缺 `start, end, total, size` |
| `src/components/DreamPage.astro` | 64:3 | 同上 |
| `src/components/GalleryPage.astro` | 83:3 | 同上 |
| `src/components/RantPage.astro` | 313:3 | 同上 |
| `src/pages/anthology/[...page].astro` | 16:17 | url.prev 类型不兼容 |
| `src/pages/dream/[...page].astro` | 16:13 | 同上 |
| `src/pages/rant/[...page].astro` | 18:12 | 同上 |

**修法示例**（取 AnthologyPage 为例）：

```ts
// 旧
interface Props {
    page: Page<any>;   // 实际上 Props 推断成更严格的 Page<>
}
const { page } = Astro.props;
// 用到 page.start, page.end 等

// 新
interface Props {
    page: {
        data: any[];
        url: { prev?: string; next?: string };
        start: number;
        end: number;
        total: number;
        size: number;
    };
}
```

或更简洁 — 用 `AstroProps<typeof getStaticPaths>` 推断。

---

## 2. BlogStats 字段访问（2 errors）

**问题**：`BlogStats.astro` 假设所有 post 都有 `tags` / `draft` 字段，但 `getCollection("posts", ...)` 和 `getCollection("spec", ...)` 的 schema 不一样，spec collection 没 `tags` 也没 `draft`。

| 文件 | 行 | 报错 |
|---|---|---|
| `src/components/BlogStats.astro` | 18:44 | `Property 'draft' does not exist on type spec-post` |
| `src/components/BlogStats.astro` | 26:30 | `Property 'tags' does not exist on type spec-post` |

**修法**：要么 spec collection 的 schema 补这两个字段（`z.boolean().optional()`），要么在 BlogStats 里用 `'tags' in post && ...` 做类型守卫。

---

## 3. Svelte `client:only` prop（2 errors）

**问题**：Astro 类型认为 `client:only` 不在 Svelte 组件的 `Props` 里。

| 文件 | 行 | 报错 |
|---|---|---|
| `src/components/Navbar.astro` | 86:14 | `client:only` 不在组件 props 类型 |
| `src/pages/ai-world.astro` | 7:6 | 同上 |

**修法**：找到对应的 Svelte 组件，在 `<script lang="ts">` 里：

```ts
interface Props {
    // 原有 props...
    "client:only"?: string;
}
```

或更通用 — 不用 `client:only`，改用 `client:load` / `client:visible`。

---

## 4. i18n 缺 `friends` key（8 errors）

**问题**：`I18nKey.friends` 在 `I18nKey.ts` 加了，但 8 个非主要语言文件没补这个 key。

| 文件 | 报错 |
|---|---|
| `src/i18n/languages/es.ts` | 缺 `[I18nKey.friends]` |
| `src/i18n/languages/id.ts` | 同上 |
| `src/i18n/languages/ja.ts` | 同上 |
| `src/i18n/languages/ko.ts` | 同上 |
| `src/i18n/languages/th.ts` | 同上 |
| `src/i18n/languages/tr.ts` | 同上 |
| `src/i18n/languages/vi.ts` | 同上 |
| `src/i18n/languages/zh_TW.ts` | 同上 |

**修法**：每个文件按现有 key 风格补一行。比如 `es.ts`：

```ts
export default {
    home: "Inicio",
    // ... 其它 key ...
    [I18nKey.friends]: "Amigos",   // ← 加这行
    license: "Licencia",
} as const;
```

参考 `src/i18n/languages/en.ts` 和 `zh_CN.ts` 里的 `friends` 翻译。

---

## 5. DOM `.style` 类型（2 errors）

**问题**：`document.querySelector(...)` 返回 `Element` 而不是 `HTMLElement`，没有 `.style` 属性。

| 文件 | 行 | 报错 |
|---|---|---|
| `src/pages/[...page].astro` | 153:36 | `Property 'style' does not exist on type 'Element'` |
| `src/pages/[...page].astro` | 160:36 | 同上 |

**修法**：在 `<script>` 块里：

```ts
// 旧
const pagination = document.querySelector('.pagination-wrapper');
pagination.style.display = 'none';   // ← 报错

// 新
const pagination = document.querySelector<HTMLElement>('.pagination-wrapper');
pagination!.style.display = 'none';
```

或加 `as HTMLElement` 断言。

---

## 6. archive.astro PostForList[] 类型（1 error）

**问题**：`getSortedPostsList()` 返回 `PostForList[]`（slug + data 简版），但 `ArchivePanel.svelte` 的 props 期望完整 `Post[]`（含 `id` / `body` / `render()` 等）。

| 文件 | 行 | 报错 |
|---|---|---|
| `src/pages/archive.astro` | 12:19 | `PostForList[]` 不能赋给 `Post[]` |

**修法**：把 `ArchivePanel` 组件的 props type 从 `Post[]` 改成 `PostForList[]`，或让 `getSortedPostsList()` 返回完整 `Post[]`（去掉 `delete post.body` 那行）。

---

## 验证命令

修复后跑：

```bash
pnpm astro check
```

预期结果：`0 errors, 0 warnings`（hints 数会变，看实际）。

构建不受影响：

```bash
pnpm build   # 仍然通过
```
