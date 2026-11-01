/**
 * 生成 public/favicon.ico(32×32 PNG-in-ICO,浑仪环意象)
 * 纯 Node 手写,无依赖。运行:node scripts/make-favicon.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { resolve } from 'node:path';

const SIZE = 32;
const BG = [0x14, 0x11, 0x0d];      // 暖炭
const GOLD = [0xd8, 0xb4, 0x5a];    // 鎏金
const BRONZE = [0x5c, 0x6b, 0x52];  // 青铜

// 逐像素:深底 + 金外环 + 青铜赤道环 + 中心金点(1.5px 距离场抗锯齿)
const px = (x, y) => {
  const dx = x - 15.5, dy = y - 15.5;
  const d = Math.hypot(dx, dy);
  const band = (c, r, w) => {
    const a = Math.max(0, Math.min(1, w / 2 - Math.abs(d - r)));
    return [c[0], c[1], c[2], Math.round(a * 255)];
  };
  const ring = band(GOLD, 12.5, 2.2);
  const eq = band(BRONZE, 12.5, 0); // 赤道环另行计算
  const eqA = Math.max(0, Math.min(1, 0.9 - Math.abs(Math.abs(dy) - 4.2)) ) * (d < 12 ? 1 : 0);
  const core = band(GOLD, 1.8, 3.2);
  let best = ring[3] >= core[3] ? ring : core;
  if (eqA > best[3] / 255) best = [BRONZE[0], BRONZE[1], BRONZE[2], Math.round(eqA * 255)];
  return best[3] === 0 ? [...BG, 255] : best;
};

// RGBA 原始行(带 filter byte 0)
const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1));
let o = 0;
for (let y = 0; y < SIZE; y++) {
  raw[o++] = 0;
  for (let x = 0; x < SIZE; x++) {
    const [r, g, b, a] = px(x, y);
    raw[o++] = r; raw[o++] = g; raw[o++] = b; raw[o++] = a;
  }
}

const crc32 = (buf) => {
  let c, table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  c = 0 ^ -1;
  for (const byte of buf) c = (c >>> 8) ^ table[(c ^ byte) & 0xff];
  return (c ^ -1) >>> 0;
};

const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0); ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

// ICO 容器:头 6B + 目录项 16B + PNG
const ico = Buffer.alloc(22);
ico.writeUInt16LE(0, 0); ico.writeUInt16LE(1, 2); ico.writeUInt16LE(1, 4);
ico.writeUInt8(SIZE, 6); ico.writeUInt8(SIZE, 7);
ico.writeUInt16LE(0, 8); ico.writeUInt16LE(1, 10); // 32bpp? PNG 内嵌时置 0 也行,保守置 1
ico.writeUInt32BE(png.length, 14); ico.writeUInt32BE(22, 18);

const out = resolve(process.cwd(), 'public/favicon.ico');
mkdirSync(resolve(process.cwd(), 'public'), { recursive: true });
writeFileSync(out, Buffer.concat([ico, png]));
console.log(`favicon.ico written: ${out} (${png.length + 22} bytes)`);
