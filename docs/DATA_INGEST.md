# 数据集接入手册(T20 决议的执行版)

上游 [Renhuai123/ziwei-doushu](https://github.com/Renhuai123/ziwei-doushu) 的 v4.0 十三维解读数据集(674,976 盘 × 13 维,CC BY 4.0)是 zh 站解读的主数据源。**断语库闭源、不可自生成**(见 `wayfinder/research/dataset-inventory.md`),只能下载预处理。

## 流水线(一次性的离线准备)

1. **下载**:从上游 Releases 获取 v4.0 zstd 分卷(161MB / 77 个年份卷)。
2. **预处理**(按年切片 → 每 key 一个 JSON):

   ```bash
   # 伪代码:scripts/ingest-dataset.ts(TODO:按下载后的实际分卷格式补齐解析器)
   npx tsx scripts/ingest-dataset.ts --src <下载目录> --out dist-dataset/
   ```

   产物:`dist-dataset/YYYY-MM-DD-hH-g.json`(每文件即该 key 的 13 维文本,h=时辰序号,g=m/f)。
3. **上传**:整目录上传 Cloudflare R2 桶(公开读或经 Worker 签名)。
4. **配置**:`DATASET_BASE_URL=https://<bucket>.r2.dev`(或自定义域)→ 完成。

## 运行时行为(已实现,无需改动)

- 命盘页按 `datasetKey(y,m,d,h,g)` 取 `${DATASET_BASE_URL}/${key}.json`;
- 命中的维度文本**前插**到知识库解读之前(标签"专属条目");
- 未配置 / 1950–2026 窗口外 / 404 → 自动回退本地知识库,页面明示(见 `src/lib/dataset/index.ts`);
- 整页 `'use cache'` 参数级缓存,数据查询被吃进缓存,部署即失效。

## 许可义务

- CC BY 4.0:method 页完整声明 + 每个数据集解读区块尾注「解读文本改编自 Renhuai123/ziwei-doushu 数据集,CC BY 4.0」(两处均已实现)。
- v3.0(518,400 条)仅作交叉校验用,不直接展示;famous 11 人已入站并删除 2 处 NC 提法。

## en 站口径(T20)

数据集为中文。en 站解读 = 本地双语知识库(168 条体系,金样见 `src/content/interpretations/combos.ts`),13 维数据集文本不译,en 页明示覆盖差异。
