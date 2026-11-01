import type { ZiweiChart } from './index';

/**
 * 盘面结构键(T21「同盘之日」口径):
 * 十二宫的宫名排布 + 每宫星曜集合(含生年四化) + 五行局 + 命主身主。
 * 不含大限顺逆(随性别)与时运信息 —— “结构相同”即两张盘的静态骨架完全一致。
 */
export function structureKey(chart: ZiweiChart): string {
  const parts: string[] = [
    `ju${chart.wuxingJu}`,
    `ming${chart.mingGongBranch}`,
    `ziwei${chart.ziweiPos}`,
    chart.mingZhu ?? '-',
    chart.shenZhu ?? '-',
    ...chart.palaces
      .slice()
      .sort((a, b) => a.branch - b.branch)
      .map((p) => {
        const stars = p.stars
          .map((s) => (s.siHua ? `${s.name}${s.siHua}` : s.name))
          .sort()
          .join('.');
        return `${p.branch}:${stars}`;
      }),
  ];
  return parts.join('|');
}

/** 结构键 → 相同结构的出生时刻,由 scripts/build-same-structure.ts 离线生成 */
export interface SameStructureIndex {
  meta: { windowStart: number; windowEnd: number; generatedAt: string };
  index: Record<string, string[]>; // key → ['1990-06-15#7', ...](日期#时辰序号)
}
