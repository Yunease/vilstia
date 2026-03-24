---
title: JavaScript API-1
tags: [Java, JavaScript, API]
category: 学习
published: 2024-06-13T17:05:38
---

Dom树 概念：

Api最重要的部分  dom文档对象模型  bom浏览器对象模型

什么是dom：是浏览器提供的一套专门用来操作网页内容的功能，实现了网页内容特效，实现了和用户的交互。

Dom将html以树状结构表现出来，我们称之为文档树或者dom树，直观的体现了标签和标签之间的关系。

Js通过api（dom树操作）来控制htm的树状结构。

Dom对象：浏览器根据html标签生成的js对象（本质是对象，需要用对象的思维去理解）

Const div = doucument.querslector(‘div’)

这样就会选中网页的盒子的对象，就可以用于操作了

打印对象：

Console.log(div)

在html里是标签，在dom中叫对象，是符合面向对象逻辑的对象。

获取dom对象：

