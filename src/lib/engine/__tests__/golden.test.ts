import { describe, expect, it } from 'vitest';
import { generateChart } from '@/lib/ziwei/algorithm';
import type { ZiweiChart } from '@/lib/ziwei/types';

/**
 * 黄金对照测试(T13;用例出处:wayfinder/research/engine-extraction.md §6)
 * 口径:引擎 495b79e + 亮度 QS + 闰月 split + 晚子时 next-day
 */

const BRANCH_INDEX: Record<string, number> = {
  子: 0, 丑: 1, 寅: 2, 卯: 3, 辰: 4, 巳: 5,
  午: 6, 未: 7, 申: 8, 酉: 9, 戌: 10, 亥: 11,
};

interface LeapCase {
  no: number;
  y: number; m: number; d: number; h: number; g: 'male' | 'female';
  mingBranch: string;
  mingStars: string[]; // 命宫主星(空宫则借星,期望不在此断言)
  sihua: { lu: [string, string]; quan: [string, string]; ke: [string, string]; ji: [string, string] }; // [星名, 落宫地支]
  ju: string;
  mingZhu: string;
  shenZhu: string;
}

/** §6.3 #20–29:闰月后半月 ×10(T15 已由上游 demo 复核) */
const LEAP_CASES: LeapCase[] = [
  { no: 20, y: 1974, m: 6, d: 10, h: 0, g: 'male',   mingBranch: '午', mingStars: [], sihua: { lu: ['廉贞', '酉'], quan: ['破军', '酉'], ke: ['武曲', '丑'], ji: ['太阳', '寅'] }, ju: '土五局', mingZhu: '破军', shenZhu: '天梁' },
  { no: 21, y: 1979, m: 8, d: 10, h: 4, g: 'female', mingBranch: '辰', mingStars: ['太阳'], sihua: { lu: ['武曲', '卯'], quan: ['贪狼', '亥'], ke: ['天梁', '寅'], ji: ['文曲', '申'] }, ju: '木三局', mingZhu: '廉贞', shenZhu: '天相' },
  { no: 22, y: 1984, m: 12, d: 14, h: 6, g: 'male',  mingBranch: '午', mingStars: ['天梁'], sihua: { lu: ['廉贞', '未'], quan: ['破军', '亥'], ke: ['武曲', '亥'], ji: ['太阳', '子'] }, ju: '土五局', mingZhu: '破军', shenZhu: '火星' },
  { no: 23, y: 1987, m: 8, d: 19, h: 8, g: 'female', mingBranch: '子', mingStars: ['紫微'], sihua: { lu: ['太阴', '巳'], quan: ['天同', '未'], ke: ['天机', '亥'], ji: ['巨门', '未'] }, ju: '木三局', mingZhu: '贪狼', shenZhu: '天同' },
  { no: 24, y: 1990, m: 7, d: 8, h: 2, g: 'male',    mingBranch: '巳', mingStars: ['紫微', '七杀'], sihua: { lu: ['太阳', '寅'], quan: ['武曲', '丑'], ke: ['太阴', '子'], ji: ['天同', '子'] }, ju: '金四局', mingZhu: '武曲', shenZhu: '火星' },
  { no: 25, y: 2001, m: 6, d: 12, h: 10, g: 'male',  mingBranch: '申', mingStars: ['七杀'], sihua: { lu: ['巨门', '巳'], quan: ['太阳', '亥'], ke: ['文曲', '寅'], ji: ['文昌', '子'] }, ju: '火六局', mingZhu: '廉贞', shenZhu: '天机' },
  { no: 26, y: 2004, m: 4, d: 8, h: 3, g: 'female',  mingBranch: '丑', mingStars: [], sihua: { lu: ['廉贞', '寅'], quan: ['破军', '辰'], ke: ['武曲', '午'], ji: ['太阳', '未'] }, ju: '水二局', mingZhu: '巨门', shenZhu: '天梁' },
  { no: 27, y: 2006, m: 9, d: 16, h: 5, g: 'male',   mingBranch: '辰', mingStars: ['太阴'], sihua: { lu: ['天同', '申'], quan: ['天机', '子'], ke: ['文昌', '巳'], ji: ['廉贞', '巳'] }, ju: '水二局', mingZhu: '廉贞', shenZhu: '文昌' },
  { no: 28, y: 2014, m: 11, d: 9, h: 7, g: 'male',   mingBranch: '辰', mingStars: ['七杀'], sihua: { lu: ['廉贞', '戌'], quan: ['破军', '申'], ke: ['武曲', '寅'], ji: ['太阳', '卯'] }, ju: '木三局', mingZhu: '廉贞', shenZhu: '火星' },
  { no: 29, y: 2020, m: 6, d: 14, h: 11, g: 'female', mingBranch: '未', mingStars: ['天机'], sihua: { lu: ['太阳', '巳'], quan: ['武曲', '辰'], ke: ['太阴', '酉'], ji: ['天同', '卯'] }, ju: '木三局', mingZhu: '武曲', shenZhu: '火星' },
];

function sihuaPalace(chart: ZiweiChart, mark: '禄' | '权' | '科' | '忌'): { star: string; branch: number } | null {
  for (const palace of chart.palaces) {
    const star = palace.stars.find((s) => s.siHua === mark);
    if (star) return { star: star.name, branch: palace.branch };
  }
  return null;
}

