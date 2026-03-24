---
title: 算法_temp
tags: [算法]
category: 学习
published: 2026-01-08T16:13:27
---

分治算法——整数拆分

4

F(4,4)

最大选择1->f(4,1)

1+f(3,1)

1+1+f(2,1)

1+1+1+f(1,1)

1+1+1+1

最大选择2->f(4,2)

2+f(2,2)

2+2

–

2+f(2,2-1)

2+1+(f1,1)

2+1+1

最大选择3->f(4,3)

3+f(1,1)

3+1

最大选择4->f(4,4)

4+f(0,x)

4

5种，伪代码：

Fun(int n,int max)

{

If(n==1) return 1

Int sum=0

For(int i=1;i<n&&i<max;i++)

{

Sum=fun(n-i,i)

}

Return sum

}

阶乘问题：求n!

fun(int n)

{

If(n==1 || n==0)

Retuen 1

Else

Return n*fun(n-1)

}

斐波那契数列的递归算法：

Fun(int n)

{

If(n<=2)

Return 1

Else

Return fun(n-1)+fun(n-2)

}

欧几里得最大公约数算法

假设输入的两个数都是正整数：

Fun(a,b)

{

If(a%b==0)

Return b

Else

Fun(b,a%b)

}

子集遍历算法：

Fun（int a[n],int index）

{

If(n==)

}

01背包问题的递归穷举算法：

// Fun(i, c) : 考虑前 i 件物品，背包剩余容量为 c 的最大总价值

Fun(i, c)

{

// 终止条件：没有物品或容量为0

if(i == 0 || c == 0)

return 0;

// 如果第 i 件物品太重，无法选

if(w[i] > c)

return Fun(i-1, c);  // 只能不选

// 两种选择：不选第 i 件 或 选第 i 件

valueWithout = Fun(i-1, c);             // 不选第 i 件

valueWith    = Fun(i-1, c - w[i]) + v[i]; // 选第 i 件

// 返回两者最大值

return max(valueWithout, valueWith);

}

完全二叉树定义（考试版）：

除最后一层外，其余各层结点数都达到最大；最后一层的结点从左到右连续排列。

A

/   \

B     C

/ \    /

D  E  F

A(0)

/      \

B(1)      C(2)

/   \     /

D(3) E(4)  F(5)

下标:  0   1   2   3   4   5

数组: [A,  B,  C,  D,  E,  F]

