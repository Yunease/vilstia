import { getImage } from "astro:assets";
import { profileConfig, siteConfig } from "../config";
import { formatDateToYYYYMMDD } from "./date-utils";
import { getPostUrlBySlug } from "./url-utils";
import { getCachedSpec } from "./datasource";
import qinlinAvatar from "../assets/images/qinlin.png";

/**
 * Build an absolute URL for a site-relative path.  Tolerates inputs that
 * already start with the site origin or are missing a leading slash.
 * Returns "" if site is not configured.
 */
export function absUrl(site: URL | undefined, path: string): string {
	if (!site) return "";
	const siteOrigin = site.toString().replace(/\/$/, "");
	if (!path) return siteOrigin;
	if (/^https?:\/\//.test(path)) return path;
	const rel = path.startsWith("/") ? path : `/${path}`;
	return `${siteOrigin}${rel}`;
}

/**
 * Replicate the slug logic from src/pages/about/[slug].astro so we can
 * derive the canonical URL of any spec post here.
 */
function getAboutSlug(id: string): string {
	return id.replace("about", "").replace(/^\//, "").replace(/\.md$/, "") || "default";
}

/**
 * Stable Person @id anchored to the Chinese "About Me" page
 * (aboutMe(zh-CN).md).  All pages reference the same identity so that
 * Schema.org graph nodes are joined across the site.
 */
export async function resolvePersonId(site: URL | undefined): Promise<string> {
	if (!site) return "";
	const allSpec = await getCachedSpec();
	const meZh = allSpec.filter(({ id }) => id === "aboutMe(zh-CN).md");
	const slug = meZh[0] ? getAboutSlug(meZh[0].id) : "default";
	return absUrl(site, `/about/${encodeURIComponent(slug)}/`);
}

/**
 * Resolve the local avatar asset to its public URL at build time.
 * Returns undefined if the image cannot be processed.
 */
export async function resolveAvatarUrl(site: URL | undefined): Promise<string | undefined> {
	if (!site) return undefined;
	try {
		const { src } = await getImage({ src: qinlinAvatar });
		return absUrl(site, src);
	} catch {
		return undefined;
	}
}

/**
 * The full Person entity.  Reused as author/publisher across the site.
 */
export async function getPersonSchema(site: URL | undefined) {
	if (!site) return null;
	const personId = await resolvePersonId(site);
	const image = await resolveAvatarUrl(site);
	const [name, ...rest] = profileConfig.name.split(/\s*-\s*/);
	const alternateName = rest.length ? rest.join(" - ") : undefined;
	const siteUrl = absUrl(site, "/");
	return {
		"@context": "https://schema.org",
		"@type": "Person",
		"@id": personId,
		name,
		...(alternateName ? { alternateName } : {}),
		description: siteConfig.subtitle,
		url: siteUrl,
		...(image ? { image } : {}),
		sameAs: profileConfig.links.map((l) => l.url),
	};
}

export async function getWebSiteSchema(site: URL | undefined) {
	if (!site) return null;
	const personId = await resolvePersonId(site);
	const siteUrl = absUrl(site, "/");
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		"@id": `${siteUrl}#website`,
		url: siteUrl,
		name: siteConfig.title,
		description: siteConfig.subtitle,
		inLanguage: siteConfig.lang.replace("_", "-"),
		author: { "@id": personId },
		publisher: { "@id": personId },
	};
}

/**
 * Build a BlogPosting entity for a post page.  Author and publisher are
 * expanded into full Person objects (with @id AND name) so the schema is
 * self-contained — Google does not strictly require expanding references,
 * but inlining name keeps the entity valid even if the page-level Person
 * JSON-LD is stripped.
 */
export async function getBlogPostingSchema(
	entry: {
		slug: string;
		data: {
			title: string;
			published: Date;
			updated?: Date;
			description?: string;
			image?: string;
			tags?: string[];
			category?: string | null;
			lang?: string;
		};
	},
	site: URL | undefined,
	reading?: { words?: number; minutes?: number },
) {
	if (!site) return null;

	const personId = await resolvePersonId(site);
	const personName =
		profileConfig.name.split(/\s*-\s*/)[0]?.trim() || profileConfig.name;
	const postUrl = absUrl(site, getPostUrlBySlug(entry.slug));
	const inLanguage = (entry.data.lang || siteConfig.lang).replace("_", "-");
	const dateModified = entry.data.updated
		? formatDateToYYYYMMDD(entry.data.updated)
		: undefined;

	// Fall back to the site default OG image when the post has no cover,
	// so Google always has at least one image to render in search.
	const image =
		entry.data.image?.trim() || absUrl(site, siteConfig.ogImage.src);

	const schema: Record<string, unknown> = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		"@id": `${postUrl}#article`,
		headline: entry.data.title,
		description: entry.data.description || entry.data.title,
		image,
		inLanguage,
		datePublished: formatDateToYYYYMMDD(entry.data.published),
		url: postUrl,
		mainEntityOfPage: { "@id": `${postUrl}#webpage` },
		author: {
			"@type": "Person",
			"@id": personId,
			name: personName,
		},
		publisher: {
			"@type": "Person",
			"@id": personId,
			name: personName,
		},
	};

	if (dateModified) schema.dateModified = dateModified;
	if (entry.data.tags?.length) schema.keywords = entry.data.tags.join(", ");
	if (entry.data.category) schema.articleSection = entry.data.category;
	if (reading?.words) schema.wordCount = reading.words;
	if (reading?.minutes) {
		const minutes = Math.max(1, Math.ceil(reading.minutes));
		schema.timeRequired = `PT${minutes}M`;
	}

	return schema;
}
