import 'server-only';

import type { Locale } from '@/i18n/routing';
import type { ZiweiChart } from '@/lib/engine';
import { canonPalaceName } from '@/lib/interpret/canon';
import { comboParagraph, genericStarParagraph, type Paragraph } from '@/lib/interpret/assemble';
import { SIHUA_HOOKS } from '@/content/interpretations/sihua';
import { getDaXianSiHua, getSiHuaByStem } from '@/lib/ziwei/sihua';
import { getDaXianStartYear, getChildhoodYears } from '@/lib/ziwei/yunxian-context';

/**
 * T-v1.1 运限解读组装(大限/流年)。
 * 红线:运限不在数据集覆盖内 → 全部走引擎结构 + 知识库(combo/generic/sihua 钩),
 * 逐段明示来源;结构可见免费,正文随 $9.99 买断解锁(上线后可再拆分 SKU)。
 */

export interface YunxianDecade {
  index: number;
  startAge: number;
  endAge: number;
  /** 起始农历年(约等于公历年,UI 注明按农历口径) */
  startYear: number;
  endYear: number;
  palaceBranch: number;
  palaceName: string;
  /** 大限宫主星(空宫为空数组,借星见 borrowedStars) */
  stars: string[];
  borrowedStars: string[];
  /** 宫干四化:各化落星名 */
  siHua: { lu: string; quan: string; ke: string; ji: string } | null;
  paragraphs: Paragraph[];
}

/** 流年宫(地支索引 0-11)的预组装段落 */
export interface YunxianBranchReading {
  branch: number;
  palaceName: string;
  stars: string[];
  borrowedStars: string[];
  paragraphs: Paragraph[];
}

export interface YunxianReading {
  decades: YunxianDecade[];
  childhood: { years: number[] } | null;
  byBranch: YunxianBranchReading[];
  /** 年干四化预计算(stem 索引 0-9 → 四化落星);客户端按 ((year-4)%10) 纯查表,
   *  避免客户端 import sihua.ts(其传递依赖 lunar-javascript 会撑爆 JS 预算) */
  yearSihuaByStem: Array<{ lu: string; quan: string; ke: string; ji: string }>;
}

const pick = (locale: Locale, pair: { zh: string; en: string }): string =>
  locale === 'zh' ? pair.zh : pair.en;

function starsOf(palace: { stars: { type: string; name: string }[] }): string[] {
  return palace.stars.filter((s) => s.type === 'major').map((s) => s.name);
}

/** 星曜×宫位段落(combo 优先,知识库诚实兜底) */
function starParagraphs(starNames: string[], palaceName: string, locale: Locale): Paragraph[] {
  const out: Paragraph[] = [];
  for (const name of starNames.slice(0, 2)) {
    const combo = comboParagraph(name, palaceName, true, locale);
    out.push(combo ?? genericStarParagraph(name, palaceName, locale));
  }
  return out;
}

/** 四化钩段落:「化禄会紫微:…」 */
function siHuaParagraphs(
  si: { lu: string; quan: string; ke: string; ji: string },
  locale: Locale,
): Paragraph[] {
  const marks: Array<[keyof typeof si, '禄' | '权' | '科' | '忌']> = [
    ['lu', '禄'], ['quan', '权'], ['ke', '科'], ['ji', '忌'],
  ];
  return marks.map(([field, mark]) => ({
    text: locale === 'zh'
      ? `化${mark}会${si[field]}:${SIHUA_HOOKS[mark].zh}`
      : `${si[field]} takes ${mark} (Lu/Quan/Ke/Ji #${mark}): ${SIHUA_HOOKS[mark].en}`,
    source: 'sihua' as const,
  }));
}

export function assembleYunxian(chart: ZiweiChart, locale: Locale): YunxianReading {
  /* ———— 十二大限 ———— */
  const decades: YunxianDecade[] = chart.daXians.map((dx, index) => {
    const palace = chart.palaces.find((p) => p.branch === dx.palaceBranch);
    const canonical = palace ? canonPalaceName(palace.name) : dx.palaceName;
    const own = palace ? starsOf(palace) : [];
    const borrowed = palace?.isEmpty ? (palace.borrowedStars ?? []) : [];
    const startYear = getDaXianStartYear(chart, index) ?? 0;

    /* castChart 不填 DaXian.siHua → 统一由 getDaXianSiHua(宫干)现算 */
    const built = getDaXianSiHua(chart, index);
    const si = dx.siHua ?? (built ? { lu: built.transforms['禄'], quan: built.transforms['权'], ke: built.transforms['科'], ji: built.transforms['忌'] } : null);

    const paragraphs: Paragraph[] = [];
    paragraphs.push({
      text: locale === 'zh'
        ? `${dx.startAge}–${dx.endAge} 岁的十年,聚光灯移到${canonical.replace('宫', '')}:${borrowed.length > 0 && own.length === 0 ? '此宫无主星,借对宫之势立论' : '此宫星曜成为十年主线'}。以下为传统星情的结构化转述,不作祸福断言。`
        : `Ages ${dx.startAge}–${dx.endAge}: the spotlight moves to the ${canonical.replace('宫', '')} palace${own.length === 0 && borrowed.length > 0 ? ' (empty, borrowing from opposite)' : ''}. Below is a structural retelling of traditional star lore — no fortune verdicts.`,
      source: 'summary',
    });
    paragraphs.push(...starParagraphs(own.length > 0 ? own : borrowed, canonical, locale));
    if (si) {
      paragraphs.push(...siHuaParagraphs(si, locale));
    }

    return {
      index,
      startAge: dx.startAge,
      endAge: dx.endAge,
      startYear,
      endYear: startYear + (dx.endAge - dx.startAge),
      palaceBranch: dx.palaceBranch,
      palaceName: canonical,
      stars: own,
      borrowedStars: borrowed,
      siHua: si,
      paragraphs,
    };
  });

  /* ———— 流年十二宫(按地支预组装;流年四化由客户端按年干现算) ———— */
  const byBranch: YunxianBranchReading[] = chart.palaces.map((p) => {
    const canonical = canonPalaceName(p.name);
    const own = starsOf(p);
    const borrowed = p.isEmpty ? (p.borrowedStars ?? []) : [];
    const paragraphs: Paragraph[] = starParagraphs(own.length > 0 ? own : borrowed, canonical, locale);
    if (paragraphs.length === 0) {
      paragraphs.push({
        text: locale === 'zh'
          ? '此宫无主星,流年行至此,以对宫与三方星情参看。'
          : 'No major star here; a year passing this seat is read through the opposite and triad palaces.',
        source: 'generic',
      });
    }
    return { branch: p.branch, palaceName: canonical, stars: own, borrowedStars: borrowed, paragraphs };
  });

  const childhoodYears = getChildhoodYears(chart);

  /* 年干四化(0-9 天干预计算,甲=0) */
  const yearSihuaByStem = Array.from({ length: 10 }, (_, stem) => {
    const raw = getSiHuaByStem(stem);
    return { lu: raw['禄'], quan: raw['权'], ke: raw['科'], ji: raw['忌'] };
  });

  return {
    decades,
    childhood: childhoodYears.length > 0 ? { years: childhoodYears } : null,
    byBranch,
    yearSihuaByStem,
  };
}

export { pick as __pick };
