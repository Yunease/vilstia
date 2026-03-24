---
title: sql语言
tags: [数据库]
category: 学习
published: 2025-06-22T13:40:42
---

创建表：

Create table<表名>（<列名><数据类型>[列级完整性约束条件]，<列名><数据类型>[列级完整性约束条件]， … [，<表级完整性约束条件>]）；

Create table sc（

Sno char (9)，

Cno char (4),

Grade smallint,

Primary key(sno,cno),//设置主码，由两个属性构成

Foreign key(sno) reference student(sno),//设置外码，表级完整性约束，sno为外码，参照的是表student

）

修改表的基本操作：

Add[column]<新列名><数据类型>[完整性约束]//新增一列

Drop[column]<列名>[cascade|restrict]//删除一列

删除基本表

Drop table<表名>[cascade/restrict]

如果选择restrict删除，则该表的删除是有限制条件的，想删除的基本表不能被其他表的约束引用，也不能有视图，触发器等，如果存在这些依赖关系，则表不能删除。

索引的建立

Create[UNIQUE][CLUSTER]index<索引名>on<表明>（<列名>[[次序]]）；

数据字典：是管理系统内部的一组系统表，记录了所有的定义信息

例如这个表的查询：

单表查询：仅涉及一个表的查询

Select 列名 form 表名;

也能是一个表达式：

Select sname，2024-sage form student

取消重复的行：

查询符合条件的元组——where

查询所有年龄在20岁以下的学生的姓名和年龄：

Select name，age form student where age<20;//比较大小

查询年龄在20~30岁之间的学生的姓名、系别和年龄。

Select name，sdept，age form student where age between 30 and 30;//确定范围。

谓词in能用来查询属性值属于指定集合的元组，查询cs系，ma系学生的姓名和性别：

Select name，sex form student where sdept in (‘cs’,’ma’);//确定集合

字符匹配——>关键字like 能包含通配符%和_，%代表任意长度的字符串，_代表单个字符。

查询所有姓张的学生的学号，姓名和性别：

Select id，name，sex form student where name like ‘张%’;

查询所有名字里第二个字为阳的学生的学号和姓名：

Select id，name form student where name like ‘_阳%’;

查询空值：查询缺少成绩的学生的学号和相应的课程：

Select id cno form sc where grade is NULL;

多条件查询：查询计算机系年龄在20岁以下得学生得姓名：

Select name from student where sdept=‘cs’ and age<20;

查询全体学生的情况，结果按照系名升序排列，同一系按年龄降序。

Select * from student Order by sdept (asc),age DESC

聚集函数

Sql提供了许多聚集函数，主要是：

Count统计，sum求和，avg平均（必须是数值型），max和min。

查询学生的总数：

Select count(*) from student;

计算选修1号课程的学生的平均成绩：

Select avg(grade) from sc where cno=’1’;

查询选修1号课程的学生最高分数：

Select max(grade) form sc where cno = ‘1’;

Group by字句用于分组，having短语用于指定筛选条件：

查询各个课程号和相应的选课人数：

Select cno，count(id) form sc group by cno;

查询选修三门以上课程的学生学号：

Select sno form sc group by sno having count(*)>3;

连接查询和多表查询，同时涉及多个表

格式：

等值连接:

查询每个学生及选修课程的情况。(外表foreign)

Select student.*,sc.* from student,sc where student.sno = sc.sno;

查询结果：

还可以自身连接，能与自己表连接。

查询course表中的一门课的间接先行课。

先起名字，course表有两个别名，一个是first，一个是second

Select first.cno,second cpno from course first,course second where first.cpno = second.cno;

外连接：

满足条件的元组会被保留输出，剩下的元组就会被舍去，如果想保留剩下的元组，就需要用到外连接。

格式：

Select 属性名 from 表1 left out join on 表2（表1属性名=表2属性名）

通俗的说：

-- 邀请名单表

CREATE TABLE 邀请名单 (

姓名 VARCHAR(50),

邀请函编号 VARCHAR(10) PRIMARY KEY

);

-- 实际到场表

CREATE TABLE 实际到场 (

姓名 VARCHAR(50),

签到编号 VARCHAR(10) PRIMARY KEY

);

Select * form 邀请名单 left join 实际到场 on 邀请名单.姓名 = 实际到场.姓名；

执行结果：

Select * form 邀请名单 right join 实际到场 on 邀请名单.姓名 = 实际到场.姓名;

左外连接需要列出左边关系中所有的元组，右外连接需要列出右边关系中所有的元组。

当涉及 多表连接（这里是 Student 表和 SC 表） 时，不同表可能有 同名字段 （虽然例子里没体现，但实际开发常见，比如两张表都有 “创建时间” 字段 ）。如果用 * ，数据库可能分不清到底要哪个表的字段，或者查询结果里同名字段会混乱，导致后续使用数据出错 。
明确列出属性，加上表名前缀（像 Student.Sno ），能清晰区分不同表的字段，避免歧义 。

多表连接：两个以上的表进行连接，通过两个表的公共属性进行连接

查询每个学生的学号，姓名，选修的课和成绩：

Select student.id,name,cname,grade form student,sc,course where student.sno=sc.sno and course.cno = sc.cno;

嵌套查询：

一个select-from-where语句称为一个查询块，将一个查询块嵌套在另一个的where字句或having短语的条件中的查询，称之为嵌套查询。

查询与刘晨在同一个系得学生：

先查询刘晨所在得系的名：

Select sdept from student where name=‘刘晨’;

查询所有在cs系的学生：

Select sno，sname，sdept from student where sdept=‘cs’;

构建嵌套：

Select sno，sname，sdept from student where sdept in （Select sdept from student where name=‘刘晨’）;

带有比较运算符的子查询：

查询所有选修了信息系统和数学课程，并且成绩均不及格（<60）的学生的学号。

Select sno form student where sno in（select sno from course,sc where course.cno = sc.cno and name = ‘信息系统’ and grade<60） and sno in（select sno from course,sc where course.cno = sc.cno and name = ‘数学’ and grade<60）

插入数据：

插入元组的insert语句的格式：

Insert into 表名[属性列1，属性列2…]values（常量1，常量2…）；

例题：将一个新学生元组插入student表中：

Insert into student（id，name，sex，sdept，age）values（‘005’，‘张三’，‘男’，‘is’，18）;

这是手动插入的方法，也能引入：

Insert into dept_age(sdept,avg_age) select sdept,avg(sage) from student group by sdept;

更新数据：

关键词：updata和set

例题：将学生1145的年龄改为25：

Updata student set sage=25 where sno=‘1145’;

将所有入学时间为2024年的学生的年龄改为22岁：

Updata student set sage==22 where time=‘2024’；

修改多个元组的值：

将所有学生的年龄增加1岁：

Updata student set sage=sage+1;

删除语句：

语法：

Delete from 表名 where 条件

Delete删除元组和数据，但不删除定义和字典，只会清空，不屑where相当于清除全部数据。
