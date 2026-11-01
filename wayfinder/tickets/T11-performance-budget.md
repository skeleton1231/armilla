---
id: T11
title: 性能预算与验收清单
labels: [wayfinder:grilling]
blocked-by: [T03]
claimed-by:
status: closed
---

## Question

全站性能预算对齐全局 web 规则(LCP<2.5s、INP<200ms、CLS<0.1):landing 与命盘页分开的 3D/three chunk 预算;字体(≤2 族、preload 关键字重、swap);材质/贴图资产预算;next dev loop 的使用节奏(何时跑、看什么指标、什么算回退);最终验收清单 —— 什么数字达标才算规格完成。

## Resolution

2026-11-01 与用户拍板:

1. **分页 bundle 预算**:landing **零 three**(JS ≤150kb gz,氛围用 CSS/静态图/轻量 canvas 星空);/chart 页 three+fiber+drei 懒加载 chunk **≤250kb gz**,不进首屏关键路径。
2. **/chart 加载策略:2D 先渲、3D 异步接管** —— 服务端直出 2D SVG 命盘骨架 = LCP 来源;three 就绪后 3D 化(带进度提示);prefers-reduced-motion / 低端设备 / 爬虫永久停留 2D。
3. **验收三层**:开发期 next dev loop 持续自查;CI 里 **Lighthouse CI 硬门禁**(CWV + bundle 阈值,红即阻断合并);线上 Vercel Speed Insights(RUM)。CWV 目标:LCP<2.5s、INP<200ms、CLS<0.1(全局 web 规则)。
4. **字体:中文衬线子集化** —— 思源宋体级别字库按常用字表+站内字表 fontTools 切片 woff2,zh 预加载 1 字重;Latin 衬线 1–2 字重;共 ≤2 族;font-display: swap。
5. 资产预算:3D 材质程序化生成为主(青铜/鎏金用 shader 与顶点色,不堆贴图);贴图单张 ≤200kb、总量 ≤1MB。
6. 数字达标 = 规格完成的验收口径:CI 门禁绿 + 移动端 Slow 4G 模拟下 /chart LCP<2.5s。
