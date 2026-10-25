---
title: SQlite 快速入门：sqlite的基本语法
tags: [数据库, SQlite]
category: 学习
description: 本文梳理了轻量嵌入式数据库 SQLite 的核心特性与语法分类，并结合成绩管理系统实例，系统拆解了 ALTER 结构变更、BETWEEN 范围筛选与 ATTACH 多库挂载，深入剖析了 ANALYZE 优化器情报收集，以及 BEGIN 与 COMMIT 的事务锁控、原子性与刷盘持久化机制。
published: 2026-10-25T17:13:42
---

# SQlite 简介

SQLite是一个进程内的库，实现了自给自足的、无服务器的、零配置的、事务性的 SQL 数据库引擎。它是一个零配置的数据库，这意味着与其他数据库不一样，您不需要在系统中配置。

就像其他数据库，SQLite 引擎不是一个独立的进程，可以按应用程序需求进行静态或动态连接。SQLite 直接访问其存储文件。

- 不需要一个单独的服务器进程或操作的系统（无服务器的）。
- SQLite 不需要配置，这意味着不需要安装或管理。
- 一个完整的 SQLite 数据库是存储在一个单一的跨平台的磁盘文件。
- SQLite 是非常小的，是轻量级的，完全配置时小于 400KiB，省略可选功能配置时小于250KiB。
- SQLite 是自给自足的，这意味着不需要任何外部的依赖。
- SQLite 事务是完全兼容 ACID 的，允许从多个进程或线程安全访问。
- SQLite 支持 SQL92（SQL2）标准的大多数查询语言的功能。
- SQLite 使用 ANSI-C 编写的，并提供了简单和易于使用的 API。
- SQLite 可在 UNIX（Linux, Mac OS-X, Android, iOS）和 Windows（Win32, WinCE, WinRT）中运行。



## DDL - 数据定义语言

| 命令   | 描述                                                   |
| :----- | :----------------------------------------------------- |
| CREATE | 创建一个新的表，一个表的视图，或者数据库中的其他对象。 |
| ALTER  | 修改数据库中的某个已有的数据库对象，比如一个表。       |
| DROP   | 删除整个表，或者表的视图，或者数据库中的其他对象。     |



## DML - 数据操作语言

| 命令   | 描述           |
| :----- | :------------- |
| INSERT | 创建一条记录。 |
| UPDATE | 修改记录。     |
| DELETE | 删除记录。     |



## DQL - 数据查询语言

| 命令   | 描述                           |
| :----- | :----------------------------- |
| SELECT | 从一个或多个表中检索某些记录。 |



# SQLite 语法

## 注释

SQLite 注释是附加的注释，可以在 SQLite 代码中添加注释以增加其可读性，他们可以出现在任何空白处，包括在表达式内和其他 SQL 语句的中间，但它们不能嵌套。

SQL 注释以两个连续的 "-" 字符（ASCII 0x2d）开始，并扩展至下一个换行符（ASCII 0x0a）或直到输入结束，以先到者为准。

您也可以使用 C 风格的注释，以 "/*" 开始，并扩展至下一个 "*/" 字符对或直到输入结束，以先到者为准。SQLite的注释可以跨越多行。

```
sqlite>.help -- 这是一个简单的注释
```



## SQLite 语句

所有的 SQLite 语句可以以任何关键字开始，如 SELECT、INSERT、UPDATE、DELETE、ALTER、DROP 等，所有的语句以分号 **;** 结束。



## SQLite ANALYZE 语句：

```sqlite
ANALYZE;
or
ANALYZE database_name;
or
ANALYZE database_name.table_name;
```

ANALYZE 会对表进行全读分析，告诉查询优化器哪条索引才是真正的捷径。适用于刚简历表，需要整理清楚表结构的情况。



## SQLite AND/OR 子句：

```sqlite
SELECT column1, column2....columnN
FROM   table_name
WHERE  CONDITION-1 {AND|OR} CONDITION-2;
```

这段代码的含义：

选择一些行，从一个表中，仅取出特定条件的行（过滤条件），条件为：CONDITION-1 和/或 CONDITION-2

在这里的 CONDITION-1 是一个语法占位符，本质是一个布尔表达式，可能是真或者假的。

举个简单的例子：

这是一个学生成绩管理系统，有很多表，其中一个表就是 2023 届学生的成绩。取出了数学成绩和语文成绩这个行，但需要取出特定条件的行，比如满足 数学成绩>90 and 语文成绩<90 类似这样。



## SQLite ALTER TABLE 语句：

```sqlite
ALTER TABLE table_name ADD COLUMN column_def...;
```

ALTER 是新增字段的意思，它的核心含义是，在不重建整张表，不丢失已有数据的情况下，向先有的数据表中动态追加一个新的字段。在这段代码中，它的含义：

