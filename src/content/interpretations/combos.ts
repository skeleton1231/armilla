/**
 * 星×宫深度解读条目(T08 P0 层;T16 DoD:主体分庙旺/落陷 + 四化钩 4 句 + 内链 + source)
 * v1 先种入两条金样(T16 定稿),其余 166 条按此基准生产;未覆盖组合由 assemble 层
 * 以“星性 × 宫性”组合模板诚实兜底并明示为通用解读。
 */
export interface ComboEntry {
  star: string;        // 星曜名(十四主星)
  palace: string;      // 宫名(交友宫/仆役宫 归一为 交友宫)
  bright: { zh: string; en: string };   // 庙旺档主体
  dim: { zh: string; en: string };      // 落陷档主体
  sihua: Record<'禄' | '权' | '科' | '忌', { zh: string; en: string }>;
  source: string;
}

export const COMBOS: ComboEntry[] = [
  {
    star: '紫微', palace: '财帛宫',
    bright: {
      zh: '紫微入财帛,财随位至:进财多与职务、名望、事业规模相连,取财有道而格局大。庙旺时财库稳固、善守善用;落陷或煞会,则名大于利,排场开销随行。',
      en: 'Zi Wei in the Wealth Palace: income arrives with standing. Earnings follow office, enterprise, and reputation rather than opportunistic gain. Well-placed, the coffers hold and money is managed with authority; poorly placed, name outruns profit and spending rises to keep up appearances.',
    },
    dim: {
      zh: '紫微落陷入财帛,名大于利:收入与头衔挂钩,却常为场面所累——请客、置装、撑规格的支出如影随形。取财之道在先立专业之名,再图利,顺序不可颠倒。',
      en: 'Zi Wei poorly placed in wealth: title outweighs income. Pay is bound to position while the cost of presence — hosting, dress, standard — follows like a shadow. The way in is to establish professional name first and let profit follow; never the reverse.',
    },
    sihua: {
      禄: { zh: '进财顺遂,财源与声望相济。', en: 'Income flows; wealth and reputation feed each other.' },
      权: { zh: '财权一把抓,宜制度化理财。', en: 'Full hold on the purse; institutionalize the money management.' },
      科: { zh: '以名生财,收入与专业声誉挂钩。', en: 'Earning by name; income tracks professional standing.' },
      忌: { zh: '为体面所累,防大宗消费撑场面。', en: 'Spending to keep up appearances; beware big-ticket outlays for show.' },
    },
    source: 'T16 金样一(依据传统星情改写)',
  },
  {
    star: '天机', palace: '迁移宫',
    bright: {
      zh: '天机入迁移,动中取势:外出、异地、变动之局利于发展,心思机敏、见机而作。庙旺则他乡逢贵、越动越有;落陷则奔波漂泊,谋而后动可减反复。',
      en: 'Tian Ji in the Travel Palace: fortune favours movement. Relocation and change of scene tend to open the way; success comes from reading the moment. Well-placed, help appears away from home and each move builds on the last; poorly placed, drift and detours — plan before leaping.',
    },
    dim: {
      zh: '天机落陷入迁移,奔波多于收获:行程满、变动频,落地生根却难。宜定一地深耕,把“动脑”用在“动身”之前——每一次搬迁都要有明确的目的地,而非逃离感。',
      en: 'Tian Ji poorly placed in travel: motion exceeds harvest — full itineraries, frequent changes, thin roots. Best to fix on one place and dig deep, and put the thinking before the traveling: every move deserves a destination, not an escape.',
    },
    sihua: {
      禄: { zh: '外出得利,异乡机遇多。', en: 'Profit away from home; opportunity in other places.' },
      权: { zh: '在外掌局,主动求变。', en: 'Holding the reins abroad; initiate the change.' },
      科: { zh: '旅途平顺,贵人在外。', en: 'Smooth passages; patrons found afar.' },
      忌: { zh: '奔波徒劳,行前多算。', en: 'Toil on the road; calculate before departing.' },
    },
    source: 'T16 金样二(依据传统星情改写)',
  },
];

export const COMBO_KEY = (star: string, palace: string): string => `${star}@${palace}`;
export const COMBO_MAP = new Map(COMBOS.map((c) => [COMBO_KEY(c.star, c.palace), c]));

/* ———— T27:en 付费层组合条目(batch1 56 + batch2 112 = 168 满配)———— */
export type EnComboSource = { star: string; palace: string; bright: string; dim: string; sihua: Record<'禄' | '权' | '科' | '忌', string> };
export { EN_COMBOS_BATCH1 } from './combos-en.batch1';
export { EN_COMBOS_BATCH2 } from './combos-en.batch2';

import { EN_COMBOS_BATCH1 } from './combos-en.batch1';
import { EN_COMBOS_BATCH2 } from './combos-en.batch2';
export const EN_COMBO_MAP = new Map(
  [...EN_COMBOS_BATCH1, ...EN_COMBOS_BATCH2].map((c) => [COMBO_KEY(c.star, c.palace), c]),
);
