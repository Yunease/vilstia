---
title: 如何把 Claude 从 Contributor 中删掉 | 把Claude从我的Contributors中踢出去！
tags: [git, 开发日志]
category: 开发日志
description: ""
published: 2026-07-29T20:30:00
---

# 前言 哥们你哪里来的？

昨晚在做一个项目的性能优化，做完之后提交了。今天早上（并非早上）发现点开仓库发现claude的出现在了贡献者里：
（卧槽忘记截图了你们凑活看吧
		Contributors：
		头像  Lumina（我自己）
		头像  Claude
）

虽然我确实使用了claude code提交代码，但我也接的是deepseek，我怀疑claude code专门内置了这种提示词，不过我懒得去专门看了。

为了解决这个问题，我跑了不少社区查找解决办法，终于找到了一个稳定解决的方案，这个发现开启了一段相当折腾的清理过程 —— 涉及 git 历史改写、强制推送、GitHub 内部缓存、甚至一个不太常规的分支重命名操作。这篇文章就把整个过程完整记录下来，既给未来的自己留个备忘，也希望能给踩到同一个坑的人一些参考。

> 其实解决它很简单，你可以直接跳转到最后，但是折腾，定位这个问题才是最有意思的。



---

# 一、诊断 —— Claude 是从哪儿冒出来的?

## 1.1 第一个怀疑:Co-Authored-By trailer

GitHub 在 commit 页面显示"共同作者"(co-author)时,是从 commit message 末尾的 `Co-Authored-By:` trailer 解析的。这是 git 的一个非官方但被广泛支持的约定 —— 在 message 最后加一行:

```
Co-Authored-By: Name <email@example.com>
```

GitHub 就会在那个 commit 旁边多显示一个头像。

我于是检查了自己的 commit 历史:

```bash
git log --all --format="%B" | grep -i "Co-Authored-By:.*Claude"
```

输出 7 行,每行都长这样:

```
Co-Authored-By: Claude <noreply@anthropic.com>
```

一共有7 个 commit，全部带这个 trailer，日期集中在 2026-07-28 那批 SEO/性能优化工作里。

我仔细检查了一下更改内容，确定了不是bot的奇怪提交，看样子应该是A/的 Claude Code 发力了

> 这里还是建议大家用OpenCode吧，cc不知道内置了什么奇怪的提示词。。。

既然确认了问题，下一步就应该仔细分析一下了。



## 1.2 这些 trailer 怎么来的?

回想起来，那批 commit 是在我当时在 Claude Code 里自动跑的，因为当时着急吃饭，没有仔细检查就直接让它写了 message 并提交。Claude Code 在生成 commit message 时，可能会**在末尾追加一个 `Co-Authored-By: Claude` 的 trailer**（我在此之前并没有遇到过这个情况，几个月内也没有升级 Claude Code ，因此我不太好定位它，但大概是这样的）。

> 这是 Claude Code 当前的一个"行为"：它默认把自己的贡献归到 commit 上。从功能角度说,这个 trailer 是**诚实的**，AI参与的项目确实应该有标注，但我认为应该写进readme里，从项目归属角度说，我希望每个 commit 的共同作者都来自**真正参与的人**，而不是使用的工具。

7 个 commit 的 SHA(被改写前的原始值):

```
8981420  feat(seo): 拆分 og/meta description + 用 satori 重写 OG 图
2937ae6  chore(claude): 更新本地权限规则
9ae5d06  feat(seo): 补全 ARIA 地标与 skip navigation
d78a60a  feat(seo): 给 Profile 头像链接加 rel="author"
d8e6d94  feat(perf): ImageWrapper 支持 fetchpriority prop
b24cd8f  perf(seo): 优化首屏 banner LCP 与 alt 文案
923de45  feat(seo): 重写 robots.txt 为 GEO 策略
```

每个末尾都有同一行 `Co-Authored-By: Claude <noreply@anthropic.com>`。



---

# 二、第一刀 —— git filter-branch 改写历史

## 2.1 选定工具

