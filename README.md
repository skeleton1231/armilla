# 璇玑 / Armilla · 紫微斗数排盘

> 星有轨迹,盘有出处 / Every star placed. Every word sourced.

纯 2D 紫微斗数排盘与解读站:输入生辰 → 服务端引擎排盘 → 环形盘面 + 十三维确定性解读 + 同盘之日 + 名人盘。无账号、无数据库、URL 即分享。

- **规格与决策**:见 [`wayfinder/MAP.md`](wayfinder/MAP.md)(22 张票的完整决策账本,执行前必读)
- **数据集接入**:见 [`docs/DATA_INGEST.md`](docs/DATA_INGEST.md)

## 技术栈(全部按官方文档实核,见 `wayfinder/research/stack-facts.md`)

| 层 | 选型 |
|---|---|
| 框架 | Next.js 16.4.3(App Router / Turbopack / Cache Components) |
| UI | shadcn 模式 tokens(Tailwind v4,oklch,浑仪青铜 dark 单主题) |
| i18n | next-intl 4.14.9(`/zh` `/en` 子路径,proxy.ts) |
| 排盘引擎 | iztro 2.6.1 + lunar-javascript 1.7.7 + vendored 校准层(`src/lib/ziwei`,MIT,29 黄金用例回归) |
| 解读 | 十三维组装层 + 双语知识库种子;数据集接入后自动升级(见 DATA_INGEST) |

## 开发

```bash
npm install
npm run dev        # 开发(Next 16 默认 Turbopack)
npm test           # 引擎黄金对照 + 不变量 + URL 参数(vitest)
npm run build      # 生产构建
npx tsx scripts/build-same-structure.ts   # 重建「同盘之日」索引(全窗口约几分钟)
```

### 环境变量

| 变量 | 作用 |
|---|---|
| `SITE_URL` | sitemap/robots 的站点根 URL |
| `DATASET_BASE_URL` | 十三维数据集切片的 R2/CDN 根(未配置时自动走知识库兜底并明示) |

## 目录导览

```
src/
├── app/[locale]/        # 页面:landing / chart / stars / palaces / famous / method
├── app/api/lunar/       # 农历→公历换算(服务端,客户端不加载历法库)
├── lib/ziwei/           # 上游移植引擎(MIT;已清除 NC 内容)
├── lib/engine/          # 引擎封装 / URL 参数 / 结构键 / 同盘索引
├── lib/interpret/       # 十三维解读组装(分层查表+段落模板)
├── lib/dataset/         # 数据集适配(R2 + key,未配置自动兜底)
├── content/             # 双语词条(14 主星 / 12 宫 / 组合金样 / 四化钩 / 名人 11)
└── components/          # ChartBoard(环形盘面)/ BirthForm / ui
data/same-structure.json # 同盘之日索引(离线枚举产物)
```

## 红线(维护者必读)

1. **不作祸福断言**;文案语气循钦天监基准(见 `wayfinder/tickets/T16` 金样)
2. **倪师(CC BY-NC-SA)内容禁入**;数据集内容需 CC BY 4.0 署名(method 页 + 区块尾注)
3. **全站零 3D / 零 three.js**(2026-11-01 转向决议)
4. 性能:全站 JS ≤150kb gz;Lighthouse CI 门禁对齐 `wayfinder/tickets/T11`
