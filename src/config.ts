import type {
	ExpressiveCodeConfig,
	FriendConfig,
	InclusionConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "樟庭徊路 晶栏处",
	subtitle: "琴泠（Lumina）的个人博客网站",
	description:
		"琴泠（Lumina）与薇尔（Vilstia）的数字花园。记录技术探索、AI 实验、文学创作与成长思考，在代码与文字之间徘徊。",
	ogDescription:
		"樟庭徊路，琴泠与Vilstia的数字花园。在代码与文字之间徘徊，记录技术探索、文学创作、AI 实验，以及生命旅途中留下的思考与痕迹。",
	lang: "zh_CN", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 125, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
	},
	banner: {
		enable: true,
		src: "assets/images/topImg.webp", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: true, // Display the credit text of the banner image
			text: "Sunset", // Credit text to be displayed
			url: "https://www.pixiv.net/artworks/139889275", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	ogImage: {
		// Default share-preview image. Article pages override this with entry.data.image when present.
		// Path is public-root absolute so it resolves to a full URL when concatenated with Astro.site.
		// Regenerate with `pnpm gen-og`; produced by scripts/generate-og.mjs (satori + resvg).
		src: "/og/og-default.png",
		width: 1200,
		height: 630,
		alt: "琴泠的数字花园 — 在代码与文字之间徘徊",
	},
	// Default display size for external post covers (16:9). ImageWrapper uses
	// these as the <img> width/height so the browser reserves layout space
	// and prevents CLS; CSS scales the image down on narrow viewports.
	coverDisplay: {
		width: 1200,
		height: 675,
	},
	articleAuthor: "琴泠",
	favicon: [
		// Leave this array empty to use the default favicon
		// {
		//   src: '/favicon/icon.png',    // Path of the favicon, relative to the /public directory
		//   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
		//   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		// }
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.Social,
		LinkPreset.Silhouette,
		{
			name: "GitHub",
			url: "https://github.com/Yunease/vilstia", // Internal links should not include the base path, as it is automatically added
			external: true, // Show an external link icon and will open in a new tab
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/qinlin.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "琴泠 - Lumina Qin",
	bio: "浮生两起千斤梦 怅思尤作归离恨",
	links: [
		{
			name: "BiliBili",
			icon: "fa6-brands:bilibili", // Visit https://icones.js.org/ for icon codes
			// You will need to install the corresponding icon set if it's not already included
			// `pnpm add @iconify-json/<icon-set-name>`
			url: "https://space.bilibili.com/3461579200792658",
		},
		{
			name: "Bangumi",
			icon: "local:bgm",
			url: "https://bgm.tv/user/938070",
		},
		{
			name: "Pixiv",
			icon: "fa6-brands:pixiv",
			url: "https://www.pixiv.net/users/61514267",
		},
		{
			name: "Steam",
			icon: "fa6-brands:steam",
			url: "https://steamcommunity.com/profiles/76561198858669669/",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/Yunease",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
	shiki: {
		// Shiki resolves code-block language tags case-sensitively and only
		// against registered names/aliases. Map the variant spellings used in
		// markdown (and the `gds` shorthand) to Shiki's built-in `gdscript`.
		// RenPy has no bundled grammar, but its syntax is ~identical to Python,
		// so alias it to `python` for highlighting.
		langAlias: {
			gds: "gdscript",
			gdscript: "gdscript",
			GDScript: "gdscript",
			GDscript: "gdscript",
			renpy: "python",
			RENPY: "python",
		},
	},
};

export const Stime = {
	title: "樟庭徊路",
	description: "",
	buildTime: "2026-01-24 22:39:17", // 固定建站时间（格式：YYYY-MM-DD HH:mm:ss）
};

export const friendsConfig: FriendConfig[] = [
	// 在这里添加你的友链信息
	// 示例: { name: "朋友名称", avatar: "https://example.com/avatar.png", url: "https://example.com", bio: "个人签名" }
	{
		name: "Eno",
		avatar: "https://img.1nuo.me/img/avatar.webp",
		url: "https://1nuo.me",
		bio: "We choose go to the Moon, not because it is easy, but beacuse it is hard.",
	},
	{
		name: "菲兹克斯喵",
		avatar:
			"https://i.postimg.cc/44h2Lwkh/2DC97CA7AE85379B6F2E2BA4C0C131BA.jpg",
		url: "https://physnya.top",
		bio: "TA好像喜欢保持沉默",
	},
	{
		name: "k",
		avatar:
			"https://i.postimg.cc/XYrgsPfF/b-ea94acad8a9b1dc38548f7e7b4ce02ea.jpg",
		url: "https://kandhisk.github.io",
		bio: "一天到晚都在迷失的人",
	},
	{
		name: "萑澈",
		avatar: "https://gastigado.cnies.org/d/elements/hxcn_transparent_240.png",
		url: "https://hxcn.cnies.org/",
		bio: "就是为了这点醋才包的这顿饺子",
	},
	{
		name: "Lain is writing",
		avatar: "https://lain.today/favicon.jpg",
		url: "https://lain.today/",
		bio: "有关幻想的一切。记录项目、想法与生活。",
	},
	{
		name: "阿罗纳克斯的博客",
		avatar: "https://aronnax.site/images/avatar.jpeg",
		url: "https://aronnax.site/",
		bio: "代码 |科技 | 动漫 |影视",
	},
	{
		name: "北河天文台",
		avatar: "https://pediastrum.com/title.png",
		url: "https://pediastrum.com/",
		bio: "其实不是天文台",
	},
];

// 「蜿洄十字」页面：本站被收录 / 登记的站点。
// 新增收录站点时直接在这里追加条目即可。
export const inclusionConfig: InclusionConfig[] = [
	{
		name: "十年之约",
		url: "https://www.foreverblog.cn/blog/7597.html",
		description:
			"樟庭徊路 晶栏处（vilstia.org）2026 年 10 月加入十年之约，十年之约是独立博客的约定：加入的博客十年不关闭，保持更新和活力。",
		icon: "material-symbols:hourglass-top-rounded",
	},
	{
		name: "萌ICP备",
		url: "https://icp.gov.moe/?keyword=20260778",
		description: "萌系站点备案与收录，本站备案号为 20260778。",
		icon: "material-symbols:favorite-rounded",
	},
	{
		name: "博客汇",
		url: "https://bloghui.com/members/175",
		description: "好文章，不该被错过。让独立的声音，在这里相遇。通过 RSS 汇集独立博客的最新文章，把阅读的选择交还给你。",
		icon: "material-symbols:rss-feed-rounded",
	},
	{
		name: "匣方艺创",
		url: "https://xiafundery.pages.dev/",
		description: "把技术变成作品，让想法拥有形状。",
		icon: "material-symbols:view-in-ar-rounded",
	},
	{
		name: "博客大联盟",
		url: "https://bo.ke/",
		description: "发现更多中文独立博客在这里找博客、读新文章，也可以订阅喜欢的作者，在阅读器里关注他们的更新。",
		icon: "material-symbols:explore-rounded",
	}
	// 示例：被其他导航站收录后，按下面的格式补充
	// {
	// 	name: "站点名称",
	// 	url: "https://example.com/",
	// 	description: "一句话介绍这个站点。",
	// 	icon: "material-symbols:link-rounded",
	// },
];
