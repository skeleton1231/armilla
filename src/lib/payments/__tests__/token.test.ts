import { describe, expect, it } from 'vitest';
import { tokenMatches, verifyToken } from '../token';

/**
 * 支付解锁 token 单元(T26/T29-②,安全关键)。
 * PAYMENT_SECRET 由测试进程注入。
 */
process.env.PAYMENT_SECRET = 'test-secret-0123456789abcdef';

describe('payments token', () => {
  it('roundtrip:签发 → 验证还原 payload', async () => {
    const { issueToken } = await import('../token');
    const t = issueToken({ y: 1990, m: 6, d: 15, h: 6, g: 'm', iat: 1700000000 });
    const p = verifyToken(t);
    expect(p).toEqual({ y: 1990, m: 6, d: 15, h: 6, g: 'm', iat: 1700000000 });
  });

  it('伪造签名被拒(改一字节)', async () => {
    const { issueToken } = await import('../token');
    const t = issueToken({ y: 1990, m: 6, d: 15, h: 6, g: 'm', iat: 1700000000 });
    const forged = t.slice(0, -2) + (t.endsWith('aa') ? 'bb' : 'aa');
    expect(verifyToken(forged)).toBeNull();
  });

  it('篡改 payload(改生日)被拒', async () => {
    const { issueToken } = await import('../token');
    const t = issueToken({ y: 1990, m: 6, d: 15, h: 6, g: 'm', iat: 1700000000 });
    const [body, mac] = t.split('.');
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    payload.y = 2000; // 改年
    const evilBody = Buffer.from(JSON.stringify(payload)).toString('base64url');
    expect(verifyToken(`${evilBody}.${mac}`)).toBeNull();
  });

  it('tokenMatches 只解锁对应盘(跨盘无效)', async () => {
    const { issueToken } = await import('../token');
    const t = issueToken({ y: 1990, m: 6, d: 15, h: 6, g: 'm', iat: 1700000000 });
    expect(tokenMatches(t, { y: 1990, m: 6, d: 15, h: 6, g: 'm' })).toBe(true);
    expect(tokenMatches(t, { y: 1990, m: 6, d: 15, h: 7, g: 'm' })).toBe(false);
    expect(tokenMatches(t, { y: 1990, m: 6, d: 15, h: 6, g: 'f' })).toBe(false);
  });

  it('畸形输入与缺失密钥', async () => {
    expect(verifyToken('')).toBeNull();
    expect(verifyToken('abc')).toBeNull();
    expect(verifyToken('a.b')).toBeNull();
    expect(tokenMatches(undefined, { y: 1990, m: 6, d: 15, h: 6, g: 'm' })).toBe(false);
  });
});
