import { type CollectionEntry, getCollection } from "astro:content";

export async function getChronicleEvents(): Promise<
	CollectionEntry<"chronicle">[]
> {
	const entries = await getCollection("chronicle");
	return entries.sort((a, b) => {
		const dateA = new Date(a.data.date);
		const dateB = new Date(b.data.date);
		return dateA > dateB ? 1 : -1;
	});
}
