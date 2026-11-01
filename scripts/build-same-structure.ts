/**
 * 离线枚举「同盘之日」索引(T21)—— 子进程分片并行版。
 * 产出 data/same-structure.json(运行时 fs 读取,随部署分发)。
 * 运行:npx tsx scripts/build-same-structure.ts [--from 1950] [--to 2026]
 */
import { writeFileSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { spawn } from 'node:child_process';
import { cpus } from 'node:os';
import type { SameStructureIndex } from '../src/lib/engine/structure';

const args = process.argv.slice(2);
const argOf = (name: string): number | undefined => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? Number(args[i + 1]) : undefined;
};

const FROM = argOf('from') ?? 1950;
const TO = argOf('to') ?? 2026;
const WORKERS = Math.max(2, Math.min(cpus().length - 1, 12));
const t0 = Date.now();

const years: number[] = [];
for (let y = FROM; y <= TO; y++) years.push(y);
const per = Math.ceil(years.length / WORKERS);
const chunks: { from: number; to: number; out: string }[] = [];
let n = 0;
for (let i = 0; i < years.length; i += per) {
  const from = years[i];
  const to = years[Math.min(i + per, years.length) - 1];
  chunks.push({ from, to, out: resolve(process.cwd(), `data/.tmp-chunk-${n++}.json`) });
}

console.log(`[same-structure] ${years.length} years across ${chunks.length} child processes`);

function runChunk(chunk: { from: number; to: number; out: string }): Promise<void> {
  return new Promise((res, rej) => {
    const child = spawn(
      process.execPath,
      ['--import', 'tsx', 'scripts/same-structure-worker.ts', String(chunk.from), String(chunk.to), chunk.out],
      { stdio: ['ignore', 'ignore', 'inherit'] },
    );
    child.on('close', (code) => (code === 0 ? res() : rej(new Error(`chunk ${chunk.from}-${chunk.to} exit ${code}`))));
    child.on('error', rej);
  });
}

async function main(): Promise<void> {
  mkdirSync(resolve(process.cwd(), 'data'), { recursive: true });
  await Promise.all(chunks.map(runChunk));

  const merged: Record<string, string[]> = {};
  for (const chunk of chunks) {
    const part = JSON.parse(readFileSync(chunk.out, 'utf8')) as Record<string, string[]>;
    for (const [k, v] of Object.entries(part)) (merged[k] ??= []).push(...v);
    rmSync(chunk.out);
  }
  for (const v of Object.values(merged)) v.sort();

  const entries = Object.values(merged).reduce((a, b) => a + b.length, 0);
  const out: SameStructureIndex = {
    meta: { windowStart: FROM, windowEnd: TO, generatedAt: new Date().toISOString() },
    index: merged,
  };
  const file = resolve(process.cwd(), 'data/same-structure.json');
  writeFileSync(file, JSON.stringify(out));
  console.log(
    `[same-structure] DONE: ${entries} casts, ${Object.keys(merged).length} structures, ` +
      `${((Date.now() - t0) / 1000).toFixed(0)}s -> ${file}`,
  );
}

void main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
