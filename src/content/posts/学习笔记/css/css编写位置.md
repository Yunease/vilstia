---
title: css编写位置
tags: [css]
category: 学习
published: 2023-12-02T14:15:48
---

如果使用内联样式，只能对一个标签生效，并且样式发生变化之后还得一个一个改。

行内样式不方便维护和修改。

第二种办法：将样式写在head标签下的style标签里。

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<meta name="description" content="这是一个网页">

<meta name="title" content="砂铃的网页">

<title>the_love</title>

<style>

p{color:bisque; font-size: larger;}

</style>

</head>

<body>

<p>我爱你！</p>

</body>

</html>

在这个页面里，我们只需要在head标签下设置style标签，内部就设置好了所有p标签采用的样式，那么这个样式就是color bisque font-size larger 。

它的写法是这样的：

标签名{样式}

这种办法就是用内部样式表，可以通过css选择器设置不同的样式。

当然，内部样式表也有不足，不能跨页面使用。

我们用外部样式表来解决这个问题。

将css样式编写到一个外部的css文件中去。

Css文件的后缀是css。

在外部写好css文件之后通过link标签引入html文件即可。（link标签也需要写在head标签下）

虽然外部标签表需要link标签引入，但是只要想使用就可以用，可以在不同页面复用，提升了便捷性，也是开发常用的最佳使用方式。

外部css文件会被缓存到本地，这样可以加块网页的访问速度。

Css文件的注释和c语言的注释是一样的，也是 /*   */

注释的快捷键还是ctrl+/

