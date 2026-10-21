---
title: DeepSeek 上线收费 Web Search API，原来的免费搜索方案还能不能用了？
tags: [博客文章, DeepSeek, DSH, AI]
category: 前沿速报
image: "https://i.postimg.cc/KzwCqnw9/178ffe2f4fd9e1d3.png"
description: DeepSeek 搜索开始收费了？原来的免费联网方案还能用吗？Curl 明明也能让 AI 上网，为什么还要额外付费？一文讲清 Web Search API 的收费逻辑，帮你避开不必要的开销，别让 AI 还没用明白，钱包就先瘪了。
published: 2026-10-21T23:11:01
---

# 1. 最近 DeepSeek 怎么了

就在前几天，DeepSeek 正式开放了自己的 Web Search API，这意味着你可以直接使用官方定价的 web 工具了！如果您经常使用各类 AI app，或许经常有问过 AI “请帮我搜索一下xxx”之类的问题吧？这次更新的 web 工具，就是为了解决这样的常见需求。

不过，也有很多人担心，是不是 DeepSeek 开始圈钱了？这也不能怪网友敏感，毕竟 DeepSeek 总是隔三岔五突然宣布价格调整策略，梁子地位正在滑动变阻中……

让我们先来看看这次的价格变动情况吧！

> ## 网页搜索与抓取价格
>
> Search 和 Fetch 是独立的 API，按请求次数计费。
>
> | API    | 计费单位            | 价格 |
> | :----- | :------------------ | :--- |
> | Search | 每 1,000 次成功请求 | 5元  |
> | Fetch  | 每 1,000 次成功请求 | 5元  |

Fetch 和 Search 这两个单词都不陌生，在 Agent 内部，模型会通过 Fetch 请求来获取网页内容，DeepSeek 的此次更新并不是国内第一个这样做的 AI 供应商，早在上半年，MiniMax 等一众厂商也开放了自己的 Web Search，不过 MiniMax 是跟随订阅免费试用的，并不需要单独额外付费。

总而言之，你可以通过 Search 和 Fetch 请求来得到网页内容。



# 2. 它和 Curl 有什么区别？

这是许多消费者都没有搞明白的一点，明明我不配置任何 Web Search 工具，但也能正常使用 Curl 来获得网页信息，为什么还要单独购买这些服务呢，它们有什么意义，更有人担心 DeepSeek 鲸鱼娘背地里其实是黑心贩！（才不是才不是！大肥鱼的订阅用着不烧心）

首先，我们得明确一点：**Curl 本身并不是搜索引擎，而是一个网络请求工具。**

举个例子，本站吉祥物 Moss VMina 想要去搜一下哪里的 Token 最便宜。但是她没有多模态，也不能直接操作鼠标去点击浏览器，只能使用 Curl 发送网络请求。假设小 VMina 使用了 樟庭徊路 作为搜索引擎（其实没有这个功能！），Curl 的实际终端代码大概长这样：

```powershell
curl -L "https://樟庭徊路的搜索引擎接口?q=Token 便宜 免费 大白饭 最便宜 好吃的 肚子饿了"
# 假设参数是q
```

这时候，小 VMina 就会得到 Curl 返回的 HTML 元素，如果渲染出来，其实和你直接去搜的东西大概率是完全一样的（不过现代搜索引擎很复杂，会用到大数据等等，实际上还是会有一定区别）。

可惜，小 VMina 没有长眼睛。确切的说，在她眼里拿到的数据并不是清晰的详细数据，而是非常复杂的 HTML 结构，就好比：

```html
<div class="group relative mx-auto max-w-3xl p-4 sm:px-6" data-page="search">
  <nav class="flex gap-4 text-xs text-gray-500"><a href="/all">全部</a><a href="/news">资讯</a><a href="/forum">论坛</a></nav>
  <article class="mt-4 border-b border-gray-200 pb-4" data-rank="0.982" data-track="impression">
    <div class="flex items-center gap-2 text-xs text-gray-400"><img src="/favicon.ico" class="h-4 w-4 rounded-full" alt=""><span>example.com › blog</span><span hidden>广告追踪参数</span></div>
    <a href="/article?id=1024" class="mt-2 block text-lg font-semibold text-blue-700 hover:underline">如何获取便宜的 Token？免费模型 API 全面解析</a>
    <p class="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">本文介绍了多种模型服务的价格、免费额度以及 API 调用方式……<span class="text-gray-400">阅读全文</span></p>
    <div class="mt-2 flex gap-2 text-xs text-gray-400"><span class="rounded bg-gray-100 px-2 py-1">AI</span><span>2026-10-20</span></div>
  </article>
  <div class="pointer-events-none absolute -left-[9999px]" aria-hidden="true">token cheap free unlimited rank_score=0.8731</div>
</div>
```

