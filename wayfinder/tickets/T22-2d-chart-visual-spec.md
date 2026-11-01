---
id: T22
title: 2D 环形盘面视觉规格(原型)
labels: [wayfinder:prototype]
blocked-by: []
claimed-by: claude-main
status: open
---

## Question

3D 移除后,2D SVG 环形盘面升格为产品主界面,需要一份视觉规格原型(纯 SVG/HTML/CSS,零 three.js):

- 继承 T07 的环形十二宫布局结论与 T09 tokens(青铜锈绿环体、鎏金星曜、朱砂四化、刻度细节);
- 星曜表现:2D 下的"鎏金"语言(实心点 + 呼吸光晕 CSS 动画,reduced-motion 关闭);
- 交互:hover 宫位高亮、点击宫位 → 解读区联动锚滚、键盘 Tab 沿宫环遍历(承 T12);
- 响应式:桌面双栏(盘面 + 解读侧栏)/ 移动端上下堆叠 + 底部抽屉;
- 动效节奏:入场描线(stroke-dashoffset)、宫位依次点亮,全部 CSS/SVG 实现;
- 产出:单文件 HTML 原型(手造样例数据)+ 无头浏览器验证截图,过 T01 去味清单;执行阶段照此实现服务端 SVG 组件。
