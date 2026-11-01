# -*- coding: utf-8 -*-
"""
v4.0-13d 数据集入库(T23):tar → 77 年卷(校验 SHA256)→ 流式按月切分 gzip。
产物:data/dataset/monthly/YYYY-MM.jsonl.gz(行=上游 JSONL 原行,键 k=YYYY-MM-DD-{h}-{male|female})
运行:python scripts/ingest-dataset.py [--src D:/tmp/ziwei-dataset] [--keep-volumes]
中间产物(年卷 zst)默认处理后删除;tar 保留由调用方决定。
"""
import gzip
import hashlib
import io
import json
import sys
import tarfile
from pathlib import Path

import zstandard

ROOT = Path(__file__).resolve().parent.parent
SRC = Path("D:/tmp/ziwei-dataset")
OUT = ROOT / "data" / "dataset" / "monthly"


def sha256_file(p: Path, chunk: int = 1 << 20) -> str:
    h = hashlib.sha256()
    with p.open("rb") as f:
        while True:
            b = f.read(chunk)
            if not b:
                break
            h.update(b)
    return h.hexdigest()


def main() -> int:
    tar_path = SRC / "ziwei-interp-v4-all.tar"
    sums_path = SRC / "SHA256SUMS.txt"
    if not tar_path.exists():
        print(f"missing {tar_path}", file=sys.stderr)
        return 1

    expected = {}
    for line in sums_path.read_text(encoding="utf-8").splitlines():
        parts = line.split()
        if len(parts) == 2:
            expected[parts[1].lstrip("*")] = parts[0].lower()

    OUT.mkdir(parents=True, exist_ok=True)
    writers: dict[str, gzip.GzipFile] = {}
    total_lines = 0
    key_sample = None
    months_seen = set()

    with tarfile.open(tar_path) as tar:
        members = sorted(
            (m for m in tar.getmembers() if m.name.endswith(".jsonl.zst")),
            key=lambda m: m.name,
        )
        print(f"volumes in tar: {len(members)}")
        for mi, member in enumerate(members, 1):
            name = Path(member.name).name
            want = expected.get(name)
            raw = tar.extractfile(member).read()  # 年卷 zst ≤ ~3MB
            if want:
                got = hashlib.sha256(raw).hexdigest()
                if got != want:
                    print(f"SHA256 MISMATCH {name}: {got} != {want}", file=sys.stderr)
                    return 1
            dctx = zstandard.ZstdDecompressor()
            reader = io.BufferedReader(dctx.stream_reader(io.BytesIO(raw)))
            lines = 0
            buf = io.StringIO()
            for line in reader:
                s = line.decode("utf-8")
                try:
                    rec = json.loads(s)
                except json.JSONDecodeError:
                    continue
                ym = f"{rec['y']:04d}-{rec['m']:02d}"
                w = writers.get(ym)
                if w is None:
                    w = gzip.open(OUT / f"{ym}.jsonl.gz", "wb", compresslevel=1)
                    writers[ym] = w
                    months_seen.add(ym)
                if key_sample is None:
                    key_sample = rec.get("k")
                buf.write(s)
                if buf.tell() > (1 << 22):
                    w.write(buf.getvalue().encode("utf-8"))
                    buf = io.StringIO()
                lines += 1
            if buf.tell():
                writers[ym].write(buf.getvalue().encode("utf-8"))
            total_lines += lines
            print(f"[{mi}/{len(members)}] {name}: {lines} charts, cum {total_lines}")

    for w in writers.values():
        w.close()

    total_bytes = sum(p.stat().st_size for p in OUT.glob("*.jsonl.gz"))
    print(
        f"DONE: {total_lines} charts, {len(months_seen)} monthly shards, "
        f"{total_bytes / 1e9:.2f} GB on disk, sample key = {key_sample}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
