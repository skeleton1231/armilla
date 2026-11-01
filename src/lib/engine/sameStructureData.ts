import 'server-only';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { SameStructureIndex } from './structure';

/**
 * 同盘之日索引(离线产物 data/same-structure.json,scripts/build-same-structure.ts 生成)。
 * 文件缺失时返回 null —— 该功能隐藏而非报错(部署可先于数据)。
 */
let cached: SameStructureIndex | null | undefined;

export function loadSameStructure(): SameStructureIndex | null {
  if (cached !== undefined) return cached;
  try {
    cached = JSON.parse(
      readFileSync(resolve(process.cwd(), 'data/same-structure.json'), 'utf8'),
    ) as SameStructureIndex;
  } catch {
    cached = null;
  }
  return cached;
}
