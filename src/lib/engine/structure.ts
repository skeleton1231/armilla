import type { ZiweiChart } from './index';

/**
 * 盘面结构键(T21「同盘之日」口径):
 * 十二宫的**主星布局 + 主星生年四化** + 命宫/身宫地支 —— 即传统“基本盘”语义。
 * 不含辅曜杂曜(随日辰近连续变化,会让结构近乎独一无二)、
 * 不含五行局/大限(时运信息)、不含性别相关项。
 * 该口径下 1950–2026 窗口约数千至万级结构,平均每种 ~20 个时刻。
 */
export function structureKey(chart: ZiweiChart): string {
  const parts: string[] = [
    `ming${chart.mingGongBranch}`,
    `shen${chart.shenGongBranch}`,
    ...chart.palaces
      .slice()
      .sort((a, b) => a.branch - b.branch)
      .map((p) => {
        const majors = p.stars
          .filter((s) => s.type === 'major')
          .map((s) => (s.siHua ? `${s.name}${s.siHua}` : s.name))
          .sort()
          .join('.');
        return `${p.branch}:${majors}`;
      }),
  ];
  return parts.join('|');
}

/** 结构键 → 相同结构的出生时刻,由 scripts/build-same-structure.ts 离线生成 */
export interface SameStructureIndex {
  meta: { windowStart: number; windowEnd: number; generatedAt: string };
  index: Record<string, string[]>; // key → ['1990-06-15#7', ...](日期#时辰序号)
}
