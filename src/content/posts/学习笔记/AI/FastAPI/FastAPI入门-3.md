---
title: FastAPI入门-3
tags: [AI, FastAPI, 博客文章]
category: 学习
description: FastAPI 借助 Pydantic 模型以及 Path、Query 等工具，分别统一处理请求体、路径与查询参数。仅凭 Python 原生类型注解即可自动完成数据类型转换、范围与格式校验、错误拦截，并实时同步生成规范的 OpenAPI 交互文档。
published: 2026-10-25T12:06:48
---

# 请求体

当你需要从客户端向 API 发送数据时，会把它作为请求体发送。

请求体是客户端发送给你的 API 的数据。响应体是你的API发送给客户端的数据。

> 发送数据应使用以下之一：`POST`（最常见）、`PUT`、`DELETE` 或 `PATCH`。
>
> 规范中没有定义用 `GET` 请求发送请求体的行为，但 FastAPI 仍支持这种方式，只用于非常复杂/极端的用例。
>
> 由于不推荐，在使用 `GET` 时，Swagger UI 的交互式文档不会显示请求体的文档，而且中间的代理可能也不支持它。



## 导入 `Pydantic` 的 `BaseModel`

首先，你需要从 `pydantic` 中导入 `BaseModel`：

```python
from fastapi import FastAPI
from pydantic import BaseModel


class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None


app = FastAPI()


@app.post("/items/")
async def create_item(item: Item):
    return item
```



## 创建数据模型

然后，把数据模型声明为继承 `BaseModel` 类。

```python
class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None
```



## 结果

仅使用这些 Python 类型声明，**FastAPI** 就可以：

- 以 JSON 形式读取请求体。
- （在必要时）把请求体转换为对应的类型。
- 校验数据。
  - 数据无效时返回清晰的错误信息，并指出错误数据的确切位置和内容。
- 把接收的数据赋值给参数 `item`
  - 因为你把函数中的参数类型声明为 `Item`，所以还能获得所有属性及其类型的编辑器支持（补全等）。
- 为你的模型生成 JSON Schema 定义，如果对你的项目有意义，还可以在其他地方使用它们。
- 这些 schema 会成为生成的 OpenAPI Schema 的一部分，并被自动文档的 UIs 使用。



# 查询参数和字符串校验

**FastAPI** 允许你为参数声明额外的信息和校验。

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/items/")
async def read_items(q: str | None = None):
    results = {"items": [{"item_id": "Foo"}, {"item_id": "Bar"}]}
    if q:
        results.update({"q": q})
    return results
```



# 其他默认值

你也可以使用除了 None 以外的默认值。比如你想让 q 的 min_length 为 3，并且默认值为 fixedquery：

```python
from typing import Annotated

from fastapi import FastAPI, Query

app = FastAPI()


@app.get("/items/")
async def read_items(q: Annotated[str, Query(min_length=3)] = "fixedquery"):
    results = {"items": [{"item_id": "Foo"}, {"item_id": "Bar"}]}
    if q:
        results.update({"q": q})
    return results
```

> 注意！任何类型的默认值（包括 `None`）都会让该参数变为可选（非必填）。



# 路径参数和数值校验

## 导入 `Path`

首先，从 `fastapi` 导入 `Path`，并导入 `Annotated`：

```python
from typing import Annotated

from fastapi import FastAPI, Path, Query

app = FastAPI()


@app.get("/items/{item_id}")
async def read_items(
    item_id: Annotated[int, Path(title="The ID of the item to get")],
    q: Annotated[str | None, Query(alias="item-query")] = None,
):
    results = {"item_id": item_id}
    if q:
        results.update({"q": q})
    return results
```



## 总结

你能够以与查询参数和字符串校验相同的方式使用 `Query`、`Path`（以及其他你还没见过的类）声明元数据和字符串校验。

而且你还可以声明数值校验：

- `gt`：大于（`g`reater `t`han）
- `ge`：大于等于（`g`reater than or `e`qual）
- `lt`：小于（`l`ess `t`han）
- `le`：小于等于（`l`ess than or `e`qual）
