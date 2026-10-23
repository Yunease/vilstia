---
title: TypeScript Day2: 速通八股
tags: [TypeScript]
category: 学习
published: 2026-10-23T13:46:01
---

# ts如何支持类型判断

1. 基本类型判断：

   ```typescript
   let num = 42 //ts会推断num的类型为number
   ```

2. 函数返回值的判断：

   ```typescript
   function add(a: number, b: number) {
       return a + b;  // 返回值类型被推断为 number
   }
   ```

3. 联合类型的推断：

   ```typescript
   let value: number | string;
   value = 123;    // 推断为 number
   value = "abc";  // 推断为 string
   ```

   这个value允许两种类型，因此在下面遇到123时会推断为number，abc会推断为str

注意点：

类型推断是编译器在没有显式指定类型的情况下，自动推断出变量或表达式的类型。保持了js的灵活和ts的安全。



# 什么是泛型？

假设你要写一个函数，把传进来的数字原样返回。

```typescript
function identity(value: number): number {
    return value;
}
```

问题来了：如果我们希望这个函数不仅能返回数字，还能返回字符串、布尔值，怎么办？

一种办法是复制多个函数。

```typescript
function identityNumber(value: number): number {
    return value;
}

function identityString(value: string): string {
    return value;
}

function identityBoolean(value: boolean): boolean {
    return value;
}
```

你会发现，三个函数做的事情完全一样，只是参数类型和返回值类型不同。

如果以后还需要处理十几种类型，难道要写十几个函数吗？

这就引出了泛型。

```typescript
function identity<T>(value: T): T {
    return value;
}
```

| 代码           | 意思                     |
| -------------- | ------------------------ |
| `identity`     | 函数名称                 |
| `<T>`          | 声明一个泛型类型参数 `T` |
| `value: T`     | 参数的类型是 `T`         |
| `: T`          | 返回值的类型也是 `T`     |
| `return value` | 原样返回传进来的值       |

这里的 `T` 不是某一种固定的数据类型。

你可以暂时把它想象成一个空盒子：现在先不决定里面装什么，等调用函数时再决定。

泛型和any也有一些区别，相对来说，any会削弱ts的类型检查。使用泛型可以类型错误，比如：

```typescript
function identity<T>(value: T): T {
    return value;
}

const result = identity("hello");
result.toFixed(2); // TypeScript 报错
```

你可以理解为，泛型在没有确定的时候，是一种模糊的类型，但是被确定后，就不再变化，在这点和any不一样，any会一直跳过类型约束和检查。



# TS中的接口interface 和 type语句有什么区别？

在 TypeScript 中，`interface` 和 `type` 都可以用来定义对象的结构，但它们之间还是有一些重要的区别和适用场景。以下是两者的主要区别：

#### **定义方式**

interface：

主要用于定义对象的形状（结构）。
可以通过 extends 关键字支持继承。

```typescript
interface Person {
    name: string;
    age: number;
}

interface Employee extends Person {
    employeeId: number;
}
```


type：

用于定义任意类型，包括原始类型、联合类型、元组等。
不支持继承，但可以通过交叉类型组合多个类型。

```typescript
type Person = {
    name: string;
    age: number;
};

type Employee = Person & {
    employeeId: number;
};
```

#### **使用场景**

- 如果你需要定义一个具有结构的对象，并且可能会扩展它，使用 `interface` 是更常见的做法。
- 如果你需要定义一些类型组合（如联合类型或复杂类型），使用 `type` 更加方便。



本篇文章参考了：[73道TypeScript面试八股文（答案、分析和深入提问）整理_typescript八股文-CSDN博客](https://blog.csdn.net/ocean2103/article/details/142679234)

