import { type CollectionEntry } from "astro:content";
import { getCachedChronicle } from "@utils/datasource";

export async function getChronicleEvents(): Promise<
	CollectionEntry<"chronicle">[]
> {
	const entries = await getCachedChronicle();
	return entries.sort((a, b) => {
		const dateA = new Date(a.data.date);
		const dateB = new Date(b.data.date);
		return dateA > dateB ? 1 : -1;
	});
}
