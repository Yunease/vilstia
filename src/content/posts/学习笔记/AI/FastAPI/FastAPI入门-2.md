---
title: FastAPI入门-2
tags: [AI, FastAPI, 博客文章]
category: 学习
description: 利用 OpenAPI 规范定义路由与操作，自动生成接口文档；重点解析了路径参数与查询参数的智能识别机制，覆盖列表分页切片、类型自动转换（如布尔值）、默认值配置以及参数可选与必选的判定规则。
published: 2026-10-25T11:24:48
---

# OpenAPI

**FastAPI** 使用定义 API 的 **OpenAPI** 标准将你的所有 API 转换成「模式」。

如果你对原始的 OpenAPI 模式长什么样子感到好奇，FastAPI 自动生成了包含所有 API 描述的 JSON（模式）。

你可以直接在：http://127.0.0.1:8000/openapi.json 看到它。

它将显示以如下内容开头的 JSON：

```json
{
    "openapi": "3.1.0",
    "info": {
        "title": "FastAPI",
        "version": "0.1.0"
    },
    "paths": {
        "/items/": {
            "get": {
                "responses": {
                    "200": {
                        "description": "Successful Response",
                        "content": {
                            "application/json": {



...
```



## 什么是toml

是一种专为配置文件设计的数据序列化语言，由 GitHub 联合创始人 Tom Preston-Werner 于 2013 年创建。

简单的例子：

```toml
# 基础键值对
title = "TOML 示例配置"
version = 1.0
enabled = true

# 嵌套表格（Table，等同于字典/对象）
[owner]
name = "琴泠"
bio = "喜欢杀戮和钻孔"

# 强类型与数组
[database]
server = "192.168.1.1"
ports = [ 8001, 8001, 8002 ]
connection_max = 5000
created_at = 2026-10-25T10:00:00Z  # 原生支持日期时间
```



# 创建一个 FastAPI 实例

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}
```

这里的 app 就是 fastapi 的一个实例。这个实例时创建所有 api 的主要交互对象。



## 路径

路径也就是 url 从第一个 / 后的部分，比如：

```python
https://vilstia.org/items/foo
```

路径就是：

```python
/items/foo
```

> 路径有时候也被称作端点或者路由。



## 操作

通常使用：

- post：创建数据
- get：读取数据
- put：更新数据
- delete：删除数据



## 定义一个路径操作装饰器

```python
from fastapi import FastAIP

app = FAstAPI()

@app.get("/")
async def root():
	return {
		"message": "hello world"
	}
```

在这个代码片段中：

- 请求路径：`/`
- 使用 `get` 操作



# 查询参数

```python
from fastapi import FastAPI

app = FastAPI()

fake_items_db = [{"item_name": "Foo"}, {"item_name": "Bar"}, {"item_name": "Baz"}]

# 这里是拼音查询参数，大家不要学习这个命名风格，不然会被前端兄弟打死的。
@app.get("/cxcs/")
async def read_item(skip: int = 0, limit: int = 10):
    return fake_items_db[skip : skip + limit]
```

这个代码段和上面代码段不同的部分，在于增加了一段参数查询：

`skip: int = 0, limit: int = 10`

如果直接访问 `http://127.0.0.1:8000/cxcs/`，能够看到：`[{"item_name":"Foo"},{"item_name":"Bar"},{"item_name":"Baz"}]` ,把所有数据都展示了出来。

如果增加参数查询，就像短链接变为长链接那样：

`http://127.0.0.1:8000/cxcs/?skip=1&limit=10`

`[{"item_name":"Bar"},{"item_name":"Baz"}]`

这是怎么回事呢？

在这里，skip 这个参数的作用是从第几位开始，而 limit 是一共显示几个。

```python
list[起始位置 : 结束位置]
# 在这里，起始位置就是 skip，终止位置就是 skip+limit
```



## 默认值

查询参数不是路径中的固定内容，可选，还支持默认值。

上述用 skip=0 和 limit=10 设定默认值。

