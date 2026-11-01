import 'server-only';
import { generateChart } from '@/lib/ziwei/algorithm';
import type { BirthInfo, ZiweiChart } from '@/lib/ziwei/types';

export type { BirthInfo, ZiweiChart, Palace, Star, SiHua } from '@/lib/ziwei/types';

/** 数据集覆盖窗口(T19:冻结 1950–2026) */
export const DATASET_WINDOW = { start: 1950, end: 2026 } as const;

export function castChart(input: BirthInfo): ZiweiChart {
  return generateChart(input);
}
