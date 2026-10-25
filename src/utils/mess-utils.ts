import type { CollectionEntry } from "astro:content";
import { getCachedPosts } from "@utils/datasource";

async function filterPublished(
	posts: CollectionEntry<"posts">[],
): Promise<CollectionEntry<"posts">[]> {
	return import.meta.env.PROD
		? posts.filter(({ data }) => data.draft !== true)
		: posts;
}

export async function getPostsByTag(
	tag: string,
): Promise<CollectionEntry<"posts">[]> {
	const allBlogPosts = await filterPublished(await getCachedPosts());

	// Filter posts with the given tag
	const taggedPosts = allBlogPosts.filter((post) =>
		post.data.tags.includes(tag),
	);

	// Sort by publication date (newest first)
	const sorted = taggedPosts.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});

	return sorted;
}

export async function getMessPosts(): Promise<CollectionEntry<"posts">[]> {
	return getPostsByTag("mess");
}
