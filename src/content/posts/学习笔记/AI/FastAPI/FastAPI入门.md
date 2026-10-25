---
title: FastAPI入门
tags: [AI, FastAPI, 博客文章]
category: 学习
description: FastAPI 是一个用于构建 API 的现代、快速（高性能）的 Python Web 框架，专为构建 RESTful API 而设计。
published: 2026-10-13T15:23:48
---

# 在开始之前

本笔记参考菜鸟教程和一些社区回答。由于笔者拥有HTTP相关经验，不会赘述HTTP协议，GET，POST等，如果您要看这个系列，请先学习http部分。

python也是，请确保至少拥有一定python理解。



# 了解FastAPI

*FastAPI 是一个用于构建 API 的现代、快速（高性能）的 Python Web 框架，专为构建 RESTful API 而设计。*

*FastAPI 使用 Python 3.8+ 并基于标准的 Python 类型提示，使用 Starlette 和 Pydantic 构建，能够自动生成 API 文档并进行数据校验。*



## FastAPI 技术栈

FastAPI 构建在两个核心库之上：

| 组件          | 作用        | 说明                                                         |
| :------------ | :---------- | :----------------------------------------------------------- |
| **Starlette** | Web 框架层  | 提供路由、中间件、WebSocket 等基础 Web 功能，FastAPI 直接继承自 Starlette |
| **Pydantic**  | 数据校验层  | 基于 Python 类型提示进行数据校验、序列化和文档生成           |
| **Uvicorn**   | ASGI 服务器 | 基于 uvloop 和 httptools 的高性能 ASGI 服务器，用于运行 FastAPI 应用 |

> FastAPI 是 Starlette 的子类，因此你可以使用 Starlette 的所有功能。同时 FastAPI 完全兼容 Pydantic，包括基于 Pydantic 的 ORM（如 SQLModel）等外部库。



# 安装FastAPI

FastAPI可以使用python命令安装：

```powershell
pip install fastapi
```



需要注意的是，FastAPI是一个ASGI框架，需要安装uv：

```powershell
pip install "uvicorn[standard]"
```



# 编写第一个FastAPI应用

完成安装之后，创建一个名为`main.py`的文件，简单编写以下内容，具体的含义我们很快就知道了：

```python
# 显然，这是引入fastapi依赖，因为fastapi的包是小写的，所以form后跟的包名是小写，请不要搞乱这一点。
from fastapi import FastAPI

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义根路径的 GET 路由
@app.get("/")
# 这里的 async 是允许函数异步执行，对于高并发的 api 请求来说应该写。但在这个示范中，没有明显的性能变化。
async def root():
    return {"message": "Hello World"}

# app.get("/")：准备注册一个处理根路径 GET 请求的接口。
# @app.get("/")：把这个注册操作应用于下面定义的函数。
# def root()：定义实际处理请求的函数。
# return ...：决定接口返回什么数据。
```

`@app.get("/")` = 注册一个接口：当客户端通过 GET 方法访问 `/` 时，执行下面的函数。需要注意的是，通常使用浏览器路径达到某个位置，这个行为本身就是 GET 方法。



编写完毕后，按下f5开始运行，不出意外的话没有任何返回结果。

你须要在命令行输入：

```powershell
uvicorn main:app --reload
```

然后才会出现一些信息，我们先不关心这些信息。

为什么f5运行什么也没有？

当你运行这段代码时，Python 主要做了三件事：

1. 创建一个 FastAPI 应用对象 `app`。
2. 定义 `root()` 函数。
3. 把这个函数注册到 `/` 路由上。

然后，Python 程序就结束了。定义了一个函数并不代表函数被执行，运行命令`uvicorn main:app --reload`后，这次不是启动普通的python脚本，而是一个web服务器进程。简单拆解一下：

| 部分       | 含义                                   |
| ---------- | -------------------------------------- |
| `uvicorn`  | 启动一个 ASGI 服务器                   |
| `main`     | 加载 `main.py` 模块                    |
| `app`      | 找到里面的 `app` 应用对象              |
| `--reload` | 开发期间检测文件变化，并自动重启服务器 |

服务器启动后，会持续运行，并监听一个本地地址，通常是 `http://127.0.0.1:8000`。

现在整个过程就变成这样了：

- 运行 Uvicorn

​		加载 main.py 中的 app

- Web 服务器持续运行

​		监听 127.0.0.1:8000

- 浏览器访问 /

​		发送 HTTP GET 请求

- FastAPI 调用 root()

​		返回 



# 检查info

运行后，出现如下日志：

```powershell
PS E:\fastAPI> uvicorn main:app --reload  
INFO:     Will watch for changes in these directories: ['E:\\fastAPI']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [20012] using WatchFiles
INFO:     Started server process [26008]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     127.0.0.1:62087 - "GET / HTTP/1.1" 200 OK
```

