# T28 · 部署手册(Deploy Runbook)

> 状态:基础设施脚本已就绪(R2 上传器 + Lighthouse CI);**等两个人工动作**后即可上线。

## 一、Cloudflare R2(需本人操作:绑卡)

1. 登录 [dash.cloudflare.com](https://dash.cloudflare.com)(talhuang1231@gmail.com,密码在浏览器密码管理器)
2. 左侧 **R2 Object Storage** → 「Add R2 subscription」→ 绑卡(22GB ≈ **$0.33/月**,出口流量免费)
3. **Create bucket**:`armilla-dataset`(location: auto)
4. **Manage API Tokens** → Create API Token → 权限 **Object Read & Write** → 仅限该桶 → 记下:
   - Access Key ID / Secret Access Key / 账号 ID(右上角)
5. 桶 Settings → **Public access** 开启(或绑自定义域名)

## 二、上传 22GB 数据集(自动化,约 1-3 小时)

```bash
# .env.local 或系统环境变量(不入库):
export R2_ACCOUNT_ID=xxx
export R2_ACCESS_KEY_ID=xxx
export R2_SECRET_ACCESS_KEY=xxx

npm run upload:r2          # 全量 924 片,断点续传,重跑自动跳过已完成
npm run upload:r2 -- 1950  # 只传 1950-* 分片(测试)
```

上传完成后验证一片:`https://<桶公共域名>/monthly/1990-06.jsonl.gz` 应返回 gzip 文件。

## 三、Vercel(需本人操作:Pro 订阅 + 域名)

1. [vercel.com](https://vercel.com) 用 GitHub 登录 → Import `skeleton1231/armilla`
2. 升级 **Pro**(商用合规,T25 决议)
3. 绑定域名(如 `armilla.app`,DNS 指向 Vercel)
4. 环境变量(Production):
   | 变量 | 值 |
   |---|---|
   | `SITE_URL` | `https://你的域名` |
   | `DATASET_BASE_URL` | `https://<桶公共域名>` |
   | `NEXT_PUBLIC_SUPABASE_URL` | 见 `.env`(本地已配) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 见 `.env` |
   | `PAYMENT_SECRET` | 见 `.env` |

## 四、上线后(Supabase + GCP 收尾)

- Supabase Auth → URL Configuration:Site URL 填正式域名,Redirect URLs 加 `https://域名/auth/callback`
- GCP OAuth(项目 Gemini API)→ 客户端 `armilla` → **追加**正式域名的回调地址
- GCP Audience → 上线时决定 Publish app(Testing 模式仅测试用户可登录;影响同项目 tarotab/galaxgame)
- GSC 提交 sitemap(`https://域名/sitemap.xml`)

## 五、CI(已就绪,自动生效)

`.github/workflows/lighthouse.yml`:push/PR → build → Lighthouse 断言(JS ≤150kb gz / LCP ≤2.5s / CLS ≤0.1 / TBT ≤300ms),**error 级失败即红**,防止性能回归(T11 门禁)。

## 本地等价命令

```bash
npm run build && npx @lhci/cli@0.14.x autorun --config=lighthouserc.json
```
