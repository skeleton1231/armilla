---
id: T17
title: 缓存/ISR 与运行时策略
labels: [wayfinder:grilling]
blocked-by: [T11]
claimed-by: claude-main
status: open
---

## Question

自雾区毕业(T05 路由 + T11 预算已定)。锁定各路由的渲染/缓存矩阵:

- landing(静态?)、/chart(动态 SSR,还是按 URL 参数用 `'use cache'` 全路由缓存?)、26 核心 + 168 组合百科(generateStaticParams 全静态?)、/method(静态);
- 引擎(iztro + lunar-javascript + vendored 校准层)在 edge runtime 是否可行,还是固定 nodejs runtime;
- 构建时长上限与 revalidate 策略(内容变更时);
- 产出:路由 × 渲染/缓存 × runtime 矩阵表进规格。
