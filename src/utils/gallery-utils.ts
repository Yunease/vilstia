import { type CollectionEntry, getCollection } from "astro:content";

export interface GalleryPost extends CollectionEntry<"posts"> {
	isStar: boolean;
}

export async function getGalleryPosts(): Promise<GalleryPost[]> {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	// Filter posts with "gallery" tag
	const galleryPosts = allBlogPosts.filter((post) => post.data.tags.includes("gallery"));

	//gallery_star" tag Mark posts with "
	const galleryPostsWithStar = galleryPosts.map((post) => ({
		...post,
		isStar: post.data.tags.includes("gallery_star"),
	}));

	// Sort by publication date (newest first)
	const sorted = galleryPostsWithStar.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});

	return sorted;
}
