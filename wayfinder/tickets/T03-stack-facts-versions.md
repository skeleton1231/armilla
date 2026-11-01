---
id: T03
title: Next.js / shadcn / three.js / next-intl 版本与集成事实
labels: [wayfinder:research]
blocked-by: []
claimed-by:
status: closed
---

## Question

"严格参照文档不幻想"需要事实底座。以官方文档为准,钉死(每条附出处链接):

1. 最新稳定 Next.js 版本号,及 App Router/RSC 约定、client 组件动态导入的现行写法、Turbopack 状态、缓存/ISR 现行 API。
2. shadcn/ui 当前版本:CLI 初始化流程(对最新 Next.js + Tailwind 4)、主题机制(CSS 变量/theming 文档)、常用组件清单。
3. three.js + @react-three/fiber + drei 的当前版本兼容矩阵(与 React 19/Next 最新版)、基础包体积、SSR/动态加载注意点。
4. next-intl 当前主版本与最新 Next.js 的集成方式(子路径路由 `/zh` `/en` + Accept-Language 重定向的官方推荐配置)。

产出 `wayfinder/research/stack-facts.md`:一张"我们将采用的确切版本 + 关键 API 写法 + 出处"事实表。

## Context pointers

- 研究产出: wayfinder/research/stack-facts.md —— 四栈版本与集成事实已钉死(2026-11-01 官方文档 + npm registry 实核):Next.js 16.4.3 / shadcn CLI 4.23.0 / three 0.187.0 + fiber 9.8.2 + drei 10.7.9 / next-intl 4.14.9;含 next/dynamic ssr:false 限制、Turbopack 默认、Cache Components 双模型缓存 API、shadcn Tailwind v4 oklch theming、fiber v9 React 19 坑与体积实测、proxy.ts + [locale] 官方配置;并附 T06/T11 事实提示段。

## Resolution

四个栈全部以官方文档 + npm registry 当日实核并写入 `wayfinder/research/stack-facts.md`:**next 16.4.3**(Turbopack dev+build 默认;缓存走 `'use cache'`/Cache Components 模型,`ssr:false` 仅限 client 组件)、**shadcn CLI 4.23.0**(create-next-app→init→add;Tailwind v4 oklch CSS 变量 theming;表单 = `<Field />` + RHF/TanStack Form 双官方指南)、**three 0.187.0 + fiber 9.8.2 + drei 10.7.9**(fiber 9 = React 19 线,peers 无冲突;three 全量 ≈186KB gz;3D 必须 `'use client'` + dynamic ssr:false + transpilePackages)、**next-intl 4.14.9**(支持 Next 16;proxy.ts + [locale] + next/root-params 静态渲染)。T06(选型)与 T11(预算)所需事实已各设提示段,两张票的 blocked-by 已解除依据。
