<script lang="ts">
	import { onMount } from "svelte";

	export let years: YearData[];
	export let totalCount: number;
	export let currentYearCount: number;

	interface YearData {
		year: number;
		count: number;
		articleCount: number;
		rantCount: number;
		data: Record<string, number>;
	}

	let selectedYear: number = Math.max(...years.map((y) => y.year));

	$: yearData = years.find((y) => y.year === selectedYear);
	$: yearIdx = years.findIndex((y) => y.year === selectedYear);

	function goToYear(y: number) {
		selectedYear = y;
	}
	function prevYear() {
		if (yearIdx > 0) selectedYear = years[yearIdx - 1].year;
	}
	function nextYear() {
		if (yearIdx < years.length - 1) selectedYear = years[yearIdx + 1].year;
	}

	// ── SVG / Canvas constants ─────────────────────────────────
	const CELL = 11;
	const GAP = 3;
	const STEP = CELL + GAP;
	const R = 2;
	const PL = 34;
	const PR = 8;
	const PT = 22;
	const PB = 0;
	const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""];

	function getMonday(d: Date): Date {
		const r = new Date(d);
		r.setHours(0, 0, 0, 0);
		r.setDate(r.getDate() - ((r.getDay() + 6) % 7));
		return r;
	}
	function getSunday(d: Date): Date {
		const r = new Date(d);
		r.setHours(0, 0, 0, 0);
		r.setDate(r.getDate() + (7 - ((r.getDay() + 6) % 7 + 1)));
		return r;
	}
	function fmt(d: Date): string {
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
	}
	function op(n: number): string {
		if (n === 0) return "0.05";
		if (n === 1) return "0.4";
		if (n === 2) return "0.6";
		if (n === 3) return "0.8";
		return "1";
	}
	function opNum(n: number): number {
		if (n === 0) return 0.05;
		if (n === 1) return 0.4;
		if (n === 2) return 0.6;
		if (n === 3) return 0.8;
		return 1;
	}

	interface Cell {
		x: number;
		y: number;
		op: string;
		tip: string;
	}
	interface Mlabel {
		x: number;
		label: string;
	}

	// Fixed dimensions for consistent aspect ratio across all years.
	const FIXED_W = 53 * STEP + PL + PR;
	const FIXED_H = 7 * STEP + PT + PB;

	let cells: Cell[] = [];
	let monthLabels: Mlabel[] = [];

	$: if (yearData) {
		const { year, data } = yearData;
		const now = new Date();
		const ystart = new Date(year, 0, 1);
		const yend = year === now.getFullYear() ? now : new Date(year, 11, 31);

		const gs = getMonday(ystart);
		const ge = getSunday(yend);
		const nWeeks = Math.max(1, Math.ceil((ge.getTime() - gs.getTime()) / (7 * 86400000)));

		// Month labels — only odd months
		const ml: Mlabel[] = [];
		const seen = new Set<number>();
		for (let w = 0; w < nWeeks; w++) {
			const d = new Date(gs);
			d.setDate(d.getDate() + w * 7 + 3);
			if (w === 0 || d.getMonth() !== new Date(gs.getTime() + (w - 1) * 7 * 86400000 + 3 * 86400000).getMonth()) {
				const x = w * STEP + PL;
				const b = Math.round(x / 5) * 5;
				if (seen.has(b)) continue;
				seen.add(b);
				const monthNum = d.getMonth() + 1;
				if (monthNum === 12 || monthNum % 2 === 0) continue;
				ml.push({ x, label: `${monthNum}月` });
			}
		}
		monthLabels = ml;

		// Cells
		const cc: Cell[] = [];
		for (let w = 0; w < nWeeks; w++) {
			for (let d = 0; d < 7; d++) {
				const cd = new Date(gs);
				cd.setDate(cd.getDate() + w * 7 + d);
				if (cd < ystart || cd > yend) continue;
				const key = fmt(cd);
				const n = data[key] ?? 0;
				cc.push({
					x: w * STEP + PL,
					y: d * STEP + PT,
					op: op(n),
					tip: n === 0 ? `无文章` : `${n} 篇 · ${key}`,
				});
			}
		}
		cells = cc;
	}

	// ── Canvas rendering ─────────────────────────────────────────
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let tooltip: { text: string; x: number; y: number; visible: boolean } = { text: "", x: 0, y: 0, visible: false };

	function draw() {
		if (!canvas || !ctx || !yearData) return;

		// Scale for high-DPI displays. Keep the drawing buffer at FIXED_W/FIXED_H
		// logical units; CSS max-w-full h-auto scales the display size responsively.
		const dpr = window.devicePixelRatio || 1;
		canvas.width = FIXED_W * dpr;
		canvas.height = FIXED_H * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		// Resolve the CSS variable to an actual color for canvas drawing.
		const primaryColor = getComputedStyle(canvas).getPropertyValue("--primary").trim() || "oklch(0.55 0.12 125)";

		// Clear
		ctx.clearRect(0, 0, FIXED_W, FIXED_H);

		// Month labels
		ctx.font = "14px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = primaryColor;
		for (const ml of monthLabels) {
			ctx.globalAlpha = 0.6;
			ctx.fillText(ml.label, ml.x, PT - 10);
		}
		ctx.globalAlpha = 1;

		// Day labels
		ctx.font = "12px sans-serif";
		ctx.textAlign = "right";
		ctx.textBaseline = "middle";
		ctx.fillStyle = primaryColor;
		ctx.globalAlpha = 0.5;
		DAYS.forEach((label, i) => {
			if (label) {
				ctx!.fillText(label, PL - 6, i * STEP + PT + CELL / 2);
			}
		});
		ctx.globalAlpha = 1;

		// Cells
		ctx.fillStyle = primaryColor;
		for (const c of cells) {
			ctx.globalAlpha = opNum(parseFloat(c.op));
			// draw rounded rect manually
			const x = c.x;
			const y = c.y;
			const r = R;
			ctx.beginPath();
			ctx.moveTo(x + r, y);
			ctx.arcTo(x + CELL, y, x + CELL, y + CELL, r);
			ctx.arcTo(x + CELL, y + CELL, x, y + CELL, r);
			ctx.arcTo(x, y + CELL, x, y, r);
			ctx.arcTo(x, y, x + CELL, y, r);
			ctx.closePath();
			ctx.fill();
		}
		ctx.globalAlpha = 1;
	}

	function handleMouseMove(e: MouseEvent) {
		if (!canvas || cells.length === 0) return;
		const rect = canvas.getBoundingClientRect();
		const scaleX = FIXED_W / rect.width;
		const scaleY = FIXED_H / rect.height;
		const x = (e.clientX - rect.left) * scaleX;
		const y = (e.clientY - rect.top) * scaleY;

		const cell = cells.find((c) => x >= c.x && x <= c.x + CELL && y >= c.y && y <= c.y + CELL);
		if (cell) {
			tooltip = { text: cell.tip, x: e.clientX - rect.left + 8, y: e.clientY - rect.top - 8, visible: true };
		} else {
			tooltip = { ...tooltip, visible: false };
		}
	}

	function handleMouseLeave() {
		tooltip = { ...tooltip, visible: false };
	}

	$: cells, monthLabels, canvas, draw();

	onMount(() => {
		ctx = canvas.getContext("2d");
		draw();
	});
