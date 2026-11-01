# -*- coding: utf-8 -*-
"""
T29-③:v3 样本集(518,400 盘)× 自建同盘索引(data/same-structure.json)交叉校验。
对每行 v3 记录按我们的 structureKey 口径(主星+生年四化+命身宫)重算键,与索引比对:
  - 键空间一致性:v3 出现的键是否都在 8,640 内
  - 成员一致性:同键日期集合的 Jaccard(窗口交集内)
运行:python scripts/crosscheck-v3.py
"""
import gzip
import io
import json
import zipfile
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
V3_ZIP = Path("D:/tmp/ziwei-dataset/ziwei-samples-v3.zip")
OUR_INDEX = ROOT / "data" / "same-structure.json"

WINDOW = (1950, 2026)


def our_key(chart: dict) -> str | None:
    try:
        palaces = sorted(chart["palaces"], key=lambda p: p["branch"])
        parts = [f"ming{chart['mingGongBranch']}", f"shen{chart['shenGongBranch']}"]
        for p in palaces:
            majors = sorted(
                (s["name"] + (s.get("siHua") or "")) for s in p["stars"] if s.get("type") == "major"
            )
            parts.append(f"{p['branch']}:" + ".".join(majors))
        return "|".join(parts)
    except (KeyError, TypeError):
        return None


def main() -> int:
    ours = json.loads(OUR_INDEX.read_text(encoding="utf-8"))
    our_index: dict[str, set[str]] = {
        k: {e.split("#")[0] for e in v} for k, v in ours["index"].items()
    }
    print(f"our index: {len(our_index)} structures")

    z = zipfile.ZipFile(V3_ZIP)
    shards = sorted(
        i.filename for i in z.infolist()
        if i.filename.endswith(".jsonl.gz") and "year-" in i.filename
    )
    print(f"v3 shards: {len(shards)}")

    v3_index: dict[str, set[str]] = defaultdict(set)
    n = 0
    unknown_keys: set[str] = set()
    for si, name in enumerate(shards, 1):
        text = gzip.decompress(z.read(name)).decode("utf-8")
        for line in text.splitlines():
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                continue
            bi = rec.get("birthInfo") or {}
            y = bi.get("year")
            if not isinstance(y, int) or not (WINDOW[0] <= y <= WINDOW[1]):
                continue  # 窗口外交集为空,只校验 1950–2026
            key = our_key(rec.get("chart") or {})
            if not key:
                continue
            date = f"{y:04d}-{bi.get('month', 0):02d}-{bi.get('day', 0):02d}"
            v3_index[key].add(date)
            n += 1
        if si % 120 == 0:
            print(f"  {si}/{len(shards)} shards, {n} records")

    print(f"v3 in-window records: {n}, distinct keys: {len(v3_index)}")

    outside = set(v3_index) - set(our_index)
    if outside:
        unknown_keys |= outside
    print(f"keys in v3 but not in our index: {len(outside)}")

    # 成员一致性(窗口内同键日期集合)
    jac_samples = []
    mismatch_keys = []
    both = 0
    for k, dates in v3_index.items():
        ours_dates = our_index.get(k)
        if not ours_dates:
            continue
        both += 1
        inter = len(dates & ours_dates)
        union = len(dates | ours_dates) or 1
        jac = inter / union
        jac_samples.append(jac)
        if jac < 0.999:
            mismatch_keys.append((k, jac, len(dates), len(ours_dates)))

    if jac_samples:
        avg = sum(jac_samples) / len(jac_samples)
        perfect = sum(1 for j in jac_samples if j >= 0.999)
        print(f"member Jaccard: avg={avg:.4f}, perfect={perfect}/{len(jac_samples)}")
    if mismatch_keys:
        print(f"mismatched keys: {len(mismatch_keys)} (showing up to 3)")
        for k, j, a, b in mismatch_keys[:3]:
            print(f"  jac={j:.3f} v3={a}days ours={b}days key={k[:80]}")
    print(
        "VERDICT:",
        "CONSISTENT" if not outside and not mismatch_keys else
        ("KEY_SPACE_GAP" if outside else "MEMBER_DIFF"),
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
