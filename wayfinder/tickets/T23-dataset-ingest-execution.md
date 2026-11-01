---
id: T23
title: v4.0 数据集下载与入库执行
labels: [wayfinder:task]
blocked-by: []
claimed-by:
status: closed
---

## Question

(2026-11-02 用户指令:"必须 100% 使用这个数据源,不能自产代替")执行 v4.0-13d 数据集接入:

1. 从 GitHub Releases `v4.0-13d` 下载全量包(`ziwei-interp-v4-all.tar`,161MB,zstd --long=27);
2. 解包 77 个年卷 `year-YYYY.jsonl.zst`,流式逐行解析(JSON Lines:`k/y/m/d/h/g/ms/t/c`);
3. 切分为**按月 gzip 分片** `data/dataset/monthly/YYYY-MM.jsonl.gz`(约 924 片):node 内置 zlib 可直接运行时解压,单月 ~65MB 解压流冷读 <0.5s,磁盘总量 ~1GB 可控;
4. key 规范:上游 `YYYY-MM-DD-{h}-{male|female}`;adapter 的 `datasetKey` 同步修正(现 `-h{h}-m` 有误);
5. 中间产物(tar/年卷)处理完删除;`data/dataset/` 入 .gitignore,部署走 R2 上传同名 monthly 文件(无凭据前 local fs 模式)。

**许可口径精确化**(T02 红线的补充):数据集正文内嵌的倪师引文(注明集数/时间码)随 CC BY 4.0 数据集一起使用合规;"单独成批抽出引文"才受 NC 约束 —— 我们展示完整解读 = 合规。method 页署名按上游要求格式(来源 URL + 作者王多鱼AI)。

## Resolution

2026-11-02 执行完毕,全量入库:

- 下载 `ziwei-interp-v4-all.tar`(161MB,GitHub Releases,curl 断点续传);
- **77 个年卷逐一 SHA256 校验通过(零失配)**;
- 流式切分 **924 个月度 gzip 分片**(data/dataset/monthly/,22GB,gitignored),不落 56.6GB 中间态;
- **674,976 盘全量**(与官方规格分毫不差),sample key 证实上游键 `YYYY-MM-DD-{h}-{male|female}`;
- 抽样交叉验证:数据集 `ms`(命宫主星)与本地引擎排盘一致(1990-06-15-6-male → 武曲)✓;
- adapter 双模式(本地 fs / R2 URL)同一分片格式;R2 无凭据前以本地模式 100% 服务,日后上传同名分片 + 设 `DATASET_BASE_URL` 即无缝切换。
