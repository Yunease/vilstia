<script lang="ts">
type CatType = "Normal" | "Rest" | "Lost" | "Shadow" | "Jump";
type PetMessages = Record<CatType, string[]>;

const PET_IMG_PATH = "/images/pet/";
const PET_SIZE = 172;
const BUBBLE_DURATION = 3000;
const BUBBLE_MAX_WIDTH = 200;
const CAT_TYPES: CatType[] = ["Normal", "Rest", "Lost", "Shadow", "Jump"];
const CAT_LABELS: Record<CatType, string> = {
	Normal: "₍^..^₎⟆",
	Rest: "(˘ρ˘)",
	Lost: "(ﾟ´ω`ﾟ)",
	Shadow: "▀︿▀",
	Jump: "( ⁰▿⁰)",
};
const CAT_IMAGE_MAP: Record<CatType, string> = {
	Normal: "Idle_Normal",
	Rest: "Idle_Rest",
	Lost: "Idle_Lost",
	Shadow: "Idle_Shadow",
	Jump: "Idle_Jump",
};

let { messages }: { messages: PetMessages } = $props();

let visible = $state(true);
let catType: CatType = $state("Normal");
let hasBeenClosed = $state(false);
let fading = $state(false);
let message = $state("");
let showBubble = $state(false);
let showMenu = $state(false);
let bubbleTimeout: ReturnType<typeof setTimeout> | null = null;
let fadeTimeout: ReturnType<typeof setTimeout> | null = null;
let imgEl: HTMLImageElement | null = $state(null);

$effect(() => {
	CAT_TYPES.forEach((type) => {
		const img = new Image();
		img.src = `${PET_IMG_PATH}${CAT_IMAGE_MAP[type]}.png`;
	});
});

$effect(() => {
	return () => {
		if (bubbleTimeout) clearTimeout(bubbleTimeout);
		if (fadeTimeout) clearTimeout(fadeTimeout);
	};
});

function switchCat(type: CatType) {
	if (type === catType) {
		showMenu = false;
		restoreCat();
		return;
	}
	showMenu = false;
	fading = true;
	if (fadeTimeout) clearTimeout(fadeTimeout);
	fadeTimeout = setTimeout(() => {
		catType = type;
		if (imgEl) {
			if (imgEl.complete) {
				restoreCat();
			} else {
				imgEl.onload = () => {
					restoreCat();
					imgEl!.onload = null;
				};
			}
		} else {
			restoreCat();
		}
	}, 200);
}

function restoreCat() {
	if (fadeTimeout) clearTimeout(fadeTimeout);
	fadeTimeout = setTimeout(() => {
		fading = false;
	}, 150);
}

function handleDialogue() {
	if (!visible) return;
	if (showBubble && bubbleTimeout) clearTimeout(bubbleTimeout);
	message = getRandomMessage();
	showBubble = true;
	bubbleTimeout = setTimeout(() => {
		showBubble = false;
	}, BUBBLE_DURATION);
}

function handleContext(e: MouseEvent) {
	e.preventDefault();
	if (!visible) return;
	if (!showMenu) {
		fading = true;
		if (bubbleTimeout) clearTimeout(bubbleTimeout);
		showBubble = false;
	}
	showMenu = !showMenu;
}

function handleClickOutside() {
	if (showMenu) {
		showMenu = false;
		restoreCat();
	}
}

function toggleVisibility() {
	if (visible) {
		hasBeenClosed = true;
		visible = false;
	} else {
		if (hasBeenClosed) {
			const next = CAT_TYPES[Math.floor(Math.random() * CAT_TYPES.length)];
			if (next !== catType) {
				switchCat(next);
			}
		}
		visible = true;
	}
}

function getRandomMessage(): string {
	const msgs = messages[catType];
	if (!msgs || msgs.length === 0) return "……";
	return msgs[Math.floor(Math.random() * msgs.length)];
}
</script>

<svelte:window onclick={handleClickOutside} />

<div
	id="pet-cat-container"
	class="hidden md:block fixed bottom-4 z-40 select-none transition-all duration-300 ease-out"
	class:opacity-0={!visible}
	class:scale-90={!visible}
	class:pointer-events-none={!visible}
	style="right: calc(1rem + 15px);"
