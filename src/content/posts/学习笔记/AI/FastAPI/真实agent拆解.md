---
title: 深度拆解真实agent，FastAPI
tags: [AI, FastAPI, 博客文章, Agent]
category: 学习
description: FastAPI 是一个用于构建 API 的现代、快速（高性能）的 Python Web 框架，专为构建 RESTful API 而设计。
published: 2026-10-13T15:23:48
---

# 介绍

本文使用了一个出色的开源项目：[Tsukiyy/AI-Agent: 一个面向 AI Agent 的渐进式实践项目：从 FastAPI 任务管理和 LLM 对话出发，逐步扩展到 Tool Calling与 Edge 浏览器助手。](https://github.com/Tsukiyy/AI-Agent)

这个项目虽然做的很简单，但非常清晰的实现了fast api的交互逻辑。

本文就要对这个项目进行拆解。



# POST/tasks完整代码追踪

相关代码片段：

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/tasks", tags=["tasks"])

# 创建任务：POST 请求，请求体必须符合 TaskCreate
# TaskCreate 是项目里一个 Pydantic 模型，它规定了客户端想新建一个任务，必须发什么样的数据过来。
# 虽然代码写的很清晰，但是学习阶段这种db=db确实看着头疼。
@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    return crud.create_task(db=db, task=task)
```

这个文件所有接口都自带 `/tasks`前缀：`APIRouter(prefix="/tasks")`

因为前缀是`/tasks`，所以这里是 `POST/tasks`。

此时，FastAPI先调用 get_db() ，得到数据库连接，再传递给函数，这叫依赖式注入。

`response_model=TaskResponse`：返回时只露出声明的字段，自动转化为JSON

它的工作流程大约是这样的：

- 启动阶段：导入模块时，装饰器把路由通过POST请求注册进表：POST/tasks -> create_tasks
- 每次受到请求（重复执行）
  - 收到POST/task ,请求体是json格式的
  - 按TaskCreate进行解析，校验body
  - 上述完毕后，执行Depends(get_db)，注入db
  - 调用create_task写库

FastAPI代码具有两个完全不同的运行时刻，导入时和请求时存在区别。

好吧这段代码还是很复杂。

`task: TaskCreate, db: Session = Depends(get_db)`这段应该是最难理解的，这里的冒号不是赋值，而是规定了一个参数类型。举个例子：

```python
task: TaskCreate, db: Session = Depends(get_db)
# 感觉完全看不懂？

# 看看这个：
{
	"title":"study FastAPI",
	"description":"其实还没学"
}
# 这是一个非常简单的JSON，在这个情境中，FastAPI会帮你把JSON变成TaskCreate对象，例如：
def create_task(
    task=TaskCreate对象,
    db=数据库Session对象
):
# 而不是
def create_task(
    task={
        "title":"study FastAPI"
    }
)
```

原代码：

```python
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    return crud.create_task(db=db, task=task)
```

等价于：

```python
def create_task(
    incoming_task: TaskCreate,
    db: Session
):
    return crud.create_task(
        db=db,
        task=incoming_task
    )
```

经过处理后，此时你可以直接通过：

```python
task.title
```

来访问得到`study FastAPI`

具体的db操作取决于你的`crud.py`怎么写，我们会在随后拆解这个部分。



# Schema.py 定义格式

```python
from pydantic import BaseModel, Field, ConfigDict

class TaskBase(BaseModel):
    # 它规定了一个任务的最基本的数据结构是什么，拥有title和description，对于title为空的数据就不符合，因为field(...)表示必填，等价于title必须存在。leng规定其长度，这个没什么好说的。
    title: str = Field(..., min_length=1, max_length=100)
    # 而dec这里就比较宽容，允许字符串也允许为空，举例：
    # {
    #	 "title":"123"
    #	 "description":""
    # }
	# 这是完全合法的。
    description: str | None = Field(default=None, max_length=500)

class TaskCreate(TaskBase):   # 继承，自动拥有 title/description
    pass

class TaskResponse(TaskBase):
    id: int
    completed: bool
    model_config = ConfigDict(from_attributes=True)  # 能从 ORM 对象读属性
```

schema是数据模型层，它规定了数据应该长什么样。

如果你接触过 TypeScript ，它其实类似于 `interface` 或者前端表单验证规则。

举个简单例子，对于 vue 来说：

```typescript
interface Task {
    title: string
    description?: string
}
```

在 FastAPI：

```python
class TaskBase(BaseModel):
    title: str
    description: str | None
```



TaskCreate 看起来什么也没做，不过实际因为继承于 TaskBase，所以自带了title 和 desc，注释中说明了，不解释。

单独创建的原因是，尽管很多时候所用的数值类型一样，但是返回不一样，所以不能混用。



TaskResponse 同样继承于 TaskBase，但是还额外拥有 id 和 completed（是一个布尔值，用于判断任务是否完成）。最终的完整数据应该形似：

```json
{
    "id":1,
    "title":"study FastAPI",
    "description":"其实还没学",
    "completed":false
}
```



# 数据库连接 database.py

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DATABASE_URL = "sqlite:///./tasks.db"   # 本地一个文件当数据库
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db          # 把连接交给接口用
    finally:
        db.close()        # 用完关闭，避免泄漏
```

这段代码在进行数据库连接，相比之下是更加底层的操作。

- task.db 真正储存数据的sqlite文件
- engine 管理程序与数据之间的连接
- SessionLocal() 创建一个数据库会话，供执行增删改查
- get_db() 把会话交给接口，使用后关闭

大致顺序如上。