要彻底删除 trailer,必须**改写 commit 历史**。这意味着每个 commit 的 SHA 都会变(因为 message 是 commit object 的一部分)。

可用的工具有:

- `git filter-branch` — git 内置,通用但有大量"陷阱"
- `git filter-repo` — 更现代、更快、更安全(但需要单独安装)
- `git rebase -i` + `reword` — 适合少量 commit,7 个就太多了
- `git rebase` + 脚本化的 `exec git commit --amend` — 中等方案

我选了 `filter-branch`,因为它原生可用,而且这次操作的范围明确(`8981420^..HEAD`),不会误伤。



## 2.2 改写命令

```bash
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f \
  --msg-filter 'grep -v -E "^Co-Authored-By:.*Claude"' \
  8981420^..HEAD
```

逐行解释:

- `FILTER_BRANCH_SQUELCH_WARNING=1` —— 关掉 `filter-branch` 那段"我有很多陷阱"的警告文本。
- `-f` —— 强制执行。（因为 `refs/original/` 里可能有旧备份）
- `--msg-filter` —— 对每个 commit 的 message 应用过滤器。
- `grep -v -E "^Co-Authored-By:.*Claude"` —— 反向匹配，删除所有以 `Co-Authored-By:` 开头且包含 `Claude` 的行，其它行(包括空行、commit 主体内容)原样保留。
- `8981420^..HEAD` —— 范围:从 `8981420` 的**父提交**到 `HEAD`(包括 `8981420`)。这个范围刚好覆盖所有 7 个 commit 。



## 2.3 一个有趣的"环境副作用"

跑这个命令的时候,遇到了一个意料之外的小插曲：filter-branch 一直报 "You have unstaged changes"。

排查后发现,是**当前会话的工具** （Claude Code） 在每次调用 bash 工具时，都会**自动把执行过的命令追加到 `.claude/settings.local.json` 的权限列表里**。也就是说，在我按回车执行 filter-branch 的**前一瞬间**，settings.local.json 已经被写入了一行新命令，git status 因此显示有 unstaged 改动，filter-branch 拒绝执行。

解法是把"恢复工作区"和"filter-branch"串成一条命令：

```bash
git checkout HEAD -- .claude/settings.local.json && \
  FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f \
  --msg-filter 'grep -v -E "^Co-Authored-By:.*Claude"' 8981420^..HEAD
```

中间那一步 `git checkout` 会把 Claude Code 前置写入的权限行覆盖掉，filter-branch 启动时工作区就是干净的。

> 这个"前置写入"机制本身的目的是做权限审计，但对 git 这类需要"clean working tree"的工具来说会有点冲突。如果你也用类似工具，可能也会遇到 —— 知道这个机制，就好处理了。



## 2.4 改写结果

filter-branch 跑完后,本地 `master` 的 10 个 commit（SHA 全部变了）message 都干净了:

```bash
$ git log master --format="%B" | grep -i "Co-Authored-By:.*Claude" || echo "✓ master 完全干净"
✓ master 完全干净
```

清理 filter-branch 自动创建的 backup refs：

```bash
git update-ref -d refs/original/refs/heads/master
```

然后，关键的一步 —— 推送到 GitHub：

```bash
git push --force-with-lease origin master
```

> 用 `--force-with-lease` 而不是 `--force`：**前者会检查远程 HEAD 是否还是我们预期的那样，如果别人在我们改写期间推了新东西，会拒绝覆盖**。这层"租约检查"是免费的安全网。

推送成功后输出:

```
+ 1a7c14a...a82354c master -> master (forced update)
```

远程 master 的 SHA 已经从 `1a7c14a` 变成 `a82354c`,commit message 不再含 `Co-Authored-By: Claude`。

到这里，我以为事情就结束了。



---

# 三、第二幕 —— GitHub 侧边栏的"幽灵"

## 3.1 改写完了,但头像还在

刷了一下 GitHub 仓库主页，发现右侧的 Contributors 侧边栏，**Claude 还在**。

