import 'server-only';
import type { Locale } from '@/i18n/routing';
import type { Palace, ZiweiChart } from '@/lib/engine';
import { detectPatterns, getMingGongSummary } from '@/lib/ziwei/patterns';
import { STAR_BY_NAME } from '@/content/wiki/stars';
import { palaceEntryByName } from '@/content/wiki/palaces';
import { COMBO_MAP } from '@/content/interpretations/combos';
import { SIHUA_HOOKS } from '@/content/interpretations/sihua';
import { canonPalaceName } from './canon';

export { canonPalaceName };

/** T19 十三维:键 ↔ 宫位 ↔ 中英标签 */
export interface DimMeta {
  key: string;
  palace: string; // 引擎宫名(归一后)
  label: { zh: string; en: string };
  anchor: boolean; // 重点 4 维(默认展开)
}

export const DIMENSIONS: DimMeta[] = [
  { key: 'overview', palace: '命宫', anchor: true, label: { zh: '命格总览', en: 'Overview' } },
  { key: 'personality', palace: '命宫', anchor: true, label: { zh: '性格特质', en: 'Personality' } },
  { key: 'love', palace: '夫妻宫', anchor: true, label: { zh: '感情婚姻', en: 'Love & Marriage' } },
  { key: 'career', palace: '官禄宫', anchor: true, label: { zh: '事业职业', en: 'Career' } },
  { key: 'wealth', palace: '财帛宫', anchor: true, label: { zh: '财富运势', en: 'Wealth' } },
  { key: 'health', palace: '疾厄宫', anchor: false, label: { zh: '健康状况', en: 'Health' } },
  { key: 'family', palace: '兄弟宫', anchor: false, label: { zh: '兄弟合伙', en: 'Siblings & Partners' } },
  { key: 'children', palace: '子女宫', anchor: false, label: { zh: '子女缘分', en: 'Children' } },
  { key: 'move', palace: '迁移宫', anchor: false, label: { zh: '迁移外出', en: 'Relocation' } },
  { key: 'friends', palace: '交友宫', anchor: false, label: { zh: '人际贵人', en: 'Friends & Patrons' } },
  { key: 'home', palace: '田宅宫', anchor: false, label: { zh: '田宅不动产', en: 'Home & Estate' } },
  { key: 'spirit', palace: '福德宫', anchor: false, label: { zh: '精神福德', en: 'Spirit' } },
  { key: 'parents', palace: '父母宫', anchor: false, label: { zh: '父母长辈', en: 'Parents' } },
];

export type ParagraphSource = 'combo' | 'sihua' | 'generic' | 'pattern' | 'summary' | 'dataset';

export interface Paragraph {
  text: string;
  source: ParagraphSource;
}

export interface ReadingSection {
  key: string;
  label: string;
  palaceName: string;
  paragraphs: Paragraph[];
}

export interface AssembledReading {
  sections: ReadingSection[];
  patterns: { name: string; description: string }[];
  coverage: { combos: number; generic: number };
}

const pick = (locale: Locale, pair: { zh: string; en: string }): string =>
  locale === 'zh' ? pair.zh : pair.en;

const BRIGHT_SET = new Set(['庙', '旺', '得', '利']);

/** 引擎宫名归一:见 ./canon */
function palaceByName(chart: ZiweiChart, name: string): Palace | undefined {
  const target = canonPalaceName(name);
  return chart.palaces.find((p) => canonPalaceName(p.name) === target);
}

function majorStars(palace: Palace | undefined): Palace['stars'] {
  if (!palace) return [];
  const own = palace.stars.filter((s) => s.type === 'major');
  if (own.length > 0) return own;
  return []; // 空宫:借星由 generic 段说明
}

function comboParagraph(
  starName: string,
  palaceName: string,
  bright: boolean,
  locale: Locale,
): Paragraph | null {
  const combo = COMBO_MAP.get(`${starName}@${palaceName}`);
  if (!combo) return null;
  return { text: pick(locale, bright ? combo.bright : combo.dim), source: 'combo' };
}

function genericStarParagraph(
  starName: string,
  palaceName: string,
  locale: Locale,
): Paragraph {
  const star = STAR_BY_NAME.get(starName);
  const palace = palaceEntryByName(palaceName);
  if (star && palace) {
    return locale === 'zh'
      ? { text: `${star.name}入${palace.name.replace('宫', '')}宫:${star.essence.zh},落于${palace.domain.zh}之位。${star.body.zh.split('。')[0]}。`, source: 'generic' }
      : { text: `${star.en} in the ${palace.en}: ${star.essence.en}, seated in the domain of ${palace.domain.en.toLowerCase()}. ${star.body.en.split('. ')[0]}.`, source: 'generic' };
  }
  return locale === 'zh'
    ? { text: `${starName}坐${palaceName},依传统星情参断。`, source: 'generic' }
    : { text: `${starName} in the ${palaceName}, read by traditional star lore.`, source: 'generic' };
}

