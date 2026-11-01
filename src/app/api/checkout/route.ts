import { NextResponse } from 'next/server';
import { issueToken } from '@/lib/payments/token';
import { createReportSession, isStripeConfigured } from '@/lib/payments/stripe';
import { parseChartParams } from '@/lib/engine/params';

/**
 * T26:发起购买。POST { q: "y=..&m=..&d=..&h=..&g=..", locale }
 * → { url }(Stripe Checkout)。token 预签并写入 session.metadata,
 * 仅当 session 付清(redeem)后才会返回给前端。
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'payments_not_configured' }, { status: 503 });
  }
  let body: { q?: string; locale?: string };
  try {
    body = (await request.json()) as { q?: string; locale?: string };
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const locale = body.locale === 'zh' ? 'zh' : 'en';

  const query = new URLSearchParams(body.q ?? '');
  const params = parseChartParams(Object.fromEntries(query.entries()));
  if (!params) {
    return NextResponse.json({ error: 'invalid_chart' }, { status: 400 });
  }

  const token = issueToken({ ...params, iat: Math.floor(Date.now() / 1000) });
  const origin = new URL(request.url).origin;
  const chartQuery = query.toString();

  try {
    const { url } = await createReportSession({
      chartQuery,
      locale,
      origin,
      token,
      sessionId: `s_${Date.now()}`,
    });
    if (!url) return NextResponse.json({ error: 'stripe_no_url' }, { status: 502 });
    return NextResponse.json({ url });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: 'stripe_error', message: err instanceof Error ? err.message : 'unknown' },
      { status: 502 },
    );
  }
}
