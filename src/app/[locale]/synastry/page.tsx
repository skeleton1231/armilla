import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { castChart, type ZiweiChart } from '@/lib/engine';
import { encodeChartParams, parseChartParams, type ChartQuery } from '@/lib/engine/params';
import { assembleSynastry, type SynastrySection } from '@/lib/interpret/synastry';
import type { Paragraph } from '@/lib/interpret/assemble';
import { STAR_BY_NAME } from '@/content/wiki/stars';
import { SynastryForm, SynastryShare } from '@/components/synastry/SynastryForm';
import type { Locale } from '@/i18n/routing';

/**
 * v1.1 合盘(两人合参):/?a=&b= 双生辰 → 双盘对照。
 * 结构与解读全部免费(裂变引擎);红线:不作合不合断言。
 */

/** 双参驱动页:显式退出预渲染(searchParams 阻断式渲染,Next 16 Cache Components) */
export const instant = false;

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'synastry' });
  return { title: t('metaTitle') };
}

function toQuery(s: string | string[] | undefined): ChartQuery {
  const sp = new URLSearchParams(Array.isArray(s) ? s[0] : (s ?? ''));
  const out: Record<string, string> = {};
  sp.forEach((v, k) => { out[k] = v; });
  return out;
}

const SOURCE_TAG: Record<Paragraph['source'], string> = {
  combo: 'comboTag', generic: 'genericTag', pattern: 'patternTag',
  sihua: 'sihuaTag', summary: 'summaryTag', dataset: 'datasetTag',
};

export default async function SynastryPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  const { locale } = await props.params;
  const search = await props.searchParams;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale, namespace: 'synastry' });
  const tc = await getTranslations({ locale, namespace: 'chart' });

  const pa = parseChartParams(toQuery(search.a));
  const pb = parseChartParams(toQuery(search.b));

  /* ———— 无/缺参数:双表单 ———— */
  if (!pa || !pb) {
    return (
      <div className="mx-auto max-w-4xl py-10">
        <h1 className="text-2xl font-semibold text-[var(--gold)]">{t('title')}</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">{t('intro')}</p>
        <div className="mt-6"><SynastryForm locale={locale} /></div>
      </div>
    );
  }

  /* ———— 双盘合参 ———— */
  const cast = (p: typeof pa): ZiweiChart =>
    castChart({ year: p.y, month: p.m, day: p.d, hour: p.h, gender: p.g === 'm' ? 'male' : 'female' });
  const reading = assembleSynastry(cast(pa), cast(pb), locale as Locale);

  const starLabel = (n: string): string =>
    locale === 'zh' ? n : (STAR_BY_NAME.get(n)?.en ?? n);

  const sectionLabels: Record<SynastrySection['key'], string> = {
    cores: t('coresLabel'),
    'seek-a': t('seekALabel'),
    'seek-b': t('seekBLabel'),
  };

  const SideCard = ({ who, stars, borrowed, essence }: { who: string; stars: string[]; borrowed: string[]; essence: string }): React.JSX.Element => (
    <div className="rounded-[3px] border border-[var(--border)] bg-[var(--card)] p-5">
      <p className="text-xs tracking-label text-[var(--muted-foreground)]">{who}</p>
      <p className="mt-2 text-lg font-semibold text-[var(--gold)]">
        {(stars.length > 0 ? stars : borrowed).map(starLabel).join(' · ') || t('noStar')}
        {stars.length === 0 && borrowed.length > 0 && (
          <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)]">({t('borrowedTag')})</span>
        )}
      </p>
      <p className="mt-1 text-xs leading-6 text-[var(--muted-foreground)]">{essence}</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[var(--gold)]">{t('title')}</h1>
        <SynastryShare label={t('share')} copied={t('copied')} />
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <SideCard who={t('you')} stars={reading.a.stars} borrowed={reading.a.borrowedStars} essence={reading.a.essence} />
        <SideCard who={t('them')} stars={reading.b.stars} borrowed={reading.b.borrowedStars} essence={reading.b.essence} />
      </div>

      <div className="mt-6 divide-y divide-[var(--border)] rounded-[3px] border border-[var(--border)] bg-[var(--card)]">
        {reading.sections.map((sec) => (
          <section key={sec.key} className="px-6 py-5">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">{sectionLabels[sec.key]}</h2>
            <div className="mt-3 space-y-3">
              {sec.paragraphs.map((p, k) => (
                <p key={k} className="text-[13px] leading-7 text-[color-mix(in_oklab,var(--foreground)_88%,var(--muted-foreground))]">
                  <span className="mr-2 inline-block rounded-full border border-[var(--border)] px-2 py-0.5 align-middle text-[10px] text-[var(--muted-foreground)]">
                    {tc(SOURCE_TAG[p.source])}
                  </span>
                  {p.text}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-4 text-xs leading-6 text-[var(--muted-foreground)]/80">{t('disclaimer')}</p>

      {/* 交叉导流:各自的完整报告 */}
      <div className="mt-5 flex flex-wrap gap-3">
        <a href={`/${locale}/chart?${encodeChartParams(pa)}`} className="text-sm text-[var(--gold)] underline-offset-4 hover:underline">
          → {t('viewYours')}
        </a>
        <a href={`/${locale}/chart?${encodeChartParams(pb)}`} className="text-sm text-[var(--gold)] underline-offset-4 hover:underline">
          → {t('viewTheirs')}
        </a>
      </div>
    </div>
  );
}
