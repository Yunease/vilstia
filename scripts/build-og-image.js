// One-shot: regenerate the default Open Graph image used as og:image fallback.
// Run with: node scripts/build-og-image.js
//
// Output: public/og/og-default.png (1200x630 PNG).
// Re-run only when the avatar or site branding changes; not wired into `pnpm build`.

import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync, statSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const AVATAR = join(ROOT, "src", "assets", "images", "qinlin.png");
const OUT_DIR = join(ROOT, "public", "og");
const OUT = join(OUT_DIR, "og-default.png");

const W = 1200;
const H = 630;
const AVATAR_SIZE = 360;
const AVATAR_TOP_OFFSET = -60;

const bgSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="g" cx="50%" cy="38%" r="78%">
      <stop offset="0%" stop-color="#eef7f1" />
      <stop offset="55%" stop-color="#d8ecdf" />
      <stop offset="100%" stop-color="#b8d6c1" />
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)" />
</svg>
`.trim();

const textSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <text x="${W / 2}" y="${H / 2 + AVATAR_SIZE / 2 + 60}"
        text-anchor="middle"
        font-family="Microsoft YaHei, 微软雅黑, PingFang SC, sans-serif"
        font-weight="700"
        font-size="72"
        fill="#1b4a2a">琴泠</text>
  <text x="${W / 2}" y="${H / 2 + AVATAR_SIZE / 2 + 110}"
        text-anchor="middle"
        font-family="Microsoft YaHei, 微软雅黑, PingFang SC, sans-serif"
        font-size="28"
        fill="#3a6a4a"
        letter-spacing="3">Lumina Qin · Personal Blog</text>
</svg>
`.trim();

async function main() {
	mkdirSync(OUT_DIR, { recursive: true });

	const bg = await sharp(Buffer.from(bgSvg)).png().toBuffer();

	const circleMask = Buffer.from(
		`<svg xmlns="http://www.w3.org/2000/svg" width="${AVATAR_SIZE}" height="${AVATAR_SIZE}">
			<circle cx="${AVATAR_SIZE / 2}" cy="${AVATAR_SIZE / 2}" r="${AVATAR_SIZE / 2}" fill="white"/>
		</svg>`,
	);

	const avatarCircle = await sharp(AVATAR)
		.resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover" })
		.composite([{ input: circleMask, blend: "dest-in" }])
		.png()
		.toBuffer();

	const textLayer = await sharp(Buffer.from(textSvg)).png().toBuffer();

	const avatarLeft = Math.floor((W - AVATAR_SIZE) / 2);
	const avatarTop = Math.floor((H - AVATAR_SIZE) / 2) + AVATAR_TOP_OFFSET;

	await sharp(bg)
		.composite([
			{ input: avatarCircle, left: avatarLeft, top: avatarTop },
			{ input: textLayer, left: 0, top: 0 },
		])
		.png({ compressionLevel: 9 })
		.toFile(OUT);

	const { size } = statSync(OUT);
	console.log(`Generated ${OUT.replace(ROOT, "")} (${(size / 1024).toFixed(1)} KB)`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
