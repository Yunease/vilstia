---
title: G÷ 继续引发众怒，JIO 用户堪比滚木，APP 同步下架 4a 模型
description: 梳理 Google Antigravity 屏蔽 Jio 合作版 AI Pro 订阅使用 Gemini 4 系列模型（4a/4c/4h/4n）的始末：从官方最初承诺全套餐可用到改口仅限直接付费订阅，剖析 Jio 用户被迫留守 3.8f 的现状及 2.33.0 更新动态。
tags: [AI, 博客文章, Gemini]
category: 前沿速报
published: 2026-11-19T11:04:00
---

> AI 圈该不会有什么诅咒吧，谁好不容易翻身了就要晋级为/字辈。

11 月 13 日，第一批 JIO 合作订阅的用户发现自己的反重力里用不了刚上线的 4a 和 4c 模型，此事很快反重力社区中开始讨论，官方工作人员回复：

**Per the Models page, Gemini 4 Hydrogen is included across all plans.**

出处：[Jio 18个月 Google AI Pro 捆绑包受限于 Gemini 4 中 氩气与氢气 Google 反重力（尽管在 Gemini 应用中可正常工作）——Google Antigravity - Google AI 开发者论坛](https://discuss.ai.google.dev/t/jio-18-month-google-ai-pro-bundle-restricted-from-gemini-4-argon-hydrogen-in-google-antigravity-despite-working-in-gemini-app/199891)

此时大家都认为是 Bug 导致的模型暂不可用，也有人指出 Gemini APP 是可以用 4a 模型，建议大家暂时先用这个过渡一下。

11 月 13 日晚到17 日，大量 JIO 用户尝试了更新反重力版本和重新登陆账户，但发现 4h 模型依旧不可用，引发大规模讨论，有人计算过 4h 的计算成本比 3.8f 更低，没必要一直赖着用 3.8f。大量用户反馈更新后依然是灰色的，另一位官方支持人员很快收紧了口径，明确表示这是既定策略而非 Bug：

**At the moment, access to Gemini Argon and Hydrogen in Antigravity is only available on paid Google AI Pro subscriptions and select trials bundled with premium devices. While Jio trial plans aren't included just yet…**

由于官方的左右脑互搏，以及谷歌 ONE 的踢皮球，再加上官方人员 Chunduriv 直接建议 JIO 用户如果不想放弃主账号的权益，可以自己去绑定 Google Cloud / Vertex AI 按量付费（Pay-As-You-Go） 来调用 Gemini 4 Argon 和 Claude 5.5或者升级为付费订阅。虽然使用 JIO 提供的 PRO 订阅的用户多少有点捡便宜的心态，但是这种神人操作很快让讨论区炸锅。

笔者认为，就算很多用 JIO 订阅去白嫖甚至反代，但这也是谷歌管理不力导致的，并不应该一刀切把所有用户都打为不可用。目前 JIO 订阅的用户只剩下 3.8f 这个滚木模型，GPT 120b 和 Claude 4.6 这种不仅额度量非常有限，而且论智力可能也比 3.8f 高不了太多，勉强可以做个规划模型，没办法当主力模型使用。

目前事态还在进一步发酵，既不确定是否是 bug，也不确定是否会开放。昨天晚上反重力开启灰测更新，到现在为止大部分人应该都能更新到 2.33.0，本以为 4h 能用了结果迎来的是滚木更新，现在模型栏里增加了一个 4n 模型（Gemini 4 Neno），与此同时 gemini app上的 4a 也被替换成了 4n（顺便一提，神人谷歌好像忘记给 Gemini APP 的 4n 的 description 翻译了，尝试切了几个语言都是纯英语，看得出来上线很草率了）
