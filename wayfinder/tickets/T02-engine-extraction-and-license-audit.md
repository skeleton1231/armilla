---
id: T02
title: 上游紫微引擎提取与许可审计
labels: [wayfinder:research]
blocked-by: []
claimed-by:
status: open
---

## Question

如何把 Renhuai123/ziwei-doushu 的排盘能力带进本站?查明:

1. `lib/ziwei/` 各模块(algorithm、constants、sihua、patterns 格局库、true-solar-time 真太阳时、cities 城市表、shier-shen、lunar-solar、dst-cn 等)的职责、相互依赖、输入输出数据形状(types.ts)。
2. 依赖边界:上游基于 iztro + lunar-javascript —— 哪些直接 vendored 移植,哪些换成 iztro/lunar-javascript 的 npm 包直接调用?两条路线的代价对比。
3. 许可审计:MIT 代码可复用;**倪师原话 CC BY-NC-SA(禁商用)不得进入本站**;数据集 CC BY 4.0 署名边界;明确列出"能拿/不能拿/拿了要署名"三栏清单。
4. 黄金用例:从上游 README/文档整理 10 个左右"已知出生输入 → 已知盘面输出"对照用例,供 T13 测试票使用。

产出 `wayfinder/research/engine-extraction.md`,含移植方案建议与依赖清单。

## Context pointers

(研究完成后登记 `wayfinder/research/engine-extraction.md`)
