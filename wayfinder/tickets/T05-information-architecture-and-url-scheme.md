---
id: T05
title: 信息架构与命盘 URL 编码
labels: [wayfinder:grilling]
blocked-by: []
claimed-by:
status: closed
---

## Question

全站路由树(zh/en 双树):landing、排盘输入(首页直排 vs 独立输入页)、命盘页、星曜/宫位百科页的层级与命名。出生数据(公历/农历、日期、时辰、性别、出生城市)如何序列化进 URL 实现无数据库分享:参数格式(可读 query vs 紧凑编码)、校验规则、隐私考量(生日进 URL 是否可接受、是否提供短码 —— 注意无数据库约束)。与用户对齐并锁定路由清单。

## Resolution

2026-11-01 与用户拍板:

1. **五区极简路由**(zh/en 同构;`/` 按 Accept-Language 重定向到 `/zh` 或 `/en`):

   | 路由 | 页面 | 形态 |
   |---|---|---|
   | `/[locale]` | 首页 = 排盘入口(首屏即表单,T01 结论) | server |
   | `/[locale]/chart` | 命盘页(3D island + 解读) | server + 最小 client |
   | `/[locale]/stars/[slug]` | 星曜百科(14 主星) | 静态 |
   | `/[locale]/palaces/[slug]` | 宫位百科(12 宫) | 静态 |
   | `/[locale]/method` | 方法与出处(算法出处、开源署名、隐私说明) | 静态 |

   落选:wiki 前缀层级(多一层无增益)、独立输入页(违背"首屏即入口")。
2. **命盘 URL = 可读 query**:`/zh/chart?y=1990&m=6&d=15&h=7&g=m&city=4401` —— y/m/d 为公历 canonical 日期、h 时辰序号、g 性别(m/f)、city 为上游城市表 id;农历输入在客户端换算为公历 canonical 后入 URL;参数集与 locale 无关,切语言命盘不丢;无效/越界参数重定向回首页表单并提示。生日进 URL = 分享型工具的既定取舍。
3. **百科 v1 = 26 词条**(14 星 + 12 宫,双语共 52 静态页,generateStaticParams);星×宫 168 组合页**不进 v1**,是否做、做多少由 T08 内容覆盖决策后再定(已挂到 T08)。
4. **最近命盘**:localStorage 存最近 ≤5 张盘参数,首页"最近星盘"一键重看;纯客户端,无云同步(不属于账号体系,未越范围红线)。