我点进 `/graphs/contributors` 看 Insights 图表 —— 这时候 Claude 不在了。**这个页面是基于 author 字段实时算的,我们没改 author，只改了 message，本来就该是干净的。**

看样子侧边栏和 Insights 用的是**两套数据**。



## 3.2 经验上的诊断：不是缓存那么浅

先后尝试了Ctrl+F5 硬刷新、无痕窗口访问、换手机用 4G 打开 —— Claude 头像**依然稳稳地坐在侧边栏里**。

后端数据层面我已经验证过：用 GitHub API 直接拉 100 个 commit，扫描 `Co-Authored-By.*Claude`,0 个命中。**HTML 渲染的 SSR 部分也只是个 skeleton placeholder**（占位骨架屏），真正数据由前端 JS 动态 fetch。

这意味着:

- 浏览器缓存、CDN 边缘缓存都排除了（手机上也没了 → 不是缓存）
- 后端 commit message 数据已经干净
- **侧边栏用的不是"commit history 实时聚合"，而是 GitHub 维护的一个独立的、陈旧的索引**

简单说：**GitHub 在仓库层面的"贡献者统计"是一个有滞后性的独立索引，跟 git 数据并不是实时同步的。**



---

# 四、社区方案调研

在动手试各种"刷新技巧"前，我去搜了一下 GitHub Community 的相关讨论。这个问题在社区里**有大量的反馈**,基本都是从 2026 年 4-5 月开始的(也正是 Claude Code、Cursor 等 AI 工具大规模普及、共同作者污染问题集中爆发的时间段)。

我重点读了几个高赞讨论,归纳出社区报告过的几种"刷新索引"方法:

| 方案 | 操作 | 报告有效度 |
|---|---|---|
| 推空 commit | `git commit --allow-empty -m "reindex" && git push` | 偶尔 |
| 切换默认分支 | 切到别的分支再切回 | 偶有 |
| 改名分支 | 把 `main` rename 成 `main1` 再改回（或者master改名，道理一样，到时候记得改回去就行了） | **最常被报告"立即生效"** |
| 切换 Private/Public | 改私有再改回公开 | 多次"立即刷新" |
| 转让 ownership | Org 仓库:临时转给个人再转回 | Org 仓库有效 |
| Block @claude 用户 | 在 github.com/claude 点 block | 报告不一致,有时头像变"已屏蔽"占位 |
| 删仓库重建 | 删了重新创建同名仓库 | 必有效但代价大(丢 star / PR / issue) |
| 联系 GitHub Support | 提交工单 | **免费账户直接被拒**:"this level of support requires a paid plan" |

**官方 GitHub 员工 0 回答,文档 0 说明** —— 这就是 GitHub 服务端的一个未解决的 bug。

> 顺带，这个 bug 不只影响 Claude。任何在历史 commit 里有"曾经存在但已不在 git 里"的 co-author 邮箱(比如删除了的 GitHub 账号、临时邮箱、改过 GitHub 用户名等)，都可能触发同样的"幽灵头像"。

---

# 五、试错过程

## 5.1 第一试:切换默认分支

按社区方案,先试最简单的"切换默认分支"。

**操作**:

1. 创建一个 `temp` 分支(基于 master 当前 SHA)
2. Settings → Branches → 把默认分支从 `master` 切到 `temp`
3. 立刻再切回 `master`
4. Ctrl+Shift+R 硬刷新仓库主页

**结果**:Claude 头像**依然在**。

这个方法被报告有效,但对我没用。可能跟仓库当时的活跃度、commit 数量、或者 GitHub 后端某次缓存命中的具体策略有关。

## 5.2 第二试:Rename master → main1 → master

接下来试社区报告最有效的"重命名分支"方案。

**操作**:

1. Settings → Branches → 把默认分支切到 `temp`(GitHub 不允许直接 rename 当前默认分支,必须先切走)
2. 进入 Branches 列表,找到 `master`,点右边的铅笔图标 rename 成 `main1`,确认
3. 同一个页面,找到 `main1`,rename 回 `master`,确认
4. Settings → Branches → 把默认分支切回 `master`
5. 硬刷新仓库主页

