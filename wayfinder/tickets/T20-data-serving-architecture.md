---
id: T20
title: 数据集服务化架构决策
labels: [wayfinder:grilling]
blocked-by: [T19]
claimed-by:
status: open
---

## Question

依据 T19 的盘点,决定数据如何变成用户可见的服务(注意平台约束:Vercel、无自有数据库红线是否因数据集破例 —— 若破例要显式记录):

- **托管与查询**:Cloudflare R2 / Supabase / 按年切片静态 JSONL 挂 CDN,三选一(或组合);按出生 key 查询的 API 形态(Next Route Handler 代理 vs 客户端直拉 CDN);
- **自生成 vs 下载数据**:若上游生成脚本可用,是部署时按需生成还是离线预生成为切片;
- **缓存**:与 T17 的 `'use cache'` 矩阵合并(按参数缓存整个命盘页,数据查询自然被吃进缓存);
- **兜底链路**:数据缺录(超出覆盖年份/闰月边界)时回退 T08 本地知识库 + 明示标注;
- **署名落点**:CC BY 4.0 署名在页面的具体形态(钦天监语气)。
