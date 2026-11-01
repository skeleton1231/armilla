---
id: T12
title: 2D 降级、无障碍与分享卡片
labels: [wayfinder:grilling]
blocked-by: [T07, T05]
claimed-by:
status: closed
---

## Question

- 3D 不可用 / prefers-reduced-motion / SEO 爬虫下的 2D 命盘渲染方案(SVG?与 T07 拍板的构图同源);
- OG 分享图动态生成:命盘 2D 渲染进 OG 图的技术选型与视觉;
- 键盘可达性与焦点管理;hreflang 与结构化数据(JSON-LD)方案。

## Resolution

2026-11-01 与用户拍板(最后一张票,地图随之走完):

1. **2D 降级 = SVG 环形盘面,与 3D 变体 A 同构**(同一盘面数据驱动两种渲染)。它一身四用:LCP 骨架(T11)、爬虫/低版本/reduced-motion 的永久呈现、无障碍主路径、OG 图素材。服务端渲染直出。
2. **OG = @vercel/og(satori)按 URL 参数动态生成** 1200×630:2D 环形盘面简版 + 标语「星有轨迹,盘有出处 / Every star placed. Every word sourced.」+ 域名入口;`'use cache'` 按参数缓存,同盘同图。
3. **无障碍:2D SVG 为可访问主路径,3D 视图 aria-hidden 装饰化**;键盘 Tab 沿十二宫环形序遍历,焦点样式 = 鎏金环;每宫 alt 文本完整;解读面板 aria-live;对比度随 T09 tokens 已达标。
4. **SEO 全套**:next-intl 自动 hreflang(zh/en 互指)+ WebApplication/Article/BreadcrumbList JSON-LD + sitemap(静态页全量;/chart 参数空间不入 sitemap,由分享与内链发现)。

雾区最后一项(分享卡片视觉规格)随本票定案清空。
