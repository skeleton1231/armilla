/** 术语速查(T0-2):盘面高频术语的双语一句话解释,悬停即出 */
export interface GlossaryTerm {
  /** 显示名(zh) */
  zh: string;
  /** 显示名(en) */
  en: string;
  /** 一句话解释 */
  def: { zh: string; en: string };
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    zh: '化禄', en: 'Lu (Gain)',
    def: {
      zh: '四化之一:该年使这颗星偏向收获、机缘与资源的流动。',
      en: 'One of the four transformations: this year the star leans toward gain, openings and the flow of resources.',
    },
  },
  {
    zh: '化权', en: 'Quan (Authority)',
    def: {
      zh: '四化之一:该年使这颗星偏向主导、力度与掌控。',
      en: 'One of the four: this year the star leans toward command, force and control.',
    },
  },
  {
    zh: '化科', en: 'Ke (Renown)',
    def: {
      zh: '四化之一:该年使这颗星偏向名声、文书与贵人。',
      en: 'One of the four: this year the star leans toward reputation, documents and helpful people.',
    },
  },
  {
    zh: '化忌', en: 'Ji (Obsession)',
    def: {
      zh: '四化之一:该年使这颗星偏向执着、消耗与需要面对的课题。',
      en: 'One of the four: this year the star leans toward fixation, drain, and lessons that must be faced.',
    },
  },
  {
    zh: '庙旺', en: 'Radiant',
    def: {
      zh: '星曜落在最能发挥的位置,力量充分、色彩鲜明。',
      en: 'The star sits where it performs best — full strength, distinct color.',
    },
  },
  {
    zh: '落陷', en: 'Fallen',
    def: {
      zh: '星曜落在受制的位置,力量打折,需更多经营。',
      en: 'The star sits in a constrained seat — its strength discounted, needing more tending.',
    },
  },
  {
    zh: '空宫借星', en: 'Empty palace',
    def: {
      zh: '宫内无主星时,借对宫主星论断——底色来自对面,发力靠自己。',
      en: 'A palace with no major star borrows its reading from the opposite palace.',
    },
  },
  {
    zh: '命宫', en: 'Life Palace',
    def: {
      zh: '十二宫之首:性格、主轴与人生的基本盘。',
      en: 'The first palace: temperament, structure, the spine of a life.',
    },
  },
  {
    zh: '身宫', en: 'Body Palace',
    def: {
      zh: '后天着力点:越活越明显的那个自己。',
      en: 'Where effort lands: the self that grows more visible with living.',
    },
  },
  {
    zh: '大限', en: 'Decade',
    def: {
      zh: '每十年为一章的运势段落:盘面结构不变,聚光的宫位轮转。',
      en: 'A ten-year chapter: the chart stays fixed while the spotlight rotates.',
    },
  },
  {
    zh: '三方四正', en: 'Triad',
    def: {
      zh: '本宫与它最相关的三个宫位(对照+两夹角),合起来看一件事的完整格局。',
      en: 'A palace plus its three partners (opposite and two corners) — read together for the full picture.',
    },
  },
  {
    zh: '五行局', en: 'Element cycle',
    def: {
      zh: '排盘定局的基础(水二局、木三局等),决定大限起排的节奏。',
      en: 'The founding cycle (Water-2, Wood-3 …) that sets the rhythm of the decades.',
    },
  },
];
