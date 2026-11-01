/** 分片工作进程:枚举年份区间 → 写临时 JSON(由 build-same-structure.ts 以子进程调度) */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { generateChart } from '../src/lib/ziwei/algorithm';
import { structureKey } from '../src/lib/engine/structure';

const args = process.argv.slice(2);
const from = Number(args[0]);
const to = Number(args[1]);
const outFile = args[2];

const index: Record<string, string[]> = {};

for (let year = from; year <= to; year++) {
  for (let month = 1; month <= 12; month++) {
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    for (let day = 1; day <= daysInMonth; day++) {
      for (let hour = 0; hour < 12; hour++) {
        try {
          const chart = generateChart({ year, month, day, hour, gender: 'male' });
          const key = structureKey(chart);
          (index[key] ??= []).push(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}#${hour}`);
        } catch {
          /* 理论上不存在的无效组合,跳过 */
        }
      }
    }
  }
  console.log(`  [${from}-${to}] year ${year} done`);
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(index));
console.log(`  [${from}-${to}] chunk written -> ${outFile}`);
