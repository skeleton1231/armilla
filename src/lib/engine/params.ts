import { z } from 'zod';
import { CITY_LONGITUDE } from './cities';

/**
 * 命盘 URL 参数(T05 决议:可读 query;公历 canonical;跨语言共用)
 * /zh/chart?y=1990&m=6&d=15&h=7&g=m&city=北京
 *  - y/m/d 公历 canonical 日期
 *  - h 时辰序号 0-11(0=子 … 11=亥)
 *  - g 性别 m/f
 *  - city 城市名(可选,按上游城市表查经度做真太阳时;缺省 = 北京时区口径)
 */
export const chartParamsSchema = z.object({
  y: z.coerce.number().int().min(1900).max(2100),
  m: z.coerce.number().int().min(1).max(12),
  d: z.coerce.number().int().min(1).max(31),
  h: z.coerce.number().int().min(0).max(11),
  g: z.enum(['m', 'f']),
  city: z.string().trim().min(1).max(24).optional(),
  /** u=1 时辰未知(午时试排,页面显著标注) */
  u: z.coerce.number().int().min(1).max(1).optional(),
});

export type ChartParams = z.infer<typeof chartParamsSchema>;

export interface ChartQuery {
  y?: string | string[];
  m?: string | string[];
  d?: string | string[];
  h?: string | string[];
  g?: string | string[];
  city?: string | string[];
  u?: string | string[];
}

/** 城市名 → 经度(真太阳时修正);来自上游移植城市表 */
export function cityLongitude(cityName: string | undefined): number | undefined {
  if (!cityName) return undefined;
  return CITY_LONGITUDE.get(cityName);
}

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/** 解析并校验;无效返回 null(调用方重定向回首页表单并提示) */
export function parseChartParams(query: ChartQuery): ChartParams | null {
  const parsed = chartParamsSchema.safeParse({
    y: first(query.y),
    m: first(query.m),
    d: first(query.d),
    h: first(query.h),
    g: first(query.g),
    city: first(query.city),
    u: first(query.u),
  });
  if (!parsed.success) return null;
  // 日期真实性(2月30日等)
  const probe = new Date(Date.UTC(parsed.data.y, parsed.data.m - 1, parsed.data.d));
  if (
    probe.getUTCFullYear() !== parsed.data.y ||
    probe.getUTCMonth() !== parsed.data.m - 1 ||
    probe.getUTCDate() !== parsed.data.d
  ) {
    return null;
  }
  return parsed.data;
}

/** canonical query 字符串(键序固定,保证同盘同 URL) */
export function encodeChartParams(p: ChartParams): string {
  const sp = new URLSearchParams();
  sp.set('y', String(p.y));
  sp.set('m', String(p.m));
  sp.set('d', String(p.d));
  sp.set('h', String(p.h));
  sp.set('g', p.g);
  if (p.city !== undefined) sp.set('city', String(p.city));
  if (p.u !== undefined) sp.set('u', String(p.u));
  return sp.toString();
}
