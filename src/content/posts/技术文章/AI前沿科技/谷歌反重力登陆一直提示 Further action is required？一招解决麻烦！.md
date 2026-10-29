---
title: 谷歌反重力登陆一直提示 Further action is required？一招解决麻烦！
description: 详细记录 Google Antigravity 登录全流程避坑指南，从 Clash TUN 模式代理设置、账号区域修复，到抓包分析 244444 短信拦截并一招切换二维码验证。
tags: [AI, 博客文章, Gemini]
category: 前沿速报
published: 2026-10-29T22:06:00
---

随着 Gemini 4 的重磅推出，被大家戏称为“谷歌反重力”的 Google Antigravity 凭借深度集成的高能开发体验再次刷屏。身边不少朋友都迫不及待想接入体验，我的常用账号本身订了 Pro，但在多台新设备配置时，依然遭遇了一连串经典的 Google 客户端登录暗坑。

如果你还没有下载客户端，可以前往官方文档获取：[快速入门 | Google Antigravity Docs](https://antigravity.google/docs/get-started)（根据自身系统平台选择安装包）。

从代理配置、区域限制到最后的安全短信验证卡死，这里整理了一份完整的排错链路与最优解决方案。



---

## 01. 代理与流量劫持：修复 Unexpected Issue

配置好客户端后，如果直接开着常规系统代理启动，大概率会当头泼来一盆冷水：

> **There was an unexpected issue setting up your account.**

这不是节点本身被墙或质量不佳，而是**桌面原生客户端的底层网络请求没有被常规系统代理（HTTP/Socks5 环境变量）捕获**。

### 解决办法：开启虚拟网卡（TUN 模式）
以 **Clash Verge** 为例：
1. 先确保客户端已安装并开启**服务模式（Service Mode）**。
2. 在设置中开启 **虚拟网卡 / TUN 模式（TUN Mode）**。

开启 TUN 模式后，操作系统会将网卡层级的所有 IP 报文强制路由给代理内核，避开桌面原生应用不走系统代理的问题，此时客户端才能与 Google 鉴权接口正常握手。



---

## 02. 账号区域风控：解决 Ineligible 资格问题

解决代理之后重新尝试登录，部分账号可能会触发第二道门槛：

> **Sorry, this account is ineligible to use Antigravity.**

### 排查与修复：
出现该提示说明你的 Google 账号归属地处于未开放或合规限制区域（例如中国大陆）。
1. 访问 Google 服务条款确认页：[Google Terms of Service](https://policies.google.com/terms)
2. 在该页面底部查看你的当前账号关联地区。
3. 如果显示为“中国大陆”，需要通过修改 Google Play 地区或付款资料（Payments Profile）将账号国家/地区迁移至支持的地区（如台湾、美国、日本等，这一步最好和你的节点地址保持一致）。
4. 修改完成后完全退出 Antigravity 客户端后台进程，清理缓存后重新发起登录，此报错即可解除。



---

## 03. 核心痛点：Further action is required 与短信死循环

这是绝大多数国内开发者卡关最久的地方。好不容易通过了前两关，客户端却弹出了这样一堵高墙：

```text
Further action is required to use Antigravity
Please verify your account, then sign in again to continue. Learn more by visiting our FAQ.

[ Verify ]   [ Sign in again ]
```

点击 **Verify** 按钮后，Google 会拉起网页要求手机验证。点击“发送短信”时，很多国产 ROM（例如我的 iQOO 11）会由于安全策略直接拦截，或者提示“短信发送失败”。

### 抓包溯源：为什么短信会发不出去？

为了弄清楚验证逻辑，在 PC 端抓取网络请求并过滤 XML / RPC 数据流，抓到了核心认证指令：

```http
sms://244444?body=xxx(xxx)
Referrer policy: origin
referer: [https://accounts.google.com/](https://accounts.google.com/)
upgrade-insecure-requests: 1
user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36
```

底层逻辑很清晰：Google 试图调用系统协议唤起系统短信，要求给国际短号 **`244444`** 发送一串特定 hash 码进行双向握手验证。

- **海外原生号卡**：直接向该号码发送对应校验码即可秒通。
- **早期 +86 注册账号**：国内三大运营商基本默认屏蔽向境外特殊 6 位短号发送国际短信，手机端拦截规则也会将其视作高危操作，导致直接报错中断。



---

## 04. 破局之道：强制唤出设备级二维码验证

既然 +86 短信通路走不通，就必须迫使 Google 认证中心切换验证信道：

1. **多次尝试**：在验证页反复重试或稍作等待，触发 Google 风险兜底策略，界面会出现备选方案：

   > **使用您的手机扫描二维码** *打开“相机”或扫码应用扫描上方二维码，访问显示的链接，或在移动端浏览器访问 `g.co/verify/xxx`。*

2. **移动端环境确认**：

   - 确保手机已登录**同一个** Google 账号（经测试，通过 Google App、Google Play 或 Chrome 登录均可）。
   - 手机同样需处于良好的代理网络环境下。

3. **完成授权**：

   - 扫描二维码进入页面后，手机端会跳出设备确认提示（如数字匹配或一键点击确认）。
   - 点击确认授权后，不要关闭页面，稍等几秒钟，回到电脑端 Antigravity 客户端。

4. **顺利登入**：

   - 客户端检测到认证回调成功，自动完成凭证置换。

至此，阻碍登录的三座大山全部清除。现在就可以在本地顺畅调用 Gemini 4，尽情享受新一代模型带来的编码生产力飞跃了！
