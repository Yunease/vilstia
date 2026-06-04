<script lang="ts">
import { BUBBLE_DURATION, BUBBLE_MAX_WIDTH, PET_SIZE } from "@constants/pet";
import petMessagesData from "@/data/pet-messages.json";
import Icon from "@iconify/svelte";
import type { PetMessages } from "@/types/pet";

const IDLE_PNG = "/images/pet/idle.png";

let visible = $state(true);
let message = $state("");
let showBubble = $state(false);
let bubbleTimeout: ReturnType<typeof setTimeout> | null = null;

const messages: PetMessages = petMessagesData as PetMessages;

function getRandomMessage(): string {
	const msgs = messages.messages;
	return msgs[Math.floor(Math.random() * msgs.length)];
}

function handleDblClick() {
	if (!visible) return;
	if (bubbleTimeout) clearTimeout(bubbleTimeout);
	message = getRandomMessage();
	showBubble = true;
	bubbleTimeout = setTimeout(() => {
		showBubble = false;
	}, BUBBLE_DURATION);
}

function toggleVisibility() {
	visible = !visible;
}
</script>

<div
	id="pet-cat-container"
	class="hidden md:block fixed bottom-4 z-40 select-none transition-all duration-300 ease-out"
	class:opacity-0={!visible}
	class:scale-90={!visible}
	class:pointer-events-none={!visible}
	style="right: 1rem;"
>
	<div class="relative flex flex-col items-end">
		{#if showBubble && message}
			<div
				class="mb-2 px-3 py-2 rounded-xl text-sm leading-snug whitespace-normal break-words
					card-base shadow-lg animate-fade-in"
				style="max-width: {BUBBLE_MAX_WIDTH}px;"
			>
				{message}
			</div>
		{/if}

		<div class="relative group">
			<button
				id="pet-cat-img"
				class="block cursor-pointer focus:outline-none active:scale-95 transition-transform"
				ondblclick={handleDblClick}
				aria-label="像素小猫"
			>
				<img
					src={IDLE_PNG}
					alt="像素小猫"
					width={PET_SIZE}
					height={PET_SIZE}
					class="image-pixelated"
					draggable="false"
				/>
			</button>

			<button
				class="absolute -top-2 -right-2 w-6 h-6 rounded-full
					flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200
					bg-[var(--card-bg)] border border-[var(--line-divider)] shadow-sm
					hover:bg-[var(--btn-regular-bg-hover)] active:scale-90 text-[var(--btn-content)]"
				onclick={toggleVisibility}
				aria-label="隐藏小猫"
			>
				<Icon icon="material-symbols:close-rounded" class="text-sm" />
			</button>
		</div>
	</div>
</div>

<button
	class="hidden md:flex fixed bottom-4 right-4 z-40 w-10 h-10 rounded-full card-base shadow-lg
		flex items-center justify-center text-lg
		hover:scale-110 active:scale-95 transition-all duration-300 ease-out"
	class:opacity-0={visible}
	class:scale-90={visible}
	class:pointer-events-none={visible}
	onclick={toggleVisibility}
	aria-label="显示小猫"
>
	🐱
</button>

<style>
	.image-pixelated {
		image-rendering: pixelated;
		image-rendering: crisp-edges;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(4px) scale(0.9);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.25s ease-out forwards;
	}
</style>