>
	<div
		class="relative flex flex-col items-end"
		oncontextmenu={handleContext}
	>
		{#if showBubble && message}
			<div
				class="mb-2 px-3 py-2 rounded-xl text-sm leading-snug break-words card-base shadow-lg animate-pet-fade-in"
				style="max-width: {BUBBLE_MAX_WIDTH}px;"
			>
				{message}
			</div>
		{/if}

		<div
			class="radial-menu"
			class:show-menu={showMenu}
			style="width: 220px; height: 220px; top: -60px; right: -10px;"
		>
			{#each CAT_TYPES as type, i}
				{@const angle = (i / CAT_TYPES.length) * 2 * Math.PI - Math.PI / 2}
				{@const r = 80}
				{@const x = Math.cos(angle) * r}
				{@const y = Math.sin(angle) * r}
				<button
					class="radial-item"
					style="left: calc(50% + {x}px - 28px); top: calc(50% + {y}px - 28px);
						transition-delay: {showMenu ? `${i * 40}ms` : `${(CAT_TYPES.length - 1 - i) * 30}ms`};"
					class:radial-active={catType === type}
					onclick={(e) => { e.stopPropagation(); switchCat(type); }}
				>
					<span class="radial-icon">{CAT_LABELS[type]}</span>
				</button>
			{/each}
			{#if showMenu}
				<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--btn-content)] opacity-40"></div>
			{/if}
		</div>

		<div class="relative group">
			<button
				id="pet-cat-img"
				class="block cursor-pointer focus:outline-none active:scale-95 transition-transform"
				onclick={handleDialogue}
				aria-label="像素小猫"
			>
				<div class="overflow-hidden" style="width: {PET_SIZE}px; height: {PET_SIZE}px;">
					<img
						bind:this={imgEl}
						src="{PET_IMG_PATH}{CAT_IMAGE_MAP[catType]}.png"
						alt="像素小猫"
						width={PET_SIZE}
						height={PET_SIZE}
						class="image-pixelated transition-opacity duration-200 transition-transform duration-200"
						class:opacity-0={fading}
						class:scale-90={fading}
						draggable="false"
					/>
				</div>
			</button>

			<button
				class="close-btn absolute -top-2 -right-1 w-6 h-6 rounded-full
					items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200
					bg-[var(--card-bg)] border border-[var(--line-divider)] shadow-sm
					hover:bg-[var(--btn-regular-bg-hover)] active:scale-90 text-[var(--btn-content)]"
				onclick={toggleVisibility}
				aria-label="隐藏小猫"
			>
				<span class="close-x">&times;</span>
			</button>

		</div>
	</div>
</div>

<button
	class="hidden md:flex fixed bottom-4 right-4 z-40 w-[3.75rem] h-[3.75rem] rounded-full card-base shadow-lg
		flex items-center justify-center
		hover:scale-110 active:scale-95 transition-all duration-300 ease-out"
	class:opacity-0={visible}
	class:scale-90={visible}
	class:pointer-events-none={visible}
	onclick={toggleVisibility}
	aria-label="显示小猫"
>
	<span class="restore-icon">Sharin</span>
</button>

<style>
	.image-pixelated {
		image-rendering: pixelated;
		image-rendering: crisp-edges;
	}

	@keyframes pet-fade-in {
		from {
			opacity: 0;
			transform: translateY(4px) scale(0.9);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.animate-pet-fade-in {
		animation: pet-fade-in 0.25s ease-out forwards;
	}

	/* Radial menu - always rendered, toggled via CSS class */
	.radial-menu {
		position: absolute;
		pointer-events: none;
		z-index: 50;
	}

	.radial-item {
		position: absolute;
		width: 56px;
		height: 56px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--card-bg, #fff);
		color: var(--btn-content, #333);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		cursor: pointer;
		border: 2px solid var(--line-divider, #e0e0e0);
		opacity: 0;
		transform: scale(0);
		pointer-events: none;
		transition:
			opacity 0.2s ease,
			transform 0.2s ease,
			box-shadow 0.15s ease,
			border-color 0.15s ease;
	}

	.radial-menu.show-menu {
		pointer-events: auto;
	}

	.radial-menu.show-menu .radial-item {
		opacity: 1;
		transform: scale(1);
		pointer-events: auto;
	}

	.radial-item.radial-active {
		border-color: var(--primary);
		box-shadow: 0 0 0 2px var(--primary), 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.radial-item:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		transform: scale(1.1);
	}

	.radial-icon {
		font-family: monospace;
		font-size: 13px;
		font-weight: bold;
		line-height: 1;
		pointer-events: none;
	}

	.close-x {
		font-family: monospace;
		font-size: 14px;
		line-height: 1;
		pointer-events: none;
	}

	.close-btn {
		display: none;
	}

	@media (min-width: 768px) {
		.close-btn {
			display: flex;
		}
	}

	.restore-icon {
		font-family: monospace;
		font-size: 13px;
		pointer-events: none;
	}
</style>