其中最重要的就是第二条：

```powershell
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

FastAPI会默认在 127.0.0.1：8000这个端口，打开这个loacl链接，你就能看到：

```json
{"message":"Hello World"}
```



看到这里，你已经完全了解了一个最简单的FastAPI应用是怎么构建的了。



# 详细拆解代码

在源代码中，最重要的一句就是：

```python
@app.get("/")
```

这行代码告诉 FastAPI：当用户通过 **GET** 方法访问根路径 **/** 时，执行下方函数。

其中涉及两个概念：

| 概念                  | 说明                                                  | 示例                   |
| :-------------------- | :---------------------------------------------------- | :--------------------- |
| **路径（Path）**      | URL 中从第一个 `/` 起的后半部分，也称为"端点"或"路由" | `/items/foo`           |
| **操作（Operation）** | HTTP 方法，对应不同的操作语义                         | GET、POST、PUT、DELETE |

| 装饰器          | HTTP 方法 | 常见用途      |
| :-------------- | :-------- | :------------ |
| `@app.get()`    | GET       | 获取/读取数据 |
| `@app.post()`   | POST      | 创建新数据    |
| `@app.put()`    | PUT       | 完整更新数据  |
| `@app.patch()`  | PATCH     | 部分更新数据  |
| `@app.delete()` | DELETE    | 删除数据      |

关于 get 方法和 post 方法的区别，在未来的章节再详细讲解。



# 添加更多路由

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root():
    """根路径，返回欢迎信息"""
    return {"message": "Hello World"}


@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str | None = None):
    """根据 ID 获取条目，支持可选的查询参数 q"""
    return {"item_id": item_id, "q": q}
```

新增路由的参数说明：

| 参数      | 类型         | 来源     | 说明                                                   |
| :-------- | :----------- | :------- | :----------------------------------------------------- |
| `item_id` | `int`        | 路径参数 | 从 URL 路径中获取，FastAPI 自动将字符串转为整数        |
| `q`       | `str | None` | 查询参数 | 从 URL 的 `?q=xxx` 部分获取，默认值为 `None`，表示可选 |

请不要因此而太过沮丧，这些东西看起来确实很复杂，但是我们先进行简单的拆解。

访问测试：

```powershell
# 访问根路径
GET http://127.0.0.1:8000/
响应: {"message": "Hello World"}

# 访问带路径参数的路由
GET http://127.0.0.1:8000/items/5
响应: {"item_id": 5, "q": null}

# 同时传递路径参数和查询参数
GET http://127.0.0.1:8000/items/5?q=runoob
响应: {"item_id": 5, "q": "runoob"}
```

不难发现，带路径参数访问的路由会出现不同的结果。

注意 `item_id` 的值是整数 `5` 而不是字符串 `"5"`，这就是 FastAPI 类型声明的数据转换功能。如果传入非整数（如 `/items/foo`），FastAPI 会返回清晰的校验错误信息。



# 初步了解 POST 请求

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


# 定义请求体数据模型
class Item(BaseModel):
    name: str           # 必填：商品名称
    description: str | None = None  # 可选：商品描述
    price: float        # 必填：商品价格
    tax: float | None = None        # 可选：税费


@app.post("/items/")
async def create_item(item: Item):
    """创建新商品，接收 JSON 请求体"""
    return item


@app.put("/items/{item_id}")
async def update_item(item_id: int, item: Item):
    """更新指定商品，同时使用路径参数和请求体"""
    return {"item_id": item_id, "item_name": item.name}
```

在刚才的内容中，我们已经简单的学习了POST请求具有添加的功能。这里进行一个例子来参考。

这里使用了 Pydantic 的 `BaseModel` 来定义请求体的结构。FastAPI 会自动：

- 将请求中的 JSON 数据解析为 `Item` 对象
- 校验数据类型和必填字段
- 在 API 文档中展示请求体结构



## FastAPI 参数识别规则

FastAPI 通过以下规则自动识别参数来源：

| 参数来源 | 识别条件                                  | 示例                               |
| :------- | :---------------------------------------- | :--------------------------------- |
| 路径参数 | 参数名出现在路由路径的 `{}` 中            | `item_id` 在 `/items/{item_id}` 中 |
| 查询参数 | 参数是单一类型（`int`、`str`、`bool` 等） | `q: str | None = None`             |
| 请求体   | 参数类型是 Pydantic 模型                  | `item: Item`                       |

你可以在同一个函数中混合使用这三种参数，FastAPI 会自动从正确的位置获取数据。



## 小结

创建 FastAPI 应用的核心步骤：

1. 导入 `FastAPI`
2. 创建应用实例 `app = FastAPI()`
3. 使用装饰器（如 `@app.get()`）定义路径操作
4. 定义路径操作函数，使用类型注解声明参数
5. 使用 `uvicorn main:app --reload` 运行开发服务器
