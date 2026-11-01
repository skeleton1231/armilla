import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * T26:买断解锁 token(HMAC-SHA256,免数据库)。
 * payload = 该盘的 canonical 参数;签名密钥 = PAYMENT_SECRET。
 * token 绑定单张盘(购买粒度 = 单张报告),永久有效,可跨设备重绑(输入购买码)。
 */

export interface UnlockPayload {
  y: number;
  m: number;
  d: number;
  h: number;
  g: 'm' | 'f';
  iat: number; // 签发时间(Stripe session 完成时刻)
}

const b64url = (buf: Buffer | string): string =>
  Buffer.from(buf).toString('base64url');

function secret(): string {
  const s = process.env.PAYMENT_SECRET;
  if (!s || s.length < 16) {
    throw new Error('PAYMENT_SECRET not configured (>=16 chars required)');
  }
  return s;
}

function sign(data: string): string {
  return createHmac('sha256', secret()).update(data).digest('base64url');
}

export function issueToken(p: UnlockPayload): string {
  const body = b64url(JSON.stringify(p));
  return `${body}.${sign(body)}`;
}

export function verifyToken(token: string | undefined | null): UnlockPayload | null {
  if (!token) return null;
  const dot = token.indexOf('.');
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = sign(body);
  try {
    const a = Buffer.from(mac);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as UnlockPayload;
    if (
      !Number.isInteger(payload.y) || !Number.isInteger(payload.m) || !Number.isInteger(payload.d) ||
      !Number.isInteger(payload.h) || (payload.g !== 'm' && payload.g !== 'f') ||
      !Number.isInteger(payload.iat) || payload.iat < 1600000000
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/** token 是否匹配指定盘参数 */
export function tokenMatches(token: string | undefined | null, chart: { y: number; m: number; d: number; h: number; g: 'm' | 'f' }): boolean {
  const p = verifyToken(token);
  return p !== null && p.y === chart.y && p.m === chart.m && p.d === chart.d &&
    p.h === chart.h && p.g === chart.g;
}
