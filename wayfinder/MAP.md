---
id: MAP
title: 紫微斗数 3D 网站 · 实现规格地图
labels: [wayfinder:map]
status: complete
---

## Destination

**(2026-11-01 重绘)** 一份可直接开工的完整实现规格:**纯 2D 平面网站**(无任何 3D/three.js),以紫微斗数**数据集驱动**服务用户:Next.js(最新稳定版,RSC 优先)+ shadcn/ui、上游排盘引擎(MIT)移植、上游 v3/v4 数据集的服务化架构、2D 环形盘面视觉规格、next-intl 子路径 i18n、性能与测试验收清单。所有关键决策以票的形式关闭;规格完成即可进入执行阶段。

> 原终点(含 3D)已作废:T06/T07/T18 及 T11 的 three 预算被 2026-11-01 转向决议取代,3D 相关工作全部移入 Out of scope。

## Notes

- **Tracker 约定(本地 markdown tracker)**:地图 = 本文件(label `wayfinder:map`);票 = `wayfinder/tickets/T*.md`,frontmatter 携带 `labels`(`wayfinder:research|prototype|grilling|task`)、`blocked-by`、`claimed-by`、`status`。**认领 = 把 `claimed-by` 写成自己**,动手前先认领。前沿(frontier)= `status: open` 且 `blocked-by` 里没有 open 票且无 `claimed-by`。票解完后:票内追加 `## Resolution`,置 `status: closed`,并在本文件 Decisions so far 加一行链接。
- **research 产出**:写 `wayfinder/research/<slug>.md`,并在对应票的 Context pointers 登记路径。(本地 tracker 无远程,以此代替 throwaway `research/*` 分支;仅作资料,永不进产品代码。)
- 每会话只解一张票(research 类除外);并发会话可能同时在改本 tracker。
- 终点性质:产出**决策**,不产出交付物;执行阶段另行开展。
- 平台约束:Vercel 部署;无数据库、无账号 —— 命盘靠 URL 参数分享。
- 技术立场:Next.js 最新稳定版 + shadcn/ui 最新版,**严格参照官方文档,禁止臆造 API**;server component/page 优先,client 组件最小化;性能对齐全局 web 规则(LCP<2.5s、INP<200ms、CLS<0.1);迭代用 next dev loop 验证。**全站零 3D / 零 three.js(2026-11-01 转向决议)**,命盘为 2D SVG 环形盘面。
- i18n:next-intl,`/zh` `/en` 子路径,根路径按 Accept-Language 重定向;重内容(星曜/宫位/格局/解读)拆独立数据文件,不进 messages。
- 解读与数据:**v4.0 数据集 = zh 十三维的唯一正文来源(T24,2026-11-02 用户指令"100% 使用,不能自产代替")**;en 站用本地双语知识库(数据集无英文,明示);窗外仅引擎格局。同盘之日索引由上游开源引擎枚举产生(与 v3 数据同源同口径)。
- 视觉:浑仪·青铜(暖炭底 / 青铜锈绿 / 鎏金 / 朱砂),**2D 平面呈现**;朱砂专属四化标记;一切设计票过 impeccable 去 AI 味清单(T01 产出)。
- 数据许可:上游引擎代码 MIT 可复用;**倪师原话 CC BY-NC-SA(禁商用)一律不引用**;若引用数据集内容需 CC BY 4.0 署名。

## Decisions so far