**可不要觉得这个结果很离谱，这还只是一个为了演示的简化搜索结果。**在真实项目的 HTML 里，搜索结果可能和导航栏、广告、埋点数据、隐藏元素混在一起，Taildwind CSS 也远远比这个情况更复杂，还套着一层又一层的标签，许多需要 Javascript 才能加载的东西，则是完全看不到了。人类当然可以一眼就能找到标题和摘要，但 AI 得先从这些乱七八糟的结构里把有用的信息提取出来。

更糟糕的是，可能你费了不少 Token ，但是获取的结果全部都是外部广告，或者低质量的回答。这些东西很难真正解答你的疑惑，反而还会干扰模型进行下一步工作。小 VMina 看的头晕眼花，找不到便宜的 Token，于是只能饿肚子了。

如果是专门提供的 Fetch 或者 Search API，模型拿到的东西就完全不一样了。

还是刚才的例子，这次我们直接使用官方的 Web Search API，虽然每一家的具体工作流我们并不知道，但通常来说是这样进行的（这里只是一个例子）：

- 接收关键词：Token 便宜 免费 大白饭 最便宜 好吃的 肚子饿了

- Web Search 响应：

  - 意图识别：理解用户不是真的 肚子饿了 ，而是账户余额要用完了（比喻）；拓展关键词；处理同义词（删除最便宜）等等

  - 检索网页：使用自研的针对 AI 的搜索引擎，匹配合适的网页（拥有一定对GEO投毒的抗性）；

    > GEO 投毒是指通过在公开网页中植入恶意诱导文本、隐形提示词或虚假数据，诱骗 AI 得到并输出攻击者预设的虚假、偏见或推销内容。尽管 GEO 优化可以提升品牌在 AI 检索时候的推荐程度，但也很容易被利用。
    >
    > 来自 AI 供应商的自研搜索引擎，通常会针对 GEO投毒 进行专门识别和降权，从而保证最终返回结果的质量。

  - 排序并过滤：按照一定算法进行排序，得到综合筛选的结果。

- Web Search 返回规范格式化的搜索结果，它可能的格式是这样的：

  ```json
  {
    "query": "Token 便宜 免费 大白饭",
    "results": [
      {
        "title": "低成本大模型 API 使用指南",
        "url": "https://example.com/cheap-token",
        "snippet": "整理了多种大模型 API 的价格、免费额度和使用限制……",
        "site_name": "AI 技术博客",
        "published_date": "2026-10-18"
      },
      {
        "title": "免费模型 API 汇总与实测",
        "url": "https://example.org/free-api",
        "snippet": "对比不同模型服务的免费额度、调用频率及上下文限制……",
        "site_name": "开发者社区",
        "published_date": "2026-10-20"
      }
    ]
  }
  ```

  这种规范化的格式，能够帮助 AI 理解搜索结果，并给出更好的回答。

而 Web Fetch 虽然工作流不一样，但最终返回的结果也大致是类似这样的格式化文本，比如：

```c
# 低成本大模型 API 指南
随着大模型应用的普及，Token 成本成为开发者关注的重点。
## 免费额度
部分服务提供免费调用额度，但通常存在请求频率、
上下文长度等限制。
## 如何选择
建议根据模型性能、价格和稳定性综合评估。
```

恭喜恭喜，小 VMina 这次完全看懂了，她想了想，还是以后升级 GPU 算了，这样就有永远都吃不完的白米饭了。



# 3. 所以，DeepSeek 这次到底是不是在圈钱？

原来如此，其实 Search 和 Fetch 并不是什么神秘的黑科技，只要你愿意，完全可以自己写代码制作一个简单的 Web Tool，把搜索引擎、网页解析器和大模型拼接起来。~~（至于质量和维护成本怎么样就别问我了！）~~

