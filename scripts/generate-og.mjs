// Build-time generator for the default Open Graph image.
//
// References the layout / visual style of public/og/og-image.png
// (top gradient bar, two-column hero with a badge + headline + description +
// CTA on the left, and an avatar card on the right), but replaces the
// template's "Your Startup Logo" / "Start Free" / tofu-glyph placeholders
// with site-appropriate copy and a guaranteed-to-render font.
//
// Output: public/og/og-image.png (1200x630).
// Run with: node scripts/generate-og.mjs
//
// The script intentionally does not depend on React / preact — it builds a
// plain element tree that satori accepts directly.  Satori + @resvg-js only
// need to run at build time, so they are listed under devDependencies-style
// runtime imports (still in `dependencies` because astro:assets is already
// ESM and pnpm hoists both fine).

import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const AVATAR = join(ROOT, "src", "assets", "images", "qinlin.png");
const FONT_DIR = join(ROOT, "scripts", "fonts");
const FONT_REGULAR = join(FONT_DIR, "NotoSansSC-Regular.otf");
const OUT_DIR = join(ROOT, "public", "og");
const OUT = join(OUT_DIR, "og-default.png");

// The 8 MB font is .gitignored; download on first run so contributors don't
// have to do it manually.  jsdelivr mirrors the notofonts/noto-cjk repo.
const FONT_URL =
	"https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/SubsetOTF/SC/NotoSansSC-Regular.otf";

async function ensureFont() {
	if (existsSync(FONT_REGULAR)) return;
	console.log(`Font missing, downloading from ${FONT_URL}`);
	const res = await fetch(FONT_URL);
	if (!res.ok) throw new Error(`Font download failed: ${res.status}`);
	const buf = Buffer.from(await res.arrayBuffer());
	mkdirSync(FONT_DIR, { recursive: true });
	writeFileSync(FONT_REGULAR, buf);
	console.log(`Downloaded ${FONT_REGULAR.replace(ROOT, "")} (${(buf.length / 1024 / 1024).toFixed(1)} MB)`);
}

const W = 1200;
const H = 630;
const AVATAR_SIZE = 260;

// Short (og/social) description — kept verbatim with src/config.ts so the
// image and meta tag stay in sync.  Update both if the copy ever changes.
const TITLE = "琴泠的数字花园";
const HEADLINE = "在代码与文字之间徘徊";
const DESCRIPTION =
	"记录技术探索、文学创作、AI 实验,以及生命旅途中留下的思考与痕迹。";
const BADGE = "个人博客 · Vilstia";
const CTA = "探索博客 →";
const SUBTITLE = "vilstia.org";
const CARD_NAME = "琴泠";
const CARD_SUB = "Lumina Qin · Personal Blog";

const avatarBase64 = `data:image/png;base64,${readFileSync(AVATAR).toString("base64")}`;

// satori 0.29 accepts a plain element tree (type/props/children).  No need
// for React or preact at build time.  See https://github.com/vercel/satori
const t = (type, props, ...children) => {
	const flat = children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false);
	return { type, props: { ...props, children: flat.length === 0 ? undefined : flat.length === 1 ? flat[0] : flat } };
};

