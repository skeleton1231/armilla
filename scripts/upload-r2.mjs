#!/usr/bin/env node
/**
 * T28 · R2 数据集分片上传器(零依赖,Node >=18,原生 fetch)
 *
 * 用途:把 data/dataset/monthly/*.jsonl.gz(924 片,~22GB)上传到 Cloudflare R2,
 *      与 src/lib/dataset 的远端模式对接(DATASET_BASE_URL 指到桶的公共域名)。
 *
 * 前置(等账号绑卡启用 R2 后):
 *   1. R2 → Overview → Create bucket(建议名 armilla-dataset,location auto)
 *   2. R2 → Manage API Tokens → Create API Token → Object Read & Write
 *      → 指定桶 → 生成 Access Key ID / Secret Access Key
 *   3. Settings → Public access(或绑定自定义域名,作为 DATASET_BASE_URL)
 *
 * 环境变量:
 *   R2_ACCOUNT_ID       Cloudflare 账号 ID(仪表盘右侧栏)
 *   R2_ACCESS_KEY_ID    API Token 的 Access Key ID
 *   R2_SECRET_ACCESS_KEY API Token 的 Secret
 *   R2_BUCKET           桶名(默认 armilla-dataset)
 *   UPLOAD_CONCURRENCY  并发数(默认 4)
 *
 * 用法:
 *   node scripts/upload-r2.mjs            # 全量(断点续传:同尺寸分片自动跳过)
 *   node scripts/upload-r2.mjs 1950-01    # 只传匹配前缀的分片(测试用)
 */

import { createHash, createHmac } from "node:crypto";
import { readFile, stat, readdir } from "node:fs/promises";
import { join, basename } from "node:path";

const DATA_DIR = join(process.cwd(), "data", "dataset", "monthly");
const ACCOUNT = process.env.R2_ACCOUNT_ID;
const KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET || "armilla-dataset";
const CONCURRENCY = Number(process.env.UPLOAD_CONCURRENCY || 4);
const HOST = `${ACCOUNT}.r2.cloudflarestorage.com`;

if (!ACCOUNT || !KEY_ID || !SECRET) {
  console.error("缺 R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY(见文件头说明)");
  process.exit(1);
}

/* ---------- AWS SigV4(服务 s3,区域 auto) ---------- */
const enc = (s) => new TextEncoder().encode(s);
const sha256Hex = (buf) => createHash("sha256").update(buf).digest("hex");
const hmac = (key, data) => createHmac("sha256", key).update(data).digest();

function amzDate() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return {
    long: `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`,
    short: `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}`,
  };
}

async function putObject(key, body) {
  const { long, short } = amzDate();
  const payloadHash = sha256Hex(body);
  const canonicalURI = `/${BUCKET}/${key}`.replaceAll(":","%3A"); // key 无特殊字符,保险处理
  const headers = {
    host: HOST,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": long,
    "content-type": "application/gzip",
    "content-length": String(body.length),
    "cache-control": "public, max-age=31536000, immutable",
  };
  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map((h) => `${h}:${headers[h]}\n`)
    .join("");
  const canonicalRequest = [
    "PUT", canonicalURI, "", canonicalHeaders, signedHeaders, payloadHash,
  ].join("\n");
  const scope = `${short}/auto/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256", long, scope, sha256Hex(enc(canonicalRequest)),
  ].join("\n");
  const signingKey = hmac(hmac(hmac(hmac(enc(`AWS4${SECRET}`), short), "auto"), "s3"), "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  headers.authorization =
    `AWS4-HMAC-SHA256 Credential=${KEY_ID}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(`https://${HOST}${canonicalURI}`, {
    method: "PUT",
    headers,
    body,
  });
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
}

/* ---------- 断点续传:HEAD 同 key 同尺寸则跳过 ---------- */
async function remoteSize(key) {
  const { long, short } = amzDate();
  const canonicalURI = `/${BUCKET}/${key}`;
  const headers = { host: HOST, "x-amz-content-sha256": "UNSIGNED-PAYLOAD", "x-amz-date": long };
  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.keys(headers).sort().map((h) => `${h}:${headers[h]}\n`).join("");
  const canonicalRequest = ["HEAD", canonicalURI, "", canonicalHeaders, signedHeaders, "UNSIGNED-PAYLOAD"].join("\n");
  const scope = `${short}/auto/s3/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", long, scope, sha256Hex(enc(canonicalRequest))].join("\n");
  const signingKey = hmac(hmac(hmac(hmac(enc(`AWS4${SECRET}`), short), "auto"), "s3"), "aws4_request");
  headers.authorization =
    `AWS4-HMAC-SHA256 Credential=${KEY_ID}/${scope}, SignedHeaders=${signedHeaders}, Signature=${createHmac("sha256", signingKey).update(stringToSign).digest("hex")}`;
  const res = await fetch(`https://${HOST}${canonicalURI}`, { method: "HEAD", headers });
  const len = res.headers.get("content-length");
  return res.status === 200 && len ? Number(len) : -1;
}

/* ---------- 主流程 ---------- */
const prefix = process.argv[2] || "";
const files = (await readdir(DATA_DIR))
  .filter((f) => f.endsWith(".jsonl.gz") && f.startsWith(prefix))
  .sort();

let done = 0, skipped = 0, failed = 0;
const t0 = Date.now();

async function worker(queue) {
  for (;;) {
    const f = queue.shift();
    if (!f) return;
    const key = `monthly/${f}`;
    const local = await stat(join(DATA_DIR, f));
    try {
      const remote = await remoteSize(key);
      if (remote === local.size) { skipped++; continue; }
      const body = await readFile(join(DATA_DIR, f));
      let ok = false;
      for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
        try { await putObject(key, body); ok = true; }
        catch (e) { if (attempt === 3) throw e; await new Promise((r) => setTimeout(r, 2000 * attempt)); }
      }
      done++;
      const pct = ((done + skipped) / files.length * 100).toFixed(1);
      process.stdout.write(`\r[${pct}%] ✓ ${f} (${(local.size / 1048576).toFixed(1)}MB)`);
    } catch (e) {
      failed++;
      console.error(`\n✗ ${f}: ${e.message}`);
    }
  }
}

console.log(`上传 ${files.length} 个分片 → ${BUCKET}(并发 ${CONCURRENCY},断点续传开)`);
const queue = [...files];
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));
const mins = ((Date.now() - t0) / 60000).toFixed(1);
console.log(`\n完成:${done} 新传 / ${skipped} 跳过 / ${failed} 失败,耗时 ${mins} 分钟`);
if (failed > 0) { console.log("重跑同一命令即可续传(已完成分片自动跳过)"); process.exit(2); }
