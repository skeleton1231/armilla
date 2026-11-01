import { describe, expect, it } from 'vitest';
import { canonPalaceName, BRANCH_ZH, BRANCH_PINYIN } from '@/lib/interpret/canon';
import { insideDatasetWindow, datasetKey } from '@/lib/dataset';
import { structureKey } from '../structure';
import { generateChart } from '@/lib/ziwei/algorithm';

describe('canonPalaceName(宫名归一)', () => {
  it('引擎裸名补"宫";仆役/事业归一', () => {
    expect(canonPalaceName('命宫')).toBe('命宫');
    expect(canonPalaceName('父母')).toBe('父母宫');
    expect(canonPalaceName('仆役')).toBe('交友宫');
    expect(canonPalaceName('事业')).toBe('官禄宫');
    expect(canonPalaceName('财帛')).toBe('财帛宫');
  });

  it('地支表:12 项且与索引对齐', () => {
    expect(BRANCH_ZH).toHaveLength(12);
    expect(BRANCH_PINYIN).toHaveLength(12);
    expect(BRANCH_ZH[6]).toBe('午');
    expect(BRANCH_PINYIN[6]).toBe('Wu');
  });
});

describe('dataset key/window(T23 上游口径)', () => {
  it('key = YYYY-MM-DD-{h}-{male|female}', () => {
    expect(datasetKey({ y: 1990, m: 6, d: 15, h: 0, g: 'm' })).toBe('1990-06-15-0-male');
    expect(datasetKey({ y: 2026, m: 12, d: 31, h: 11, g: 'f' })).toBe('2026-12-31-11-female');
  });

  it('窗口 1950–2026 闭区间', () => {
    expect(insideDatasetWindow(1950)).toBe(true);
    expect(insideDatasetWindow(2026)).toBe(true);
    expect(insideDatasetWindow(1949)).toBe(false);
    expect(insideDatasetWindow(2027)).toBe(false);
  });
});

describe('structureKey(同盘之日口径)', () => {
  it('性别不影响结构键(大限顺逆不入键)', () => {
    const m = structureKey(generateChart({ year: 1990, month: 6, day: 15, hour: 6, gender: 'male' }));
    const f = structureKey(generateChart({ year: 1990, month: 6, day: 15, hour: 6, gender: 'female' }));
    expect(m).toBe(f);
  });

  it('时辰变化改变结构键', () => {
    const a = structureKey(generateChart({ year: 1990, month: 6, day: 15, hour: 6, gender: 'male' }));
    const b = structureKey(generateChart({ year: 1990, month: 6, day: 15, hour: 7, gender: 'male' }));
    expect(a).not.toBe(b);
  });
});