const element = t(
	"div",
	{
		style: {
			display: "flex",
			flexDirection: "column",
			width: `${W}px`,
			height: `${H}px`,
			backgroundColor: "#f4faf5",
			fontFamily: "Noto Sans SC",
		},
	},
	// Top gradient bar
	t("div", {
		style: {
			display: "flex",
			width: "100%",
			height: "8px",
			backgroundImage:
				"linear-gradient(to right, #a7f3d0 0%, #34d399 50%, #10b981 100%)",
		},
	}),
	// Main row
	t(
		"div",
		{
			style: {
				display: "flex",
				flexDirection: "row",
				flex: 1,
				padding: "56px 64px",
				gap: "40px",
			},
		},
		// ── Left column ──────────────────────────────────────────────
		t(
			"div",
			{
				style: {
					display: "flex",
					flexDirection: "column",
					flex: 1,
					justifyContent: "space-between",
				},
			},
			// Logo + site name
			t("div", {
				style: {
					display: "flex",
					alignItems: "center",
					gap: "14px",
				},
			},
				t("div", {
					style: {
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						width: "48px",
						height: "48px",
						borderRadius: "12px",
						backgroundColor: "#1b4a2a",
						color: "white",
						fontSize: "26px",
						fontWeight: 700,
					},
				}, "琴"),
				t("div", {
					style: {
						display: "flex",
						flexDirection: "column",
					},
				},
					t("div", {
						style: {
							display: "flex",
							fontSize: "22px",
							fontWeight: 700,
							color: "#1b4a2a",
						},
					}, TITLE),
					t("div", {
						style: {
							display: "flex",
							fontSize: "14px",
							color: "#5a7a6a",
							marginTop: "2px",
							letterSpacing: "1px",
						},
					}, SUBTITLE),
				),
			),
			// Badge + headline + description
			t("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					marginTop: "36px",
				},
			},
				t("div", {
					style: {
						display: "flex",
						alignItems: "center",
						alignSelf: "flex-start",
						padding: "8px 18px",
						borderRadius: "999px",
						backgroundColor: "#d1fae5",
						color: "#065f46",
						fontSize: "18px",
						fontWeight: 700,
					},
				}, BADGE),
				t("div", {
					style: {
						display: "flex",
						fontSize: "56px",
						fontWeight: 700,
						color: "#1b4a2a",
						lineHeight: 1.15,
						marginTop: "22px",
					},
				}, HEADLINE),
				t("div", {
					style: {
						display: "flex",
						fontSize: "22px",
						color: "#3a6a4a",
						lineHeight: 1.5,
						marginTop: "18px",
					},
				}, DESCRIPTION),
			),
			// CTA
			t("div", {
				style: {
					display: "flex",
					alignItems: "center",
					alignSelf: "flex-start",
					padding: "16px 30px",
					borderRadius: "12px",
					backgroundColor: "#10b981",
					color: "white",
					fontSize: "22px",
					fontWeight: 700,
					marginTop: "32px",
				},
			}, CTA),
		),
		// ── Right column (avatar card) ───────────────────────────────
		t("div", {
			style: {
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				width: "400px",
				flexShrink: 0,
				backgroundColor: "#d1fae5",
				borderRadius: "28px",
				padding: "32px",
			},
		},
			t("div", {
				style: {
					display: "flex",
					width: `${AVATAR_SIZE}px`,
					height: `${AVATAR_SIZE}px`,
					borderRadius: "50%",
					overflow: "hidden",
					border: "6px solid white",
				},
			},
				t("img", {
					src: avatarBase64,
					width: AVATAR_SIZE,
					height: AVATAR_SIZE,
					style: {
						width: "100%",
						height: "100%",
					},
				}),
			),
			t("div", {
				style: {
					display: "flex",
					fontSize: "44px",
					fontWeight: 700,
					color: "#1b4a2a",
					marginTop: "24px",
				},
			}, CARD_NAME),
			t("div", {
				style: {
					display: "flex",
					fontSize: "16px",
					color: "#3a6a4a",
					marginTop: "6px",
					letterSpacing: "2px",
				},
			}, CARD_SUB),
		),
	),
);

async function main() {
	mkdirSync(OUT_DIR, { recursive: true });
	await ensureFont();

	const fontRegularData = readFileSync(FONT_REGULAR);

	const svg = await satori(element, {
		width: W,
		height: H,
		fonts: [
			{
				name: "Noto Sans SC",
				data: fontRegularData,
				weight: 400,
				style: "normal",
			},
		],
	});

	const resvg = new Resvg(svg, {
		fitTo: { mode: "width", value: W },
	});
	const png = resvg.render().asPng();
	writeFileSync(OUT, png);

	const { size } = statSync(OUT);
	console.log(`Generated ${OUT.replace(ROOT, "")} (${(size / 1024).toFixed(1)} KB)`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