</script>

<div class="heatmap-card rounded-[var(--radius-large)] bg-[var(--card-bg)] p-4 md:p-5">
	<h3 class="font-bold text-lg mb-3 flex items-center text-[var(--primary)] gap-2">
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
		创作热力图
	</h3>

	<!-- Year tabs -->
	<div class="year-tabs">
		<button class="year-nav" on:click={prevYear} disabled={yearIdx <= 0}>
			‹
		</button>

		{#each years as yr}
			<button
				class="year-tab"
				class:active={yr.year === selectedYear}
				on:click={() => goToYear(yr.year)}
			>
				{yr.year}
			</button>
		{/each}

		<button class="year-nav" on:click={nextYear} disabled={yearIdx >= years.length - 1}>
			›
		</button>
	</div>

	<!-- Canvas grid -->
	{#if yearData}
		<div class="relative" style="max-width: 100%; overflow-x: auto;">
			<canvas
				bind:this={canvas}
				width={FIXED_W}
				height={FIXED_H}
				class="block max-w-full h-auto"
				role="img"
				aria-label={`${selectedYear} 年创作热力图，共 ${yearData?.articleCount ?? 0} 篇文章`}
				on:mousemove={handleMouseMove}
				on:mouseleave={handleMouseLeave}
			></canvas>
			{#if tooltip.visible}
				<div
					class="heatmap-tooltip absolute z-10 px-2 py-1 rounded text-xs bg-black/80 text-white pointer-events-none whitespace-nowrap"
					style="left: {tooltip.x}px; top: {tooltip.y}px; transform: translate(-50%, -100%);"
				>
					{tooltip.text}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Legend + stats -->
	<div class="heatmap-footer">
		<a href="/heatmap/" class="text-50 text-sm no-underline hover:text-[var(--primary)] transition-colors">
			累计 <strong class="text-75">{totalCount}</strong> 篇
		</a>
		<span class="text-30 text-sm">·</span>
		<span class="text-50 text-sm">
			{selectedYear} 年 <strong class="text-75">{yearData?.articleCount ?? 0}</strong> 篇文章
				{#if yearData?.rantCount}· <strong class="text-75">{yearData.rantCount}</strong> 条动态{/if}
			</span>
		<span class="ml-auto flex items-center gap-1 text-30 text-xs">
			<span>少</span>
			{#each [0, 1, 2, 3, 5] as n}
				<svg width="10" height="10" viewBox="0 0 10 10" style="display: inline-block; vertical-align: middle">
					<rect width="10" height="10" rx="1.5" style="fill: var(--primary)" opacity={op(n >= 8 ? 99 : n)} />
				</svg>
			{/each}
			<span>多</span>
		</span>
	</div>
</div>

<style>
	.heatmap-card {
		overflow-x: auto;
	}
	.year-tabs {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-bottom: 12px;
		flex-wrap: wrap;
	}
	.year-tab {
		padding: 3px 10px;
		font-size: 13px;
		border-radius: 6px;
		border: none;
		cursor: pointer;
		background: transparent;
		color: var(--primary, oklch(0.55 0.12 var(--hue, 125)));
		transition: all 0.15s;
		font-weight: 500;
	}
	.year-tab:hover {
		background: var(--btn-plain-bg-hover, oklch(0.95 0.025 var(--hue, 125)));
	}
	.year-tab.active {
		background: var(--primary, oklch(0.70 0.14 var(--hue, 125)));
		color: white;
	}
	.year-nav {
		padding: 3px 8px;
		font-size: 16px;
		border-radius: 6px;
		border: none;
		cursor: pointer;
		background: transparent;
		color: var(--primary, oklch(0.55 0.12 var(--hue, 125)));
		transition: all 0.15s;
		line-height: 1;
	}
	.year-nav:hover:not(:disabled) {
		background: var(--btn-plain-bg-hover, oklch(0.95 0.025 var(--hue, 125)));
	}
	.year-nav:disabled {
		opacity: 0.3;
		cursor: default;
	}
	.heatmap-footer {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 16px;
		margin-top: 12px;
		padding-top: 10px;
		border-top: 1px dashed var(--line-color, rgba(0,0,0,0.1));
	}
	.heatmap-tooltip {
		position: absolute;
	}
</style>
