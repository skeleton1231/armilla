---
id: T08
title: 解读知识架构与双语内容策略
labels: [wayfinder:grilling]
blocked-by: [T02]
claimed-by:
status: open
---

## Question

确定性解读的知识架构:

- 结构化 schema:星曜 × 宫位 × 四化 × 格局 → 双语文案的数据模型;
- 覆盖优先级:14 主星 × 12 宫先行?辅曜/格局/四化分层排期;
- 生成方式:纯查表拼接 vs 轻量模板引擎,段落组装规则(优先级、去重、长度控制);
- 内容文件组织:独立于 next-intl messages 的双语数据文件结构(参考 split-heavy-data 原则);
- en 文案生产管线:zh 原创 → en 翻译/审校的流程与工具。

依据 T02 盘点的可移植知识(格局库 1100+ 行、星曜宫位知识)定案。
