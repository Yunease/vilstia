export interface AIWorld {
	title: string;
	description: string;
	basePrompt: string;
	scenarioPrompt: string;
	topicCheckPrompt: string;
	summaryPrompt: string;
}

/** Cloudflare Worker API 地址 */
export const WORKER_API_BASE = "https://vilstia.2642076599.workers.dev";

export const world: AIWorld = {
	title: "AI小世界",
	description:
		"一个由AI角色组成的思维空间，他们会讨论各种话题，而你可以引导对话的方向。",
	basePrompt: `你正在参与一场轻松的日常闲聊。
规则：
- 每次发言控制在50-80字，自然表达
- 说两三句话，有来有回地聊天
- 说话口语化、轻松自然，像朋友之间聊天
- 不要重复别人说过的内容`,
	scenarioPrompt: `你是一个场景描述者。请用一段话（50-80字）描述一个有趣简短的开场场景或话题，让以下角色可以展开讨论。
场景要具体、有画面感，能引发思考和讨论。
只输出场景描述，不要加任何前缀、引号或角色名。
话题要轻松，日常，偏向二次元的萌系互动，适合年轻人讨论。话题不要太复杂，只需要让每个角色简单讨论两句即可。推荐的话题：美食，旅行，校园生活，兴趣爱好，二次元文化，日常趣事等。`,
	topicCheckPrompt: "",
	summaryPrompt:
		"请用约30个字总结这次讨论的核心观点或最有启发性的结论。不要加任何前缀。",
};
