'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Paragraph, ReadingSection } from '@/lib/interpret/assemble';
import { canonPalaceName, BRANCH_ZH, BRANCH_PINYIN } from '@/lib/interpret/canon';
import { STAR_BY_NAME } from '@/content/wiki/stars';
import { PALACE_BY_NAME } from '@/content/wiki/palaces';
import type { Palace, Star, ZiweiChart } from '@/lib/engine';
import { palaceEntryByName } from '@/content/wiki/palaces';

const CX = 420;
const CY = 420;
const R_OUT = 318;
const R_IN = 205;
const R_TICK = 330;    // 拉进,给宫名留呼吸
const R_LABEL = 378;   // 推出,与刻度拉开
const R_BRANCH = 352;
const R_STAR_BASE = 282; // 主星起始径向位
const R_STAR_STEP = 28;  // 星与星的径向间距(星名不再水平重叠)

/** 极坐标:0° = 正下方(命宫),顺时针为正 */
function pt(r: number, deg: number): [number, number] {
  const a = ((deg + 90) * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

function sectorPath(c0: number, c1: number): string {
  const [ox, oy] = pt(R_OUT, c0);
  const [tx, ty] = pt(R_OUT, c1);
  const [ix, iy] = pt(R_IN, c0);
  const [jx, jy] = pt(R_IN, c1);
  const f = (n: number): string => n.toFixed(1);
  return `M ${f(ox)} ${f(oy)} A ${R_OUT} ${R_OUT} 0 0 1 ${f(tx)} ${f(ty)} L ${f(jx)} ${f(jy)} A ${R_IN} ${R_IN} 0 0 0 ${f(ix)} ${f(iy)} Z`;
}

export interface FamousMatchInfo {
  name: string;
  notable: string;
}

export interface LockedSectionMeta {
  key: string;
  label: string;
  palaceName: string;
}

export interface ChartBoardProps {
  chart: ZiweiChart;
  sections: ReadingSection[];
  /** T26:付费墙后的维度元数据(服务端已剪裁正文) */
  lockedSections: LockedSectionMeta[];
  paid: boolean;
  /** sid 兑换成功时的一次性 token(前端存 localStorage 供回访) */
  redeemedToken: string | null;
  stripeReady: boolean;
  chartQuery: string;
  locale: string;
  anchorKeys: string[];
  /** 维度键 → 宫名(点击宫位锚滚到对应维度) */
  palaceToDim: Record<string, string>;
  sameDays: { count: number; years: { year: number; n: number }[]; window: { start: number; end: number } } | null;
  famousMatch: FamousMatchInfo[];
  unknownHour: boolean;
  shareUrl: string;
}

const SOURCE_TAG: Record<Paragraph['source'], string> = {
  combo: 'comboTag',
  generic: 'genericTag',
  pattern: 'patternTag',
  sihua: 'sihuaTag',
  summary: 'summaryTag',
  dataset: 'datasetTag',
};

export function ChartBoard(props: ChartBoardProps): React.JSX.Element {
  const { chart, sections, lockedSections, paid, redeemedToken, stripeReady, chartQuery, locale, anchorKeys, palaceToDim, sameDays, famousMatch, unknownHour, shareUrl } = props;
  const t = useTranslations('chart');
  const tp = useTranslations('pay');
  const [selected, setSelected] = useState<number>(-1);
  const [copied, setCopied] = useState(false);
  const [buying, setBuying] = useState(false);
  const [codeSaved, setCodeSaved] = useState(false);

  // 兑换成功:把购买码持久化到本机(localStorage key 绑定盘参数)
  useEffect(() => {
    if (redeemedToken) {
      try {
        localStorage.setItem(`xuanji_unlock_${chartQuery}`, redeemedToken);
        setCodeSaved(true);
      } catch {
        /* localStorage 不可用则仅展示 */
      }
    }
  }, [redeemedToken, chartQuery]);

  const buy = async (): Promise<void> => {
    if (!stripeReady) return;
    setBuying(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ q: chartQuery, locale }),
      });
      const data = (await res.json()) as { url?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
    } catch {
      /* 网络异常回落到按钮态 */
    }
    setBuying(false);
  };

  const restore = (): void => {
    const code = window.prompt(tp('restorePrompt'), '');
    if (!code) return;
    window.location.href = `/${locale}/chart?${chartQuery}&t=${encodeURIComponent(code.trim())}`;
  };

  /** 显示序:命宫在正下方,按传统宫序(命→兄弟→…)顺时针;宫名用归一形式 */
  const orderedPalaces = useMemo<Palace[]>(() => {
    const byCanon = new Map(chart.palaces.map((p) => [canonPalaceName(p.name), p]));
    const order = ['命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫', '迁移宫', '交友宫', '官禄宫', '田宅宫', '福德宫', '父母宫'];
    const out: Palace[] = [];
    for (const name of order) {
      const p = byCanon.get(name);
      if (p && !out.includes(p)) out.push(p);
    }
    for (const p of chart.palaces) if (!out.includes(p)) out.push(p);
    return out.slice(0, 12);
  }, [chart]);

  const alias = canonPalaceName;

  /** en 站星曜名:主星用英文名,辅曜暂回退中文名(渐进本地化) */
  const starLabel = (name: string): string =>
    locale === 'zh' ? name : (STAR_BY_NAME.get(name)?.en ?? name);
  const palaceLabel = (name: string): string =>
    locale === 'zh' ? alias(name) : (PALACE_BY_NAME.get(alias(name))?.en ?? alias(name));

  const selectedPalace = selected >= 0 ? orderedPalaces[selected] : null;
  const selEntry = selectedPalace ? palaceEntryByName(alias(selectedPalace.name)) : undefined;

  const share = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(new URL(shareUrl, window.location.origin).toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* 剪贴板不可用(非 https 环境)时静默 */
    }
  };

  const f = (n: number): string => n.toFixed(1);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
      {/* ———— 盘面 ———— */}
      <div className="relative">
        {unknownHour && (
          <p className="mb-3 rounded-[3px] border border-[color-mix(in_oklab,var(--cinnabar)_45%,transparent)] px-4 py-2 text-xs text-[var(--cinnabar)]">
            {t('unknownHour')}
          </p>
        )}
        <svg viewBox="0 0 840 840" role="group" aria-label={locale === 'zh' ? '紫微斗数环形命盘,十二宫' : 'Zi Wei Dou Shu chart, twelve palaces'} className="w-full">
          <defs>
            <radialGradient id="patina" cx="50%" cy="50%" r="75%">
              <stop offset="0%" stopColor="#4a5741" />
              <stop offset="100%" stopColor="#5c6b52" />
            </radialGradient>
            <radialGradient id="patinaAlt" cx="50%" cy="50%" r="75%">
              <stop offset="0%" stopColor="#516046" />
              <stop offset="100%" stopColor="#64755a" />
            </radialGradient>
            <radialGradient id="patinaHi" cx="50%" cy="50%" r="75%">
              <stop offset="0%" stopColor="#6a7d5e" />
              <stop offset="100%" stopColor="#7d9370" />
            </radialGradient>
          </defs>

          {/* 刻度环 */}
          {Array.from({ length: 72 }, (_, i) => {
            const deg = i * 5;
            const major = i % 6 === 0;
            const [x1, y1] = pt(R_TICK, deg);
            const [x2, y2] = pt(R_TICK + (major ? 14 : 7), deg);
            return (
              <line
                key={`tick-${i}`}
                x1={f(x1)} y1={f(y1)} x2={f(x2)} y2={f(y2)}
                stroke={major ? 'var(--gold-dim,#9c7f3e)' : 'var(--line)'}
                strokeWidth={major ? 1.6 : 1}
                opacity={major ? 0.9 : 0.55}
              />
            );
          })}

          {/* 内外金边 */}
          {[[R_OUT + 3, 1.4], [R_IN - 3, 1.4], [R_IN - 26, 0.8], [R_IN - 78, 0.8]].map(([r, w], k) => (
            <circle key={`ring-${k}`} cx={CX} cy={CY} r={r} fill="none" stroke="var(--gold-dim,#9c7f3e)" strokeWidth={w} opacity={0.8} />
          ))}

          {/* 十二宫扇区 */}
          {orderedPalaces.map((p, i) => {
            const c0 = i * 30 - 15;
            const c1 = i * 30 + 15;
            const mid = i * 30;
            const isSelected = selected === i;
            const [nx, ny] = pt(R_LABEL, mid);
            const [bx, by] = pt(R_BRANCH, mid);
            const branchName = (locale === 'zh' ? BRANCH_ZH : BRANCH_PINYIN)[p.branch];
            const stars = p.stars.filter((s) => s.type === 'major' || s.type === 'minor' || s.type === 'lucky' || s.type === 'sha').slice(0, 3);
            return (
              <g
                key={p.branch}
                role="button"
                tabIndex={0}
                aria-selected={isSelected}
                aria-label={`${palaceLabel(p.name)} ${branchName} ${stars.map((s) => starLabel(s.name)).join(' ')}`}
                className="cursor-pointer transition-opacity"
                style={{ outline: 'none' }}
                onClick={() => setSelected(isSelected ? -1 : i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelected(isSelected ? -1 : i);
                  }
                }}
              >
                <path
                  d={sectorPath(c0, c1)}
                  fill={`url(#${isSelected ? 'patinaHi' : i % 2 ? 'patinaAlt' : 'patina'})`}
                  stroke={isSelected ? 'var(--gold)' : 'color-mix(in oklab, var(--line) 70%, transparent)'}
                  strokeWidth={isSelected ? 2.5 : 1}
                  className="transition-all duration-300 ease-qi hover:brightness-110"
                />
                <text x={f(nx)} y={f(ny + 8)} textAnchor="middle" className="fill-[var(--gold)] text-[25px] font-semibold" style={{ letterSpacing: '0.12em' }}>
                  {alias(p.name).replace('宫', '')}
                </text>
                <text x={f(bx)} y={f(by + 5)} textAnchor="middle" className="fill-[var(--muted-foreground)] text-[14px]">
                  {branchName}
                </text>
                {stars.map((s, j) => {
                  const starR = R_STAR_BASE - j * R_STAR_STEP;
                  const [sx, sy] = pt(starR, mid);
                  const isMajor = s.type === 'major';
                  const sihuaText = s.siHua ? ` ${s.siHua}` : '';
                  return (
                    <text
                      key={s.name}
                      x={f(sx)} y={f(sy)} textAnchor="middle"
                      className={isMajor
                        ? 'fill-[var(--gold-bright,#ecc87e)] text-[17px] font-semibold'
                        : 'fill-[var(--muted-foreground)] text-[15px]'}
                      style={{
                        animation: isMajor ? 'chartbreathe 4.5s ease-in-out infinite' : undefined,
                        textShadow: '0 0 8px rgba(216,180,90,0.3)',
                      }}
                    >
                      {starLabel(s.name)}
                      {s.siHua && (
                        <tspan className="fill-[var(--cinnabar)] text-[15px] font-bold">{sihuaText}</tspan>
                      )}
                    </text>
                  );
                })}
              </g>
            );
          })}

          {/* 盘芯 */}
          <line x1={CX - 100} y1={CY} x2={CX + 100} y2={CY} stroke="var(--line)" strokeWidth={0.8} opacity={0.7} />
          <line x1={CX} y1={CY - 100} x2={CX} y2={CY + 100} stroke="var(--line)" strokeWidth={0.8} opacity={0.7} />
          <text x={CX} y={CY - 26} textAnchor="middle" className="fill-[var(--gold)] text-[30px] font-semibold" style={{ letterSpacing: '0.3em' }}>
            璇玑
          </text>
          <text x={CX} y={CY + 6} textAnchor="middle" className="fill-[var(--muted-foreground)] text-[13px]" style={{ letterSpacing: '0.5em' }}>
            ARMILLA
          </text>
          <text x={CX} y={CY + 36} textAnchor="middle" className="fill-[var(--muted-foreground)] text-[13px]">
            {chart.birthInfo.year} · {chart.birthInfo.month} · {chart.birthInfo.day} · {(locale === 'zh' ? BRANCH_ZH : BRANCH_PINYIN)[chart.birthInfo.hour]}
          </text>
          <circle cx={CX} cy={CY + 64} r={3.4} className="fill-[var(--gold)]" style={{ filter: 'drop-shadow(0 0 6px rgba(216,180,90,0.55))' }} />
        </svg>
        <style>{`@keyframes chartbreathe { 0%,100% { opacity: 1; } 50% { opacity: 0.72; } }
          @media (prefers-reduced-motion: reduce) { svg [style*="chartbreathe"], svg circle { animation: none !important; } }`}</style>
      </div>

      {/* ———— 右栏:选中宫位 + 维度手风琴 ———— */}
      <div>
        <div className="sticky top-6 rounded-[3px] border border-[var(--border)] bg-[var(--card)] p-6">
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
                      <span className="text-[13px] text-[var(--cinnabar)]">化{s.siHua}</span>
                    ) : (
                      <span className="text-[11px] text-[var(--muted-foreground)]">{t(s.type === 'major' ? 'gradeMajor' : 'gradeMinor')}</span>
                    )}
                  </li>
                ))}
              </ul>
              {palaceToDim[alias(selectedPalace.name)] && (
                <a
                  href={`#dim-${palaceToDim[alias(selectedPalace.name)]}`}
                  className="text-sm text-[var(--gold)] underline-offset-4 hover:underline"
                >
                  ↓ {sections.find((sec) => sec.key === palaceToDim[alias(selectedPalace.name)])?.label}
                </a>
              )}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">{t('palacePanelHint')}</p>
          )}
        </div>

        {/* 分享 */}
        <button
          type="button"
          onClick={share}
          className="mt-4 inline-flex h-10 cursor-pointer items-center rounded-md border border-[var(--gold-dim,var(--gold))] px-5 text-sm text-[var(--gold)] transition-colors duration-150 hover:bg-[var(--gold)] hover:text-[var(--primary-foreground)]"
        >
          {copied ? t('copied') : t('share')}
        </button>

        {/* 同盘之日 */}
        {sameDays && sameDays.count > 1 && (
          <section className="mt-6 rounded-[3px] border border-[var(--border)] bg-[var(--card)] p-6">
            <h3 className="text-sm tracking-label text-[var(--muted-foreground)]">{t('sameDaysTitle')}</h3>
            <p className="mt-2 text-sm leading-8 text-[var(--muted-foreground)]">
              {t('sameDaysBody', { count: sameDays.count, start: sameDays.window.start, end: sameDays.window.end })}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {sameDays.years.slice(0, 24).map((y) => (
                <span key={y.year} className="rounded-full border border-[var(--border)] px-2.5 py-0.5 text-xs text-[var(--muted-foreground)]">
                  {y.year} ×{y.n}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 同盘名人 */}
        {famousMatch.length > 0 && (
          <section className="mt-6 rounded-[3px] border border-[color-mix(in_oklab,var(--gold)_35%,var(--border))] bg-[var(--card)] p-6">
            <h3 className="text-sm tracking-label text-[var(--gold)]">{t('famousMatchTitle')}</h3>
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

      {/* ———— 十三维手风琴 ———— */}
      <section className="lg:col-span-2">
        <h2 className="mb-4 text-sm tracking-label text-[var(--muted-foreground)]">{t('dimsTitle')}</h2>
        <div className="divide-y divide-[var(--border)] rounded-[3px] border border-[var(--border)] bg-[var(--card)]">
          {sections.map((sec, idx) => {
            const open = sec.key === 'overview' || anchorKeys.includes(sec.key);
            return (
              <details key={sec.key} id={`dim-${sec.key}`} open={open} className="group px-6 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between">
                  <span className="text-base font-semibold text-[var(--foreground)]">
                    <span className="mr-3 text-xs text-[var(--gold)]">{String(idx).padStart(2, '0')}</span>
                    {sec.label}
                    <span className="ml-3 text-xs font-normal text-[var(--muted-foreground)]">{sec.palaceName}</span>
                  </span>
                  <span className="text-[var(--muted-foreground)] transition-transform duration-300 ease-qi group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 space-y-3">
                  {sec.paragraphs.map((para: Paragraph, k) => (
                    <p key={k} className="text-sm leading-8 text-[color-mix(in_oklab,var(--foreground)_88%,var(--muted-foreground))]">
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
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">{t('attribution')}</p>
      </section>

      {/* ———— T26 付费墙(未购买时渲染;正文已在服务端剪裁)———— */}
      {!paid && lockedSections.length > 0 && (
        <section className="mt-8 rounded-[3px] border border-[color-mix(in_oklab,var(--gold)_40%,var(--border))] bg-[var(--card)] p-8 lg:col-span-2">
          <h2 className="text-sm tracking-label text-[var(--gold)]">{tp('title')}</h2>
          <p className="mt-2 max-w-xl text-sm leading-8 text-[var(--muted-foreground)]">{tp('body')}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {lockedSections.map((s) => (
              <li key={s.key} className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted-foreground)]">
                {s.label}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={buy}
              disabled={!stripeReady || buying}
              className="inline-flex h-12 cursor-pointer items-center rounded-md bg-[var(--gold)] px-8 text-base tracking-[0.2em] text-[var(--primary-foreground)] transition-colors duration-150 hover:bg-[var(--gold-bright)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {buying ? tp('buying') : tp('buy', { price: '$5.99' })}
            </button>
            <button type="button" onClick={restore} className="text-sm text-[var(--muted-foreground)] underline-offset-4 hover:text-[var(--gold)] hover:underline cursor-pointer">
              {tp('restore')}
            </button>
            {!stripeReady && <span className="text-xs text-[var(--muted-foreground)]">{tp('notReady')}</span>}
          </div>
          <p className="mt-4 text-xs text-[var(--muted-foreground)]/80">{tp('finePrint')}</p>
        </section>
      )}

      {/* 兑换成功提示(购买码已存本机) */}
      {codeSaved && (
        <section className="mt-4 rounded-[3px] border border-[var(--bronze)] bg-[var(--muted)] p-5 lg:col-span-2">
          <p className="text-sm text-[var(--foreground)]">{tp('unlocked')}</p>
          <p className="mt-2 break-all rounded border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs text-[var(--gold)]">{redeemedToken}</p>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">{tp('keepCode')}</p>
        </section>
      )}
    </div>
  );
}
