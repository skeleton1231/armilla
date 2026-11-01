---
id: MAP
title: 紫微斗数 3D 网站 · 实现规格地图
labels: [wayfinder:map]
status: open
---

## Destination

一份可直接开工的完整实现规格:Next.js(最新稳定版,RSC 优先)+ shadcn/ui 的架构定案、上游紫微排盘引擎(Renhuai123/ziwei-doushu,MIT)的移植方案、确定性解读的双语知识架构、浑仪·青铜设计系统(tokens + 3D 材质语言)、next-intl 子路径 i18n、性能与测试验收清单。所有关键决策以票的形式关闭;规格完成即可进入独立执行阶段(执行不在本图内)。

## Notes

- **Tracker 约定(本地 markdown tracker)**:地图 = 本文件(label `wayfinder:map`);票 = `wayfinder/tickets/T*.md`,frontmatter 携带 `labels`(`wayfinder:research|prototype|grilling|task`)、`blocked-by`、`claimed-by`、`status`。**认领 = 把 `claimed-by` 写成自己**,动手前先认领。前沿(frontier)= `status: open` 且 `blocked-by` 里没有 open 票且无 `claimed-by`。票解完后:票内追加 `## Resolution`,置 `status: closed`,并在本文件 Decisions so far 加一行链接。
- **research 产出**:写 `wayfinder/research/<slug>.md`,并在对应票的 Context pointers 登记路径。(本地 tracker 无远程,以此代替 throwaway `research/*` 分支;仅作资料,永不进产品代码。)
- 每会话只解一张票(research 类除外);并发会话可能同时在改本 tracker。
- 终点性质:产出**决策**,不产出交付物;执行阶段另行开展。
- 平台约束:Vercel 部署;无数据库、无账号 —— 命盘靠 URL 参数分享。
- 技术立场:Next.js 最新稳定版 + shadcn/ui 最新版,**严格参照官方文档,禁止臆造 API**;server component/page 优先,client 组件最小化(命盘 3D 视图是必要的 client island);性能对齐全局 web 规则(LCP<2.5s、INP<200ms、CLS<0.1、bundle 预算);迭代用 next dev loop 验证。
- i18n:next-intl,`/zh` `/en` 子路径,根路径按 Accept-Language 重定向;重内容(星曜/宫位/格局/解读)拆独立数据文件,不进 messages。
- 3D:three.js,3D 即产品本体(命盘即 3D);保留 2D 降级。
- 解读:本地确定性知识库(移植/参考上游 MIT 知识 + 双语原创);非 AI、非 v4 数据集。
- 视觉:浑仪·青铜(暖炭底 / 青铜锈绿 / 鎏金 / 朱砂);朱砂专属四化标记;一切设计票过 impeccable 去 AI 味清单(T01 产出)。
- 数据许可:上游引擎代码 MIT 可复用;**倪师原话 CC BY-NC-SA(禁商用)一律不引用**;若引用数据集内容需 CC BY 4.0 署名。

## Decisions so far

(尚无已关闭票)

## Not yet specified

- 解读内容验收标准与覆盖排期 —— 等 T08 知识架构定案后细化
- 3D 交互细节规格(动画时序、首屏引导、性能档位)—— 等 T07 原型反馈
- Landing 页文案与信息结构 —— 等 T01(impeccable 清单)+ T04(命名)到位
- 缓存/ISR 与运行时策略(node vs edge)—— 等 T05 路由 + T11 预算之后
- 双语内容生产管线(en 侧产能与审校)—— 等 T08
- 命盘分享卡片视觉规格 —— 等 T12 的 OG 方案

## Out of scope

- 用户账号 + 保存命盘(2026-11-01 澄清:URL 分享替代)
- AI 动态解读(上游 AI prompts 不开源;v1 走确定性解读)
- 支付/商业化(v1 免费工具站)
- 古籍阅读器(独立子产品,v1.1 再评)
- 八字/塔罗等多术数模块(平台化不属于本 effort)
- v4 数据集切片接入(56.6GB 数据基建;已选本地知识库路线)
- 移动原生 App
