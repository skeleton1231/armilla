---
id: T28
title: 部署上线(Vercel Pro + R2 + 域名 + 监控门禁)
labels: [wayfinder:task]
blocked-by: []
claimed-by:
status: open
---

## Question

(2026-11-02 盘点补票)全站至今只在本机跑,部署整链未执行:

1. 域名确定与购买;Vercel 项目(Pro,商用合规)+ GitHub 连仓库;
2. env:SITE_URL、PAYMENT_SECRET(≥16 字符随机)、DATASET_BASE_URL(接 R2 后);
3. **22GB 数据分片上传 R2**(上传脚本待写;rclone/aws-cli 均可,桶公共读;无凭据前可用 VPS+local 模式替代);
4. Speed Insights(RUM,T11 三层验收第三层);
5. **Lighthouse CI 硬门禁**(GitHub Actions workflow:build+Lighthouse 断言 CWV+bundle 预算,T11 决议从未落地);
6. 上线冒烟(全路由+排盘+数据集命中)+ GSC/sitemap 提交入口;
7. 字体子集运维项写入 README(新增中文文案重跑 subset 脚本)。

依赖:用户给域名意向 + Cloudflare/Vercel 凭据。
