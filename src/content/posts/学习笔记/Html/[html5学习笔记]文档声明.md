---
title: "[html5学习笔记]页面图片，视频，音频"
published: 2024-02-24T23:54:01
tags: [Html,Web开发]
category: "学习"
---

# HTML5 文档声明与基础结构（解决 link parse error）

## 一、报错说明

系统报错信息：**link parse error**（链接解析错误）



------

## 二、DOCTYPE 声明

用于告诉浏览器当前网页的解析方式与 HTML 版本。

```html
<!DOCTYPE html>
```

- 作用：声明当前为 **HTML5** 文档
- 位置：必须写在**第一行**，不在 html 标签内
- 不属于网页内容，仅为解析指令

------



## 三、完整基础骨架

```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    
</body>
</html>
```

------



## 四、关键标签说明

### 1. `<html lang="语言代码">`

- 作用：声明网页语言，浏览器会据此判断是否自动翻译
- `lang="en"`：英文
- `lang="zh"`：中文（可避免浏览器弹出翻译提示）

### 2. `<meta charset="UTF-8">`

- 作用：指定文档编码为 **UTF-8**，避免乱码

### 3. viewport 设置

- 作用：适配移动端，保证页面在手机上正常显示
