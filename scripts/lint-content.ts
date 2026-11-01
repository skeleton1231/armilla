/**
 * 内容红线 lint(T08/T16:语气红线自动化)
 * 检查 src/content 与 messages 中的自产文案:
 *   1. 禁词:倪师(CC BY-NC-SA,NC 内容禁入站)
 *   2. 祸福断言词:必大富/必嫁/克死/短命/注定发财 …(允许描述性用法的白名单待积累)
 *   3. 黑话词:能量频率/宇宙能量/高频振动
 * 退出码非 0 = CI 阻断。运行:npx tsx scripts/lint-content.ts
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const FORBIDDEN: { pattern: RegExp; why: string }[] = [
  { pattern: /倪师|倪海厦/, why: 'NC 内容禁入站(许可红线)' },
  { pattern: /(?<!未)必[大发富贵嫁娶]|(?<!未)注定[发富]|克死|短命之|死于非命/, why: '祸福/生死断言(语气红线)' },
  { pattern: /能量频率|宇宙能量|高频振动|低频能量/, why: '玄学黑话(去味红线)' },
];

const ROOTS = ['src/content', 'messages'];
const errors: string[] = [];

function scan(dir: string): void {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      scan(full);
      continue;
    }
    if (!/\.(ts|json)$/.test(name)) continue;
    const text = readFileSync(full, 'utf8');
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      for (const rule of FORBIDDEN) {
        if (rule.pattern.test(line)) {
          errors.push(`${resolve(full)}:${i + 1} [${rule.why}] ${line.trim().slice(0, 80)}`);
        }
      }
    });
  }
}

for (const root of ROOTS) scan(resolve(process.cwd(), root));

if (errors.length > 0) {
  console.error(`[lint-content] FAIL: ${errors.length} 处红线\n` + errors.join('\n'));
  process.exit(1);
}
console.log('[lint-content] PASS: 无红线命中');
