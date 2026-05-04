<script lang="ts">
import {
    characters,
    pickRandomCharacters,
    type AICharacter,
} from "../config/ai-world/character";
import { world, WORKER_API_BASE } from "../config/ai-world/world";
import Icon from "@iconify/svelte";

interface ChatMessage {
    role: "npc" | "user" | "system";
    characterId?: string;
    characterName?: string;
    characterAvatar?: string;
    characterColor?: string;
    content: string;
    timestamp: number;
}

type Phase =
    | "idle"
    | "generating-scenario"
    | "npc-speaking"
    | "generating-options"
    | "user-choosing"
    | "showing-summary";

// --- State ---
let phase: Phase = $state("idle");
let messages: ChatMessage[] = $state([]);
let currentCharIndex = $state(0);
let speakingOrder: AICharacter[] = $state([]);
let currentOptions: string[] = $state([]);

// Typewriter state
let fullTextBuffer = "";
let typewriterIndex = 0;
let typewriterTimer: ReturnType<typeof setInterval> | null = null;
let typewriterDone = $state(true);
let lastMessageTyping = $state(false);

// DOM
let chatContainer: HTMLDivElement | undefined = $state();

function isImage(avatar: string) {
    return avatar.startsWith("http") || avatar.startsWith("/") || avatar.startsWith("assets/");
}

// --- Scroll ---
function scrollToBottom() {
    if (chatContainer) {
        requestAnimationFrame(() => {
            chatContainer!.scrollTop = chatContainer!.scrollHeight;
        });
    }
}

$effect(() => {
    void messages.length;
    void lastMessageTyping;
    void currentOptions.length;
    setTimeout(scrollToBottom, 50);
});

// --- Typewriter ---
function startTypewriter(msgIndex: number) {
    if (typewriterTimer) clearInterval(typewriterTimer);
    typewriterIndex = 0;
    typewriterDone = false;
    lastMessageTyping = true;

    typewriterTimer = setInterval(() => {
        if (typewriterIndex < fullTextBuffer.length) {
            typewriterIndex++;
            messages[msgIndex].content = fullTextBuffer.slice(0, typewriterIndex);
            messages = [...messages];
        } else {
            if (typewriterTimer) clearInterval(typewriterTimer);
            typewriterTimer = null;
            typewriterDone = true;
            lastMessageTyping = false;
        }
    }, 30);
}

function skipTypewriter() {
    if (!typewriterDone && typewriterTimer) {
        clearInterval(typewriterTimer);
        typewriterTimer = null;
        const lastIdx = messages.length - 1;
        if (lastIdx >= 0) {
            messages[lastIdx].content = fullTextBuffer;
            messages = [...messages];
        }
        typewriterDone = true;
        lastMessageTyping = false;
    }
}

function waitForTypewriter(): Promise<void> {
    return new Promise((resolve) => {
        if (typewriterDone) {
            resolve();
            return;
        }
        const check = setInterval(() => {
            if (typewriterDone) {
                clearInterval(check);
                resolve();
            }
        }, 50);
    });
}

// --- API Calls ---
async function fetchStreaming(
    url: string,
    body: object,
    onChunk: (text: string) => void,
): Promise<void> {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "未知错误" }));
        throw new Error(errData.error || `HTTP ${res.status}`);
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop()!;

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);
            if (data === "[DONE]") continue;

            try {
                const parsed = JSON.parse(data);
                if (parsed.type === "text") {
                    onChunk(parsed.content);
                } else if (parsed.type === "error") {
                    throw new Error(parsed.content);
                }
            } catch (e) {
                if (e instanceof SyntaxError) continue;
                throw e;
            }
        }
    }
}

