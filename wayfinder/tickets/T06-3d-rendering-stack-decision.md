---
id: T06
title: 3D 渲染栈选型(R3F vs 原生 three.js)
labels: [wayfinder:grilling]
blocked-by: [T03]
claimed-by:
status: open
---

## Question

依据 T03 的版本/兼容/体积事实,定案 3D 实现栈:@react-three/fiber + drei vs 原生 three.js 自封装 vs 混合。硬约束:3D 必须 client island 动态加载、不阻塞 LCP、可控的包体积预算(T11 会定具体数字)。写明取舍理由与落选方案的问题,形成一段可进规格的决策记录。
