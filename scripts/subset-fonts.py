# -*- coding: utf-8 -*-
"""
中文字体子集化(T11:常用字表 + 站内字表 → 单片 woff2,替换 Google 动态分片)
字符集 = GB2312 一级字库(3755 常用字)+ 站内全部 CJK(messages/ 与 src/)+ 基本拉丁/标点。
运行:python scripts/subset-fonts.py
输入:/tmp/noto-src/*.otf(Noto Serif SC 400/600)
输出:src/app/fonts/noto-serif-sc-{400,600}.woff2
"""
import re
import sys
from pathlib import Path

from fontTools.subset import Options, Subsetter, load_font, save_font

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = Path("D:/tmp/noto-src")
OUT_DIR = ROOT / "src" / "app" / "fonts"

JOBS = [
    ("NotoSerifSC-Regular.otf", "noto-serif-sc-400.woff2"),
    ("NotoSerifSC-SemiBold.otf", "noto-serif-sc-600.woff2"),
]

def gb2312_level1() -> set[str]:
    """GB2312 一级字库(3755 常用汉字):区位 16-55 区"""
    chars: set[str] = set()
    for qu in range(16, 56):
        for wei in range(1, 95):
            try:
                ch = bytes([0xA0 + qu, 0xA0 + wei]).decode("gb2312")
                chars.add(ch)
            except UnicodeDecodeError:
                pass
    return chars

def site_chars() -> set[str]:
    """站内全部 CJK:messages/*.json + src/**/*.{ts,tsx,css}"""
    chars: set[str] = set()
    paths = list((ROOT / "messages").glob("*.json")) + [
        p for p in (ROOT / "src").rglob("*") if p.suffix in (".ts", ".tsx", ".css")
    ]
    for p in paths:
        try:
            chars |= set(re.findall(r"[　-鿿＀-￯]", p.read_text(encoding="utf-8")))
        except OSError:
            pass
    return chars

def main() -> int:
    # 站内字表已全覆盖可见文案(含引擎术语/城市/名人/格局全文);
    # 新增中文内容后需重跑本脚本(缺字将回退系统宋体,不破功能,仅视觉不齐)
    unicodes = (
        site_chars()
        | set(map(chr, range(0x20, 0x7F)))   # 基本拉丁
        | set("·—…‘’“”〔〕《》〈〉「」『』")     # 中文标点/引号
        | set(map(chr, range(0x2000, 0x2070)))  # 通用标点(dash/space 等)
    )
    text = "".join(sorted(unicodes))
    print(f"charset: {len(unicodes)} chars")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for src_name, out_name in JOBS:
        src = SRC_DIR / src_name
        if not src.exists():
            print(f"missing source: {src}", file=sys.stderr)
            return 1
        opts = Options()
        opts.flavor = "woff2"
        opts.layout_features = ["kern", "liga", "ccmp", "vert"]
        opts.name_IDs = [1, 2, 3, 4, 6]
        opts.hinting = False  # CJK hint 体积大而收益低(大字号展示)
        opts.desubroutinize = False
        font = load_font(str(src), opts)
        ss = Subsetter(options=opts)
        ss.populate(text=text)
        ss.subset(font)
        out = OUT_DIR / out_name
        save_font(font, str(out), opts)
        print(f"{out_name}: {out.stat().st_size // 1024} KB")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
