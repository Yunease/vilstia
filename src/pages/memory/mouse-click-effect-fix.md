---
name: mouse-click-effect-fix
description: swup 项目中 CDN 脚本与内联脚本的加载顺序问题及解决方案
type: reference
---

# mouse-firework 在 swup 项目中的加载问题

## 问题

点击 2025 页面后无任何烟花特效。

## 原因

内联 `<script is:inline>` 与 CDN `<script>` 的执行顺序冲突：

1. 内联脚本立即执行，调用 `initFirework()`
2. CDN 脚本（mouse-firework）尚未加载完成，`window.firework` 为 `undefined`
3. `initFirework()` 检查 `typeof window.firework !== 'function'`，直接 return
4. CDN 脚本加载完成后，没有任何回调触发 `initFirework()`

→ 特效永远无法初始化。

## 解决

1. **去掉 IIFE 包裹**，让 `initFirework` 成为全局函数
2. **在 CDN script 标签上加 `onload="initFirework()"`**，确保脚本加载完毕后回调初始化

```html
<!-- 错误：onload 无法访问 IIFE 内的函数 -->
<script is:inline>
(function() {
  function initFirework() { ... }
})();
</script>
<script is:inline src="...mouse-firework..." data-swup-reload-script></script>

<!-- 正确：全局函数 + onload 回调 -->
<script is:inline>
function initFirework() { ... }
</script>
<script is:inline src="...mouse-firework..." onload="initFirework()" data-swup-reload-script></script>
```

## 关键点

- `<script is:inline>` 按 HTML 顺序同步执行
- `<script src="...">` 异步加载，执行时机不固定
- 需要依赖外部脚本的初始化逻辑，必须通过 `onload` 回调触发
- swup 项目中还需 `data-swup-reload-script` 属性处理页面切换时的脚本重载
