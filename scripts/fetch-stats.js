import { writeFileSync } from 'node:fs';

const UMAMI_BASE = 'https://analytics.hxcn.dev';
const SHARE_SLUG = 'p8xz7fJixSOSxkNy';
const OUTPUT_PATH = 'public/umami-stats.json';

async function fetchStats() {
	console.log('Fetching site stats from Umami...');

	// 1. 获取网站起始日期（share API，无需认证）
	const rangeRes = await fetch(`${UMAMI_BASE}/api/share/${SHARE_SLUG}/daterange`);
	if (!rangeRes.ok) throw new Error(`Daterange API failed: ${rangeRes.status}`);
	const { startDate } = await rangeRes.json();
	const endAt = Date.now();
	const startAt = new Date(startDate).getTime();

	// 2. 获取全量统计（share API，无需认证）
	const statsRes = await fetch(
		`${UMAMI_BASE}/api/share/${SHARE_SLUG}/stats?startAt=${startAt}&endAt=${endAt}`,
	);
	if (!statsRes.ok) throw new Error(`Stats API failed: ${statsRes.status}`);
	const stats = await statsRes.json();

	const result = {
		pageviews: stats.pageviews ?? 0,
		visitors: stats.visitors ?? 0,
		visits: stats.visits ?? 0,
		bounces: stats.bounces ?? 0,
		totaltime: stats.totaltime ?? 0,
		updatedAt: new Date().toISOString(),
	};

	writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));
	console.log(`Site stats saved to ${OUTPUT_PATH}`);
	console.log(`  Pageviews: ${result.pageviews}`);
	console.log(`  Visitors:  ${result.visitors}`);
}

fetchStats().catch(err => {
	console.error('Failed to fetch stats:', err.message);
	process.exit(1);
});
