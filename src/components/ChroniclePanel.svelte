<script lang="ts">
import { onMount, onDestroy } from "svelte";
import Icon from "@iconify/svelte";

interface ChronicleEvent {
    id: string;
    data: {
        title: string;
        date: Date;
        icon?: string;
        category?: string;
    };
    body?: string;
}

const BATCH_SIZE = 3;

let { events }: { events: ChronicleEvent[] } = $props();

let displayedEvents: ChronicleEvent[] = $state(events.slice(0, BATCH_SIZE));
let loading = $state(false);
let allLoaded = $state(events.length <= BATCH_SIZE);
let sentinelEl: HTMLDivElement | undefined = $state();
let observer: IntersectionObserver | undefined;

function formatDate(date: Date) {
    const d = date instanceof Date ? date : new Date(date);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${y}.${m}.${day}`;
}

function loadNextBatch() {
    if (loading || allLoaded) return;
    loading = true;
    setTimeout(() => {
        const next = events.slice(
            displayedEvents.length,
            displayedEvents.length + BATCH_SIZE,
        );
        displayedEvents = [...displayedEvents, ...next];
        if (displayedEvents.length >= events.length) {
            allLoaded = true;
            observer?.disconnect();
        }
        loading = false;
    }, 300);
}

onMount(() => {
    if (allLoaded || !sentinelEl) return;
    observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting) {
                loadNextBatch();
            }
        },
        { rootMargin: "200px" },
    );
    observer.observe(sentinelEl);
});

onDestroy(() => observer?.disconnect());
</script>

<div class="card-base px-6 py-8 md:px-10 w-full">
    <!-- Header -->
    <div class="text-center mb-12">
        <h2 class="text-2xl font-bold text-[var(--primary)]">层岩叠纪</h2>
        <p class="text-sm text-50 mt-2">站点大事记，记录每一个足迹</p>
    </div>

    <!-- Timeline -->
    <div class="relative">

        <!-- Vertical dashed line -->
        <div class="absolute top-0 bottom-0 border-l-[1.5px] border-dashed border-[var(--line-color)]
                    left-[0.9rem] md:left-1/2 md:-translate-x-[0.75px]">
        </div>

        {#each displayedEvents as event, i (event.id)}
            {@const isRight = i % 2 !== 0}
            {@const isLast = i === displayedEvents.length - 1}

            <div class="relative {isLast ? 'mb-6' : 'mb-10'}">

                <!-- Dot (center at 0.9rem mobile, 50% desktop; 12px diameter) -->
                <div class="absolute top-6 w-3 h-3 rounded-full z-10
                            bg-[var(--primary)] outline outline-4 outline-[var(--card-bg)]
                            left-[0.9rem] -translate-x-[5px]
                            md:left-1/2 md:-translate-x-1/2">
                </div>

                <!-- Horizontal connector (dot right-edge → card left-edge) -->
                <div class="absolute top-[1.62rem] border-t-[1.5px] border-dashed border-[var(--line-color)]
                            left-[1.275rem] right-[calc(50%-0.5rem)]
                            md:hidden">
                </div>
                <div class="absolute top-[1.62rem] border-t-[1.5px] border-dashed border-[var(--line-color)]
                            hidden md:block
                            {isRight
                                ? 'left-[calc(50%+0.375rem)] right-[calc(50%-0.5rem)]'
                                : 'right-[calc(50%+0.375rem)] left-[calc(50%-0.5rem)]'}">
                </div>

                <!-- Card -->
                <div class="ml-[2.1rem] md:ml-0 md:w-[calc(50%-2rem)]
                            {isRight ? 'md:ml-auto' : 'md:mr-auto'}">
                    <div class="card-base card-shadow p-4 md:p-5 transition-all
                                hover:scale-[1.01] hover:shadow-md
                                border-[1.5px] border-dashed border-[var(--line-color)]
                                rounded-[var(--radius-large)]">
                        <div class="flex items-center gap-2 mb-2 md:mb-3">
                            {#if event.data.icon}
                                <span class="text-[var(--primary)] text-lg">
                                    <Icon icon={event.data.icon} width="22" height="22" />
                                </span>
                            {/if}
                            <span class="text-xs md:text-sm text-[var(--primary)] font-medium">
                                {formatDate(event.data.date)}
                            </span>
                            {#if event.data.category}
                                <span class="text-xs text-30 px-2 py-0.5 rounded-full bg-[var(--btn-regular-bg)]">
                                    {event.data.category}
                                </span>
                            {/if}
                        </div>
                        <h3 class="font-bold text-75 text-base md:text-lg mb-1 md:mb-2">
                            {event.data.title}
                        </h3>
                        {#if event.body}
                            <p class="text-sm text-50 leading-relaxed">{event.body.trim()}</p>
                        {/if}
                    </div>
                </div>
            </div>
        {/each}

        <!-- Sentinel / loading -->
        {#if !allLoaded}
            <div bind:this={sentinelEl} class="h-10 flex items-center justify-center">
                {#if loading}
                    <div class="flex items-center gap-2 text-30 text-sm">
                        <div class="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                        加载中...
                    </div>
                {/if}
            </div>
        {:else}
            <div class="text-center text-30 text-sm py-6 flex items-center justify-center gap-2">
                <div class="w-8 border-t-[1.5px] border-dashed border-[var(--line-color)]"></div>
                <span>已展示全部记录</span>
                <div class="w-8 border-t-[1.5px] border-dashed border-[var(--line-color)]"></div>
            </div>
        {/if}
    </div>
</div>
