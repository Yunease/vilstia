import { getImage } from "astro:assets";
import { getCollection } from "astro:content";
import { profileConfig, siteConfig } from "../config";
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
	const meZh = await getCollection("spec", ({ id }) => id === "aboutMe(zh-CN).md");
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
