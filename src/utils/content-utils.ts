import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils.ts";

// Tags to exclude from normal post lists (these go to special pages)
const EXCLUDED_TAGS = ["mess", "gallery", "photo"];

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
	const filteredPosts = allPosts.filter((post) => !EXCLUDED_TAGS.some(tag => post.data.tags.includes(tag)));

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
	const filteredPosts = sortedFullPosts.filter((post) => !EXCLUDED_TAGS.some(tag => post.data.tags.includes(tag)));

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
		if (EXCLUDED_TAGS.some(tag => post.data.tags.includes(tag))) return;
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

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	const count: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { category: string | null; tags: string[] } }) => {
		// Skip posts with excluded tags (mess, gallery, photo) for category stats
		if (EXCLUDED_TAGS.some(tag => post.data.tags.includes(tag))) return;
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
	});

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
