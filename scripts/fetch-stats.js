import { writeFileSync } from 'node:fs';

const UMAMI_BASE = 'https://analytics.hxcn.dev';
const UMAMI_USER = process.env.UMAMI_USER || 'yunease';
const UMAMI_PASS = process.env.UMAMI_PASS || '12345678';
const SHARE_SLUG = 'p8xz7fJixSOSxkNy';
const OUTPUT_PATH = 'public/umami-stats.json';

async function fetchStats() {
	console.log('Fetching site stats from Umami...');

	// 1. Login
	const loginRes = await fetch(`${UMAMI_BASE}/api/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username: UMAMI_USER, password: UMAMI_PASS }),
	});
	if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
	const { token } = await loginRes.json();

	// 2. Get websiteId
	const shareRes = await fetch(`${UMAMI_BASE}/api/share/${SHARE_SLUG}`);
	if (!shareRes.ok) throw new Error(`Share API failed: ${shareRes.status}`);
	const { websiteId } = await shareRes.json();

	// 3. Get daterange for all-time stats
	const rangeRes = await fetch(
		`${UMAMI_BASE}/api/websites/${websiteId}/daterange`,
		{ headers: { Authorization: `Bearer ${token}` } },
	);
	if (!rangeRes.ok) throw new Error(`Daterange API failed: ${rangeRes.status}`);
	const { startDate } = await rangeRes.json();
	const endAt = Date.now();
	const startAt = new Date(startDate).getTime();

	// 4. Get total stats
	const statsRes = await fetch(
		`${UMAMI_BASE}/api/websites/${websiteId}/stats?startAt=${startAt}&endAt=${endAt}`,
		{ headers: { Authorization: `Bearer ${token}` } },
	);
	if (!statsRes.ok) throw new Error(`Stats API failed: ${statsRes.status}`);
	const stats = await statsRes.json();

	// 5. Get per-path metrics for article-level PV
	const metricsRes = await fetch(
		`${UMAMI_BASE}/api/websites/${websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&type=path`,
		{ headers: { Authorization: `Bearer ${token}` } },
	);
	if (!metricsRes.ok) throw new Error(`Metrics API failed: ${metricsRes.status}`);
	const metrics = await metricsRes.json();

	const result = {
		pageviews: stats.pageviews ?? 0,
		visitors: stats.visitors ?? 0,
		visits: stats.visits ?? 0,
		bounces: stats.bounces ?? 0,
		totaltime: stats.totaltime ?? 0,
		paths: metrics.map(m => ({ path: m.x, views: m.y })),
		updatedAt: new Date().toISOString(),
	};

	writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));
	console.log(`Site stats saved to ${OUTPUT_PATH}`);
	console.log(`  Pageviews: ${result.pageviews}`);
	console.log(`  Visitors:  ${result.visitors}`);
	console.log(`  Paths:     ${result.paths.length}`);
}

fetchStats().catch(err => {
	console.error('Failed to fetch stats:', err.message);
	process.exit(1);
});
