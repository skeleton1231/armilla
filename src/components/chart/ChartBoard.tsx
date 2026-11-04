'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Paragraph, ReadingSection } from '@/lib/interpret/assemble';
import { canonPalaceName, BRANCH_ZH, BRANCH_PINYIN } from '@/lib/interpret/canon';
import { STAR_BY_NAME } from '@/content/wiki/stars';
import { PALACE_BY_NAME } from '@/content/wiki/palaces';
import type { Palace, Star, ZiweiChart } from '@/lib/engine';
import { palaceEntryByName } from '@/content/wiki/palaces';
import { ChartSnapshot } from '@/components/chart/ChartSnapshot';

/** 地支索引 → 4×4 网格位置(传统盘:寅左下,顺时针) */
const BRANCH_GRID: Record<number, { row: number; col: number }> = {
  5: { row: 0, col: 0 },  6: { row: 0, col: 1 },  7: { row: 0, col: 2 },  8: { row: 0, col: 3 },
  4: { row: 1, col: 0 },                                            9: { row: 1, col: 3 },
  3: { row: 2, col: 0 },                                           10: { row: 2, col: 3 },
  2: { row: 3, col: 0 },  1: { row: 3, col: 1 },  0: { row: 3, col: 2 }, 11: { row: 3, col: 3 },
};

export interface FamousMatchInfo { name: string; notable: string; }

export interface LockedSectionMeta { key: string; label: string; palaceName: string; }

export interface ChartBoardProps {
  chart: ZiweiChart;
  sections: ReadingSection[];
  lockedSections: LockedSectionMeta[];
  paid: boolean;
  redeemedToken: string | null;
  stripeReady: boolean;
  chartQuery: string;
  locale: string;
  anchorKeys: string[];
  palaceToDim: Record<string, string>;
  sameDays: { count: number; years: { year: number; n: number }[]; window: { start: number; end: number } } | null;
  famousMatch: FamousMatchInfo[];
  unknownHour: boolean;
  shareUrl: string;
}

const SOURCE_TAG: Record<Paragraph['source'], string> = {
  combo: 'comboTag', generic: 'genericTag', pattern: 'patternTag',
  sihua: 'sihuaTag', summary: 'summaryTag', dataset: 'datasetTag',
};

const STAR_TYPE_ORDER = { major: 0, minor: 1, lucky: 2, sha: 3 } as const;

