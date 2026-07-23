import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl, getCollectionUrl } from "@utils/url-utils.ts";

// Tags to exclude from normal post lists (these go to special pages)
const EXCLUDED_TAGS = ["mess", "gallery", "photo", "anth"];

// Retrieve posts and sort them by publication date
async function getRawSortedPosts() {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const sorted = allBlogPosts.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});
	return sorted;
}

// Get posts excluding the mess tag (for normal display)
export async function getSortedPosts() {
	const allPosts = await getRawSortedPosts();

	// Filter out posts with excluded tags (mess, gallery)
	const filteredPosts = allPosts.filter(
		(post) => !EXCLUDED_TAGS.some((tag) => post.data.tags.includes(tag)),
	);

	for (let i = 1; i < filteredPosts.length; i++) {
		filteredPosts[i].data.nextSlug = filteredPosts[i - 1].slug;
		filteredPosts[i].data.nextTitle = filteredPosts[i - 1].data.title;
	}
	for (let i = 0; i < filteredPosts.length - 1; i++) {
		filteredPosts[i].data.prevSlug = filteredPosts[i + 1].slug;
		filteredPosts[i].data.prevTitle = filteredPosts[i + 1].data.title;
	}

	return filteredPosts;
}

export type PostForList = {
	slug: string;
	data: CollectionEntry<"posts">["data"];
};
export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getRawSortedPosts();

	// Filter out posts with excluded tags (mess, gallery)
	const filteredPosts = sortedFullPosts.filter(
		(post) => !EXCLUDED_TAGS.some((tag) => post.data.tags.includes(tag)),
	);

	// delete post.body
	const sortedPostsList = filteredPosts.map((post) => ({
		slug: post.slug,
		data: post.data,
	}));

	return sortedPostsList;
}
export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const countMap: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { tags: string[] } }) => {
		// Skip posts with excluded tags (mess, gallery) for tag list
		if (EXCLUDED_TAGS.some((tag) => post.data.tags.includes(tag))) return;
		post.data.tags.forEach((tag: string) => {
			if (!countMap[tag]) countMap[tag] = 0;
			countMap[tag]++;
		});
	});

	// sort tags
	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export type CollectionItem = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	const count: { [key: string]: number } = {};
	allBlogPosts.forEach(
		(post: { data: { category: string | null; tags: string[] } }) => {
			// Skip posts with excluded tags (mess, gallery, photo) for category stats
			if (EXCLUDED_TAGS.some((tag) => post.data.tags.includes(tag))) return;
			if (!post.data.category) {
				const ucKey = i18n(I18nKey.uncategorized);
				count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
				return;
			}

			const categoryName =
				typeof post.data.category === "string"
					? post.data.category.trim()
					: String(post.data.category).trim();

			count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
		},
	);

	const lst = Object.keys(count).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}

// ─── Heatmap data ───────────────────────────────────────────────

export type YearActivity = {
	year: number;
	/** Map of "YYYY-MM-DD" → post count */
	activityMap: Map<string, number>;
	/** Total posts in this year */
	count: number;
	articleCount: number;
	rantCount: number;
};

export type PostActivityData = {
	/** Per-year data, sorted ascending */
	years: YearActivity[];
	/** Grand total */
	totalCount: number;
	/** Current year's post count */
	currentYearCount: number;
	/** Earliest valid post date */
	startDate: Date;
	/** End of data range (latest post date or today) */
	endDate: Date;
};

/**
 * Accept all posts (already fetched), iterate once, produce per-year heatmap data.
 * Skips posts with implausible dates (year < 2000).
 * O(n) — no extra file scans, no DB, no cache.
 */
export function getPostActivityData(
	posts: CollectionEntry<"posts">[],
): PostActivityData {
	const yearMap = new Map<number, Map<string, number>>();
	const now = new Date();
	const currentYear = now.getFullYear();
	let totalCount = 0;
	let currentYearCount = 0;
	let startDate: Date = now;
	let endDate: Date = new Date(0);

	for (const post of posts) {
		const d = new Date(post.data.published);
		// Skip implausible dates (e.g. 0001-01-01 placeholder)
		if (d.getFullYear() < 2000) continue;

		const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
		const year = d.getFullYear();

		if (!yearMap.has(year)) yearMap.set(year, new Map());
		const ym = yearMap.get(year)!;
		ym.set(dateStr, (ym.get(dateStr) ?? 0) + 1);

		totalCount++;
		if (year === currentYear) currentYearCount++;
		if (d < startDate) startDate = d;
		if (d > endDate) endDate = d;
	}

	const years: YearActivity[] = [];
	for (const [year, activityMap] of yearMap) {
		let yearCount = 0;
		for (const c of activityMap.values()) yearCount += c;
		years.push({ year, activityMap, count: yearCount, articleCount: 0, rantCount: 0 });
	}

	// Classify posts as article (normal) vs rant (tagged "mess")
	for (const post of posts) {
		const d = new Date(post.data.published);
		if (d.getFullYear() < 2000) continue;
		const year = d.getFullYear();
		const yr = years.find((y) => y.year === year);
		if (!yr) continue;
		if (post.data.tags.includes("mess")) {
			yr.rantCount++;
		} else {
			yr.articleCount++;
		}
	}
	years.sort((a, b) => a.year - b.year);

	const today = new Date();
	if (endDate < today) endDate = today;

	return { years, totalCount, currentYearCount, startDate, endDate };
}

// ─── Existing code below ────────────────────────────────────────

export async function getCollectionList(): Promise<CollectionItem[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	const count: { [key: string]: number } = {};
	allBlogPosts.forEach(
		(post: { data: { collection: string | null; tags: string[] } }) => {
			if (EXCLUDED_TAGS.some((tag) => post.data.tags.includes(tag))) return;
			if (!post.data.collection) return;

			const collectionName =
				typeof post.data.collection === "string"
					? post.data.collection.trim()
					: String(post.data.collection).trim();

			if (collectionName) {
				count[collectionName] = count[collectionName]
					? count[collectionName] + 1
					: 1;
			}
		},
	);

	const lst = Object.keys(count).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	const ret: CollectionItem[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCollectionUrl(c),
		});
	}
	return ret;
}
