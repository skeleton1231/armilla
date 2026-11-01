---
id: T26
title: Stripe 商业化(单次买断 $5.99,免数据库)
labels: [wayfinder:grilling]
blocked-by: []
claimed-by:
status: open
---

## Question

(2026-11-02 用户指令)Stripe 支付接入与付费墙。

> **⏸ 2026-11-02 用户指示:暂缓付款上线。** 实现已完成并在防御模式验证;恢复时只需 Stripe 密钥 → 测试模式端到端 → live。

## 方案(已与用户确认)

- **单张报告买断 $5.99**:Stripe Checkout(mode=payment);免费层 = 盘面 + 命格总览 + 性格 + 同盘之日;付费层 = 其余 11 维全文(zh=数据集原文,en=英文报告)
- **免数据库/免账号**:支付验证 = 服务端实时 `stripe.checkout.sessions.retrieve`(paid 即有效,无需 webhook/存储);解锁凭据 = **HMAC 签名 token**(绑定生辰参数,`?t=` 携带 + localStorage 保存);换设备重绑 = "输入购买码"接口验签
- 防伪:PAYMENT_SECRET 环境变量签名;Stripe 费率 ~3.4%+$0.30/笔(跨境)
- 法务:/terms 与退款政策页、privacy 增 Stripe 数据条款、命理免责声明已有
- env:STRIPE_SECRET_KEY / STRIPE_PRICE_ID / PAYMENT_SECRET;**未配置 key 时购买入口禁用**(显示"支付即将上线"),绝不出现免费绕过
