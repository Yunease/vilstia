import { writeFileSync } from 'node:fs';

const UMAMI_BASE = 'https://analytics.hxcn.dev';
const UMAMI_USER = 'yunease';
const UMAMI_PASS = '12345678';
const OUTPUT_PATH = 'public/umami-stats.json';

async function fetchStats() {
	console.log('Fetching site stats from Umami...');

	// 1. Login to get user token
	const loginRes = await fetch(`${UMAMI_BASE}/api/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username: UMAMI_USER, password: UMAMI_PASS }),
	});
	if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
	const { token } = await loginRes.json();

	// 2. Get websiteId from share slug
	const shareRes = await fetch(`${UMAMI_BASE}/api/share/p8xz7fJixSOSxkNy`);
	if (!shareRes.ok) throw new Error(`Share API failed: ${shareRes.status}`);
	const { websiteId } = await shareRes.json();

	// 3. Get all-time stats (use 90-day window for "recent" feel, or site build time for all-time)
	const endAt = Date.now();
	const startAt = endAt - 90 * 24 * 60 * 60 * 1000; // last 90 days

	const statsRes = await fetch(
		`${UMAMI_BASE}/api/websites/${websiteId}/stats?startAt=${startAt}&endAt=${endAt}`,
		{ headers: { Authorization: `Bearer ${token}` } },
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
