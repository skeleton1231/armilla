# 原型资产(wayfinder 票)

**这些是决策用粗样,不是产品代码;执行阶段在 `src/` 全新实现,本目录永不合并进产品。**

## 2026-11-01 转向:3D 已全部移除

用户决策"清除所有 3D,改纯 2D 平面":原 T07 的三个 3D 构图原型、three.js 本地库、3D 冒烟截图已从仓库删除(git 历史保留全部过程,票 T07/T06/T18 已盖 Superseded 章)。2D 盘面视觉规格由 **T22** 以纯 SVG 原型重新建立。

## T09 · 设计系统样张(仍然有效)

- `t09/tokens.css` —— 全套 oklch tokens(含 shadcn 语义映射、排版尺度、间距、动效、圆角阴影);dark 单主题定案
- `t09/style-tile.html` —— 样张页:色板 / 排版尺度 / 控件 / 卡片与朱砂语义 / 分隔仪式感(截图见 `screenshots/t09-style-tile.png`)

字体候选均为开源可自托管:Noto Serif SC(OFL)、霞鹜文楷(OFL)、Spectral(OFL)、EB Garamond(OFL)。

2D 盘面(T22)将直接复用本目录 tokens:青铜锈绿环体、鎏金星曜点、朱砂四化标记、刻线金边 —— 只是呈现层从 WebGL 回到 SVG/CSS。