在一个表中，增加一个列，这个列的的规范是……

column_def 的完整结构通常是三段：

```sqlite
[字段名] [数据类型/类型亲和性] [列约束（Column Constrainst）]
```



## SQLite ALTER TABLE 语句（Rename）：

```sqlite
ALTER TABLE table_name RENAME TO new_table_name;
```

这个语句的意思就是对表进行重命名，它的执行成本只有O(1)，不会重写所有底层数据行。

举个例子：

过去有一个表<学生成绩_1>，但是后来大家觉得这个命名不太好，容易出问题，然后改成了<2023届学生成绩>



## SQLite ATTACH DATABASE 语句：

```sqlite
ATTACH DATABASE 'DatabaseName' As 'Alias-Name';
```

这条语句是 SQLite 用来**在一个数据库连接中挂载另一个外部数据库文件**的命令，也就是常说的“多库联合挂载”。

在教务系统运行几年后，历史成绩数据量越来越大。为了避免当前学期的数据库文件过度膨胀，系统架构通常会做**冷热数据分离**：

- **当前活跃库（热数据）**：`current_semester.db`，里面放当前学期的期末成绩表 `final_exam_scores`。
- **历史归档库（冷数据）**：`archive_2025.db`，里面放往年的成绩归档表 `history_scores`。

此时，辅导员需要做一次“横跨往年与今年的成绩对比或总评”，此时需要把两个表链接起来，接下来就可以进行查询或者其他操作。



## SQLite BEGIN TRANSACTION 语句：

```sqlite
BEGIN;
or
BEGIN EXCLUSIVE TRANSACTION;
```

这两条语句是 SQLite 中用于开启显式事务（Explicit Transaction）的核心命令。

**`BEGIN`**：标记事务块的起始边界，通知引擎后续的 SQL 操作必须满足 ACID 特性，直到遇到 `COMMIT`（提交）或 `ROLLBACK`（回滚）。

`BEGIN EXCLUSIVE TRANSACTION;` 是 SQLite 中用来**立刻以最高优先级独占整个数据库**的事务开启命令，同时会锁数据库，和普通的 begin 不一样，普通 begin 只有在写的时候才会加锁，如果两个人同时 begin 开始写数据，就会报错奔溃。但是 `BEGIN EXCLUSIVE TRANSACTION;` 会在一瞬间占据数据库，其他的任何连接都会失败。



## SQLite BETWEEN 子句：

```sqlite
SELECT column1, column2....columnN
FROM   table_name
WHERE  column_name BETWEEN val-1 AND val-2;
```

这条 SQL 语句用于执行**闭区间范围检索**：从数据表（`table_name`）中筛选出指定字段（`column_name`）的值落在 `[val-1, val-2]` 区间内的所有行，并仅返回指定的列。

在 SQL 标准中，`BETWEEN ... AND ...` 只是一个语法糖，它的逻辑运算**严格等价于大于等于且小于等于的组合**：
$$
\text{column\_name BETWEEN val-1 AND val-2} \iff \text{column\_name} \ge \text{val-1} \land \text{column\_name} \le \text{val-2}
$$

> **最关键的特性：双向包含（闭区间）**
>
> 查询结果**必定包含两端的边界值**（包含 `val-1` 和 `val-2` 本身）。这个感觉面试八股的时候会用到，多记忆一下吧。

举个例子：

选择列 语文成绩 数学成绩 英语成绩……从学生成绩表中。

条件： 语文成绩 在 70 到 80 之间（包括70和80）

仅取出符合条件的行。



## SQLite COMMIT 语句：

```sqlite
COMMIT;
```

commit 在 sqlite 的含义等效于 end，结束一个操作。

它会进行三个步骤：

1. 刷盘持久化
   1. 在传统回滚日志（Rollback Journal）模式下：将修改后的数据页真正写入数据库文件，并调用操作系统的 `fsync()` 确保数据落盘，随后销毁或清空日志文件（`.db-journal`）。
   2. 在 WAL（预写日志）模式下：把事务结束标记（Commit Frame）追加写入 `.db-wal` 文件中，确保即使此时断电数据也不会丢失。
2. 解除所有文件锁
   1. 释放此前通过 `BEGIN`、`SELECT` 或 `UPDATE` 获取的 SHARED、RESERVED 或 EXCLUSIVE 锁，允许其他排队的连接进入读写。
3. 退回自动提交模式
   1. 当前连接恢复到默认的单句自提交状态，后续单条 SQL 会自动开启并立即提交微型事务。

如果不写 commit，sqlite 会认为这个事务没有完成，在下次启动时会进行自动回滚，长期不 commit 会导致库被持续锁住，其他想写入会阻塞超时报错。



## SQLite CREATE INDEX 语句：

