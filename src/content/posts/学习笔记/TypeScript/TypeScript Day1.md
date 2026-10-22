---
title: TypeScript Day1
tags: [TypeScript]
category: 学习
description: 
published: 2024-01-22T16:41:56
---

# 前言

这篇文档是为了复习明天面试而写的，因此过的很潦草。



# 第一题

```typescript
interface PlayerData {
    hp: number;
    name: string;
}

// 模拟从网络或本地读取
const raw = JSON.parse(jsonString) as PlayerData;
```

先看源码，这里有一个很容易搞混的问题。

`interface`并不等于`class`，虽然两者写起来语法很像：

```typescript
interface user{
	name: str;
}

// 这里是cpp
class user{
	public:
		std::string name;
}
```

两者都能描述一个类应该有哪些成员，也都可以对类进行约束，但存在区别：

| 对比点     | TS                            | cpp                                |
| ---------- | ----------------------------- | ---------------------------------- |
| 本质       | 纯类型                        | 真正的类型定义                     |
| 编译后     | 完全消失                      | 生成运行时代码，对象布局等         |
| 能否实例化 | 不能`new`                     | 可以创建对象                       |
| 能否有实现 | 不能写方法体                  | 可以写方法实现，构造函数，解析函数 |
| 能否有状态 | 只能描述字段，不能分配内存    | 有真实数据成员和内存分配           |
| 类型系统   | 结构化类型：形状匹配就行      | 名义类型：通常要显式继承/实现      |
| 继承       | `interface extends interface` | `class extends class`              |
| 声明合并   | 同名的interface可以合并       | 不支持这种合并                     |

另外，`as`是一个特殊的关键字，它的作用是，让编译器把这个结构当作`PlayerData` 来处理，它**不会**做任何运行时的格式转换，反而会跳过**不会**做数据合法性校验，这导致在上述的这个场景中，即便本地读取的json是一个空值，但依然不会报错，也不会崩溃。

在编译为JavaScript后，变为js特性，读取一个普通对象上不存在的属性不会抛出异常，而是静默返回`undefined`。

对于undefined类型，进行加减运算会出现错误，比如：

```typescript
raw.hp -= 10; 
console.log(raw.hp);
```

在 raw.hp 确定是 undefined 的情况下，js引擎会先尝试利用 `Number(undefined)` 转化成数字，但实际上并不能转换为数字，最终返回的结果是 `NaN`。（Not a Number）

文本框（Label）：如果代码写了 `hpLabel.string = raw.hp.toString()`，玩家的血条文字会直接变成"NaN / 100"`。

血条进度条（ProgressBar）：进度计算通常是 `raw.hp / maxHp`。一旦出现 `NaN / 100`，引擎无法解析有效比例，血条可能会直接归零、卡死在上一帧，甚至导致渲染器抛出警告。

最可怕的是，游戏完全不会崩溃，但逻辑已经彻底乱了。

如果不用 as ，类型注解的方式也没办法避开这种问题，因为 `JSON.parse()` 的返回值为 `any` ，这意味着编译器仍然会放行。

如果想要拿到安全的hp，有两套不同的策略：

## 1. 基础防线：原生关键字判断

JavaScript 提供了在运行时检查变量特性的操作符：

- **`typeof`**：检查基础数据类型（如 `'number'`、`'string'`、`'boolean'`）。
- **`in`**：检查某个属性是否存在于对象中（例如 `'hp' in raw`）。

如果我们只是想安全地拿到 `hp`，可以结合三元表达式或条件判断给默认值：

```javascript
const raw = JSON.parse(jsonString);

// 确保 raw 是非空对象，且 hp 是一个真正的数字
const safeHp: number = (typeof raw === 'object' && raw !== null && typeof raw.hp === 'number')
    ? raw.hp 
    : 100; // 兜底默认值
```

> 很多人喜欢用空值合并操作符 `raw?.hp ?? 100`。但这只能防 `null` 或 `undefined`；如果网络包传来的是字符串 `"abc"`，`raw?.hp ?? 100` 依然会拿到 `"abc"`，后续做加减法依然会出问题。

## 2. 面试高频考点：自定义类型守卫（Type Guard）

在 TypeScript 中，既想在**运行时安全检查**，又想让**编译期自动推导类型**，核心法宝是 **`is` 关键字**。

我们可以写一个专门的类型守卫函数：

```typescript
interface PlayerData {
    hp: number;
    name: string;
}

// 注意返回值处的 obj is PlayerData
function isPlayerData(obj: any): obj is PlayerData {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.hp === 'number' &&
        typeof obj.name === 'string'
    );
}
```

在这个守卫函数中：

```typescript
typeof obj === 'object' &&      // 门 1：必须是一个对象
obj !== null &&                 // 门 2：不能是 null
typeof obj.hp === 'number' &&   // 门 3：里面的 hp 必须是数字
typeof obj.name === 'string'    // 门 4：里面的 name 必须是字符串
```











