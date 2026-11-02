---
id: T30
title: Google 登录 + 用户体系(Supabase)
labels: [wayfinder:grilling]
blocked-by: []
claimed-by: claude-main
status: open
---

## Question

(2026-11-02 用户指令)加入 Google 登录和用户体系。

## 方案(已确认)

- **技术栈**:Supabase(Auth + Postgres + @supabase/ssr)
- **登录定位**:**可选增强** — 排盘/免费解读/分享/购买全不登录可用;登录增加保存命盘 + 跨设备购买记录
- **数据表**:`charts`(保存的命盘)+ `purchases`(Stripe 购买记录);RLS 行级隔离
- **对 T05/T26 的修订**:无数据库红线解除(Supabase 只存用户增强数据,命盘数据仍在 URL);购买验证优先查库,token 为回退(未登录购买场景)

## 待用户提供

- Supabase 项目 URL + Anon Key(创建项目后 Dashboard → Settings → API)
- Google OAuth Client ID/Secret(Google Cloud Console → Credentials → OAuth)
