---
id: T17
title: 缓存/ISR 与运行时策略
labels: [wayfinder:grilling]
blocked-by: [T11]
claimed-by:
status: closed
---

## Question

自雾区毕业(T05 路由 + T11 预算已定)。锁定各路由的渲染/缓存矩阵:

- landing(静态?)、/chart(动态 SSR,还是按 URL 参数用 `'use cache'` 全路由缓存?)、26 核心 + 168 组合百科(generateStaticParams 全静态?)、/method(静态);
- 引擎(iztro + lunar-javascript + vendored 校准层)在 edge runtime 是否可行,还是固定 nodejs runtime;
- 构建时长上限与 revalidate 策略(内容变更时);
- 产出:路由 × 渲染/缓存 × runtime 矩阵表进规格。

## Resolution

2026-11-01 与用户拍板,矩阵如下(进规格):

| 路由 | 渲染/缓存 | runtime |
|---|---|---|
| `/[locale]`(landing) | 构建时静态 | node |
| `/[locale]/chart` | 动态 SSR + **`'use cache'` 按 canonical 参数全路由缓存**(cacheKey = 规范化出生参数;同盘永久命中,部署即失效) | node |
| `/[locale]/stars/[slug]`(14×2) | generateStaticParams 静态 | node |
| `/[locale]/palaces/[slug]`(12×2) | 静态 | node |
| `/[locale]/stars/[star]/[palace]`(168×2) | 随 P0 内容就绪**分批静态**(内容未就绪的组合不生成,不做空页) | node |
| `/[locale]/method` | 静态 | node |

- **runtime:全站 node**(Next 默认)。理由:/chart 已被全路由缓存包裹,edge 收益趋零而引入 API 子集风险(YAGNI);引擎上 edge 的可行性留作未来优化项。
- revalidate 模型:**部署即失效**(静态页与 'use cache' 条目随每次部署重建),内容文件变更走重新部署,无定时 ISR。
- 构建时长上限:**≤10 分钟**(约 336+ 静态页 + 字体切片),超出即回头优化生成脚本。
