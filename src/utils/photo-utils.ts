import { type CollectionEntry, getCollection } from "astro:content";

export async function getPhotoPosts(): Promise<CollectionEntry<"posts">[]> {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	// Filter posts with "photo" tag
	const photoPosts = allBlogPosts.filter((post) => post.data.tags.includes("photo"));

	// Sort by publication date (newest first)
	const sorted = photoPosts.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});

	return sorted;
}

export interface PhotoAlbum {
	name: string;
	coverImage: string;
	count: number;
	latestDate: Date;
	posts: CollectionEntry<"posts">[];
}

export async function getPhotoAlbums(): Promise<PhotoAlbum[]> {
	const photoPosts = await getPhotoPosts();

	// Group by album field
	const albumMap = new Map<string, CollectionEntry<"posts">[]>();
	for (const post of photoPosts) {
		const albumName = post.data.album || "未分类";
		if (!albumMap.has(albumName)) {
			albumMap.set(albumName, []);
		}
		albumMap.get(albumName)!.push(post);
	}

	// Build album list
	const albums: PhotoAlbum[] = [];
	for (const [name, posts] of albumMap) {
		// Posts are already sorted newest first, so first one has the latest date
		const latestPost = posts[0];
		albums.push({
			name,
			coverImage: latestPost.data.image || "",
			count: posts.length,
			latestDate: new Date(latestPost.data.published),
			posts,
		});
	}

	// Sort albums by latest date (newest first)
	albums.sort((a, b) => (a.latestDate > b.latestDate ? -1 : 1));

	return albums;
}

export async function getAlbumNames(): Promise<string[]> {
	const albums = await getPhotoAlbums();
	return albums.map((a) => a.name);
}

export async function getPostsByAlbum(albumName: string): Promise<CollectionEntry<"posts">[]> {
	const photoPosts = await getPhotoPosts();
	return photoPosts.filter((post) => {
		const name = post.data.album || "未分类";
		return name === albumName;
	});
}
