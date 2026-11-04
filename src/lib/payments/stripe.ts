import 'server-only';
import Stripe from 'stripe';

/**
 * T26:Stripe 封装。验证策略 = 服务端实时 retrieve checkout session
 * (payment_status=paid 即有效)—— 无 webhook、无数据库。
 * 未配置 STRIPE_SECRET_KEY 时购买入口禁用(isStripeConfigured=false)。
 */

export const REPORT_PRICE_USD = 9.99;

let client: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  client ??= new Stripe(key);
  return client;
}

export async function createReportSession(opts: {
  chartQuery: string; // y=..&m=..&d=..&h=..&g=..
  locale: string;
  origin: string;
  token: string; // 预签发(token 在创建 session 时签发;仅当 session 付清后,前端才凭 session_id 兑换)
  sessionId: string;
}): Promise<{ url: string | null }> {
  const s = stripe();
  const zh = opts.locale === 'zh';
  const name = zh
    ? `紫微斗数完整报告(${opts.chartQuery.split('&').slice(0, 3).join(' ').replace(/[a-z]=/g, '')})`
    : `Full Zi Wei Dou Shu Report (${opts.chartQuery})`;

  const session = await s.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      process.env.STRIPE_PRICE_ID
        ? { price: process.env.STRIPE_PRICE_ID, quantity: 1 }
        : {
            quantity: 1,
            price_data: {
              currency: 'usd',
              unit_amount: Math.round(REPORT_PRICE_USD * 100),
              product_data: { name },
            },
          },
    ],
    success_url: `${opts.origin}/${opts.locale}/chart?${opts.chartQuery}&sid={CHECKOUT_SESSION_ID}`,
    cancel_url: `${opts.origin}/${opts.locale}/chart?${opts.chartQuery}`,
    metadata: { chart: opts.chartQuery, token: opts.token, sid: opts.sessionId },
  });
  return { url: session.url };
}

/** 兑换:session 付清 → 返回 metadata 里预签发的 token */
export async function redeemSession(
  sessionId: string,
): Promise<{ paid: boolean; token: string | null }> {
  const s = stripe();
  const session = await s.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== 'paid') return { paid: false, token: null };
  const token = session.metadata?.token ?? null;
  return { paid: true, token };
}
