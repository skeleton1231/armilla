'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Paragraph, ReadingSection } from '@/lib/interpret/assemble';
import { canonPalaceName } from '@/lib/interpret/canon';
import type { Palace, Star, ZiweiChart } from '@/lib/engine';
import { STAR_BY_NAME } from '@/content/wiki/stars';
import { palaceEntryByName } from '@/content/wiki/palaces';

const CX = 420;
const CY = 420;
const R_OUT = 322;
const R_IN = 205;
const R_TICK = 341;
const R_LABEL = 372;
const R_BRANCH = 350;
const R_STAR = 263;

/** 地支双刻:zh 汉字 / en 拼音(en 站盘面刻字的本地化口径) */
const BRANCH_ZH = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const BRANCH_PINYIN = ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'];

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

export interface ChartBoardProps {
  chart: ZiweiChart;
  sections: ReadingSection[];
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
};

export function ChartBoard(props: ChartBoardProps): React.JSX.Element {
  const { chart, sections, locale, anchorKeys, palaceToDim, sameDays, famousMatch, unknownHour, shareUrl } = props;
  const t = useTranslations('chart');
  const [selected, setSelected] = useState<number>(-1); // 宫位 branch 索引(按命宫顺时针序为显示序)
  const [copied, setCopied] = useState(false);

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
    <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(300px,5fr)]">
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
            const stars = p.stars.filter((s) => s.type === 'major' || s.type === 'minor' || s.type === 'lucky' || s.type === 'sha').slice(0, 4);
            return (
              <g
                key={p.branch}
                role="button"
                tabIndex={0}
                aria-selected={isSelected}
                aria-label={`${p.name} ${branchName} ${stars.map((s) => s.name).join(' ')}`}
                className="cursor-pointer transition-opacity"
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
                  strokeWidth={isSelected ? 2 : 1}
                  className="transition-all duration-300 ease-qi hover:brightness-110"
                />
                <text x={f(nx)} y={f(ny + 7)} textAnchor="middle" className="fill-[var(--gold)] text-[22px] font-semibold" style={{ letterSpacing: '0.12em' }}>
                  {alias(p.name).replace('宫', '')}
                </text>
                <text x={f(bx)} y={f(by + 5)} textAnchor="middle" className="fill-[var(--muted-foreground)] text-[13px]">
                  {branchName}
                </text>
                {stars.map((s, j) => {
                  const off = (j - (stars.length - 1) / 2) * 8.4;
                  const [sx, sy] = pt(R_STAR, mid + off);
                  const isMajor = s.type === 'major';
                  return (
                    <g key={s.name}>
                      <circle
                        cx={f(sx)} cy={f(sy)} r={isMajor ? 7 : 4.2}
                        className="fill-[var(--gold)]"
                        style={{
                          filter: `drop-shadow(0 0 ${isMajor ? 6 : 3}px rgba(216,180,90,${isMajor ? 0.55 : 0.35}))`,
                          animation: `chartbreathe ${isMajor ? 4.5 : 5.5}s ease-in-out infinite`,
                        }}
                      />
                      <text x={f(sx)} y={f(sy + 22)} textAnchor="middle" className="fill-[var(--foreground)] text-[12.5px]">
                        {s.name}
                      </text>
                      {s.siHua && (
                        <>
                          <rect
                            x={f(sx - 3.4)} y={f(sy - 3.4 - (isMajor ? 15 : 12))} width={6.8} height={6.8}
                            transform={`rotate(45 ${f(sx)} ${f(sy - (isMajor ? 15 : 12))})`}
                            className="fill-[var(--cinnabar)]"
                            style={{ filter: 'drop-shadow(0 0 4px rgba(192,61,46,0.6))' }}
                          />
                          <text
                            x={f(sx)} y={f(sy - (isMajor ? 15 : 12) - 8)} textAnchor="middle"
                            className="fill-[color-mix(in_oklab,var(--cinnabar)_75%,white)] text-[11px] font-semibold"
                          >
                            {s.siHua}
                          </text>
                        </>
                      )}
                    </g>
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
                    <span>{s.name}</span>
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
    </div>
  );
}
