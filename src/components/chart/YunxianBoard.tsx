'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ZiweiChart } from '@/lib/engine';
import type { YunxianReading } from '@/lib/interpret/yunxian';
import { STAR_BY_NAME } from '@/content/wiki/stars';
import { PALACE_BY_NAME } from '@/content/wiki/palaces';
import { canonPalaceName } from '@/lib/interpret/canon';
// 注意:客户端禁止 import '@/lib/ziwei/sihua'(传递依赖 lunar-javascript 会撑爆 JS 预算);
// 年干四化已由服务端按 10 天干预计算,经 props.yearSihuaByStem 下发。

type View = 'ben' | 'da' | 'liu';

const SIHUA_MARKS = ['lu', 'quan', 'ke', 'ji'] as const;
const SIHUA_ZH: Record<(typeof SIHUA_MARKS)[number], string> = { lu: '禄', quan: '权', ke: '科', ji: '忌' };

interface Props {
  chart: ZiweiChart;
  yunxian: YunxianReading;
  locale: string;
  paid: boolean;
  /** 选中宫地支高亮盘面(null 清除) */
  onBranch: (branch: number | null) => void;
}

/**
 * 运限视图(v1.1):大限/流年双 Tab。
 * 结构(宫位/星曜/四化)免费可见;正文随 $9.99 解锁。
 * 流年四化按年干客户端现算(纯查表,sihua 库无服务端依赖)。
 */
