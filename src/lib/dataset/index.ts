import 'server-only';
import { DATASET_WINDOW } from '@/lib/engine';

/** T19:v4 key 规则 YYYY-MM-DD-hH-g(h=时辰序号,g=m/f) */
export type DimKey =
  | 'overview' | 'personality' | 'love' | 'career' | 'wealth' | 'health'
  | 'family' | 'children' | 'move' | 'friends' | 'home' | 'spirit' | 'parents';

export interface DatasetReading {
  key: string;
  dims: Partial<Record<DimKey, string>>;
}

export interface DatasetFetchResult {
  reading: DatasetReading | null;
  /** dataset = 数据集原文;outside = 覆盖窗口外;unconfigured = 未配置数据源 */
  status: 'dataset' | 'outside' | 'unconfigured' | 'miss';
}

export function datasetKey(p: { y: number; m: number; d: number; h: number; g: 'm' | 'f' }): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${p.y}-${pad(p.m)}-${pad(p.d)}-h${p.h}-${p.g}`;
}

export function insideDatasetWindow(year: number): boolean {
  return year >= DATASET_WINDOW.start && year <= DATASET_WINDOW.end;
}

/**
 * T20 决议:R2 + key 偏移索引,经服务端代理查询。
 * DATASET_BASE_URL 未配置时返回 unconfigured —— 页面走 T08 知识库兜底并明示。
 */
export async function fetchDatasetReading(
  p: { y: number; m: number; d: number; h: number; g: 'm' | 'f' },
): Promise<DatasetFetchResult> {
  const base = process.env.DATASET_BASE_URL;
  if (!base) return { reading: null, status: 'unconfigured' };
  if (!insideDatasetWindow(p.y)) return { reading: null, status: 'outside' };

  const key = datasetKey(p);
  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/${key}.json`, {
      headers: { accept: 'application/json' },
    });
    if (res.status === 404) return { reading: null, status: 'miss' };
    if (!res.ok) return { reading: null, status: 'miss' };
    const json = (await res.json()) as Partial<Record<DimKey, string>>;
    const dims: Partial<Record<DimKey, string>> = {};
    for (const [k, v] of Object.entries(json)) {
      if (typeof v === 'string' && v.length > 0) dims[k as DimKey] = v;
    }
    return { reading: { key, dims }, status: 'dataset' };
  } catch {
    return { reading: null, status: 'miss' };
  }
}
