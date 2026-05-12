# Collection 文集功能工程文档

## 概述

为博客增加"文集（Collection）"功能，将相关文章组织为系列。文集信息展示在首页左侧栏，文章页底部提供文集内上下篇导航及完整文章列表下拉。

## 约束

- `collection` 为字符串字段，一篇文章只能属于一个文集
- 文集内文章按发布日期排序
- 无文集的文章不显示文集导航，不归入"未分类"
- 文集筛选复用现有 `/archive` 页面
- 底部文集导航为**额外增加**，不影响现有全局上/下一篇导航

---

## 一、数据层

### 1.1 Schema 变更

**文件：`src/content/config.ts`**

在 `posts` collection schema 中增加字段：

```typescript
collection: z.string().optional().nullable().default(""),
```

与 `category` 字段结构一致。

### 1.2 前端数据新增

**文件：`src/content.config.ts` 或 frontmatter 中**

```yaml
---
title: 示例文章
collection: 星之旅程
---
```

---

## 二、性能优化：合并遍历

### 2.1 现状问题

当前 `getTagList()` 和 `getCategoryList()` 各自独立调用 `getCollection("posts")` 并遍历全部文章。增加 collection 后若再独立遍历，将多一次冗余开销。

### 2.2 优化方案

**文件：`src/utils/content-utils.ts`**

新增一个合并函数 `getTaxonomyData()`，在**单次遍历**中同时计算 tag、category、collection 三项数据：

```typescript
interface TaxonomyData {
    tags: Tag[];
    categories: Category[];
    collections: Collection[];
}

export async function getTaxonomyData(): Promise<TaxonomyData> {
    const allBlogPosts = await getCollection("posts", ({ data }) => {
        return !data.draft || !import.meta.env.PROD;
    });

    const tagMap: { [key: string]: number } = {};
    const categoryMap: { [key: string]: number } = {};
    const collectionMap: { [key: string]: number } = {};

    for (const post of allBlogPosts) {
        if (EXCLUDED_TAGS.some(tag => post.data.tags.includes(tag))) continue;

        // Tags
        for (const tag of post.data.tags) {
            tagMap[tag] = (tagMap[tag] || 0) + 1;
        }

        // Category
        const cat = post.data.category || "未分类";
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;

        // Collection
        if (post.data.collection) {
            collectionMap[post.data.collection] = (collectionMap[post.data.collection] || 0) + 1;
        }
    }

    return {
        tags: Object.entries(tagMap).sort((a, b) => a[0].localeCompare(b[0])).map(([name, count]) => ({ name, count })),
        categories: /* 同现有逻辑 */,
        collections: Object.entries(collectionMap).sort((a, b) => a[0].localeCompare(b[0])).map(([name, count]) => ({ name, count })),
    };
}
```

保留原有 `getTagList()` 和 `getCategoryList()` 函数签名，内部改为调用 `getTaxonomyData()` 并取对应字段，保持向后兼容。新增 `getCollectionList()` 同理。

---

## 三、Sidebar 文集组件

### 3.1 新增组件

**文件：`src/components/widget/Collections.astro`**

结构与 `Categories.astro` 一致：
- 标题"文集"
- 列表项：文集名称 + 文章数量
- 点击跳转 `/archive/?collection=<encoded-name>`

### 3.2 侧栏布局调整

**文件：`src/components/widget/SideBar.astro`**

在 Categories 和 Tags 之间插入 Collections：

```astro
<Categories />
<Collections />   <!-- 新增 -->
<Tags />
```

---

## 四、Archive 页筛选

### 4.1 URL 格式

```
/archive/?collection=星之旅程
```

### 4.2 ArchivePanel 修改

**文件：`src/components/ArchivePanel.svelte`**

- 新增读取 `?collection=...` 查询参数
- 筛选逻辑：`post.data.collection === collection`
- 与现有 tag/category 筛选互斥（优先级：tag > category > collection，或三者独立筛选均可，需确认）

---

## 五、文章页文集导航

### 5.1 位置

在现有全局上/一篇导航**下方**，额外渲染文集导航区域。仅当文章设置了 `collection` 字段时显示。

### 5.2 导航结构

```
┌─────────────────────────────────────┐
│  文集：星之旅程                      │
│  ← 上一篇标题          下一篇标题 →  │
│           ▼ 展开全部                 │
│  ┌─────────────────────────────┐    │
│  │ 1. 第一篇文章标题            │    │
│  │ 2. 第二篇文章标题  ← 当前    │    │
│  │ 3. 第三篇文章标题            │    │
│  │ ...                        │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

- 上/下一篇：按发布时间排序后的相邻文章，首篇无上一篇，末篇无下一篇
- "展开全部"按钮：点击展开/收起该文集所有文章列表
- 当前文章在列表中高亮标记

### 5.3 实现

**文件：新建 `src/components/CollectionNav.astro`**

构建时逻辑：
1. 接收当前文章的 `collection` 字段值
2. 查询所有属于该文集的文章，按发布日期排序
3. 确定当前文章在序列中的位置，生成上/下一篇链接
4. 生成完整文章列表用于下拉

**文件：`src/pages/posts/[...slug].astro`**

在现有 prev/next 导航之后插入：

```astro
{post.data.collection && (
    <CollectionNav
        collection={post.data.collection}
        currentSlug={post.slug}
    />
)}
```

---

## 六、Type 定义

### 6.1 新增类型

**文件：`src/types/config.ts`**

```typescript
export interface Collection {
    name: string;
    count: number;
}
```

---

## 七、变更文件清单

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `src/content/config.ts` | 修改 | 增加 `collection` 字段 |
| `src/utils/content-utils.ts` | 修改 | 合并遍历优化，新增 `getCollectionList()` |
| `src/types/config.ts` | 修改 | 新增 `Collection` 类型 |
| `src/components/widget/Collections.astro` | 新增 | 文集侧栏组件 |
| `src/components/widget/SideBar.astro` | 修改 | 插入 Collections 组件 |
| `src/components/ArchivePanel.svelte` | 修改 | 支持 collection 筛选 |
| `src/components/CollectionNav.astro` | 新增 | 文章页文集导航组件 |
| `src/pages/posts/[...slug].astro` | 修改 | 引入 CollectionNav |

---

## 八、验证

- [ ] 构建无报错
- [ ] 侧栏文集列表正确显示名称和数量
- [ ] 点击文集跳转 archive 页正确筛选
- [ ] 有文集的文章底部显示文集导航，上下篇链接正确
- [ ] 无文集的文章底部不显示文集导航
- [ ] 下拉展开显示文集全部文章，当前文章高亮
- [ ] 性能：对比构建时间，确认合并遍历后无明显增长
