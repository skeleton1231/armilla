import { NextResponse } from 'next/server';
import {
  isValidLunarDate,
  leapMonthOfLunarYear,
  lunarToSolar,
} from '@/lib/ziwei/lunar-solar';

/**
 * 农历→公历换算(T10:农历输入在服务端换算,保持客户端轻量)
 * GET /api/lunar?ly=1990&lm=5&ld=15&leap=0
 */
export function GET(request: Request): NextResponse {
  const sp = new URL(request.url).searchParams;
  const ly = Number(sp.get('ly'));
  const lm = Number(sp.get('lm'));
  const ld = Number(sp.get('ld'));
  const leap = sp.get('leap') === '1';

  if (!Number.isInteger(ly) || !Number.isInteger(lm) || !Number.isInteger(ld)) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
  if (!isValidLunarDate(ly, lm, ld, leap)) {
    return NextResponse.json({ valid: false });
  }
  const solar = lunarToSolar(ly, lm, ld, leap);
  if (!solar) return NextResponse.json({ valid: false });

  return NextResponse.json({
    valid: true,
    y: solar.year,
    m: solar.month,
    d: solar.day,
    leapMonthOfYear: leapMonthOfLunarYear(ly),
  });
}
