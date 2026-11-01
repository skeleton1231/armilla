---
id: T06
title: 3D 渲染栈选型(R3F vs 原生 three.js)
labels: [wayfinder:grilling]
blocked-by: [T03]
claimed-by:
status: closed
---

## Question

依据 T03 的版本/兼容/体积事实,定案 3D 实现栈:@react-three/fiber + drei vs 原生 three.js 自封装 vs 混合。硬约束:3D 必须 client island 动态加载、不阻塞 LCP、可控的包体积预算(T11 会定具体数字)。写明取舍理由与落选方案的问题,形成一段可进规格的决策记录。

## ⛔ Superseded(2026-11-01)

用户转向决议:**全站移除 3D,零 three.js 依赖**。本票结论作废;3D 相关工作移入地图 Out of scope。

## Resolution

2026-11-01 与用户拍板:**R3F(fiber 9.8.2)+ drei(10.7.9)按需引入**。

- 依据:T03 实核与 React 19 / Next 16.4.3 无 peer 冲突;drei 只 import 所需(OrbitControls、Html 等)控制包体;声明式写法让 T07 的 2–3 个构图原型迭代最快。
- 落选理由:原生 three.js 自封装 bundle 最小,但要手写渲染循环/资源释放/事件拾取,开发量与协作门槛不划算;混合模式两套心智模型,仅在预算不够时重议(由 T11 预算数字回看本决策)。
- 落地约束(进规格):three 0.187.0;`'use client'` + `dynamic(..., { ssr: false })` + `transpilePackages: ['three']`;材质与几何尽量共享/复用,禁在渲染循环里分配新对象。
