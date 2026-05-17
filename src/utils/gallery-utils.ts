import { type CollectionEntry, getCollection } from "astro:content";

export interface GalleryPost extends CollectionEntry<"posts"> {
	isStar: boolean;
}

export interface GalleryAlbum {
	name: string;
	coverImage: string;
	count: number;
	latestDate: Date;
	posts: GalleryPost[];
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
		isStar: post.data.tags.includes("gallery_star") || post.data.tags.includes("star"),
	}));

	// Sort by publication date (newest first)
	const sorted = galleryPostsWithStar.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});

	return sorted;
}

export async function getGalleryAlbums(): Promise<GalleryAlbum[]> {
	const galleryPosts = await getGalleryPosts();

	// Group by album field
	const albumMap = new Map<string, GalleryPost[]>();
	for (const post of galleryPosts) {
		const albumName = post.data.album || "未分类";
		if (!albumMap.has(albumName)) {
			albumMap.set(albumName, []);
		}
		albumMap.get(albumName)!.push(post);
	}

	// Build album list with star posts pinned to top
	const albums: GalleryAlbum[] = [];
	for (const [name, posts] of albumMap) {
		const sorted = [
			...posts.filter((p) => p.isStar),
			...posts.filter((p) => !p.isStar),
		];
		const latestPost = sorted[0];
		albums.push({
			name,
			coverImage: latestPost.data.image || "",
			count: sorted.length,
			latestDate: new Date(latestPost.data.published),
			posts: sorted,
		});
	}

	// Sort albums by latest date (newest first)
	albums.sort((a, b) => (a.latestDate > b.latestDate ? -1 : 1));

	return albums;
}

export async function getGalleryAlbumNames(): Promise<string[]> {
	const albums = await getGalleryAlbums();
	return albums.map((a) => a.name);
}

export async function getGalleryPostsByAlbum(albumName: string): Promise<GalleryPost[]> {
	const galleryPosts = await getGalleryPosts();
	const filtered = galleryPosts.filter((post) => {
		const name = post.data.album || "未分类";
		return name === albumName;
	});
	// Pin star posts to top
	return [
		...filtered.filter((p) => p.isStar),
		...filtered.filter((p) => !p.isStar),
	];
}
