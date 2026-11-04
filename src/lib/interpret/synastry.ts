import 'server-only';

import type { Locale } from '@/i18n/routing';
import type { Palace, ZiweiChart } from '@/lib/engine';
import { canonPalaceName } from '@/lib/interpret/canon';
import { comboParagraph, genericStarParagraph, type Paragraph } from '@/lib/interpret/assemble';
import { STAR_BY_NAME } from '@/content/wiki/stars';

/**
 * v1.1 合盘(两人合参):确定性结构对照,知识库来源,逐段标源。
 * 红线:只呈现"你期待的星曜结构 vs TA 实际的星曜结构"的传统星情,
 * 不作"合/不合、配/不配"的吉凶断言。
 */

export interface SynastrySide {
  /** 命宫主星(空宫为空数组,借星见 borrowedStars) */
  stars: string[];
  borrowedStars: string[];
  /** 一句星性(多星拼接) */
  essence: string;
}

export interface SynastrySection {
  key: 'cores' | 'seek-a' | 'seek-b';
  paragraphs: Paragraph[];
}

export interface SynastryReading {
  a: SynastrySide;
  b: SynastrySide;
  sections: SynastrySection[];
}

function pick(locale: Locale, pair: { zh: string; en: string }): string {
  return locale === 'zh' ? pair.zh : pair.en;
}

function sideOf(chart: ZiweiChart, locale: Locale): SynastrySide {
  const ming = chart.palaces.find((p) => p.isMingGong) as Palace | undefined;
  const own = ming ? ming.stars.filter((s) => s.type === 'major').map((s) => s.name) : [];
  const borrowed = ming?.isEmpty ? (ming.borrowedStars ?? []) : [];
  const names = own.length > 0 ? own : borrowed;
  const essence = names
    .map((n) => STAR_BY_NAME.get(n))
    .filter(Boolean)
    .slice(0, 2)
    .map((e) => pick(locale, e!.essence))
    .join(locale === 'zh' ? ';' : '; ');
  return {
    stars: own,
    borrowedStars: borrowed,
    essence: essence || (locale === 'zh' ? '命宫无主星,借对宫立论。' : 'An empty Life Palace, read by its opposite.'),
  };
}

export function assembleSynastry(
  chartA: ZiweiChart,
  chartB: ZiweiChart,
  locale: Locale,
): SynastryReading {
  const a = sideOf(chartA, locale);
  const b = sideOf(chartB, locale);

  const fuqi = (chart: ZiweiChart): { stars: string[]; borrowed: string[]; paragraphs: Paragraph[] } => {
    const p = chart.palaces.find((x) => canonPalaceName(x.name) === '夫妻宫');
    const stars = p ? p.stars.filter((s) => s.type === 'major').map((s) => s.name) : [];
    const borrowed = p?.isEmpty ? (p.borrowedStars ?? []) : [];
    const list = stars.length > 0 ? stars : borrowed;
    const paragraphs: Paragraph[] = list
      .slice(0, 2)
      .map((n) => comboParagraph(n, '夫妻宫', true, locale) ?? genericStarParagraph(n, '夫妻宫', locale));
    if (list.length === 0) {
      paragraphs.push({
        text: locale === 'zh'
          ? '夫妻宫无主星:对亲密关系的想象不落于一格,更多随相处对象与阶段而塑形。'
          : 'An empty Marriage Palace: the image of intimacy is not fixed to one seat, but shaped by partner and season.',
        source: 'generic',
      });
    }
    return { stars, borrowed, paragraphs };
  };

  const fqA = fuqi(chartA);
  const fqB = fuqi(chartB);

  /* ———— 01 性格底色对照 ———— */
  const cores: Paragraph[] = [
    {
      text: locale === 'zh'
        ? `你的底色:${a.essence}`
        : `Your core: ${a.essence}`,
      source: 'generic',
    },
    {
      text: locale === 'zh'
        ? `TA 的底色:${b.essence}`
        : `Their core: ${b.essence}`,
      source: 'generic',
    },
    {
      text: locale === 'zh'
        ? '两张底色如何相处,没有标准答案;下面的结构对照提供的是"各自带着什么进场",不是判决书。'
        : 'How two cores get along has no standard answer; the comparisons below show what each brings in — not a verdict.',
      source: 'summary',
    },
  ];

  /* ———— 02 你期待的亲密(A 夫妻宫 × B 命宫) ———— */
  const seekA: Paragraph[] = [
    {
      text: locale === 'zh'
        ? `你的夫妻宫坐 ${fqA.stars.join('、') || '无主星(借对宫)'}——这是你在亲密关系里倾向遇到的星曜结构;而 TA 的命宫坐 ${b.stars.join('、') || '无主星(借对宫)'}。两列星曜的异同,以下述传统星情为参照。`
        : `Your Marriage Palace hosts ${fqA.stars.join(' / ') || 'no major star (borrowed)'} — the structure you tend to meet in intimacy; their Life Palace hosts ${b.stars.join(' / ') || 'no major star (borrowed)'}. Compare by the traditional star lore below.`,
      source: 'summary',
    },
    ...fqA.paragraphs,
  ];

  /* ———— 03 TA 期待的亲密(B 夫妻宫 × A 命宫) ———— */
  const seekB: Paragraph[] = [
    {
      text: locale === 'zh'
        ? `TA 的夫妻宫坐 ${fqB.stars.join('、') || '无主星(借对宫)'};而你的命宫坐 ${a.stars.join('、') || '无主星(借对宫)'}。同一份参照,方向反过来读。`
        : `Their Marriage Palace hosts ${fqB.stars.join(' / ') || 'no major star (borrowed)'}; your Life Palace hosts ${a.stars.join(' / ') || 'no major star (borrowed)'}. Same reference, read in reverse.`,
      source: 'summary',
    },
    ...fqB.paragraphs,
  ];

  return {
    a, b,
    sections: [
      { key: 'cores', paragraphs: cores },
      { key: 'seek-a', paragraphs: seekA },
      { key: 'seek-b', paragraphs: seekB },
    ],
  };
}
