import { type CollectionEntry, getCollection } from "astro:content";

export async function getDreamPosts(): Promise<CollectionEntry<"posts">[]> {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	// Filter posts with "dream" tag
	const dreamPosts = allBlogPosts.filter((post) => post.data.tags.includes("dream"));

	// Sort by publication date (newest first)
	const sorted = dreamPosts.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});

	return sorted;
}