**结果**:✅ **Claude 头像消失**。

整个操作没有任何代码、文件、commit 改动 —— **master 上的所有 SHA 在整个过程中保持不变**,重命名只动了 ref 名字。GitHub 后端在这个 rename 过程中触发了仓库侧边栏统计索引的**完整重建**,陈旧的 Claude 条目被清掉了。

最后顺手删掉 `temp` 分支清理。

---

# 六、复盘与教训

## 6.1 操作时间线

| 步骤 | 用时 | 风险 |
|---|---|---|
| 诊断 (`grep` commit message) | 1 分钟 | 0 |
| git filter-branch 改写历史 | 2 分钟 | 中(改写历史 + force push) |
| `git push --force-with-lease` | 1 分钟 | 中(force push) |
| 发现侧边栏头像还在 | 1 分钟 | 0 |
| 社区方案调研 | 20 分钟 | 0 |
| 试 #1(切换默认分支) | 5 分钟 | 极低 |
| 试 #2(rename 分支) | 3 分钟 | 低(详情见下) |

全程约 30 分钟,代码改动 0,只动了 1 次 git 历史和 1 次 GitHub 仓库设置。

## 6.2 风险提示

**git filter-branch 改写历史**:
- 旧 SHA 全部失效,任何引用旧 SHA 的外部链接(PR 评论、issue 引用)都会断
- 必须 force push
- 已经被 fork 的仓库,fork 不会自动同步,需要单独处理

**rename 默认分支**:
- 过程中 master 短暂不存在,如果 Vercel/Netlify 之类**写死了 Production Branch = master**,会短暂报"找不到分支",改回后立刻恢复
- star / watch / fork 全部保留(因为它们引用 owner/repo,不引用分支)
- 用户的本地 clone 不受影响(下次 `git fetch` 时自动同步)
- **回滚非常简单**:`main1` 改回 `master` 即可,完全对称

**对个人博客/独立项目**来说,这些都是低风险操作。**对多人协作的关键项目**来说,force push 和 rename 都需要协调。

## 6.3 防止"再次发生"

我已经把 Claude Code 的提交行为做了调整,确保以后的 commit 不会再带 `Co-Authored-By: Claude` trailer:

- 提交前手动 review message,把 trailer 删掉
- 或者在 `~/.claude/settings.json` 里关掉这个自动行为(社区反馈过相关配置,但不保证向后兼容)

> 一些 AI 工具会自动加这个 trailer,它们出发点是"如实记录 AI 参与"。这种诚实在伦理上没问题,但在"我的仓库 = 我的个人作品"这个语境下,我倾向于保持 commit 作者列表的**纯净** —— 谁真正参与了就署谁,工具的痕迹让它留在对话历史里就好。

## 6.4 给同样踩坑的人的建议

1. **先诊断**:`git log --all --format="%B" | grep -i "Co-Authored-By.*Claude"` 确认 trailer 来源
2. **改写历史**:`filter-branch` 或 `filter-repo`,删掉 trailer
3. **强推**:`git push --force-with-lease`(用 lease 不用 force)
4. **不要期待 GitHub 立刻同步** —— 侧边栏是独立索引,会有滞后
5. **如果侧边栏没刷新**:
   - 先试"切换默认分支"(最安全)
   - 再试"rename 默认分支再改回"(被报告最有效)
   - 还不行 → "Private ↔ Public 切换"
   - 最后才考虑"接受现实等几天"或者"删仓库重建"

---

# 写在最后

Git 这个工具强大到**可以重写历史**,但 GitHub 这个平台**做不到实时反映**。两者之间的差距,就是这次踩坑的本质。

AI 辅助写代码已经变成日常,但 AI 留下的"共同作者痕迹"是 GitHub 生态里一个**还没被妥善处理的产品问题**。在此之前,作为使用方,只能自己动手清理。

希望这篇文章能帮到同样遇到这个问题的人。也算是给那个晚上头疼到半夜的自己,一个完整的交代。
