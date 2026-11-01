---
id: T22
title: 2D 环形盘面视觉规格(原型)
labels: [wayfinder:prototype]
blocked-by: []
claimed-by:
status: closed
---

## Question

3D 移除后,2D SVG 环形盘面升格为产品主界面,需要一份视觉规格原型(纯 SVG/HTML/CSS,零 three.js):

- 继承 T07 的环形十二宫布局结论与 T09 tokens(青铜锈绿环体、鎏金星曜、朱砂四化、刻度细节);
- 星曜表现:2D 下的"鎏金"语言(实心点 + 呼吸光晕 CSS 动画,reduced-motion 关闭);
- 交互:hover 宫位高亮、点击宫位 → 解读区联动锚滚、键盘 Tab 沿宫环遍历(承 T12);
- 响应式:桌面双栏(盘面 + 解读侧栏)/ 移动端上下堆叠 + 底部抽屉;
- 动效节奏:入场描线(stroke-dashoffset)、宫位依次点亮,全部 CSS/SVG 实现;
- 产出:单文件 HTML 原型(手造样例数据)+ 无头浏览器验证截图,过 T01 去味清单;执行阶段照此实现服务端 SVG 组件。

## Resolution

2026-11-01 原型已实现(**纯 SVG/HTML/CSS 零依赖,双击即看**),经隔离浏览器验证(零控制台错误;AI 视觉复核 7 项全过:扇区/宫名正立/星曜发光/四化标记/盘芯/面板/刻度,无重叠错位)。用户拍板**认可为执行阶段 2D 盘面视觉基准**:

1. **布局**:环形十二宫(继承 T07 环形结论),命宫居正下方顺时针排布;**宫名+地支置于环外、水平正立**(3D 时代的倒字问题在 2D 根治)。
2. **视觉**(全部承 T09 tokens):青铜扇区双色渐变交替做旧;鎏金星曜主星 7px/辅曜 4.2px + drop-shadow 呼吸微光;朱砂四化 = 菱标 + 单字标;72 细刻度(每 30° 主刻度金色);双圈金边;盘芯十字线 +「璇玑 / ARMILLA / 生辰」刻字。
3. **交互**:hover 高亮(patinaHi 渐变);点击宫位 → 右侧面板联动(窄屏 scrollIntoView);**键盘 Tab 沿宫环遍历 + Enter/Space 选择 + focus-visible 金环**;每宫 aria-label 完整(承 T12 无障碍决议)。
4. **动效**:入场宫区依次点亮(stagger 0.06s,0.6s 缓出)+ 星曜呼吸;`prefers-reduced-motion` 全关。
5. **响应式**:>900px 双栏(盘面 + 解读面板),≤900px 单列堆叠。
6. **执行阶段实现口径**:盘面为 server component 直出的 SVG(同一数据驱动),交互层最小 client 脚本(选择/hover 状态);不再有任何 WebGL 依赖。

**资产**:`wayfinder/prototypes/t22/2d-ring.html`、`screenshots/t22-2d-ring-desktop.png`。
