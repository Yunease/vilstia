# 鼠标点击烟花特效实现指南

## 1. 安装

```bash
npm install mouse-firework
```

## 2. 引入

### 方式一：CDN 直接引入（推荐）

在 `</body>` 前添加：

```html
<script src="https://unpkg.com/mouse-firework@0.1.1/dist/index.umd.js" defer onload="setupFirework()"></script>
```

### 方式二：npm 打包引入

```javascript
import firework from 'mouse-firework';
firework(options);
```

## 3. 配置项说明

```javascript
window.firework({
  // 排除的元素，点击这些元素时不触发特效
  excludeElements: ["a", "button"],

  // 粒子数组，可以配置多层粒子效果
  particles: [
    {
      // 颜色数组，随机从中选取
      colors: ["#ff5252", "#ff6b6b", "#ff8a80", "#ffcdd2"],

      // 动画时长范围（毫秒），随机取值
      duration: [1200, 1800],

      // 缓动函数
      // 可选：linear, easeInQuad, easeOutQuad, easeInOutQuad,
      //       easeInCubic, easeOutCubic, easeInExpo, easeOutExpo,
      //       easeInCirc, easeOutCirc, easeInBack, easeOutBack,
      //       easeInBounce, easeOutBounce 等
      easing: "easeOutExpo",

      // 运动方式，数组可叠加
      // "emit"    — 从中心向外发射
      // "diffuse" — 在原地扩散（半径变大）
      // "rotate"  — 旋转
      move: ["emit"],

      // 粒子数量
      number: 20,

      // 形状
      // "circle"  — 圆形
      // "polygon" — 多边形（需配合 shapeOptions.sides）
      // "star"    — 星形（需配合 shapeOptions.spikes）
      shape: "circle",

      shapeOptions: {
        // 透明度范围（0~1）
        alpha: [0.3, 0.5],

        // 半径范围（像素）
        radius: [16, 32],

        // 线宽（设置后变为空心描边，不设置则为实心填充）
        // lineWidth: 6,

        // 多边形边数（shape 为 polygon 时生效）
        // sides: 6,

        // 星形角数（shape 为 star 时生效）
        // spikes: 5,
      }
    }
  ]
});
```

## 4. 完整示例

把以下代码放在 HTML 的 `</body>` 前：

```html
<script>
function setupFirework() {
  if (window.firework) {
    window.firework({
      excludeElements: ["a", "button"],
      particles: [
        // 第一层：多个小圆向外发射
        {
          colors: ["#ff5252", "#ff6b6b", "#ff8a80", "#ffcdd2"],
          duration: [1200, 1800],
          easing: "easeOutExpo",
          move: ["emit"],
          number: 20,
          shape: "circle",
          shapeOptions: { alpha: [0.3, 0.5], radius: [16, 32] }
        },
        // 第二层：一个大圆向外扩散
        {
          colors: ["#d32f2f"],
          duration: [1200, 1800],
          easing: "easeOutExpo",
          move: ["diffuse"],
          number: 1,
          shape: "circle",
          shapeOptions: { alpha: [0.2, 0.5], lineWidth: 6, radius: 20 }
        }
      ]
    });
  }
}
</script>
<script src="https://unpkg.com/mouse-firework@0.1.1/dist/index.umd.js" defer onload="setupFirework()"></script>
```

## 5. 常见自定义

| 需求 | 改法 |
|------|------|
| 换颜色 | 修改 `colors` 数组 |
| 粒子更多 | 增大 `number` |
| 粒子更大 | 增大 `radius` 范围 |
| 动画更久 | 增大 `duration` 范围 |
| 空心粒子 | 在 `shapeOptions` 中加 `lineWidth` |
| 星形粒子 | `shape` 改为 `"star"`，加 `spikes` |
| 六边形粒子 | `shape` 改为 `"polygon"`，加 `sides: 6` |
| 点击链接也触发 | 清空 `excludeElements: []` |
| 移动端禁用 | 用 CSS 媒体查询或 JS 判断后不调用 |
