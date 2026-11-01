---
id: T02
title: 上游紫微引擎提取与许可审计
labels: [wayfinder:research]
blocked-by: []
claimed-by:
status: closed
---

## Question

如何把 Renhuai123/ziwei-doushu 的排盘能力带进本站?查明:

1. `lib/ziwei/` 各模块(algorithm、constants、sihua、patterns 格局库、true-solar-time 真太阳时、cities 城市表、shier-shen、lunar-solar、dst-cn 等)的职责、相互依赖、输入输出数据形状(types.ts)。
2. 依赖边界:上游基于 iztro + lunar-javascript —— 哪些直接 vendored 移植,哪些换成 iztro/lunar-javascript 的 npm 包直接调用?两条路线的代价对比。
3. 许可审计:MIT 代码可复用;**倪师原话 CC BY-NC-SA(禁商用)不得进入本站**;数据集 CC BY 4.0 署名边界;明确列出"能拿/不能拿/拿了要署名"三栏清单。
4. 黄金用例:从上游 README/文档整理 10 个左右"已知出生输入 → 已知盘面输出"对照用例,供 T13 测试票使用。

产出 `wayfinder/research/engine-extraction.md`,含移植方案建议与依赖清单。

## Context pointers

- 研究产出: wayfinder/research/engine-extraction.md(上游 = npm iztro/lunar-javascript 基座 + MIT 校准层;推荐混合移植路线;许可三栏表含 3 处倪师原话红线;黄金用例 19 项 + 补录计划)

## Resolution

上游不是独立引擎,而是 iztro(2.6.1,MIT)+ lunar-javascript(1.7.7,MIT)基座之上的 MIT 校准层(亮度表/闰月 split/魁钺 KY1/大耗截空副旬/节气四柱/真太阳时/夏令时)。推荐路线 C「npm 基座 + vendored 校准层」:两个包锁版本直依赖,`lib/ziwei` 校准层整目录移植,5 个坑(astro.config 全局副作用、双真太阳时实现、晚子时换日不一致、'server-only' import、3 个已下线类型字段)与清理项均已列明。许可:引擎代码 MIT 可拿(patterns.ts 删 6 句、famous.ts 删 2 句倪师引语);heming-knowledge.ts、lib/nihai/、docs/tianji-ziwei/ 三处倪师原话(CC BY-NC-SA)一行不进站,建议 CI 关键词黑名单;需自建 THIRD-PARTY-NOTICES。黄金用例:现成 19 项(1 条全盘面 + 18 条部分/边界,含立春时刻分档、晚子时跨月、DST 分歧日、768 盘不变式),闰月后半月是最大空白,补录 10 条全字段需人工用上游 demo 复核;Releases v3/v4 数据集可作大规模 oracle(CC BY 4.0 需署名)。产出已交接 T03/T08/T10/T13。
