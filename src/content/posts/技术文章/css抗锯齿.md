---
title: CSS transform旋转的锯齿效果解决办法
tags: [博客文章, Web开发]
category: 
published: 2024-11-07T20:16:01
description: "本文针对 Web 开发作业中旋转 input 元素出现外边框锯齿的视觉问题，分享了两种实用的 CSS 解决办法：一是利用 CSS3D 的 GPU 加速渲染特性，通过给元素添加 Z 轴 0° 旋转样式触发 GPU 精确渲染，消除锯齿；二是基于抗锯齿的渐变过渡原理，使用 CSS 轻微模糊滤镜实现视觉抗锯齿效果，同时附上了两种方案的核心 CSS 代码，快速解决旋转元素的锯齿问题。"
---

在完成web开发作业的时候，需要写一个旋转的input，但写完后，input的外边框发生了明显的锯齿效果，如下：

解决办法：

利用css3d会使用gpu加速渲染的特性，给div增加3d样式，即在z轴旋转0°，从而使用gpu精确渲染来解决这个问题：

```css
        div{
            transform:rotate(-7deg) translateZ(0);
            transform:rotate(-7deg);
            margin-top: 10px;
        }
```

如果你直到抗锯齿的原理，即利用渐变色过渡来达到较好的视觉效果，那么使用css滤镜也是一个不错的办法：

```css
        div{
            transform:rotate(-7deg); 
            filter: blur(0.1px); 
            margin-top: 10px;
        }
```