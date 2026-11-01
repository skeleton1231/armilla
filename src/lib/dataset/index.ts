import 'server-only';
import { gunzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DATASET_WINDOW } from '@/lib/engine';

/** T19/T23:上游 v4.0 键规则 `YYYY-MM-DD-{时辰序号}-{male|female}` */
export type DimKey =
  | 'overview' | 'personality' | 'love' | 'career' | 'wealth' | 'health'
  | 'family' | 'children' | 'move' | 'friends' | 'home' | 'spirit' | 'parents';

export interface DatasetReading {
  key: string;
  /** 命宫第一主星(空宫 null) */
  mingStar: string | null;
  dims: Partial<Record<DimKey, string>>;
}

export type DatasetStatus = 'dataset' | 'outside' | 'unconfigured' | 'miss';

export interface DatasetFetchResult {
  reading: DatasetReading | null;
  status: DatasetStatus;
}

const MALE = new Set(['m', 'male', '男']);
const pad = (n: number): string => String(n).padStart(2, '0');

/** 上游键(注意:性别全拼 male/female) */
export function datasetKey(p: { y: number; m: number; d: number; h: number; g: 'm' | 'f' }): string {
  return `${p.y}-${pad(p.m)}-${pad(p.d)}-${p.h}-${MALE.has(p.g) ? 'male' : 'female'}`;
}

export function insideDatasetWindow(year: number): boolean {
  return year >= DATASET_WINDOW.start && year <= DATASET_WINDOW.end;
}

interface VolumeLine {
  k: string;
  ms: string | null;
  c: Partial<Record<DimKey, string>>;
}

function parseLine(text: string, key: string): DatasetReading | null {
  // 定位:行首 {"k":"<key>" …(上游字段序:k 在首)
  const start = text.indexOf(`"k":"${key}"`);
  if (start < 0) return null;
  const lineStart = text.lastIndexOf('\n', start) + 1;
  const lineEnd = text.indexOf('\n', start);
  const line = text.slice(lineStart, lineEnd > 0 ? lineEnd : undefined);
  try {
    const rec = JSON.parse(line) as VolumeLine;
    if (rec.k !== key || !rec.c) return null;
    const dims: Partial<Record<DimKey, string>> = {};
    for (const [k, v] of Object.entries(rec.c)) {
      if (typeof v === 'string' && v.trim().length > 0) dims[k as DimKey] = v;
    }
    return { key, mingStar: rec.ms ?? null, dims };
  } catch {
    return null;
  }
}

/**
 * T24:zh 十三维的唯一正文来源。
 * 双模式同一文件格式(data/dataset/monthly/YYYY-MM.jsonl.gz):
 *  - DATASET_BASE_URL 配置时:fetch 远端分片(R2/CDN)
 *  - 未配置:本地 fs 读取(ingest 产物随部署分发)
 * 单月分片解压 ~65MB,由页面层 'use cache' 包住 → 每盘只冷读一次。
 */
export async function fetchDatasetReading(
  p: { y: number; m: number; d: number; h: number; g: 'm' | 'f' },
): Promise<DatasetFetchResult> {
  if (!insideDatasetWindow(p.y)) return { reading: null, status: 'outside' };

  const shard = `monthly/${p.y}-${pad(p.m)}.jsonl.gz`;
  const key = datasetKey(p);
  let gz: Buffer;

  const base = process.env.DATASET_BASE_URL;
  try {
    if (base) {
      const res = await fetch(`${base.replace(/\/$/, '')}/${shard}`, { headers: { accept: 'application/gzip' } });
      if (!res.ok) return { reading: null, status: 'miss' };
      gz = Buffer.from(await res.arrayBuffer());
    } else {
      gz = readFileSync(resolve(process.cwd(), 'data/dataset', shard));
    }
  } catch {
    return { reading: null, status: base ? 'miss' : 'unconfigured' };
  }

  try {
    const text = gunzipSync(gz).toString('utf-8');
    const reading = parseLine(text, key);
    return reading ? { reading, status: 'dataset' } : { reading: null, status: 'miss' };
  } catch {
    return { reading: null, status: 'miss' };
  }
}