export function ChartBoard(props: ChartBoardProps): React.JSX.Element {
  const { chart, sections, lockedSections, paid, redeemedToken, stripeReady, chartQuery, locale, anchorKeys, palaceToDim, sameDays, famousMatch, unknownHour, shareUrl } = props;
  const t = useTranslations('chart');
  const tp = useTranslations('pay');
  // 默认选中命宫(用户第一眼看到最关键的宫位信息,不是空面板)
  const [selected, setSelected] = useState<number>(() =>
    chart.palaces.findIndex((p) => p.isMingGong) ?? -1,
  );
  const [copied, setCopied] = useState(false);
  const [buying, setBuying] = useState(false);
  const [codeSaved, setCodeSaved] = useState(false);

  useEffect(() => {
    if (redeemedToken) {
      try { localStorage.setItem(`xuanji_unlock_${chartQuery}`, redeemedToken); setCodeSaved(true); } catch { /* noop */ }
    }
  }, [redeemedToken, chartQuery]);

  const buy = async (): Promise<void> => {
    if (!stripeReady) return;
    setBuying(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ q: chartQuery, locale }),
      });
      const data = (await res.json()) as { url?: string };
      if (data.url) { window.location.href = data.url; return; }
    } catch { /* noop */ }
    setBuying(false);
  };

  const restore = (): void => {
    const code = window.prompt(tp('restorePrompt'), '');
    if (!code) return;
    window.location.href = `/${locale}/chart?${chartQuery}&t=${encodeURIComponent(code.trim())}`;
  };

  const alias = canonPalaceName;
  const starLabel = (name: string): string => locale === 'zh' ? name : (STAR_BY_NAME.get(name)?.en ?? name);
  const palaceLabel = (name: string): string =>
    locale === 'zh' ? alias(name) : (PALACE_BY_NAME.get(alias(name))?.en ?? alias(name));

  const selectedPalace = selected >= 0 ? chart.palaces[selected] : null;
  const selEntry = selectedPalace ? palaceEntryByName(alias(selectedPalace.name)) : undefined;

  const share = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(new URL(shareUrl, window.location.origin).toString());
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    } catch { /* noop */ }
  };

  /** 宫格:全部星曜按类型排序,主星大金,辅曜小灰,四化朱砂后缀 */
  const PalaceCell = ({ p, idx }: { p: Palace; idx: number }): React.JSX.Element => {
    const isSelected = selected === idx;
    const isMing = p.isMingGong;
    const isShen = p.isShenGong;
    const branchName = (locale === 'zh' ? BRANCH_ZH : BRANCH_PINYIN)[p.branch];
    const stars = [...p.stars].sort((a, b) => STAR_TYPE_ORDER[a.type] - STAR_TYPE_ORDER[b.type]);

    return (
      <button
        type="button"
        onClick={() => setSelected(isSelected ? -1 : idx)}
        className={`relative flex flex-col overflow-hidden rounded-[2px] border p-2 text-left transition-colors duration-200 cursor-pointer ${
          isSelected
            ? 'border-[var(--gold)] bg-[oklch(0.26_0.03_155)] shadow-[0_0_16px_rgba(216,180,90,0.18)]'
            : isMing
              ? 'border-[color-mix(in_oklab,var(--gold)_50%,var(--border))] bg-[oklch(0.22_0.02_150)]'
              : 'border-[var(--border)] bg-[var(--card)] hover:border-[color-mix(in_oklab,var(--gold)_35%,var(--border))]'
        }`}
        style={{ gridColumn: BRANCH_GRID[p.branch].col + 1, gridRow: BRANCH_GRID[p.branch].row + 1 }}
        aria-label={`${palaceLabel(p.name)} ${branchName} ${stars.map((s) => starLabel(s.name)).join(' ')}`}
        aria-pressed={isSelected}
      >
        {/* 头:地支 + 宫名 + 标记 */}
        <div className="mb-1.5 flex items-baseline justify-between border-b border-[color-mix(in_oklab,var(--border)_60%,transparent)] pb-1">
          <span className="text-[11px] tracking-wider text-[var(--muted-foreground)]">{branchName}</span>
          <span className={`text-sm font-semibold ${isMing || isShen ? 'text-[var(--gold)]' : 'text-[var(--foreground)]'}`}>
            {alias(p.name).replace('宫', '')}
            {isMing && <span className="ml-0.5 text-[9px] text-[var(--gold)]">命</span>}
            {isShen && !isMing && <span className="ml-0.5 text-[9px] text-[var(--bronze)]">身</span>}
          </span>
        </div>

        {/* 星曜列表:全部显示 */}
        <ul className="flex-1 space-y-0.5">
          {stars.map((s) => (
            <li key={s.name} className={`flex items-baseline text-[13px] leading-5 ${
              s.type === 'major' ? 'font-semibold text-[var(--gold)]' : 'text-[var(--muted-foreground)]'
            }`}>
              <span className="min-w-0 truncate">{starLabel(s.name)}</span>
              {s.siHua && (
                <span className="ml-1 shrink-0 text-[12px] font-bold text-[var(--cinnabar)]">{s.siHua}</span>
              )}
            </li>
          ))}
          {p.isEmpty && p.borrowedStars && p.borrowedStars.length > 0 && (
            <li className="text-[11px] italic text-[var(--muted-foreground)]/60">
              → {p.borrowedStars.map(starLabel).join(' ')}
            </li>
          )}
        </ul>

        {/* 尾:大限 */}
        {p.daXianAge && (
          <div className="mt-auto border-t border-[color-mix(in_oklab,var(--border)_40%,transparent)] pt-0.5 text-[10px] text-[var(--muted-foreground)]/60">
            {p.daXianAge[0]}–{p.daXianAge[1]}
          </div>
        )}
      </button>
    );
  };

  return (
    <div>
      {unknownHour && (
        <p className="mb-3 rounded-[3px] border border-[color-mix(in_oklab,var(--cinnabar)_45%,transparent)] px-4 py-2 text-xs text-[var(--cinnabar)]">
          {t('unknownHour')}
        </p>
      )}
      {/* ———— 上层:盘面 + PALACE 面板(双栏) ———— */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
        <div className="grid grid-cols-4 gap-1 rounded-[3px] border border-[var(--border)] bg-[var(--background)] p-1">
          {chart.palaces.map((p, idx) => (
            <PalaceCell key={p.branch} p={p} idx={idx} />
          ))}

          {/* 盘芯:出生信息 + 五行局 */}
          <div
            className="flex flex-col items-center justify-center gap-1 rounded-[2px] border border-[var(--border)] bg-[oklch(0.18_0.015_150)] p-3"
            style={{ gridColumn: '2 / 4', gridRow: '2 / 4' }}
          >
            <p className="text-lg font-semibold tracking-[0.25em] text-[var(--gold)]">璇玑</p>
            <p className="text-[10px] tracking-[0.4em] text-[var(--muted-foreground)]">ARMILLA</p>
            <div className="my-2 h-px w-4/5 bg-[var(--border)]" />
            <p className="text-xs text-[var(--foreground)]">
              {chart.birthInfo.year} · {chart.birthInfo.month} · {chart.birthInfo.day}
            </p>
            <p className="text-xs text-[var(--foreground)]">
              {(locale === 'zh' ? BRANCH_ZH : BRANCH_PINYIN)[chart.birthInfo.hour]} · {chart.birthInfo.gender === 'male' ? (locale === 'zh' ? '男' : 'M') : (locale === 'zh' ? '女' : 'F')}
            </p>
            <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">{chart.wuxingJuName}</p>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              {locale === 'zh' ? '命主' : 'Lord'} {chart.mingZhu} · {locale === 'zh' ? '身主' : 'Body'} {chart.shenZhu}
            </p>
          </div>
        </div>

        {/* 分享 + 合盘钩子(T0-3) */}
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button" onClick={share}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-[var(--gold-dim,var(--gold))] px-4 text-xs tracking-wider text-[var(--gold)] transition-colors duration-150 hover:bg-[var(--gold)] hover:text-[var(--primary-foreground)]"
          >
            {copied ? t('copied') : t('share')}
          </button>
          <a
            href={`/${locale}`}
            className="inline-flex h-9 items-center rounded-md border border-[var(--border)] px-4 text-xs tracking-wider text-[var(--muted-foreground)] transition-colors duration-150 hover:border-[color-mix(in_oklab,var(--gold)_45%,var(--border))] hover:text-[var(--gold)]"
            title={t('shareTogetherNote')}
          >
            {t('shareTogether')}
          </a>
        </div>

        {/* 同盘之日 */}
        {sameDays && sameDays.count > 1 && (
          <section className="mt-4 rounded-[3px] border border-[var(--border)] bg-[var(--card)] p-5">
            <h3 className="text-xs tracking-label text-[var(--muted-foreground)]">{t('sameDaysTitle')}</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
              {t('sameDaysBody', { count: sameDays.count, start: sameDays.window.start, end: sameDays.window.end })}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {sameDays.years.slice(0, 20).map((y) => (
                <span key={y.year} className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[11px] text-[var(--muted-foreground)]">
                  {y.year} ×{y.n}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 同盘名人 */}
        {famousMatch.length > 0 && (
          <section className="mt-4 rounded-[3px] border border-[color-mix(in_oklab,var(--gold)_35%,var(--border))] bg-[var(--card)] p-5">
            <h3 className="text-xs tracking-label text-[var(--gold)]">{t('famousMatchTitle')}</h3>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{t('famousMatchBody')}</p>
            <ul className="mt-3 space-y-2">
              {famousMatch.map((fm) => (
                <li key={fm.name} className="rounded-[3px] border border-[var(--border)] bg-[var(--muted)] p-3 text-sm">
                  <b className="text-[var(--gold)]">{fm.name}</b>
                  <span className="ml-2 text-xs text-[var(--muted-foreground)]">{fm.notable}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* ———— PALACE 面板(右栏,不 sticky)———— */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-[3px] border border-[var(--border)] bg-[var(--card)] p-6">
          {selectedPalace ? (
            <div>
              <p className="text-xs tracking-label text-[var(--muted-foreground)]">PALACE</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--gold)]">{alias(selectedPalace.name)}</h2>
              <p className="mb-4 text-xs text-[var(--muted-foreground)]">
                {selEntry ? (locale === 'zh' ? selEntry.domain.zh : selEntry.domain.en) : ''}
              </p>
              <ul className="mb-4 border-t border-[var(--border)]">
                {selectedPalace.stars.map((s: Star) => (
                  <li key={s.name} className="flex items-baseline justify-between border-b border-[var(--border)] py-2 text-[15px]">
                    <span>{starLabel(s.name)}</span>
                    {s.siHua ? (
                      <span className="text-[13px] text-[var(--cinnabar)]">{s.siHua}</span>
                    ) : (
                      <span className="text-[11px] text-[var(--muted-foreground)]">{t(s.type === 'major' ? 'gradeMajor' : 'gradeMinor')}</span>
                    )}
                  </li>
                ))}
              </ul>
              {palaceToDim[alias(selectedPalace.name)] && (
                <a href={`#dim-${palaceToDim[alias(selectedPalace.name)]}`} className="text-sm text-[var(--gold)] underline-offset-4 hover:underline">
                  ↓ {sections.find((sec) => sec.key === palaceToDim[alias(selectedPalace.name)])?.label}
                </a>
              )}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">{t('palacePanelHint')}</p>
          )}
        </div>
      </div>
      </div>

      {/* ———— 三问速写(T0-1):盘面与十三维之间的顿悟层 ———— */}
      <ChartSnapshot chart={chart} locale={locale} />

      {/* ———— 下层:十三维解读 + 付费墙(全宽)———— */}
      <div className="mt-8 space-y-6">
        <h2 className="text-xs tracking-label text-[var(--muted-foreground)]">{t('dimsTitle')}</h2>
        <div className="divide-y divide-[var(--border)] rounded-[3px] border border-[var(--border)] bg-[var(--card)]">
          {sections.map((sec, idx) => {
            const open = sec.key === 'overview' || anchorKeys.includes(sec.key);
            return (
              <details key={sec.key} id={`dim-${sec.key}`} open={open} className="group px-6 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    <span className="mr-2 text-xs text-[var(--gold)]">{String(idx).padStart(2, '0')}</span>
                    {sec.label}
                    <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)]">{sec.palaceName}</span>
                  </span>
                  <span className="text-[var(--muted-foreground)] transition-transform duration-300 ease-qi group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 space-y-3">
                  {sec.paragraphs.map((para: Paragraph, k) => (
                    <p key={k} className="text-[13px] leading-7 text-[color-mix(in_oklab,var(--foreground)_88%,var(--muted-foreground))]">
                      <span className="mr-2 inline-block rounded-full border border-[var(--border)] px-2 py-0.5 align-middle text-[10px] text-[var(--muted-foreground)]">
                        {t(SOURCE_TAG[para.source])}
                      </span>
                      {para.text}
                    </p>
                    ))}
                  </div>
                </details>
              );
            })}
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">{t('attribution')}</p>

        {/* 付费墙 */}
        {!paid && lockedSections.length > 0 && (
          <section className="mt-6 rounded-[3px] border border-[color-mix(in_oklab,var(--gold)_40%,var(--border))] bg-[var(--card)] p-6">
            <h2 className="text-xs tracking-label text-[var(--gold)]">{tp('title')}</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">{tp('body')}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {lockedSections.map((s) => (
                <li key={s.key} className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted-foreground)]">{s.label}</li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <button type="button" onClick={buy} disabled={!stripeReady || buying}
                className="inline-flex h-11 cursor-pointer items-center rounded-md bg-[var(--gold)] px-7 text-sm tracking-[0.15em] text-[var(--primary-foreground)] transition-colors duration-150 hover:bg-[var(--gold-bright)] disabled:cursor-not-allowed disabled:opacity-50">
                {buying ? tp('buying') : tp('buy', { price: '$9.99' })}
              </button>
              <button type="button" onClick={restore} className="text-sm text-[var(--muted-foreground)] underline-offset-4 hover:text-[var(--gold)] hover:underline cursor-pointer">
                {tp('restore')}
              </button>
              {!stripeReady && <span className="text-xs text-[var(--muted-foreground)]">{tp('notReady')}</span>}
            </div>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]/80">{tp('finePrint')}</p>
          </section>
        )}

        {codeSaved && (
          <section className="mt-4 rounded-[3px] border border-[var(--bronze)] bg-[var(--muted)] p-5">
            <p className="text-sm text-[var(--foreground)]">{tp('unlocked')}</p>
            <p className="mt-2 break-all rounded border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs text-[var(--gold)]">{redeemedToken}</p>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">{tp('keepCode')}</p>
          </section>
        )}
      </div>
    </div>
  );
}
