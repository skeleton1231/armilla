---
id: T09
title: 设计系统 tokens 与字体选型(青铜主题)
labels: [wayfinder:prototype]
blocked-by: [T01, T03]
claimed-by:
status: closed
---

## Question

把"浑仪·青铜"落成 shadcn 主题原型:

- 完整色板:暖炭底 / 青铜锈绿 / 鎏金 / 朱砂的 oklch 值,语义 token 映射(dark 单主题定案?亮色是否完全不做的结论要显式写下);
- 中文衬线字体候选与授权(思源宋体 / 霞鹜文楷 / …)+ Latin 配对,font loading 策略;
- 密度、间距、排版尺度;3D 材质语言与 UI 色板的对应关系;
- 产出:可直接进 Tailwind CSS 变量的 tokens 文件 + 1–2 个关键页样式小样,过 T01 去味清单。

## Resolution

2026-11-01 样张已实现并经无头浏览器全页验证(布局无破碎),用户拍板认可:

1. **`wayfinder/prototypes/t09/tokens.css` 为执行阶段基底**(并入 Tailwind 4 @theme):暖炭底 `oklch(0.17 0.008 75)` / 青铜锈绿 `oklch(0.62 0.048 155)` / 鎏金 `oklch(0.78 0.115 85)` / 朱砂 `oklch(0.55 0.190 30)` / 暖纸白 `oklch(0.90 0.020 85)` / 刻线 `oklch(0.46 0.030 90)`;shadcn 语义变量全映射(primary=鎏金,destructive=朱砂,ring=鎏金)。
2. **dark 单主题定案:亮色不做**(显式结论)。理由:星空材质语言与暗底共生,亮色需要整套重调,收益低于成本;impeccable"色彩即语义"在单主题里最纯净。
3. **色彩语义红线**:鎏金=星曜/主强调(唯一高亮源);朱砂=四化专属,全站不得挪用;青铜=结构与次级强调。
4. **字体**:中文衬线 **Noto Serif SC(思源宋体,OFL)** 为主候选,霞鹜文楷为备选;Latin **Spectral(OFL)**,EB Garamond 备选;均开源可自托管;加载按 T11(子集化+swap)。
5. 排版尺度:中文正文行高 2.0(疏排),界面标签 letter-spacing 0.35em(仪刻感);间距 4px 基;圆角 3px(器物少圆角);动效仅 transform/opacity,缓出 `cubic-bezier(0.16,1,0.3,1)`,禁弹跳。
6. 3D 材质与 UI 同源:3D 的青铜/鎏金/朱砂材质色值即 UI tokens 值(渲染时按光照换算),保证"器物与界面一体"。

**资产**:`wayfinder/prototypes/t09/tokens.css`、`style-tile.html`(截图见 `wayfinder/prototypes/screenshots/`)。