export function assembleReading(chart: ZiweiChart, locale: Locale): AssembledReading {
  const sections: ReadingSection[] = [];
  let combos = 0;
  let generic = 0;

  // 命格总览(overview):格局(zh)+ 命宫摘要(zh);en 用星性合成
  const overviewParagraphs: Paragraph[] = [];
  const patterns = detectPatterns(chart).map((p) => ({
    name: p.name,
    description: p.description ?? '',
  }));
  if (locale === 'zh') {
    const s = getMingGongSummary(chart);
    const kw = s.keywords.slice(0, 6).join('、');
    overviewParagraphs.push({
      text: `${s.nature}。命宫主星:${s.stars.join('、') || '无(借对宫)'}。格局关键词:${kw || '—'}。`,
      source: 'summary',
    });
    for (const p of patterns.slice(0, 3)) {
      overviewParagraphs.push({ text: `【${p.name}】${p.description}`, source: 'pattern' });
    }
  } else {
    const ming = palaceByName(chart, '命宫');
    for (const s of majorStars(ming).slice(0, 2)) {
      const star = STAR_BY_NAME.get(s.name);
      if (star) overviewParagraphs.push({ text: `${star.en}: ${star.essence.en}. ${star.body.en}`, source: 'generic' });
    }
    if (patterns.length > 0) {
      overviewParagraphs.push({
        text: `Named configurations detected: ${patterns.slice(0, 3).map((p) => p.name).join(', ')} (explanations currently in Chinese).`,
        source: 'pattern',
      });
    }
  }
  if (overviewParagraphs.length === 0) {
    overviewParagraphs.push(
      locale === 'zh'
        ? { text: '命宫无主星,借对宫之星立身:性情多面,际遇随境而转。', source: 'generic' }
        : { text: 'An empty Life Palace borrows stars from across the wheel: a many-sided nature, fortunes that turn with the scene.', source: 'generic' },
    );
  }
  sections.push({ key: 'overview', label: pick(locale, DIMENSIONS[0].label), palaceName: '命宫', paragraphs: overviewParagraphs });

  // 其余 12 维(命宫在 personality 重复使用命宫数据)
  for (const dim of DIMENSIONS.slice(1)) {
    const palace = palaceByName(chart, dim.palace);
    const paragraphs: Paragraph[] = [];
    const majors = majorStars(palace);
    const aliasName = palace ? canonPalaceName(palace.name) : dim.palace;

    if (majors.length === 0) {
      const borrowed = palace?.borrowedStars ?? [];
      const palaceEntry = palaceEntryByName(aliasName);
      if (borrowed.length > 0) {
        paragraphs.push(
          locale === 'zh'
            ? { text: `${aliasName}无主星,借对宫${palace?.borrowedFromName ?? ''}之${borrowed.join('、')}参断:`, source: 'generic' }
            : { text: `No major star here; borrowed from opposite palace (${borrowed.join(', ')}):`, source: 'generic' },
        );
        for (const b of borrowed.slice(0, 2)) paragraphs.push(genericStarParagraph(b, aliasName, locale));
      } else {
        paragraphs.push(
          locale === 'zh'
            ? { text: `${aliasName}无主星,以宫性参断:${palaceEntry ? palaceEntry.domain.zh : ''}。`, source: 'generic' }
            : { text: `No major star; read by palace nature alone${palaceEntry ? `: ${palaceEntry.domain.en}` : ''}.`, source: 'generic' },
        );
      }
    }
    for (const s of majors) {
      const bright = !s.brightnessRaw || BRIGHT_SET.has(s.brightnessRaw);
      const combo = comboParagraph(s.name, aliasName, bright, locale);
      if (combo) { combos++; paragraphs.push(combo); }
      else { generic++; paragraphs.push(genericStarParagraph(s.name, aliasName, locale)); }
      if (s.siHua) {
        const hook = SIHUA_HOOKS[s.siHua];
        paragraphs.push({ text: pick(locale, { zh: `${s.name}${hook.zh}`, en: `${s.name} ${hook.en}` }), source: 'sihua' });
      }
    }
    if (paragraphs.length === 0) {
      paragraphs.push(
        locale === 'zh' ? { text: '此宫暂无星曜坐守,依三方四正会照参断。', source: 'generic' }
                        : { text: 'No star seated here; read through the facing trine.', source: 'generic' },
      );
    }
    sections.push({ key: dim.key, label: pick(locale, dim.label), palaceName: aliasName, paragraphs });
  }

  return { sections, patterns, coverage: { combos, generic } };
}

/**
 * T24:zh 站「引擎-only」解读(数据集窗口外/未命中时)。
 * 只含上游引擎产物(命宫摘要 + 格局识别),不用自产星性段落填充;
 * 12 个宫位维度整体缺省,由页面提示"不在数据集覆盖范围"。
 */
export function buildEngineOnlySections(chart: ZiweiChart): AssembledReading {
  const patterns = detectPatterns(chart).map((p) => ({ name: p.name, description: p.description ?? '' }));
  const s = getMingGongSummary(chart);
  const overview: Paragraph[] = [
    {
      text: `${s.nature}。命宫主星:${s.stars.join('、') || '无(借对宫)'}。格局关键词:${s.keywords.slice(0, 6).join('、') || '—'}。`,
      source: 'summary',
    },
    ...patterns.slice(0, 5).map((p) => ({ text: `【${p.name}】${p.description}`, source: 'pattern' as const })),
  ];
  return {
    sections: [{ key: 'overview', label: DIMENSIONS[0].label.zh, palaceName: '命宫', paragraphs: overview }],
    patterns,
    coverage: { combos: 0, generic: 0 },
  };
}

/** 数据集 Markdown 行 → 段落(**粗体** 行去标记,空行剔除) */
export function datasetParagraphs(text: string): Paragraph[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => ({
      text: l.replace(/^\*\*(.+?)\*\*$/, '$1').replace(/\*\*(.+?)\*\*/g, '$1'),
      source: 'dataset' as const,
    }));
}
