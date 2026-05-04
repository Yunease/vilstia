import type {
	ExpressiveCodeConfig,
	FriendConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "樟庭徊路",
	subtitle: "晶栏处",
	lang: "zh_CN", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 45, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
	},
	banner: {
		enable: true,
		src: "assets/images/topImg.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
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
		LinkPreset.About,
		LinkPreset.Friends,
		LinkPreset.Silhouette,
		{
			name: "AI小世界",
			url: "/ai-world/",
		},
		{
			name: "GitHub",
			url: "https://github.com/Yunease/vilstia", // Internal links should not include the base path, as it is automatically added
			external: true, // Show an external link icon and will open in a new tab
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/qinling.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "琴泠",
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
];