- [T01 impeccable 去 AI 味准则摘要](tickets/T01-impeccable-anti-slop-checklist.md):四节可勾选去味清单(wayfinder/research/impeccable.md);朱砂=四化专属与"色彩即语义"同构;浑仪刻度须对齐真实宫位数据;Landing 首屏应即排盘入口;禁"智能解读"类虚假主张。
- [T02 上游紫微引擎提取与许可审计](tickets/T02-engine-extraction-and-license-audit.md):**路线 C = npm 基座(iztro 2.6.1 + lunar-javascript 1.7.7,均 MIT)+ vendored 校准层**(lib/ziwei 整目录移植,清理 5 处坑:astro.config 副作用、双真太阳时、晚子时换日等)。许可:patterns.ts 删 6 句、famous.ts 删 2 句倪师引语;heming-knowledge.ts / lib/nihai/ / docs/tianji-ziwei/ 三处 NC 内容禁入站(建议 CI 黑名单)。19 个黄金用例就绪;闰月后半月 10 例待补(T15)。
- [T03 技术栈版本事实](tickets/T03-stack-facts-versions.md):**Next.js 16.4.3 / shadcn CLI 4.23.0 / three 0.187.0 + fiber 9.8.2 + drei 10.7.9 / next-intl 4.14.9**,peers 无冲突;3D 走 `'use client'` + `dynamic ssr:false` + `transpilePackages:['three']`;缓存按 `'use cache'`/Cache Components;表单 `<Field />` + TanStack Form;next-intl 用 proxy.ts + `[locale]` + next/root-params(详见 wayfinder/research/stack-facts.md)。
- [T04 站点命名与品牌语气](tickets/T04-naming-and-brand-voice.md):**站名「璇玑 / Armilla」**(浑仪古名,中英同源);语气**钦天监式庄重**(克制、准确、有出处,禁祸福断言);logo **浑仪环线稿**。
- [T05 信息架构与命盘 URL 编码](tickets/T05-information-architecture-and-url-scheme.md):**五区极简路由**(/[locale]、/chart、/stars/[slug]、/palaces/[slug]、/method;根路径按语言重定向);命盘 URL = **可读 query**(公历 canonical + 时辰 + 性别 + 城市 id,跨语言共用);百科 v1 = 26 词条静态,168 组合页挂 T08;首页 localStorage 记最近 ≤5 张盘。
- [T06 3D 渲染栈选型](tickets/T06-3d-rendering-stack-decision.md):~~R3F + drei 按需引入~~ **已失效(2026-11-01 转向:全站零 3D,three.js 依赖取消)**。
- [T08 解读知识架构与双语内容策略](tickets/T08-interpretation-knowledge-architecture.md):**分层查表+段落模板**(格局>主星宫位>四化>辅曜,3–6 段);**P0=168 条主星×宫 + 四化**,168 组合百科页**做**;en 管线 zh 定稿→机翻+审校,术语表先行;文件 `src/content/interpretations/` 条目内嵌 zh/en,编译期校验,不进 i18n messages。**(2026-11-01 转向后:定位调整为 en 层与数据缺录兜底,zh 主解读让位于数据集服务,以 T20 结论为准)**
- [T10 输入表单与历法换算 UX](tickets/T10-birth-input-form-ux.md):公历/农历双模式(闰月条件显示、即时校验);12 时辰选择 + 可选"精确时间→真太阳时"高级模式;城市 autocomplete(拼音/英文可搜,降级北京时区要明示);时辰未知 = 午时试排 + 显著标注;shadcn `<Field />` + TanStack Form。
- [T15 补录闰月黄金用例](tickets/T15-golden-cases-leap-month.md):10 条闰月后半月用例(#20–29,闰二/四/五/六/七/九月,1974–2020)已补进研究文档 §6.3,split 等价校验 10/10 通过;探针脚本在 D:\tmp\ziwei-doushu-research\scripts\leap-month-probe.ts。黄金用例共 29 条,T13 可用。
- [T11 性能预算与验收清单](tickets/T11-performance-budget.md):~~landing 零 three;/chart three chunk ≤250kb~~ **修订(2026-11-01 转向):全站零 three,所有页面 JS ≤150kb gz,盘面 SVG 服务端直出即 LCP**;其余不变(验收三层 next dev loop + Lighthouse CI + Speed Insights;字体子集化+swap)。
- [T13 测试与引擎正确性策略](tickets/T13-testing-and-correctness.md):29 条黄金对照 + 属性测试(边界/闰月/晚子时,不变量校验);Vitest + Playwright + Testing Library;E2E 五条关键流;覆盖率引擎/解读 ≥90%、全站 ≥80%,CI 门禁。
- [T14 Landing 首屏与文案结构](tickets/T14-landing-copy-and-structure.md):slogan「星有轨迹,盘有出处 / Every star placed. Every word sourced.」;首屏左叙事右表单(canvas 星空非 three);下探五段式含"不是什么"诚实边界;hero 双语基准样张已定稿在票内。
- [T16 解读条目 DoD 与双语样张](tickets/T16-interpretation-entry-dod-and-samples.md):字段=主体(庙旺/落陷分档)+四化钩 4 句+内链+source;语气红线 lint 进 CI;两条金样(紫微·财帛宫 / 天机·迁移宫)已定稿在票内,为 168 条生产基准。
- [T17 缓存/ISR 与运行时策略](tickets/T17-caching-and-runtime-matrix.md):路由×缓存矩阵锁定(landing/词条/method 静态;/chart SSR + `'use cache'` 全参数路由缓存,部署即失效;168 组合页随内容分批静态);**全站 node runtime**(edge YAGNI);构建 ≤10min。
- [T07 命盘 3D 构图原型](tickets/T07-3d-chart-composition-prototype.md):~~环形十二宫 3D 定案~~ **已失效(2026-11-01 转向:3D 全部移除)**;其"环形十二宫"布局结论由 T22 的 2D SVG 盘面继承,原型文件已删除(git 历史可查)。
- [T09 设计系统 tokens 与字体选型](tickets/T09-design-tokens-and-typography.md):tokens.css 定为执行基底(oklch 全套+shadcn 映射);**dark 单主题,亮色不做**;鎏金唯一高亮源、朱砂四化专属;Noto Serif SC(OFL)+ Spectral(OFL)主候选;3px 圆角、缓出动效禁弹跳;3D 材质与 UI tokens 同源。
- [T12 2D 降级、无障碍与分享卡片](tickets/T12-2d-fallback-a11y-og.md):**SVG 环形盘面 = 唯一盘面形态(2026-11-01 由"降级"升格为主界面)**;OG = @vercel/og 按参数动态生成 1200×630 环形盘+标语;键盘沿宫环遍历、鎏金焦点环;hreflang+JSON-LD+sitemap 全套。

- [T18 移动端 3D 交互与画质策略](tickets/T18-mobile-3d-adaptation.md):~~移动端 2D 内嵌 + 全屏 3D 模式~~ **已失效(2026-11-01 转向:无 3D)**;移动端 = 桌面同一套 2D SVG,响应式布局沿用其竖屏实测结论。
- [T22 2D 环形盘面视觉规格](tickets/T22-2d-chart-visual-spec.md)(转向后新票):**2D SVG 环形盘面定为产品主界面与视觉基准** —— 环形十二宫(命宫居底)、宫名环外水平正立、青铜扇区+鎏金呼吸星曜+朱砂四化菱标、72 刻度、盘芯刻字;hover/点击联动面板、键盘沿宫环遍历、reduced-motion 关动效;>900px 双栏/窄屏堆叠;零依赖双击可看,原型已隔离浏览器验证。
- [T19 紫微数据集深度盘点](tickets/T19-dataset-inventory-research.md)(research,产出 dataset-inventory.md):**自生成不可行**(13 维文本依赖闭源断语库);161MB/77 卷需一次预处理;推荐"存储按年+服务按 key 偏移索引"(~19MB 索引,单查 84KB);**关键修正**:v3=518,400 条每盘一 JSON(无 CSV/Parquet)、famous 实为 **11 人**(非 3,770)、"天盘/地势/人盘"标签无证据、v4 覆盖冻结 **1950–2026**、famous 含 2 处倪师提法待删。
- [T20 数据集服务化架构](tickets/T20-data-serving-architecture.md):**R2 + key 偏移索引 + Route Handler 代理**(离线预处理一次上 R2,零流量费;R2 属对象存储,"无数据库"红线就此破例记录);缓存并入 T17 参数级 `'use cache'`;窗口外回退 T08 知识库+显著明示;**zh 全量、en 精简**(en=T08 体系);CC BY 4.0 署名双落(method 页+区块尾注);数据集原文不逐条改写、不做人口统计暗示。
- [T21 数据驱动的产品功能](tickets/T21-data-driven-features.md):13 维 = **导语+手风琴+盘面宫位联动**(重点 4 维默认展开);**「同盘之日」**(引擎自枚举 1950–2026 结构相同日期,v3 交叉校验,口径="结构相同"禁人口暗示);**「名人命盘馆」**(11 人,删倪师提法,同盘高亮卡片);统计聚合不进 v1;**v1 全量一次成型**(排盘+盘面+13 维+同盘+名人馆+百科+landing)。
- [T23 v4.0 数据集下载与入库执行](tickets/T23-dataset-ingest-execution.md)(2026-11-02 用户指令"100% 使用数据源"):**674,976 盘全量入库**,77 年卷 SHA256 全过,924 月度 gzip 分片(22GB 本地),键 `YYYY-MM-DD-{h}-{male|female}` 实核修正;adapter 双模式(本地/R2 同格式);`ms` 与本地引擎交叉验证一致。
- [T24 解读层 100% 数据源驱动](tickets/T24-reading-layer-100pct-dataset.md):**zh 十三维正文 100% 数据集**(每维 1200–4200 字全文,标签「数据集 v4.0」);自产段落退出 zh 主链路;窗外 = 引擎-only + 明示;en 保留双语知识库;实测冷读 1.25s/缓存 135ms。T08 知识库就此**仅服务 en 站**。

## 🏁 地图完成 · 第二次(2026-11-01,转向后)

22/22 票关闭(T06/T07/T18 盖 Superseded 章),雾区清空,**新终点达成:纯 2D + 数据集驱动的 build-ready 规格**。

执行阶段出发点(按依赖序):脚手架(Next 16.4.3 + shadcn 4.23 + next-intl 4.14.9)→ 引擎移植(T02 路线 C,29 黄金用例先行)→ 数据管道(T20:下载 77 卷→预处理→R2+索引)→ tokens 并入 + 2D 盘面组件(T22 基准)→ 13 维解读层(T21 形态,T08 兜底)→ 同盘之日(引擎枚举)→ 名人馆(删倪师)→ 百科 26/168 → landing(T14)→ 测试(T13)+ Lighthouse CI(T11 修订版)。

## Not yet specified

(空 —— 第二次清空)

## Out of scope

- **3D / three.js / R3F(2026-11-01 转向划出,永不回归本 effort;原型与依赖已从仓库删除,git 历史可查)**
- 用户账号 + 保存命盘(2026-11-01 澄清:URL 分享替代)
- AI 动态解读(上游 AI prompts 不开源;数据集解读为确定性预生成,非 AI)
- 支付/商业化(v1 免费工具站)
- 古籍阅读器(独立子产品,v1.1 再评)
- 八字/塔罗等多术数模块(平台化不属于本 effort)
- 移动原生 App

(注:原"v4 数据集切片接入"曾划出,2026-11-01 转向后回到范围,并于 2026-11-02 由用户指令升级为**强制 100% 使用**(T23/T24)—— 自产 zh 解读替代随之作废,仅 en 站保留知识库。)
