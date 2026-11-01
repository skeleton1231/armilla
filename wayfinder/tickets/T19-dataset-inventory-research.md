---
id: T19
title: 紫微数据集深度盘点(v3/v4/famous)
labels: [wayfinder:research]
blocked-by: []
claimed-by:
status: open
---

## Question

转向后的核心资产研究。基于上游仓库 Renhuai123/ziwei-doushu(浅克隆在 D:\tmp\ziwei-doushu-research,或重新克隆)的文档、生成脚本与仓库内样本,**不下载完整数据集**(v4 解压 56.6GB),查明:

1. **v4.0 解读数据集**:13 个解读维度各是什么;每条 passage 的字段结构与平均长度;语言(纯中文?);key 规则 `YYYY-MM-DD-hH-g` 的准确语义(公历?h 是时辰序?g 性别?);覆盖年份范围;zstd 压缩分卷的组织方式;**生成脚本在仓库里吗?若在,我们能否自己按需生成单条/单年数据**(这决定服务化架构)。
2. **v3.0 样本数据集(518k 盘)**:字段 schema;天盘/地势/人盘三系标签的含义与用法;CSV/Parquet 哪个可用最少内存做"同盘检索";样本与真实人口分布的偏差说明。
3. **famous.ts(3,770 名人盘)**:字段(姓名/生辰/成就分类?);是否含 NC 倪师内容(T02 已标记删 2 句);作为"同盘名人"功能的可行性。
4. **许可与署名**:数据集 CC BY 4.0 的署名要求具体怎么满足(页面脚注?method 页?每条解读尾注?);v3/famous 是否同许可。
5. **体积与切片**:若 v4 按年切 JSONL,单年多大、单条查询需拉多少字节;给出 2–3 种可行切片粒度(按年/按月/按 key 索引)的量化对比。

产出 `wayfinder/research/dataset-inventory.md`:schema 表、生成能力结论(能否自生成)、切片方案对比、署名方案建议。T20/T21 依赖本票。