export function YunxianBoard({ chart, yunxian, locale, paid, onBranch }: Props): React.JSX.Element {
  const t = useTranslations('chart');
  const zh = locale === 'zh';

  const [view, setView] = useState<View>('da');
  const [dxIdx, setDxIdx] = useState<number>(Math.max(0, chart.currentDaXianIndex));
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const starLabel = (n: string): string => zh ? n : (STAR_BY_NAME.get(n)?.en ?? n);
  const palaceLabel = (n: string): string =>
    zh ? canonPalaceName(n) : (PALACE_BY_NAME.get(canonPalaceName(n))?.en ?? canonPalaceName(n));

  // 视图/选择变化 → 高亮盘面对应宫
  useEffect(() => {
    if (view === 'da') {
      const d = yunxian.decades[dxIdx];
      onBranch(d ? d.palaceBranch : null);
    } else if (view === 'liu') {
      onBranch(((year - 4) % 12 + 12) % 12);
    } else {
      onBranch(null);
    }
  }, [view, dxIdx, year, yunxian.decades, onBranch]);

  const decade = yunxian.decades[dxIdx];

  /* 流年:年支宫 + 年干四化(props 预计算表纯查表) */
  const liunian = useMemo(() => {
    const branch = ((year - 4) % 12 + 12) % 12;
    const reading = yunxian.byBranch.find((b) => b.branch === branch);
    const stem = ((year - 4) % 10 + 10) % 10;
    const transforms = yunxian.yearSihuaByStem[stem];
    return { branch, reading, transforms };
  }, [year, yunxian.byBranch, yunxian.yearSihuaByStem]);

  const tab = (id: View, label: string, active: boolean): React.JSX.Element => (
    <button
      type="button" key={id}
      onClick={() => setView(id)}
      className={`h-8 cursor-pointer rounded-md px-4 text-xs tracking-wider transition-colors duration-150 ${
        active
          ? 'bg-[var(--gold)] text-[var(--primary-foreground)]'
          : 'border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[color-mix(in_oklab,var(--gold)_45%,var(--border))] hover:text-[var(--gold)]'
      }`}
    >
      {label}
    </button>
  );

  const SihuaChips = ({ si }: { si: { lu: string; quan: string; ke: string; ji: string } }): React.JSX.Element => (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {SIHUA_MARKS.map((m) => (
        <span key={m} className="rounded-full border border-[color-mix(in_oklab,var(--cinnabar)_40%,var(--border))] px-2.5 py-0.5 text-[11px] text-[var(--cinnabar)]">
          化{SIHUA_ZH[m]} · {starLabel(si[m])}
        </span>
      ))}
    </div>
  );

  const ProseOrLock = ({ paragraphs }: { paragraphs: { text: string }[] }): React.JSX.Element =>
    paid ? (
      <div className="mt-3 space-y-2">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-[13px] leading-7 text-[color-mix(in_oklab,var(--foreground)_88%,var(--muted-foreground))]">{p.text}</p>
        ))}
      </div>
    ) : (
      <div className="relative mt-3 overflow-hidden rounded-[3px] border border-[var(--border)] bg-[var(--muted)] p-4">
        <p className="text-[13px] leading-6 text-[var(--muted-foreground)] blur-[3px] select-none">
          {paragraphs[0]?.text ?? ''}
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-[var(--muted-foreground)]">{t('yxLocked', { count: paragraphs.length })}</p>
          <a href="#paywall" className="shrink-0 text-xs text-[var(--gold)] underline-offset-4 hover:underline">
            {t('yxUnlock')} ↓
          </a>
        </div>
      </div>
    );

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xs tracking-label text-[var(--muted-foreground)]">{t('yxTitle')}</h2>
        <div className="flex gap-2">
          {tab('ben', t('yxTabBen'), view === 'ben')}
          {tab('da', t('yxTabDa'), view === 'da')}
          {tab('liu', t('yxTabLiu'), view === 'liu')}
        </div>
      </div>

      <div className="mt-3 rounded-[3px] border border-[var(--border)] bg-[var(--card)] p-5">
        {/* ———— 大限 ———— */}
        {view === 'da' && decade && (
          <>
            <div className="flex flex-wrap gap-1.5">
              {yunxian.decades.map((d) => (
                <button
                  type="button" key={d.index}
                  onClick={() => setDxIdx(d.index)}
                  className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] transition-colors duration-150 ${
                    d.index === dxIdx
                      ? 'border-[var(--gold)] text-[var(--gold)]'
                      : d.index === chart.currentDaXianIndex
                        ? 'border-[color-mix(in_oklab,var(--gold)_50%,var(--border))] text-[var(--muted-foreground)]'
                        : 'border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--gold)]'
                  }`}
                >
                  {d.startAge}–{d.endAge}{d.index === chart.currentDaXianIndex ? ' ·' : ''}
                </button>
              ))}
            </div>

            <div className="mt-4 border-t border-[var(--border)] pt-4">
              <p className="text-lg font-semibold text-[var(--gold)]">
                {palaceLabel(decade.palaceName)}
                <span className="ml-3 text-sm font-normal text-[var(--muted-foreground)]">
                  {decade.startAge}–{decade.endAge} {t('yxAgeUnit')} · {decade.startYear}–{decade.endYear}
                </span>
              </p>
              <p className="mt-1 text-sm text-[var(--foreground)]">
                {(decade.stars.length > 0 ? decade.stars : decade.borrowedStars).map(starLabel).join(' · ') || t('yxNoStar')}
                {decade.stars.length === 0 && decade.borrowedStars.length > 0 && (
                  <span className="ml-2 text-xs text-[var(--muted-foreground)]">({t('yxBorrowed')})</span>
                )}
              </p>
              {decade.siHua && (
                <>
                  <p className="mt-2 text-[11px] tracking-label text-[var(--muted-foreground)]">{t('yxDaSihua')}</p>
                  <SihuaChips si={decade.siHua} />
                </>
              )}
              <ProseOrLock paragraphs={decade.paragraphs} />
            </div>
          </>
        )}

        {/* ———— 流年 ———— */}
        {view === 'liu' && liunian.reading && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs text-[var(--muted-foreground)]" htmlFor="yx-year">{t('yxYearLabel')}</label>
              <select
                id="yx-year"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="h-8 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm text-[var(--foreground)]"
              >
                {Array.from({ length: 2026 - 1950 + 1 }, (_, i) => 1950 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="mt-4 border-t border-[var(--border)] pt-4">
              <p className="text-lg font-semibold text-[var(--gold)]">
                {palaceLabel(liunian.reading.palaceName)}
                <span className="ml-3 text-sm font-normal text-[var(--muted-foreground)]">{year}</span>
              </p>
              <p className="mt-1 text-sm text-[var(--foreground)]">
                {(liunian.reading.stars.length > 0 ? liunian.reading.stars : liunian.reading.borrowedStars).map(starLabel).join(' · ') || t('yxNoStar')}
              </p>
              <p className="mt-2 text-[11px] tracking-label text-[var(--muted-foreground)]">{t('yxYearSihua')}</p>
              <SihuaChips si={liunian.transforms} />
              <ProseOrLock paragraphs={liunian.reading.paragraphs} />
            </div>
          </>
        )}

        {/* ———— 本命 ———— */}
        {view === 'ben' && (
          <p className="text-sm leading-7 text-[var(--muted-foreground)]">{t('yxBenHint')}</p>
        )}

        <p className="mt-4 border-t border-[var(--border)] pt-3 text-[11px] leading-5 text-[var(--muted-foreground)]/80">
          {t('yxDisclaimer')}
        </p>
      </div>
    </section>
  );
}
