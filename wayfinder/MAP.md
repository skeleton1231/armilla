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

- [T01 impeccable 去 AI 味准则摘要](tickets/T01-impeccable-anti-slop-checklist.md):四节可勾选去味清单(wayfinder/research/impeccable.md);朱砂=四化专属与"色彩即语义"同构;浑仪刻度须对齐真实宫位数据;Landing 首屏应即排盘入口;禁"智能解读"类虚假主张。
- [T02 上游紫微引擎提取与许可审计](tickets/T02-engine-extraction-and-license-audit.md):**路线 C = npm 基座(iztro 2.6.1 + lunar-javascript 1.7.7,均 MIT)+ vendored 校准层**(lib/ziwei 整目录移植,清理 5 处坑:astro.config 副作用、双真太阳时、晚子时换日等)。许可:patterns.ts 删 6 句、famous.ts 删 2 句倪师引语;heming-knowledge.ts / lib/nihai/ / docs/tianji-ziwei/ 三处 NC 内容禁入站(建议 CI 黑名单)。19 个黄金用例就绪;闰月后半月 10 例待补(T15)。
- [T03 技术栈版本事实](tickets/T03-stack-facts-versions.md):**Next.js 16.4.3 / shadcn CLI 4.23.0 / three 0.187.0 + fiber 9.8.2 + drei 10.7.9 / next-intl 4.14.9**,peers 无冲突;3D 走 `'use client'` + `dynamic ssr:false` + `transpilePackages:['three']`;缓存按 `'use cache'`/Cache Components;表单 `<Field />` + TanStack Form;next-intl 用 proxy.ts + `[locale]` + next/root-params(详见 wayfinder/research/stack-facts.md)。
- [T04 站点命名与品牌语气](tickets/T04-naming-and-brand-voice.md):**站名「璇玑 / Armilla」**(浑仪古名,中英同源);语气**钦天监式庄重**(克制、准确、有出处,禁祸福断言);logo **浑仪环线稿**。
- [T05 信息架构与命盘 URL 编码](tickets/T05-information-architecture-and-url-scheme.md):**五区极简路由**(/[locale]、/chart、/stars/[slug]、/palaces/[slug]、/method;根路径按语言重定向);命盘 URL = **可读 query**(公历 canonical + 时辰 + 性别 + 城市 id,跨语言共用);百科 v1 = 26 词条静态,168 组合页挂 T08;首页 localStorage 记最近 ≤5 张盘。
- [T06 3D 渲染栈选型](tickets/T06-3d-rendering-stack-decision.md):**R3F(fiber 9.8.2)+ drei(10.7.9)按需引入**,three 0.187.0;client island 动态加载(ssr:false)+ transpilePackages;原生自封装与混合模式落选(开发量/心智模型不划算,预算不够时重议)。
- [T08 解读知识架构与双语内容策略](tickets/T08-interpretation-knowledge-architecture.md):**分层查表+段落模板**(格局>主星宫位>四化>辅曜,3–6 段);**P0=168 条主星×宫 + 四化**,168 组合百科页**做**;en 管线 zh 定稿→机翻+审校,术语表先行;文件 `src/content/interpretations/` 条目内嵌 zh/en,编译期校验,不进 i18n messages。

## Not yet specified

- 3D 交互细节规格(动画时序、首屏引导、性能档位)—— 等 T07 原型反馈
- 缓存/ISR 与运行时策略(node vs edge)—— 等 T11 预算之后(T05 已定)
- 命盘分享卡片视觉规格 —— 等 T12 的 OG 方案

## Out of scope

- 用户账号 + 保存命盘(2026-11-01 澄清:URL 分享替代)
- AI 动态解读(上游 AI prompts 不开源;v1 走确定性解读)
- 支付/商业化(v1 免费工具站)
- 古籍阅读器(独立子产品,v1.1 再评)
- 八字/塔罗等多术数模块(平台化不属于本 effort)
- v4 数据集切片接入(56.6GB 数据基建;已选本地知识库路线)
- 移动原生 App
