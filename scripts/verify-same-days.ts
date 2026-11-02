/** 验证同盘之日年份分布的正确性(特别是跨年干支的 1961/1991/2021) */
import { readFileSync } from 'node:fs';
import { structureKey } from '../src/lib/engine/structure';
import { generateChart } from '../src/lib/ziwei/algorithm';

const ours: Record<string, string[]> = JSON.parse(readFileSync('data/same-structure.json', 'utf8')).index;
const key = structureKey(generateChart({ year: 1990, month: 6, day: 15, hour: 6, gender: 'male' }));
const all = ours[key] ?? [];

const byYear: Record<number, string[]> = {};
for (const e of all) {
  const y = Number(e.slice(0, 4));
  (byYear[y] ??= []).push(e);
}

console.log('=== 年份分布 ===');
for (const y of Object.keys(byYear).map(Number).sort((a, b) => a - b)) {
  console.log(`${y} x${byYear[y].length}`);
}

console.log(`\n=== 1961 具体日期(验证是否在立春前=庚年)=====`);
for (const e of byYear[1961] ?? []) console.log(e);

console.log('\n=== 1991 具体日期 ===');
for (const e of byYear[1991] ?? []) console.log(e);

console.log('\n=== 2021 具体日期 ===');
for (const e of byYear[2021] ?? []) console.log(e);

// 验证跨年日期的年干与结构键匹配
const crossYear = [...(byYear[1961] ?? []), ...(byYear[1991] ?? []), ...(byYear[2021] ?? [])];
console.log('\n=== 跨年条目年干验证 ===');
for (const e of crossYear.slice(0, 6)) {
  const [y, m, d] = e.split('#')[0].split('-').map(Number);
  const h = Number(e.split('#')[1]);
  const chart = generateChart({ year: y, month: m, day: d, hour: h, gender: 'male' });
  const match = structureKey(chart) === key;
  const yearPillar = chart.lunarInfo.fourPillars?.[0] ?? 'N/A';
  console.log(`${e} 年柱=${yearPillar} 匹配=${match}`);
}

// 对照:1990(庚年)条目的年干
console.log('\n=== 1990 条目年干(应全为庚)===');
for (const e of (byYear[1990] ?? []).slice(0, 3)) {
  const [y, m, d] = e.split('#')[0].split('-').map(Number);
  const h = Number(e.split('#')[1]);
  const chart = generateChart({ year: y, month: m, day: d, hour: h, gender: 'male' });
  console.log(`${e} 年柱=${chart.lunarInfo.fourPillars?.[0] ?? 'N/A'} 匹配=${structureKey(chart) === key}`);
}
