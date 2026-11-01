---
id: T16
title: 解读条目验收标准(DoD)与双语样张
labels: [wayfinder:grilling]
blocked-by: [T08]
claimed-by:
status: closed
---

## Question

自雾区毕业(T08 已定架构)。为 P0 条目(14 主星 × 12 宫,168 条)定义"完成即合格":

- 字段完备清单(基础释义、庙旺利陷分档、四化修饰钩子、内链到星曜/宫位词条、来源标注);
- 长度区间与语气红线(钦天监式庄重、禁祸福断言,过 T01 清单);
- zh/en 对齐标准(术语统一、非逐字直译);
- 产出 2 条定稿样张(如「紫微·财帛宫」「天机·迁移宫」,zh+en),作为执行阶段的金样。

## Resolution

2026-11-01 与用户拍板:

1. **DoD 字段**:id(star×palace)、zh/en 主体(80–150 字 / 60–120 词,**分庙旺/落陷两档**)、四化钩子 4 句(每句 ≤25 字)、内链(星/宫/关键组合)、source 标注(改写自上游 MIT 知识 / 传统星情 / 古籍典故)。
2. **语气红线**:禁祸福断言、禁绝对时间断言、禁"能量/频率"类黑话、须有可核对出处或"依传统星情"标注。
3. **en 对齐**:术语表统一、意译不逐字、长度对等 ±20%。
4. **红线 lint 进 CI**(关键词黑名单)+ schema 校验 + 内链存在检查 + 双语齐全检查,不绿不合并;抽样人审为最后层。
5. **两条金样(执行阶段基准,照此质量生产)**:

   **金样一 · 紫微 · 财帛宫**
   zh 主体:紫微入财帛,财随位至:进财多与职务、名望、事业规模相连,取财有道而格局大。庙旺时财库稳固、善守善用;落陷或煞会,则名大于利,排场开销随行。
   zh 四化钩:禄:进财顺遂,财源与声望相济/权:财权一把抓,宜制度化理财/科:以名生财,收入与专业声誉挂钩/忌:为体面所累,防大宗消费撑场面。
   en 主体:Zi Wei in the Wealth Palace: income arrives with standing. Earnings follow office, enterprise, and reputation rather than opportunistic gain. Well-placed, the coffers hold and money is managed with authority; poorly placed, name outruns profit and spending rises to keep up appearances.

   **金样二 · 天机 · 迁移宫**
   zh 主体:天机入迁移,动中取势:外出、异地、变动之局利于发展,心思机敏、见机而作。庙旺则他乡逢贵、越动越有;落陷则奔波漂泊,谋而后动可减反复。
   zh 四化钩:禄:外出得利,异乡机遇多/权:在外掌局,主动求变/科:旅途平顺,贵人在外/忌:奔波徒劳,行前多算。
   en 主体:Tian Ji in the Travel Palace: fortune favours movement. Relocation and change of scene tend to open the way; success comes from reading the moment. Well-placed, help appears away from home and each move builds on the last; poorly placed, drift and detours — plan before leaping.
