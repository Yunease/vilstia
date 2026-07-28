// ============================================================================
// 数据源缓存层
// ----------------------------------------------------------------------------
// 背景: `getCollection` 每次调用都会重新读取并解析所有 markdown frontmatter。
// 旧代码里同一个集合在 build 期间被反复调用(utils + pages + components),
// 导致 N 次磁盘扫描和 frontmatter 解析。
//
// 这里把"读取 + 解析"这一步缓存到模块级 promise 里:
//   - 构建时: build 是单进程,模块只 load 一次,缓存有效
//   - dev    : 模块也只 load 一次;新增/删除文章需要重启 dev server 才能看到(可接受)
//
// 注意: 缓存返回的是**全集**(不做 draft / id 过滤)。
// 各调用方仍然保留自己的过滤逻辑 —— 这样行为完全不变,只是省掉解析成本。
// ============================================================================

import { type CollectionEntry, getCollection } from "astro:content";

let postsCache: Promise<CollectionEntry<"posts">[]> | null = null;
let specCache: Promise<CollectionEntry<"spec">[]> | null = null;
let chronicleCache: Promise<CollectionEntry<"chronicle">[]> | null = null;

/** 获取全部 posts 条目(无 draft 过滤,调用方按需过滤) */
export function getCachedPosts(): Promise<CollectionEntry<"posts">[]> {
	if (!postsCache) {
		postsCache = getCollection("posts");
	}
	return postsCache;
}

/** 获取全部 spec 条目 */
export function getCachedSpec(): Promise<CollectionEntry<"spec">[]> {
	if (!specCache) {
		specCache = getCollection("spec");
	}
	return specCache;
}

/** 获取全部 chronicle 条目 */
export function getCachedChronicle(): Promise<
	CollectionEntry<"chronicle">[]
> {
	if (!chronicleCache) {
		chronicleCache = getCollection("chronicle");
	}
	return chronicleCache;
}