既然如此，DeepSeek 为什么还要单独收费？

答案其实很简单：**能自己实现，不代表自己实现最划算。**

对于普通用户来说，如果你只是偶尔问 AI 几个问题，直接使用已经集成联网搜索的 AI APP 就行了。你不需要自己调用 API，更没有必要为了偶尔搜一次网页，就专门搭建一套检索系统。

但对于开发者来说，情况就不一样了。

假设你正在开发一个 AI Agent，需要它每天搜索上百篇技术文章、整理行业动态，再生成一份日报。你当然可以自己实现搜索、抓取、正文提取和异常处理，但后续还要面对搜索接口变化、网页结构调整、反爬机制等问题。

这时候，直接调用 DeepSeek 官方提供的现成 API，可能表现结果更好的同时，还能省下不少钱。

至于到底是不是圈钱，我们可以对比一下其他 AI 供应商的定价来看看：

| 服务商                         | 搜索价格（元/千次）        | 网页抓取 / 内容提取  | 备注                            |
| ------------------------------ | -------------------------- | -------------------- | ------------------------------- |
| **DeepSeek**                   | ¥5.00****                  | **¥5.00/千次 Fetch** | **Search、Fetch 分别计费**      |
| Brave Search                   | ¥33.40                     | 另行处理             | 原价 $5/千次                    |
| Exa                            | ¥26.72 起                  | ¥6.68/千页起         | 搜索与内容提取分别计费          |
| Tavily                         | ¥53.44 起                  | 依套餐和工具计费     | Basic 参考价 $8/千次            |
| You.com                        | ¥33.40                     | ¥6.68/千页           | 搜索与内容获取分开计费          |
| Serper                         | ¥6.68 起，批量最低约 ¥2.00 | 依服务而定           | 批量价格取决于套餐              |
| SerpApi                        | ¥167.00                    | 依服务而定           | 按 $25/千次折算                 |
| Firecrawl                      | 约 ¥42.75                  | 依 credits 消耗计费  | 按此前估算的 $6.40/千次搜索折算 |
| OpenAI Web Search              | ¥66.80                     | 集成搜索工具         | 另计模型 Token 费用             |
| Anthropic Web Search           | ¥66.80                     | 集成搜索工具         | 另计模型 Token 费用             |
| Google Gemini Search Grounding | ¥93.52                     | 集成搜索工具         | 超出免费额度后按查询计费        |

> 换算汇率：1 USD = 6.68 CNY。表中美元价格均按此汇率折算，并不代表实际国内地区的最低价格；“起”表示参考价格或特定套餐价格，并非所有用量下的统一价格。

如果只看标价，DeepSeek 的 Search 每千次 ¥5.00，Fetch 每千次也是 ¥5.00。两者各调用一次的情况下，合计 ¥10.00/千组请求。但这里有一个重要区别，DeepSeek 的 Search 和 Fetch 是两项独立服务，而其他厂商有的提供搜索结果，有的还会直接返回网页内容，有的则把搜索集成到大模型调用流程中。

不过，总的来看，DeepSeek 这次推出的 Fetch 和 Search 工具，还是挺便宜的。



# 4. 总结

说到底，DeepSeek 这次开放 Web Search API，真正值得关注的并不是它能不能联网——毕竟让大模型联网早就不是什么新鲜事了，而是它把搜索和网页内容提取拆成了独立的 API，并给出了相对直观的调用成本。

这次新增的 Web 工具，如果没有重型的并发请求需求，其实完全不 care 也行，你仍然可以直接通过 Curl 让 Agent 去 Google 或者百度里获得内容，尽管返回来的 HTML 元素结构很复杂，但是对于轻量任务的情况下，现有的 AI 也可以对付这种情况。但是搜索引擎也有很多反爬策略，很多内容依赖 Javascript 进行渲染，Curl 很多时候拿到的东西质量并不好。

对于想做 AI Agent、RAG 或个人 AI 助手的开发者来说，这意味着少折腾一点网页解析，多花一点时间在真正有价值的业务逻辑上。当然，如果你本来就有成熟的搜索接口和网页解析方案，也没必要为了追热点立刻迁移。**工具没有绝对的好坏，只有适不适合自己的需求。**

> Moss VMina 说完后，继续寻找她那永远吃不饱的免费 Token。