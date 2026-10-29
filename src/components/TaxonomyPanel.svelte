<script lang="ts">
import { onMount } from "svelte";
import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import { getPostUrlBySlug } from "../utils/url-utils";

/** 单个分类/标签/文集条目，含预计算的跳转链接 */
export interface TaxonomyItem {
	name: string;
	count: number;
	/** 完整的页面内导航 URL，如 /tags/?tag=AI */
	itemUrl: string;
	/** URL 参数名："tag" | "category" | "collection" | "uncategorized" */
	paramKey: string;
	/** URL 参数值（paramKey 为 uncategorized 时为 "true"） */
	paramValue: string;
}

interface Post {
	slug: string;
	data: {
		title: string;
		tags: string[];
		category?: string | null;
		collection?: string | null;
		published: Date;
	};
}

interface Group {
	year: number;
	posts: Post[];
}

/** 页面标题（用于 h1） */
export let title = "";
/** 页面描述说明 */
export let description = "";
/** 条目量词名称（如 "标签"、"分类"、"文集"） */
export let unitName = "条目";
/** 基础路径（如 "/tags/"、"/categories/"、"/collections/"） */
export let basePath = "/";
/** 展示列表 */
export let items: TaxonomyItem[] = [];
/** 全部文章（已按日期降序排列，已过滤特殊标签） */
export let sortedPosts: Post[] = [];
/**
 * 条目渲染风格：
 * - "tag"    → 胶囊标签，flex-wrap 排列（用于标签页）
 * - "button" → 全宽按钮 + 数量徽章（用于分类/文集页）
 */
export let itemStyle: "tag" | "button" = "button";

let selectedItem: TaxonomyItem | null = null;
let groups: Group[] = [];

function formatDate(date: Date) {
	const d = new Date(date);
	const month = (d.getMonth() + 1).toString().padStart(2, "0");
	const day = d.getDate().toString().padStart(2, "0");
	return `${month}-${day}`;
}

function formatTag(tagList: string[] | undefined) {
	if (!tagList || !Array.isArray(tagList)) return "";
	return tagList.map((t) => `#${t}`).join(" ");
}

function readAndFilter() {
	const params = new URLSearchParams(window.location.search);

	// 找到当前 URL 对应的选中条目
	selectedItem =
		items.find((item) => {
			if (item.paramKey === "uncategorized") {
				return params.get("uncategorized") === "true";
			}
			return params.get(item.paramKey) === item.paramValue;
		}) ?? null;

	if (!selectedItem) {
		groups = [];
		return;
	}

	// 按选中条目过滤文章（使用 trim 消除空格影响）
	let filtered: Post[];
	if (selectedItem.paramKey === "tag") {
		filtered = sortedPosts.filter(
			(p) =>
				Array.isArray(p.data.tags) &&
				p.data.tags.some((t) => t.trim() === selectedItem!.paramValue.trim()),
		);
	} else if (selectedItem.paramKey === "category") {
		filtered = sortedPosts.filter(
			(p) =>
				p.data.category &&
				p.data.category.trim() === selectedItem!.paramValue.trim(),
		);
	} else if (selectedItem.paramKey === "collection") {
		filtered = sortedPosts.filter(
			(p) =>
				p.data.collection &&
				p.data.collection.trim() === selectedItem!.paramValue.trim(),
		);
	} else if (selectedItem.paramKey === "uncategorized") {
		filtered = sortedPosts.filter(
			(p) => !p.data.category || p.data.category.trim() === "",
		);
	} else {
		filtered = [];
	}

	// 按年份分组
	const grouped = filtered.reduce(
		(acc, post) => {
			const year = new Date(post.data.published).getFullYear();
			if (!acc[year]) acc[year] = [];
			acc[year].push(post);
			return acc;
		},
		{} as Record<number, Post[]>,
	);

	groups = Object.keys(grouped)
		.map((y) => ({
			year: Number.parseInt(y, 10),
			posts: grouped[Number.parseInt(y, 10)],
		}))
		.sort((a, b) => b.year - a.year);
}

function handleItemClick(e: MouseEvent, targetUrl: string) {
	// 允许用户按住修饰键时正常在新标签页打开
	if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
		return;
	}

	// 阻止默认页面跳转和 Swup 介入
	e.preventDefault();

	// 原生静默更新地址栏（支持分享/书签）
	window.history.pushState(null, "", targetUrl);

	// 仅在本地响应式过滤数据，避免整页重新挂载与动画抖动
	readAndFilter();
}

onMount(() => {
	readAndFilter();
	// 监听浏览器前进/后退按键
	window.addEventListener("popstate", readAndFilter);
	// 监听外部页面通过 Swup 首次跳转进来
	document.addEventListener("swup:content", readAndFilter);
	return () => {
		window.removeEventListener("popstate", readAndFilter);
		document.removeEventListener("swup:content", readAndFilter);
	};
});
</script>

