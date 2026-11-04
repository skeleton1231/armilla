'use client';

import { useTranslations } from 'next-intl';
import type { Star, ZiweiChart } from '@/lib/engine';
import { STAR_BY_NAME } from '@/content/wiki/stars';
import { canonPalaceName } from '@/lib/interpret/canon';
import { PALACE_BY_NAME } from '@/content/wiki/palaces';
import { Term } from '@/components/ui/Term';
import { GLOSSARY } from '@/content/glossary';

/** 亮度 8 档的英文短名(en 站显示) */
const BRIGHTNESS_EN: Record<string, string> = {
  '庙': 'radiant', '旺': 'strong', '得': 'favored', '利': 'able',
  '平': 'neutral', '不': 'weak', '闲': 'idle', '陷': 'fallen', '地': 'grounded',
};

interface Props { chart: ZiweiChart; locale: string; }

/**
 * 三问速写(T0-1):排盘后 30 秒内的顿悟时刻。
 * 三张卡:底色(命宫主星)/最亮三颗(全盘庙旺)/当前章节(大限结构预告,运限解读 v1.1)。
 * 纯确定性数据重组,不新增断言,符合"不作祸福断言"红线。
 */
export function ChartSnapshot({ chart, locale }: Props): React.JSX.Element | null {
  const t = useTranslations('chart');
  const zh = locale === 'zh';

  const alias = canonPalaceName;
  const palaceLabel = (name: string): string =>
    zh ? alias(name) : (PALACE_BY_NAME.get(alias(name))?.en ?? alias(name));
  const starLabel = (name: string): string =>
    zh ? name : (STAR_BY_NAME.get(name)?.en ?? name);

  const ming = chart.palaces.find((p) => p.isMingGong);
  if (!ming) return null;

  /* —— Q1 底色:命宫主星(空宫则借对宫,如实标注) —— */
  let q1: { star: Star | null; byName: string | null; borrowed: boolean } = {
    star: ming.stars.find((s) => s.type === 'major') ?? null,
    byName: null, borrowed: false,
  };
  if (!q1.star && ming.borrowedStars && ming.borrowedStars.length > 0) {
    q1 = { star: null, byName: ming.borrowedStars[0], borrowed: true };
  }
  const q1Name = q1.star?.name ?? q1.byName;
  const q1Entry = q1Name ? STAR_BY_NAME.get(q1Name) : undefined;
  const q1All = q1.star
    ? ming.stars.filter((s) => s.type === 'major')
    : (ming.borrowedStars ?? []).map((n) => ({ name: n })).slice(0, 2);

  /* —— Q2 最亮三颗:全盘庙/旺主星,庙优先 —— */
  const bright: { name: string; brightness: string; palace: string }[] = [];
  for (const p of chart.palaces) {
    for (const s of p.stars) {
      if (s.type === 'major' && (s.brightnessRaw === '庙' || s.brightnessRaw === '旺')) {
        bright.push({ name: s.name, brightness: s.brightnessRaw!, palace: p.name });
      }
    }
  }
  bright.sort((a, b) => (a.brightness === b.brightness ? 0 : a.brightness === '庙' ? -1 : 1));
  const q2 = bright.slice(0, 3);

  /* —— Q3 当前章节:当前大限(只给结构,解读 v1.1) —— */
  const dx = chart.daXians[chart.currentDaXianIndex];
  const dxPalace = dx ? chart.palaces.find((p) => p.branch === dx.palaceBranch) : undefined;
  const dxStars = dxPalace ? dxPalace.stars.filter((s) => s.type === 'major') : [];

  const card = 'rounded-[3px] border border-[var(--border)] bg-[var(--card)] p-5';
  const label = 'text-xs tracking-label text-[var(--muted-foreground)]';
  const num = 'mr-2 text-xs text-[var(--gold)]';

  return (
    <section className="mt-6">
      <h2 className="text-xs tracking-label text-[var(--muted-foreground)]">{t('snapTitle')}</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {/* Q1 */}
        <div className={card}>
          <p className={label}><span className={num}>01</span>{t('snap1Label')}</p>
          {q1Name ? (
            <>
              <p className="mt-2 text-lg font-semibold text-[var(--gold)]">
                {q1All.map((s, i) => (
                  <span key={s.name}>
                    {i > 0 && <span className="mx-1 text-sm font-normal">·</span>}
                    {starLabel(s.name)}
                  </span>
                ))}
                {q1.star?.brightnessRaw && (
                  <span className="ml-2 align-middle text-xs font-normal text-[var(--muted-foreground)]">
                    {zh ? q1.star.brightnessRaw : BRIGHTNESS_EN[q1.star.brightnessRaw]}
                  </span>
                )}
              </p>
              <p className="mt-1 text-xs leading-6 text-[var(--muted-foreground)]">
                {q1.borrowed ? t('snap1Borrowed') : t('snap1In')}
                {q1Entry ? (zh ? q1Entry.essence.zh : q1Entry.essence.en) : ''}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t('snap1None')}</p>
          )}
        </div>

        {/* Q2 */}
        <div className={card}>
          <p className={label}><span className={num}>02</span>{t('snap2Label')}</p>
          {q2.length > 0 ? (
            <ul className="mt-2 space-y-1.5">
              {q2.map((s) => (
                <li key={s.name} className="flex items-baseline justify-between text-sm">
                  <span className="font-semibold text-[var(--gold)]">{starLabel(s.name)}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {palaceLabel(s.palace)} · {zh ? s.brightness : BRIGHTNESS_EN[s.brightness]}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t('snap2None')}</p>
          )}
        </div>

        {/* Q3 */}
        <div className={card}>
          <p className={label}><span className={num}>03</span>{t('snap3Label')}</p>
          {dx && dxPalace ? (
            <>
              <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                {dx.startAge}–{dx.endAge}
                <span className="ml-2 text-sm font-normal text-[var(--muted-foreground)]">
                  {palaceLabel(dxPalace.name)}
                </span>
              </p>
              {dxStars.length > 0 && (
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {dxStars.map((s) => starLabel(s.name)).join(' · ')}
                </p>
              )}
              <p className="mt-2 border-t border-[var(--border)] pt-2 text-[11px] leading-5 text-[var(--muted-foreground)]/80">
                {t('snap3Note')}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t('snap3None')}</p>
          )}
        </div>
      </div>

      {/* 术语速查(T0-2):只列本盘出现的关键概念 + 通用四化 */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[11px] tracking-label text-[var(--muted-foreground)]">
          {t('glossaryTitle')}
        </span>
        {GLOSSARY.filter((g) => {
          if (['化禄', '化权', '化科', '化忌', '庙旺', '落陷', '命宫', '大限'].includes(g.zh)) return true;
          if (g.zh === '空宫借星') return ming.isEmpty;
          if (g.zh === '身宫') return chart.palaces.some((p) => p.isShenGong);
          return false;
        }).map((g) => (
          <Term key={g.zh} term={g} locale={locale} />
        ))}
      </div>
    </section>
  );
}
