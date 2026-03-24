---
title: string.h说明
tags: [C语言]
category: 学习
published: 2023-10-29T19:32:42
---

Strlen：返回字符串的长度。

Size_t strlen(const char*s);//返回数组s的长度（不包含末尾的0

Strcmp：用于比较两个字符串。可以比较出两个字符串的大小。

S1==s2  0

S1>s2  1

S1<s2  -1

Int strcmp()

输出两个不相等字符的差值。

Strcpy：把第二个字符串里的字符拷贝到第一个字符串里，结果返回第一个字符串

Char *strcpy(char* a,char* b)

把b拷贝进a里。

复制一个字符串：

Char *dst = （char*）malloc（strlen（src）+1）

动态申请内存的时候，由于数组的长度最后是有\0，所以必须多申请一位。

Strchr(const char *s,int c);

这个函数是用来查找在字符串s里c第一次出现的位置。

比如：  char *a = strchr(s, ‘t’);

就是查找在字符串s里t第一次出现的位置，返回的是一个地址