describe('黄金用例:闰月后半月 ×10(§6.3 #20–29)', () => {
  for (const c of LEAP_CASES) {
    it(`#${c.no} ${c.y}-${c.m}-${c.d} h${c.h} ${c.g}`, () => {
      const chart = generateChart({ year: c.y, month: c.m, day: c.d, hour: c.h, gender: c.g });
      expect(chart.mingGongBranch).toBe(BRANCH_INDEX[c.mingBranch]);
      expect(chart.wuxingJuName).toBe(c.ju);
      expect(chart.mingZhu).toBe(c.mingZhu);
      expect(chart.shenZhu).toBe(c.shenZhu);

      const ming = chart.palaces.find((p) => p.branch === chart.mingGongBranch)!;
      const mingMajors = ming.stars.filter((s) => s.type === 'major').map((s) => s.name);
      if (c.mingStars.length > 0) {
        expect(mingMajors.sort()).toEqual([...c.mingStars].sort());
      }

      for (const [mark, expectPair] of [['lu', c.sihua.lu], ['quan', c.sihua.quan], ['ke', c.sihua.ke], ['ji', c.sihua.ji]] as const) {
        const zhMark = { lu: '禄', quan: '权', ke: '科', ji: '忌' }[mark];
        const got = sihuaPalace(chart, zhMark);
        expect(got, `${c.no} 化${zhMark}`).not.toBeNull();
        expect(got!.star).toBe(expectPair[0]);
        expect(got!.branch).toBe(BRANCH_INDEX[expectPair[1]]);
      }
    });
  }
});

describe('黄金用例:现成断言(§6.1)', () => {
  it('#1 1988-10-08 未时男:命宫天机(忌)+太阴(权);父母宫贪狼(禄)+右弼(科)', () => {
    const chart = generateChart({ year: 1988, month: 10, day: 8, hour: 7, gender: 'male' });
    const ming = chart.palaces.find((p) => p.isMingGong)!;
    const sihua = new Map(ming.stars.filter((s) => s.siHua).map((s) => [s.name, s.siHua!]));
    expect(sihua.get('天机')).toBe('忌');
    expect(sihua.get('太阴')).toBe('权');

    const fumu = chart.palaces.find((p) => p.name === '父母')!;
    const fumuSihua = new Map(fumu.stars.filter((s) => s.siHua).map((s) => [s.name, s.siHua!]));
    expect(fumuSihua.get('贪狼')).toBe('禄');
    expect(fumuSihua.get('右弼')).toBe('科');
  });

  it('#7 1990-06-15 午时男:节气四柱 = 庚午 壬午 辛亥 甲午', () => {
    const chart = generateChart({ year: 1990, month: 6, day: 15, hour: 6, gender: 'male' });
    expect(chart.lunarInfo.fourPillars).toEqual(['庚午', '壬午', '辛亥', '甲午']);
  });

  it('#10 非法时辰抛 RangeError', () => {
    for (const bad of [-1, 12, 0.5]) {
      expect(() =>
        generateChart({ year: 1990, month: 6, day: 15, hour: bad as number, gender: 'male' }),
      ).toThrow(RangeError);
    }
  });

  it('#17 不存在的公历日期抛 RangeError(不得静默顺延)', () => {
    for (const [y, m, d] of [[1925, 2, 29], [1925, 2, 30], [1925, 4, 31], [1925, 13, 1]]) {
      expect(() =>
        generateChart({ year: y, month: m, day: d, hour: 6, gender: 'male' }),
      ).toThrow(RangeError);
    }
    // 合法闰年日不抛
    expect(() =>
      generateChart({ year: 1924, month: 2, day: 29, hour: 6, gender: 'male' }),
    ).not.toThrow();
  });
});

describe('盘面不变量(§6.1 #18 采样网格)', () => {
  it('768 盘采样:十二宫齐全、地支不重不漏、命宫唯一、紫府对称', () => {
    const years = [1960, 1972, 1984, 1996, 2001, 2010];
    const months = [1, 4, 7, 10];
    const days = [5, 15, 25];
    const hours = [0, 4, 8, 10];
    const genders = ['male', 'female'] as const;
    let count = 0;

    for (const y of years) {
      for (const m of months) {
        for (const d of days) {
          for (const h of hours) {
            for (const g of genders) {
              const chart = generateChart({ year: y, month: m, day: d, hour: h, gender: g });
              count++;

              expect(chart.palaces).toHaveLength(12);
              const branches = chart.palaces.map((p) => p.branch).sort((a, b) => a - b);
              expect(branches).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
              expect(chart.palaces.filter((p) => p.isMingGong)).toHaveLength(1);

              // 紫府对称:(紫微位 + 天府位) % 12 == 4
              const tianfu = chart.palaces.find((p) => p.stars.some((s) => s.name === '天府'));
              expect(tianfu, `${y}-${m}-${d} h${h} 天府缺席`).toBeDefined();
              expect((chart.ziweiPos + tianfu!.branch) % 12).toBe(4);
            }
          }
        }
      }
    }
    expect(count).toBe(years.length * months.length * days.length * hours.length * genders.length);
  });
});
