import { describe, expect, it } from 'vitest';
import { encodeChartParams, parseChartParams } from '../params';

describe('chart URL params(T05:可读 query,canonical 公历)', () => {
  it('roundtrip:encode → parse 还原', () => {
    const p = { y: 1990, m: 6, d: 15, h: 7, g: 'm' as const, city: '北京', u: 1 };
    const q = encodeChartParams(p);
    expect(parseChartParams({ y: '1990', m: '6', d: '15', h: '7', g: 'm', city: '北京', u: '1' })).toEqual(p);
    expect(q).toBe('y=1990&m=6&d=15&h=7&g=m&city=%E5%8C%97%E4%BA%AC&u=1');
  });

  it('拒绝不存在的日期(2月30日)', () => {
    expect(parseChartParams({ y: '1990', m: '2', d: '30', h: '6', g: 'm' })).toBeNull();
  });

  it('拒绝越界时辰/性别', () => {
    expect(parseChartParams({ y: '1990', m: '6', d: '15', h: '12', g: 'm' })).toBeNull();
    expect(parseChartParams({ y: '1990', m: '6', d: '15', h: '6', g: 'x' })).toBeNull();
  });

  it('city 与 u 可缺省', () => {
    expect(parseChartParams({ y: '1990', m: '6', d: '15', h: '6', g: 'f' })).toEqual({
      y: 1990, m: 6, d: 15, h: 6, g: 'f',
    });
  });
});
