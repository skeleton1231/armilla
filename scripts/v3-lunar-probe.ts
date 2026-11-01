/**
 * T29-③ 探针:验证「v3 birthInfo = 农历日期」假设。
 * 读 D:/tmp/v3probe.json(24 条 v3 样本)→ lunarToSolar 换算 → 引擎排盘 →
 * structureKey 查自建索引(日期级)。命中率高 ⇒ 假设成立,交叉校验口径应按农历换算。
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { gunzipSync } from 'node:zlib';
import { lunarToSolar } from '../src/lib/ziwei/lunar-solar';
import { generateChart } from '../src/lib/ziwei/algorithm';
import { structureKey } from '../src/lib/engine/structure';

interface ProbeRec {
  ly: number; lm: number; ld: number; h: number; g: 'male' | 'female';
}

// 自包含取样:从 v3 zip 第一个年分片抽 24 条(跨时辰/性别)
const probePath = 'D:/tmp/v3probe.json';
try {
  JSON.parse(readFileSync(probePath, 'utf8'));
} catch {
  const pyPath = 'D:/tmp/v3probe-take.py';
  writeFileSync(pyPath, `import gzip, json, zipfile
z = zipfile.ZipFile('D:/tmp/ziwei-dataset/ziwei-samples-v3.zip')
shard = sorted(i.filename for i in z.infolist() if i.filename.endswith('.jsonl.gz') and 'year-1975' in i.filename)[0]
lines = gzip.decompress(z.read(shard)).decode('utf-8').splitlines()
recs = []
for line in lines[:24]:
    bi = json.loads(line)['birthInfo']
    recs.append({'ly': bi['year'], 'lm': bi['month'], 'ld': bi['day'], 'h': bi['hour'], 'g': bi['gender']})
import os; os.makedirs('D:/tmp', exist_ok=True)
open('D:/tmp/v3probe.json','w').write(json.dumps(recs))
print('probe:', len(recs))
`);
  console.log(execSync(`python ${pyPath}`).toString().trim());
}
const recs = JSON.parse(readFileSync(probePath, 'utf8')) as ProbeRec[];
const ours: Record<string, string[]> = JSON.parse(
  readFileSync('data/same-structure.json', 'utf8'),
).index as Record<string, string[]>;

let hit = 0;
let miss = 0;
const misses: string[] = [];
for (const r of recs) {
  const solar = lunarToSolar(r.ly, r.lm, r.ld, false);
  if (!solar) {
    miss++;
    misses.push(`lunar invalid ${r.ly}-${r.lm}-${r.ld}`);
    continue;
  }
  try {
    const chart = generateChart({ year: solar.year, month: solar.month, day: solar.day, hour: r.h, gender: r.g });
    const k = structureKey(chart);
    const dateStr = `${solar.year}-${String(solar.month).padStart(2, '0')}-${String(solar.day).padStart(2, '0')}#`;
    const found = (ours[k] ?? []).some((e) => e.startsWith(dateStr));
    found ? hit++ : miss++;
    if (!found) misses.push(`${r.ly}-${r.lm}-${r.ld} -> ${dateStr} not in index`);
  } catch (err) {
    miss++;
    misses.push(`cast fail: ${(err as Error).message.slice(0, 60)}`);
  }
}
console.log(`lunar-conversion match: ${hit}/${hit + miss}`);
if (misses.length > 0) console.log(misses.slice(0, 5).join('\n'));