<div class="flex flex-col gap-4">
	<!-- ── 顶部卡片：标题、说明与条目列表 ── -->
	<div class="card-base p-6 onload-animation">
		<!-- 页面大标题（h1 用于 SEO） -->
		<h1 class="text-3xl font-bold text-[var(--primary)] mb-3">{title}</h1>

		<!-- 说明文本 -->
		{#if description}
			<p class="text-neutral-700 dark:text-neutral-300 leading-relaxed">
				{description}
			</p>
		{/if}

		<!-- 统计与操作提示标签 -->
		<div class="mt-3 mb-5 flex flex-wrap items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
			<span class="rounded-full bg-[var(--btn-regular-bg)] px-3 py-1 font-medium text-[var(--primary)]">
				共 {items.length} 个{unitName}
			</span>
			<span>点击条目筛选相关文章，再次点击可取消筛选</span>
		</div>

		<!-- 条目选择区 -->
		{#if itemStyle === "tag"}
			<!-- 标签胶囊 -->
			<div class="flex gap-2 flex-wrap">
				{#each items as item}
					{@const isActive = selectedItem?.paramValue === item.paramValue && selectedItem?.paramKey === item.paramKey}
					{@const targetUrl = isActive ? basePath : item.itemUrl}
					<a
						data-no-swup
						href={targetUrl}
						onclick={(e) => handleItemClick(e, targetUrl)}
						aria-label={`查看 ${item.name} 下的文章`}
						class="taxonomy-tag btn-regular h-8 text-sm px-3 rounded-lg flex items-center gap-1.5 transition-all"
						class:taxonomy-tag--active={isActive}
					>
						<span>{item.name}</span>
						<span class="text-xs opacity-70 ml-0.5">{item.count}篇</span>
					</a>
				{/each}
			</div>
		{:else}
			<!-- 全宽按钮（分类 / 文集） -->
			<div class="flex flex-col gap-1">
				{#each items as item}
					{@const isActive = selectedItem?.paramValue === item.paramValue && selectedItem?.paramKey === item.paramKey}
					{@const targetUrl = isActive ? basePath : item.itemUrl}
					<a
						data-no-swup
						href={targetUrl}
						onclick={(e) => handleItemClick(e, targetUrl)}
						aria-label={`查看 ${item.name} 下的文章`}
					>
						<button
							class="taxonomy-btn w-full h-10 rounded-lg bg-none hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)] transition-all pl-2 hover:pl-3 text-neutral-700 hover:text-[var(--primary)] dark:text-neutral-300 dark:hover:text-[var(--primary)]"
							class:taxonomy-btn--active={isActive}
						>
							<div class="flex items-center justify-between relative mr-2">
								<div class="overflow-hidden text-left whitespace-nowrap overflow-ellipsis">
									{item.name}
								</div>
								<div
									class="transition px-2.5 h-7 ml-4 min-w-[2rem] rounded-lg text-sm font-bold
									text-[var(--btn-content)] dark:text-[var(--deep-text)]
									bg-[var(--btn-regular-bg)] dark:bg-[var(--primary)]
									flex items-center justify-center"
								>
									{item.count} 篇
								</div>
							</div>
						</button>
					</a>
				{/each}
			</div>
		{/if}
	</div>

	<!-- ── 独立卡片：筛选结果（仅在选中时展示，与上方容器存在天然间距） ── -->
	{#if selectedItem}
		<div class="card-base px-8 py-6 onload-animation">
			<!-- 按年份分组的文章时间线 -->
			{#each groups as group}
				<div>
					<div class="flex flex-row w-full items-center h-[3.75rem]">
						<div class="w-[15%] md:w-[10%] transition text-2xl font-bold text-right text-75">
							{group.year}
						</div>
						<div class="w-[15%] md:w-[10%]">
							<div
								class="h-3 w-3 bg-none rounded-full outline outline-[var(--primary)] mx-auto
								-outline-offset-[2px] z-50 outline-3"
							></div>
						</div>
						<div class="w-[70%] md:w-[80%] transition text-left text-50">
							{group.posts.length}
							{i18n(group.posts.length === 1 ? I18nKey.postCount : I18nKey.postsCount)}
						</div>
					</div>

					{#each group.posts as post}
						<a
							href={getPostUrlBySlug(post.slug)}
							aria-label={post.data.title}
							class="group btn-plain !block h-10 w-full rounded-lg hover:text-[initial]"
						>
							<div class="flex flex-row justify-start items-center h-full">
								<!-- 日期 -->
								<div class="w-[15%] md:w-[10%] transition text-sm text-right text-50">
									{formatDate(post.data.published)}
								</div>
								<!-- 时间轴竖线 + 节点 -->
								<div class="w-[15%] md:w-[10%] relative dash-line h-full flex items-center">
									<div
										class="transition-all mx-auto w-1 h-1 rounded group-hover:h-5
										bg-[oklch(0.5_0.05_var(--hue))] group-hover:bg-[var(--primary)]
										outline outline-4 z-50
										outline-[var(--card-bg)]
										group-hover:outline-[var(--btn-plain-bg-hover)]
										group-active:outline-[var(--btn-plain-bg-active)]"
									></div>
								</div>
								<!-- 文章标题 -->
								<div
									class="w-[70%] md:max-w-[65%] md:w-[65%] text-left font-bold
									group-hover:translate-x-1 transition-all group-hover:text-[var(--primary)]
									text-75 pr-8 whitespace-nowrap overflow-ellipsis overflow-hidden"
								>
									{post.data.title}
								</div>
								<!-- 标签列表 -->
								<div
									class="hidden md:block md:w-[15%] text-left text-sm transition
									whitespace-nowrap overflow-ellipsis overflow-hidden text-30"
								>
									{formatTag(post.data.tags)}
								</div>
							</div>
						</a>
					{/each}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	/* 激活的标签胶囊：保持常驻高亮，禁用 hover 动画与变色 */
	.taxonomy-tag--active,
	.taxonomy-tag--active:hover,
	.taxonomy-tag--active:active {
		background-color: var(--primary) !important;
		color: white !important;
	}
	.taxonomy-tag--active span {
		opacity: 0.95;
	}

	/* 激活的全宽按钮 */
	.taxonomy-btn--active {
		background-color: var(--btn-plain-bg-hover);
		color: var(--primary);
		padding-left: 0.75rem;
	}
</style>