async function fetchJSON(url: string, body: object): Promise<any> {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText}`);
    }
    return res.json();
}

// --- Conversation Logic ---
async function startNewConversation() {
    if (typewriterTimer) clearInterval(typewriterTimer);
    typewriterTimer = null;
    messages = [];
    currentCharIndex = 0;
    fullTextBuffer = "";
    typewriterDone = true;
    lastMessageTyping = false;
    currentOptions = [];

    speakingOrder = pickRandomCharacters(3);

    await generateScenario();
}

async function generateScenario() {
    phase = "generating-scenario";

    const charNames = speakingOrder.map((c) => c.name).join("、");
    const msgIndex = messages.length;

    messages = [
        ...messages,
        { role: "system", content: "", timestamp: Date.now() },
    ];

    fullTextBuffer = "";

    try {
        await fetchStreaming(
            `${WORKER_API_BASE}/api/ai-world/chat`,
            {
                messages: [],
                character: {
                    id: "narrator",
                    name: "旁白",
                    systemPrompt: `你是一个旁白者。请生成一个开场场景。参与讨论的角色有：${charNames}`,
                },
                world,
                round: 0,
                isLastInRound: false,
                isScenario: true,
            },
            (chunk) => {
                fullTextBuffer += chunk;
                if (typewriterDone) startTypewriter(msgIndex);
            },
        );

        await waitForTypewriter();
        await speakNextCharacter();
    } catch (err) {
        messages[msgIndex].content = `[场景生成失败: ${err instanceof Error ? err.message : "未知错误"}]`;
        messages = [...messages];
        phase = "idle";
    }
}

async function speakNextCharacter() {
    const char = speakingOrder[currentCharIndex];
    phase = "npc-speaking";

    const history = messages
        .filter((m) => m.role !== "system" || m === messages[0])
        .map((m) => ({
            role: m.role === "npc" ? "assistant" : "user",
            content: m.content,
        }));

    const msgIndex = messages.length;
    fullTextBuffer = "";

    messages = [
        ...messages,
        {
            role: "npc",
            characterId: char.id,
            characterName: char.name,
            characterAvatar: char.avatar,
            characterColor: char.color,
            content: "",
            timestamp: Date.now(),
        },
    ];

    try {
        await fetchStreaming(
            `${WORKER_API_BASE}/api/ai-world/chat`,
            {
                messages: history,
                character: {
                    id: char.id,
                    name: char.name,
                    systemPrompt: char.systemPrompt,
                },
                world,
                round: 1,
                isLastInRound: false,
                isScenario: false,
            },
            (chunk) => {
                fullTextBuffer += chunk;
                if (typewriterDone) startTypewriter(msgIndex);
            },
        );

        await waitForTypewriter();

        if (currentCharIndex < speakingOrder.length - 1) {
            currentCharIndex++;
            await speakNextCharacter();
        } else {
            // All characters have spoken, generate options directly
            await generateOptions();
        }
    } catch (err) {
        messages[msgIndex].content = `[生成失败: ${err instanceof Error ? err.message : "未知错误"}]`;
        messages = [...messages];
        phase = "idle";
    }
}

async function generateOptions() {
    phase = "generating-options";

    const history = messages
        .filter((m) => m.role === "npc" || m.role === "user")
        .map((m) => ({
            role: m.role === "npc" ? "assistant" : "user",
            content: m.content,
        }));

    try {
        console.log("[Options] Sending request with history:", JSON.stringify(history, null, 2));
        const result = await fetchJSON(`${WORKER_API_BASE}/api/ai-world/options`, {
            messages: history,
            world,
        });
        console.log("[Options] Raw API response:", JSON.stringify(result, null, 2));
        if (result.raw) console.log("[Options] Raw DeepSeek text:", result.raw);
        if (result.error) console.error("[Options] Worker error:", result.error);

        currentOptions = result.options || [];
        console.log("[Options] Parsed options:", currentOptions);

        if (currentOptions.length > 0) {
            console.log("[Options] Showing options to user");
            phase = "user-choosing";
        } else {
            console.log("[Options] No options found, going to summary");
            await generateSummary();
        }
    } catch (err) {
        console.error("[Options] Error:", err);
        messages = [...messages, {
            role: "system",
            content: `[选项生成失败: ${err instanceof Error ? err.message : "未知错误"}]`,
            timestamp: Date.now(),
        }];
        await generateSummary();
    }
}

async function handleOptionClick(option: string) {
    if (phase !== "user-choosing") return;

    // Pick a random character to reply
    const randomChar = speakingOrder[Math.floor(Math.random() * speakingOrder.length)];

    // Add user message
    messages = [
        ...messages,
        { role: "user", content: option, timestamp: Date.now() },
    ];

    // Add canned NPC reply
    const randomReply = randomChar.reply[Math.floor(Math.random() * randomChar.reply.length)];
    messages = [
        ...messages,
        {
            role: "npc",
            characterId: randomChar.id,
            characterName: randomChar.name,
            characterAvatar: randomChar.avatar,
            characterColor: randomChar.color,
            content: randomReply,
            timestamp: Date.now(),
        },
    ];

    currentOptions = [];
    await generateSummary();
}

async function generateSummary() {
    phase = "generating-scenario";

    const msgIndex = messages.length;
    fullTextBuffer = "";

    messages = [
        ...messages,
        { role: "system", content: "", timestamp: Date.now() },
    ];

    try {
        await fetchStreaming(
            `${WORKER_API_BASE}/api/ai-world/chat`,
            {
                messages: [
                    ...messages
                        .filter((m) => m.content)
                        .map((m) => ({
                            role: m.role === "npc" ? "assistant" : "user",
                            content: m.content,
                        })),
                    { role: "user", content: "请用约30个字总结这次讨论的核心观点。" },
                ],
                character: {
                    id: "system",
                    name: "总结",
                    systemPrompt: "你是一个简洁的总结者。请用约30个字总结讨论内容。不要加任何前缀。",
                },
                world,
                round: 1,
                isLastInRound: false,
                isScenario: false,
            },
            (chunk) => {
                fullTextBuffer += chunk;
                if (typewriterDone) startTypewriter(msgIndex);
            },
        );

        await waitForTypewriter();
    } catch {
        messages[msgIndex].content = "讨论结束。";
        messages = [...messages];
    }

    phase = "showing-summary";
}
</script>

<div class="card-base px-6 py-5 w-full">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-[var(--primary)]">{world.title}</h2>
        <button
            onclick={startNewConversation}
            disabled={phase !== "idle" && phase !== "showing-summary"}
            class="btn-regular rounded-lg px-4 py-2 text-sm font-bold
                   text-[var(--btn-content)] active:scale-95
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {phase === "showing-summary" ? "再来一轮" : "开始新对话"}
        </button>
    </div>

    <p class="text-sm text-black/50 dark:text-white/50 mb-4">{world.description}</p>

    <!-- Character roster -->
    {#if phase === "idle" && messages.length === 0}
        <div class="flex flex-wrap gap-3 mb-4">
            {#each characters as char}
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
                           bg-[var(--btn-regular-bg)] border border-[var(--line-divider)]">
                    {#if isImage(char.avatar)}
                        <img src={char.avatar} alt={char.name} class="w-8 h-8 rounded-full object-cover" />
                    {:else}
                        <span class="text-base">{char.avatar}</span>
                    {/if}
                    <span class="text-[var(--deep-text)]">{char.name}</span>
                </div>
            {/each}
        </div>
    {/if}

    <!-- Chat area -->
    <div
        bind:this={chatContainer}
        class="flex flex-col gap-3 min-h-[300px] max-h-[60vh] overflow-y-auto
               px-3 py-4 bg-[var(--page-bg)] rounded-xl"
        onclick={skipTypewriter}
        role="presentation"
    >
        {#if phase === "idle" && messages.length === 0}
            <div class="text-center py-16 text-black/40 dark:text-white/40">
                <p class="text-lg mb-2">点击「开始新对话」进入 AI 小世界</p>
                <p class="text-sm">角色们将展开一场随机话题的讨论</p>
            </div>
        {/if}

        {#each messages as msg, i}
            {#if msg.role === "system"}
                <div class="text-center text-sm text-black/50 dark:text-white/50
                            bg-[var(--btn-plain-bg-hover)] rounded-lg px-4 py-2.5 mx-6">
                    {#if i === 0}
                        <span class="text-xs opacity-60">场景</span><br />
                    {/if}
                    {msg.content}
                    {#if lastMessageTyping && i === messages.length - 1}
                        <span class="animate-pulse text-[var(--primary)]">|</span>
                    {/if}
                </div>

            {:else if msg.role === "npc"}
                <div class="flex items-start gap-2.5 max-w-[80%]">
                    <div
                        class="flex-shrink-0 w-12 h-12 rounded-full flex items-center
                               justify-center text-lg bg-[var(--btn-regular-bg)] overflow-hidden"
                        style="border: 2px solid {msg.characterColor || 'var(--line-divider)'}"
                    >
                        {#if isImage(msg.characterAvatar || "")}
                            <img src={msg.characterAvatar} alt={msg.characterName} class="w-full h-full object-cover" />
                        {:else}
                            {msg.characterAvatar || "?"}
                        {/if}
                    </div>
                    <div class="min-w-0">
                        <div class="text-xs font-bold mb-1" style="color: {msg.characterColor || 'var(--primary)'}">
                            {msg.characterName || "未知"}
                        </div>
                        <div class="rounded-2xl rounded-tl-sm px-4 py-2.5
                                   bg-[var(--card-bg)] text-[var(--deep-text)]
                                   border border-[var(--line-divider)]
                                   break-words whitespace-pre-wrap">
                            {msg.content}
                            {#if lastMessageTyping && i === messages.length - 1}
                                <span class="animate-pulse text-[var(--primary)]">|</span>
                            {/if}
                        </div>
                    </div>
                </div>

            {:else if msg.role === "user"}
                <div class="flex items-start gap-2.5 max-w-[80%] ml-auto flex-row-reverse">
                    <div class="flex-shrink-0 w-9 h-9 rounded-full flex items-center
                               justify-center text-sm bg-[var(--primary)] text-white font-bold">
                        你
                    </div>
                    <div class="rounded-2xl rounded-tr-sm px-4 py-2.5
                               bg-[var(--primary)] text-white break-words whitespace-pre-wrap">
                        {msg.content}
                    </div>
                </div>
            {/if}
        {/each}

        <!-- Options (separate from messages) -->
        {#if currentOptions.length > 0 && phase === "user-choosing"}
            <div class="flex flex-col gap-2 px-2">
                <span class="text-xs text-black/40 dark:text-white/40">选择你的回应：</span>
                <div class="flex flex-wrap gap-2">
                    {#each currentOptions as opt}
                        <button
                            onclick={() => handleOptionClick(opt)}
                            class="btn-plain rounded-xl px-3.5 py-1.5 text-sm
                                   border border-[var(--line-divider)]
                                   hover:bg-[var(--btn-plain-bg-hover)]
                                   active:bg-[var(--btn-plain-bg-active)]
                                   text-[var(--deep-text)] transition-all
                                   active:scale-95"
                        >
                            {opt}
                        </button>
                    {/each}
                </div>
            </div>
        {/if}

        <!-- Loading indicators -->
        {#if phase === "generating-scenario" && messages.length === 0}
            <div class="text-center py-12 text-black/40 dark:text-white/40">
                <Icon icon="material-symbols:progress-activity" class="text-3xl animate-spin inline-block mb-2" />
                <p>正在生成场景...</p>
            </div>
        {:else if phase === "generating-options"}
            <div class="text-center py-2 text-black/30 dark:text-white/30 text-xs">
                <Icon icon="material-symbols:progress-activity" class="text-sm animate-spin inline-block" />
                生成选项中...
            </div>
        {/if}
    </div>

    <!-- Participants -->
    {#if speakingOrder.length > 0 && phase !== "idle"}
        <div class="flex items-center justify-end mt-3 px-2 text-xs text-black/40 dark:text-white/40">
            参与者：{speakingOrder.map((c) => isImage(c.avatar) ? c.name : `${c.avatar} ${c.name}`).join("、")}
        </div>
    {/if}
</div>