```sqlite
CREATE INDEX index_name
ON table_name ( column_name COLLATE NOCASE );
```



## SQLite CREATE UNIQUE INDEX 语句：

```
CREATE UNIQUE INDEX index_name
ON table_name ( column1, column2,...columnN);
```



## SQLite CREATE TABLE 语句：

```
CREATE TABLE table_name(
   column1 datatype,
   column2 datatype,
   column3 datatype,
   .....
   columnN datatype,
   PRIMARY KEY( one or more columns )
);
```



## SQLite CREATE TRIGGER 语句：

```
CREATE TRIGGER database_name.trigger_name 
BEFORE INSERT ON table_name FOR EACH ROW
BEGIN 
   stmt1; 
   stmt2;
   ....
END;
```



## SQLite CREATE VIEW 语句：

```
CREATE VIEW database_name.view_name  AS
SELECT statement....;
```



## SQLite CREATE VIRTUAL TABLE 语句：

```
CREATE VIRTUAL TABLE database_name.table_name USING weblog( access.log );
or
CREATE VIRTUAL TABLE database_name.table_name USING fts3( );
```



## SQLite COMMIT TRANSACTION 语句：

```
COMMIT;
```



## SQLite COUNT 子句：

```
SELECT COUNT(column_name)
FROM   table_name
WHERE  CONDITION;
```



## SQLite DELETE 语句：

```
DELETE FROM table_name
WHERE  {CONDITION};
```



## SQLite DETACH DATABASE 语句：

```
DETACH DATABASE 'Alias-Name';
```



## SQLite DISTINCT 子句：

```
SELECT DISTINCT column1, column2....columnN
FROM   table_name;
```



## SQLite DROP INDEX 语句：

```
DROP INDEX database_name.index_name;
```



## SQLite DROP TABLE 语句：

```
DROP TABLE database_name.table_name;
```



## SQLite DROP VIEW 语句：

```
DROP VIEW view_name;
```



## SQLite DROP TRIGGER 语句：

```
DROP TRIGGER trigger_name
```



## SQLite EXISTS 子句：

```
SELECT column1, column2....columnN
FROM   table_name
WHERE  column_name EXISTS (SELECT * FROM   table_name );
```



## SQLite EXPLAIN 语句：

```
EXPLAIN INSERT statement...;
or 
EXPLAIN QUERY PLAN SELECT statement...;
```



## SQLite GLOB 子句：

```
SELECT column1, column2....columnN
FROM   table_name
WHERE  column_name GLOB { PATTERN };
```



## SQLite GROUP BY 子句：

```
SELECT SUM(column_name)
FROM   table_name
WHERE  CONDITION
GROUP BY column_name;
```



## SQLite HAVING 子句：

```
SELECT SUM(column_name)
FROM   table_name
WHERE  CONDITION
GROUP BY column_name
HAVING (arithematic function condition);
```



## SQLite INSERT INTO 语句：

```
INSERT INTO table_name( column1, column2....columnN)
VALUES ( value1, value2....valueN);
```



## SQLite IN 子句：

```
SELECT column1, column2....columnN
FROM   table_name
WHERE  column_name IN (val-1, val-2,...val-N);
```



## SQLite Like 子句：

```
SELECT column1, column2....columnN
FROM   table_name
WHERE  column_name LIKE { PATTERN };
```



## SQLite NOT IN 子句：

```
SELECT column1, column2....columnN
FROM   table_name
WHERE  column_name NOT IN (val-1, val-2,...val-N);
```



## SQLite ORDER BY 子句：

```
SELECT column1, column2....columnN
FROM   table_name
WHERE  CONDITION
ORDER BY column_name {ASC|DESC};
```



## SQLite PRAGMA 语句：

```
PRAGMA pragma_name;

For example:

PRAGMA page_size;
PRAGMA cache_size = 1024;
PRAGMA table_info(table_name);
```



## SQLite RELEASE SAVEPOINT 语句：

```
RELEASE savepoint_name;
```



## SQLite REINDEX 语句：

```
REINDEX collation_name;
REINDEX database_name.index_name;
REINDEX database_name.table_name;
```



## SQLite ROLLBACK 语句：

```
ROLLBACK;
or
ROLLBACK TO SAVEPOINT savepoint_name;
```



## SQLite SAVEPOINT 语句：

```
SAVEPOINT savepoint_name;
```



## SQLite SELECT 语句：

```
SELECT column1, column2....columnN
FROM   table_name;
```



## SQLite UPDATE 语句：

```
UPDATE table_name
SET column1 = value1, column2 = value2....columnN=valueN
[ WHERE  CONDITION ];
```



## SQLite VACUUM 语句：

```
VACUUM;
```



## SQLite WHERE 子句：

```
SELECT column1, column2....columnN
FROM   table_name
WHERE  CONDITION;
```