import type { Metadata } from 'next';
import { cacheLife } from 'next/cache';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { castChart, type ZiweiChart } from '@/lib/engine';
import { lookupCity } from '@/lib/engine/cities';
import { encodeChartParams, parseChartParams, type ChartParams } from '@/lib/engine/params';
import { structureKey } from '@/lib/engine/structure';
import { loadSameStructure } from '@/lib/engine/sameStructureData';
import { assembleReading, buildEngineOnlySections, datasetParagraphs, DIMENSIONS, type AssembledReading, type ReadingSection } from '@/lib/interpret/assemble';
import { fetchDatasetReading } from '@/lib/dataset';
import { FAMOUS_PERSONS } from '@/content/famous';
import { ChartBoard, type FamousMatchInfo } from '@/components/chart/ChartBoard';

interface ChartBundle {
  chart: ZiweiChart;
  reading: AssembledReading;
  anchorKeys: string[];
  palaceToDim: Record<string, string>;
  sameDays: { count: number; years: { year: number; n: number }[]; window: { start: number; end: number } } | null;
  famousMatch: FamousMatchInfo[];
  datasetStatus: 'dataset' | 'outside' | 'unconfigured' | 'miss';
  locale: Locale;
}

/** T17/T20:整页按参数级缓存,部署即失效 */
async function getChartBundle(params: ChartParams, locale: Locale): Promise<ChartBundle> {
  'use cache';
  cacheLife('max');

  const city = lookupCity(params.city);
  const chart = castChart({
    year: params.y,
    month: params.m,
    day: params.d,
    hour: params.h,
    gender: params.g === 'm' ? 'male' : 'female',
    longitude: city?.longitude,
    city: city?.name,
  });

  // T24:zh 十三维正文 100% 来自数据集;en 走双语知识库(数据集无英文,T20)
  const dataset = await fetchDatasetReading({ y: params.y, m: params.m, d: params.d, h: params.h, g: params.g });
  let reading: AssembledReading;
  if (locale === 'zh') {
    if (dataset.status === 'dataset' && dataset.reading) {
      const sections: ReadingSection[] = [];
      const dims = dataset.reading.dims;
      for (const dim of DIMENSIONS) {
        const text = dims[dim.key as keyof typeof dims];
        if (!text) continue;
        const paragraphs = datasetParagraphs(text);
        if (dim.key === 'overview') {
          const patterns = assembleReading(chart, 'zh').patterns;
          for (const p of patterns.slice(0, 3)) {
            paragraphs.push({ text: `【${p.name}】${p.description}`, source: 'pattern' });
          }
        }
        sections.push({ key: dim.key, label: dim.label.zh, palaceName: dim.palace, paragraphs });
      }
      reading = { sections, patterns: assembleReading(chart, 'zh').patterns, coverage: { combos: 0, generic: 0 } };
    } else {
      reading = buildEngineOnlySections(chart);
    }
  } else {
    reading = assembleReading(chart, locale);
  }

  const palaceToDim: Record<string, string> = {};
  for (const dim of DIMENSIONS) {
    if (!palaceToDim[dim.palace]) palaceToDim[dim.palace] = dim.key;
  }

  // 同盘之日(T21:结构相同口径;索引未生成时该模块隐藏)
  const sameStructure = loadSameStructure();
  const key = structureKey(chart);
  let sameDays: ChartBundle['sameDays'] = null;
  if (sameStructure) {
    const all = sameStructure.index[key] ?? [];
    const yearsMap = new Map<number, number>();
    for (const entry of all) {
      const y = Number(entry.slice(0, 4));
      yearsMap.set(y, (yearsMap.get(y) ?? 0) + 1);
    }
    const years = [...yearsMap.entries()].map(([year, n]) => ({ year, n })).sort((a, b) => a.year - b.year);
    sameDays = {
      count: all.length,
      years,
      window: { start: sameStructure.meta.windowStart, end: sameStructure.meta.windowEnd },
    };
  }

  // 同盘名人
  const famousMatch: FamousMatchInfo[] = [];
  for (const person of FAMOUS_PERSONS) {
    try {
      const fChart = castChart({
        year: person.year,
        month: person.month,
        day: person.day,
        hour: person.hour,
        gender: person.gender,
      });
      if (structureKey(fChart) === key) {
        famousMatch.push({ name: locale === 'zh' ? person.name : person.nameEn, notable: locale === 'zh' ? person.notable : person.notableEn });
      }
    } catch {
      // 名人数据个别日期无效则跳过
    }
  }

  return {
    chart,
    reading,
    anchorKeys: DIMENSIONS.filter((d) => d.anchor).map((d) => d.key),
    palaceToDim,
    sameDays,
    famousMatch,
    datasetStatus: dataset.status,
    locale,
  };
}

/** T17:本页按参数动态 SSR(数据层走 'use cache' 参数级缓存);Cache Components 模型下显式允许阻塞渲染 */
export const instant = false;

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const search = await props.searchParams;
  const params = parseChartParams(search);
  const t = await getTranslations({ locale, namespace: 'chart' });
  if (!params) return { title: t('title') };
  return {
    title: `${params.y}-${params.m}-${params.d} · ${t('title')}`,
    openGraph: {
      images: [{
        url: `/api/og?y=${params.y}&m=${params.m}&d=${params.d}&h=${params.h}&locale=${locale}`,
        width: 1200, height: 630,
      }],
    },
    robots: { index: false }, // 参数空间不入 sitemap(T12),由分享与内链发现
  };
}

export default async function ChartPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  const { locale } = await props.params;
  const search = await props.searchParams;
  const params = parseChartParams(search);
  if (!params) {
    // 无效/越界参数 → 回首页表单(T05);redirect 内部 throw,此处不可达
    redirect({ href: '/', locale });
    throw new Error('unreachable: redirect throws');
  }
  setRequestLocale(locale as Locale);

  const t = await getTranslations('chart');
  const bundle = await getChartBundle(params, locale as Locale);
  const zh = locale === 'zh';

  const shareUrl =
    typeof window === 'undefined'
      ? `/${locale}/chart?${encodeChartParams(params)}`
      : window.location.href;

  return (
    <div className="py-10">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-xs tracking-label text-[var(--muted-foreground)]">{t('title')}</p>
          <h1 className="mt-1 text-2xl font-semibold">
            {bundle.chart.birthInfo.year} · {bundle.chart.birthInfo.month} · {bundle.chart.birthInfo.day}
            <span className="ml-3 text-sm font-normal text-[var(--muted-foreground)]">
              {bundle.chart.wuxingJuName} · {zh ? '命主' : 'Life lord'} {bundle.chart.mingZhu ?? '—'} · {zh ? '身主' : 'Body lord'} {bundle.chart.shenZhu ?? '—'}
            </span>
          </h1>
        </div>
      </div>

      {bundle.datasetStatus !== 'dataset' && (
        <p className="mb-6 rounded-[3px] border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-xs leading-6 text-[var(--muted-foreground)]">
          {bundle.datasetStatus === 'outside'
            ? t('datasetNotice', { start: bundle.sameDays?.window.start ?? 1950, end: bundle.sameDays?.window.end ?? 2026 })
            : t('kbNotice')}
        </p>
      )}

      <ChartBoard
        chart={bundle.chart}
        sections={bundle.reading.sections}
        locale={locale}
        anchorKeys={bundle.anchorKeys}
        palaceToDim={bundle.palaceToDim}
        sameDays={bundle.sameDays}
        famousMatch={bundle.famousMatch}
        unknownHour={params.u === 1}
        shareUrl={shareUrl}
      />
    </div>
  );
}
