---
id: T03
title: Next.js / shadcn / three.js / next-intl 版本与集成事实
labels: [wayfinder:research]
blocked-by: []
claimed-by:
status: open
---

## Question

"严格参照文档不幻想"需要事实底座。以官方文档为准,钉死(每条附出处链接):

1. 最新稳定 Next.js 版本号,及 App Router/RSC 约定、client 组件动态导入的现行写法、Turbopack 状态、缓存/ISR 现行 API。
2. shadcn/ui 当前版本:CLI 初始化流程(对最新 Next.js + Tailwind 4)、主题机制(CSS 变量/theming 文档)、常用组件清单。
3. three.js + @react-three/fiber + drei 的当前版本兼容矩阵(与 React 19/Next 最新版)、基础包体积、SSR/动态加载注意点。
4. next-intl 当前主版本与最新 Next.js 的集成方式(子路径路由 `/zh` `/en` + Accept-Language 重定向的官方推荐配置)。

产出 `wayfinder/research/stack-facts.md`:一张"我们将采用的确切版本 + 关键 API 写法 + 出处"事实表。

## Context pointers

(研究完成后登记 `wayfinder/research/stack-facts.md`)
