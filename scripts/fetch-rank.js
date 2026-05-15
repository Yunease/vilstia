import { writeFileSync } from 'node:fs';

const UMAMI_BASE = 'https://analytics.hxcn.dev';
const SHARE_SLUG = 'p8xz7fJixSOSxkNy';
const UMAMI_USER = 'yunease';
const UMAMI_PASS = '12345678';
const OUTPUT_PATH = 'public/rank-data.json';

async function fetchRankData() {
	console.log('Fetching rank data from Umami...');

	// 1. 获取 token
	const loginRes = await fetch(`${UMAMI_BASE}/api/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username: UMAMI_USER, password: UMAMI_PASS }),
	});
	if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
	const { token } = await loginRes.json();

	// 2. 获取 websiteId
	const shareRes = await fetch(`${UMAMI_BASE}/api/share/${SHARE_SLUG}`);
	if (!shareRes.ok) throw new Error(`Share API failed: ${shareRes.status}`);
	const { websiteId } = await shareRes.json();

	// 3. 获取 metrics 数据（近 90 天）
	const endAt = Date.now();
	const startAt = endAt - 90 * 24 * 60 * 60 * 1000;
	const metricsRes = await fetch(
		`${UMAMI_BASE}/api/websites/${websiteId}/metrics?` +
		new URLSearchParams({ startAt: String(startAt), endAt: String(endAt), type: 'path' }),
		{ headers: { Authorization: `Bearer ${token}` } }
	);
	if (!metricsRes.ok) throw new Error(`Metrics API failed: ${metricsRes.status}`);
	const metrics = await metricsRes.json();

	// 4. 只保留文章路径，输出 { path, views }
	const articles = metrics
		.filter(item => item.x.startsWith('/posts/'))
		.map(item => ({ path: item.x, views: item.y }));

	writeFileSync(OUTPUT_PATH, JSON.stringify(articles, null, 2));
	console.log(`Rank data saved to ${OUTPUT_PATH} (${articles.length} articles)`);
}

fetchRankData().catch(err => {
	console.error('Failed to fetch rank data:', err.message);
	process.exit(1);
});
