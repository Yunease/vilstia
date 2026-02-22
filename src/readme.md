# 📊 Blog Rank Stats Worker

独立排行榜统计系统
 部署平台：Cloudflare Workers
 存储：Cloudflare KV

------

# 一、系统目的

本 Worker 用于：

- 统计文章 PV（仅用于排行）
- 提供排行榜 JSON API
- 不替代 Vercount
- 不影响现有统计系统

架构模式：

```
文章页面
   ↓
/api/pv
   ↓
Cloudflare KV
   ↓
/api/rank
```

Vercount 仍然作为主统计展示来源。

本系统仅作为：

> 排行榜专用统计源

------

# 二、当前部署信息

### Worker 基础地址

```
https://vilstia.2642076599.workers.dev
```

### API 列表

#### 1️⃣ 增加访问

```
GET /api/pv?slug=文章路径
```

示例：

```
https://vilstia.2642076599.workers.dev/api/pv?slug=/post/example
```

------

#### 2️⃣ 获取排行榜

```
GET /api/rank
```

返回示例：

```
[
  {
    "slug": "/post/test",
    "pv": 7
  }
]
```

默认返回前 20 条。

------

# 三、KV 绑定信息

### KV Namespace 名称

```
vilstia
```

### Worker 绑定变量名

```
STATS
```

代码中通过：

```
env.STATS
```

访问 KV。

------

# 四、当前数据结构

KV 中每个 key 结构如下：

```
Key   = slug
Value = pv 数字（字符串形式存储）
```

示例：

```
Key:   /post/example
Value: "123"
```

读取时需：

```
parseInt(value)
```

------

# 五、Astro 接入方式

在正常文章页面中加入：

```
<script>
fetch("https://vilstia.2642076599.workers.dev/api/pv?slug=" + location.pathname)
</script>
```

⚠ 需要：

- 仅在“正式文章”页面触发
- 不在吐槽，gallery，photo等文章触发
- 不在列表页触发

------

# 六、过滤规则（重要）

当前博客建议过滤逻辑：

- 根据md文件中的tag字段过滤
- 根据文件路径过滤

示例逻辑：

```
if (!location.pathname.startsWith("/rant/")) {
  fetch(...)
}
```

------

# 七、历史数据初始化（可选）

如果需要对齐 Vercount 历史数据：

步骤：

1. 抓取当前各文章 PV
2. 生成 JSON
3. 批量写入 KV

写入示例：

```
await env.STATS.put("/post/a", "456")
```

⚠ 只需执行一次。

------

# 八、未来迁移说明

本系统耦合情况：

- Worker 可迁移（标准 JS）
- KV 数据可导出
- 不影响主站运行

如迁移平台：

1. 导出 KV 数据
2. 替换存储层
3. 修改 API 域名

核心数据结构极简，迁移成本低。

------

# 九、已知特性

当前统计特点：

- 每次调用 /api/pv 即 +1
- 无去重逻辑
- 无 IP 判断
- 无防刷机制
- 属于轻量级 PV 统计

------

# 十、性能说明

 KV 操作规模：极低
 Cloudflare 免费额度足够长期使用

适用于：

- 个人博客
- 轻量排行
- 非实时需求

不适用于：

- 大规模流量
- 精准 UV 分析
- 企业级统计

------

# 十一、设计理念

本系统设计原则：

- 保持极简
- 不替代 Vercount
- 仅解决排行榜问题
- 不引入复杂数据库
- 可随时重构

这是一个：

> 低侵入、低耦合、可控的统计增强层

------

# 十二、当前完整 Worker 代码

```
export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === "/api/pv") {
      const slug = url.searchParams.get("slug")
      if (!slug) return new Response("缺少 slug", { status: 400 })

      const current = await env.STATS.get(slug)
      const pv = current ? parseInt(current) + 1 : 1

      await env.STATS.put(slug, pv.toString())

      return new Response("OK")
    }

    if (url.pathname === "/api/rank") {
      const list = await env.STATS.list()
      let results = []

      for (const key of list.keys) {
        const value = await env.STATS.get(key.name)
        results.push({
          slug: key.name,
          pv: parseInt(value)
        })
      }

      results.sort((a, b) => b.pv - a.pv)

      return Response.json(results.slice(0, 20))
    }

    return new Response("Not Found", { status: 404 })
  }
}
```

------

# 十三、交接重点提醒

如果交给 Claude 或其他开发者：

必须确认：

- KV 变量名是 `STATS`
- Namespace 正确绑定
- 只统计正常文章
- 不与 Vercount 数值强一致
- 排行榜仅为趋势展示

------

# 完成状态

当前系统状态：

- ✅ Worker 正常运行
- ✅ KV 正常读写
- ✅ 排行 API 正常返回
- ⏳ 尚未接入真实文章页面