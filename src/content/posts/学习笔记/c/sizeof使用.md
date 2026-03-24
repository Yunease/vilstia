---
title: sizeof使用
tags: [C语言]
category: 学习
published: 2023-10-08T19:34:13
---

Sizeof可以注明使用了多少个字节。

使用方法：

Sizeof(int)：表明int在内存里占据了多少字节

Sizeof(i)：表明了变量i在内存里占据了多少字节

Sizeof是一个静态运算符，在编译完之后就固定了

附：

Char是一个字节

Int 是四个字节

Short是两个字节（取决于cpu和编译器）

Long是八个字节（取决于cpu和编译器）

Longlong是八个字节

在cpu中，reg是（32/64）位（bit）决定了int的大小

