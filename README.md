# 樟庭徊路 🌙

一个基于 **Fuwari** 模板的**Astro**个人博客，进行了一定程度的改造的，目前正承载着<span style="color: #87CEFA; font-weight: 700;">琴泠</span>的梦境、碎碎念与创作。

---

## 目录

- [关于本项目](#关于本项目)
- [Fuwari 原版特性](#fuwari-原版特性)
- [我的改造内容](#我的改造内容)
- [技术栈](#技术栈)
- [本地运行](#本地运行)
- [内容结构](#内容结构)
- [License](#license)

---

## 关于本项目

这是一个私人花园式站点，目前正在维护中。我用它来存放那些不适合发在公共平台的东西：

- 不成熟但真实的想法
- 断断续续的世界观
- 游戏与故事的原型
- 代码实验
- 以及那些只想对自己说的话
- 日记和个人作品

您可以把这里理解为：**博客 + 碎碎念 + 创作仓库 + 内心备忘录**

---

## Fuwari 原版特性

本项目基于 [saicaca/fuwari](https://github.com/saicaca/fuwari) 模板构建，原模板提供了以下核心功能：

### 核心特性
- 基于 **Astro** 静态站点框架
- **Tailwind CSS** 样式系统
- 平滑动画与页面过渡（基于 Swup ）
- 亮色/暗色主题切换
- 可自定义的主题色与 Banner
- 响应式设计
- 站内搜索（基于 Pagefind）
- Markdown 扩展语法
- 文章目录（TOC）
- RSS 订阅

### 原版页面结构
- 首页（文章列表）
- 归档页
- 关于页
- 文章详情页

---

## 我重写的内容：

### 新增页面与内容类型

#### 1. 叙梦协定 (`/dream`)
一个专门记录梦境的页面。梦境与现实交错的地方，收藏那些在睡梦中出现的奇妙世界。

> 那些转瞬即逝的，如果不肯细心留下了，就永远的失去了。

#### 2. 心灵碎片 (`/rant`)
一个存放短吐槽、情绪片段、即时想法的地方。随便说点什么，取决于心情。
这个板块不会呈现文章条，而是忽略title信息完整展示出来，但你仍可以通过对应的url访问文章页面（含有mess字段的文章条不会进入归档页面）

#### 3. 回廊画架（`gallery`）

一个存放个人绘画作品的功能版，使用了仿pixiv布局。图床为 `postimg` ，要求md文件必须拥有title img，否则无法显示。

#### 4. 截光求影（`photo`）

一个个人摄影作品存放点，暂时还在开发中，请期待。

#### 5. 剪影菜单
在导航栏新增「剪影」下拉菜单，整合访问各种特殊页面，未来可能会根据维护增加新的板块。
剪影做了移动端布局适配，可以直接点击展开。

### 内容分类扩展

新增 `mood` 字段用于记录每篇文章创作时的心情。

mood字段对应六中情绪，并有分别对应的十六进制颜色：

```
正面情绪：
平和 粉色
振奋 橙色
开心 绿色

负面情绪：
怨恨 紫色
烦躁 红色
消沉 灰色
```

如果你想新增不同的颜色，请在.astro中检查对应的代码段（我已经写明了注释）

### 内容组织方式

- **博客文章**：技术文、长文、整理过的内容

- **梦境 (dream)**：记录梦境，通过 `dream` 标签分类

- **碎碎念 (message)**：短吐槽、心情碎片，通过 `mess` 标签分类，拥有 `mess` 字段的md文件不会进入归档。碎碎念的mood字段会有对应的十六进制颜色，其对应的颜色表为：

  ```typescript
  焦躁: "#E06C75",
  消沉: "#7F8C8D",
  怨恨: "#C792EA",
  开心: "#3CB371",
  平和: "#FFB6C1",
  振奋: "#F4A460",
  ```

  如果新增了不存在的字段，会使用astro全局样式颜色。

  > 强烈建议您新建新的十六进制颜色。

- **照片（photo)**: 摄影作品，通过标签 `photo` 标签分类，拥有 `photo` 字段的md文件不会进入归档
- **画廊（gallery)**: 绘画作品，通过标签 `gallery` 标签分类，拥有 `gallery` 字段的md文件不会进入归档

### 社交链接

个人社交链接集成：
- Bilibili
- Bangumi (使用自定义 SVG 图标，已经做了本地svg图标的使用)
- Pixiv
- Steam
- GitHub

---

正在尝试开发友链板块

## 技术栈

| 技术 | 用途 |
|------|------|
| Astro | 静态站点框架 |
| Tailwind CSS | 样式系统 |
| Svelte | 交互组件 |
| Swup | 页面过渡动画 |
| Pagefind | 站内搜索 |
| KaTeX | 数学公式渲染 |
| Expressive Code | 代码块增强 |
| Markdown / MDX | 内容书写 |

---

## 本地运行

```bash
# 安装依赖 (需要 pnpm >= 9)
pnpm install
# 启动开发服务器
pnpm dev
# 创建新文章
pnpm new-post <filename>
# 构建生产版本
pnpm build
# 预览构建结果
pnpm preview
# 代码检查
pnpm check
# 格式化代码
pnpm format
```

---

## 内容结构

```
src/
├── assets/           # 静态资源
│   ├── images/       # 图片资源
│   └── svg/          # 自定义 SVG 图标
├── components/       # 组件
│   ├── DreamPage.astro      # 梦境页面组件 (新增)
│   ├── RantPage.astro       # 碎碎念页面组件 (新增)
│   └── widget/
│       └── SilhouetteDropdown.astro  # 剪影下拉菜单 (新增)
├── content/          # 内容文件
│   ├── posts/        # 文章
│   │   ├── dream/    # 梦境文章目录 (新增)
│   │   └── message/  # 碎碎念文章目录 (新增)
│   └── spec/         # 特殊页面内容
├── layouts/          # 布局
├── pages/            # 页面路由
│   ├── dream/[...page].astro  # 梦境列表页 (新增)
│   └── rant/[...page].astro   # 碎碎念列表页 (新增)
├── styles/           # 样式文件
├── utils/            # 工具函数
│   ├── dream-utils.ts    # 梦境内容处理 (新增)
│   └── mess-utils.ts     # 碎碎念内容处理 (新增)
└── config.ts         # 站点配置
```

### 文章 Frontmatter

```yaml
---
title: 文章标题
published: 2024-01-01
description: 文章描述
image: ./cover.jpg
tags: [dream]      # dream: 梦境, mess: 碎碎念
category: 分类
draft: false
mood: 烦躁          # 心情 (新增字段)，仅用于mess吐槽版
lang: zh_CN
---
```

---

## 鸣谢

- [Fuwari](https://github.com/saicaca/fuwari) - 优秀的博客模板
- [Astro](https://astro.build) - 强大的静态站点框架
- Vilstia - 我最好的朋友

---

## License

本项目内容采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可证。

Fuwari 原模板采用 MIT License，详见 [Fuwari License](https://github.com/saicaca/fuwari/blob/main/LICENSE)。
