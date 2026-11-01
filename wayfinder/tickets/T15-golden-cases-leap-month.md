---
id: T15
title: 补录闰月黄金用例(10 条)
labels: [wayfinder:task]
blocked-by: []
claimed-by:
status: open
---

## Question

T02 研究留下的事实缺口:19 个黄金用例中,「农历闰月后半月」的 10 条因上游数据结构限制留白,需用上游 demo(浅克隆于 D:\tmp\ziwei-doushu-research,或重新克隆)实际排盘补录:选定覆盖闰二月/闰四月/闰六月/闰七月等 + 后半月日期的输入,跑上游 demo 记录盘面输出(至少命宫主星、四化),追加进 wayfinder/research/engine-extraction.md 的黄金用例表并标注"已由上游 demo 复核"。注意事项:在隔离目录执行第三方代码,只跑 demo 排盘,不装无关依赖;若 demo 无法运行,记录失败原因并改由 T13 阶段人工补录。完成后本票关闭,产出供 T13 直接使用。