这种情况下，访问 URL:

```python
http://127.0.0.1:8000/items/
```

与访问这个地址效果效果相同：

````python
http://127.0.0.1:8000/items/?skip=0&limit=10
````



# 可选参数

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/items/{item_id}")
async def read_item(item_id: str, q: str | None = None):
    if q:
        return {"item_id": item_id, "q": q}
    return {"item_id": item_id}
```

如果允许一个参数默认值为 None，就认为这是一个可选参数。

> 注意，**FastAPI** 可以识别出 `item_id` 是路径参数，`q` 不是路径参数，而是查询参数。



## 查询参数类型转换

参数还可以声明为 `bool` 类型，FastAPI 会自动转换参数类型：

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/items/{item_id}")
async def read_item(item_id: str, q: str | None = None, short: bool = False):
    item = {"item_id": item_id}
    if q:
        item.update({"q": q})
    if not short:
        item.update(
            {"description": "This is an amazing item that has a long description"}
        )
    return item
```

在这个案例中：

```python
http://127.0.0.1:8000/items/foo?short=1
http://127.0.0.1:8000/items/foo?short=True
http://127.0.0.1:8000/items/foo?short=true
http://127.0.0.1:8000/items/foo?short=on
http://127.0.0.1:8000/items/foo?short=yes
```

函数接收的参数值都是 True，否则为 False。

试试访问？

`{"item_id":"foo"}`



## 多个路径和查询参数

**FastAPI** 可以识别同时声明的多个路径参数和查询参数。

而且声明查询参数的顺序并不重要。

FastAPI 通过参数名进行检测：

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/users/{user_id}/items/{item_id}")
async def read_user_item(
    user_id: int, item_id: str, q: str | None = None, short: bool = False
):
    item = {"item_id": item_id, "owner_id": user_id}
    if q:
        item.update({"q": q})
    if not short:
        item.update(
            {"description": "This is an amazing item that has a long description"}
        )
    return item
```



## 必选查询参数

为不是路径参数的参数声明默认值（至此，仅有查询参数），该参数就不是必选的了。

如果只想把参数设为可选，但又不想指定参数的值，则要把默认值设为 `None`。

如果要把查询参数设置为必选，就不要声明默认值：

```python
from fastapi import FastAPI

app = FastAPI()


@app.get("/items/{item_id}")
async def read_user_item(item_id: str, needy: str):
    item = {"item_id": item_id, "needy": needy}
    return item
```

这里的查询参数 `needy` 是类型为 `str` 的必选查询参数。

> 还可以像在路径参数中那样使用 `Enum`。



# 附：全部代码

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/test")
async def test_endpoint():
    return {"message": "This is a test endpoint"}

# 定义请求体
# 你可以规定一些预设值
class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None

@app.post("/items/")
async def submit_endpoint(item: Item):
    # Process the submitted item here
    """创建新商品，接收 JSON 请求体并返回确认信息"""
    return item

# 联合类型和泛型的区别：
# 联合类型（Union）允许一个变量可以是多种类型中的一种，而泛型（Generic）允许你定义一个函数或类，它可以处理多种类型，但在使用时需要指定具体的类型。

# Item : str | int
# 这是一个联合类型，表示 item 可以是字符串或整数。

# Item : T
# 这是一个泛型，表示 item 可以是任意类型 T，但在使用时需要指定具体的类型，例如 Item[int] 或 Item[str]。一旦确定类型，它在整个函数或类中保持一致。

fake_items_db = [{"item_name": "Foo"}, {"item_name": "Bar"}, {"item_name": "Baz"}]


@app.get("/cxcs/")
async def read_item(skip: int = 0, limit: int = 10):
    return fake_items_db[skip : skip + limit]


@app.get("/items_2/{item_id}")
async def read_item(item_id: str, q: str | None = None, short: bool = False):
    item = {"item_id": item_id}
    if q:
        item.update({"q": q})
    if not short:
        item.update(
            {"description": "This is an amazing item that has a long description"}
        )
    return item
```
