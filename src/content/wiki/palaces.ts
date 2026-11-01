/** 十二宫双语词条(26 核心词条之另一部) */
export interface PalaceEntry {
  slug: string;
  name: string;
  en: string;
  /** 司掌一句 */
  domain: { zh: string; en: string };
  body: { zh: string; en: string };
}

export const PALACES: PalaceEntry[] = [
  {
    slug: 'ming', name: '命宫', en: 'Life Palace',
    domain: { zh: '你之所以为你:性情、格局、一生主轴', en: 'The self: temperament, structure, the spine of a life' },
    body: {
      zh: '命宫是全盘的枢纽,看人先看命宫——主星定性格底色,庙陷定发挥成色,四化定人生课题。命宫强,则诸宫之吉有主可承;命宫空(无主星),则借对宫之星立身,性情多面、际遇随境。它不决定你遇到什么,决定你怎么接。',
      en: 'The Life Palace is the pivot of the chart: read it first — its major stars set the temperament, their placement sets the polish, the transformations set the homework. A strong Life Palace gives every other fortune someone to answer to; an empty one borrows stars from across the wheel, and character turns many-sided. It decides not what you meet, but how you receive it.',
    },
  },
  {
    slug: 'xiongdi', name: '兄弟宫', en: 'Siblings Palace',
    domain: { zh: '手足、同辈、合伙之人', en: 'Siblings, peers, partners in venture' },
    body: {
      zh: '兄弟宫看手足缘分与同辈关系,现代亦引申为合伙人、同事圈。星吉则手足可倚、合伙有助力;星弱则各自飞、缘深情浅。此宫亦是你“平视世界”的镜子——与同辈如何相处,即你如何安放自己的位置。',
      en: 'The Siblings Palace reads siblings and equals — in modern use, business partners and close colleagues. Favorable stars, kin are a prop and partnerships hold; weak stars, paths diverge though feeling stays. This palace is also your level mirror: how you stand among peers is how you place yourself.',
    },
  },
  {
    slug: 'fuqi', name: '夫妻宫', en: 'Spouse Palace',
    domain: { zh: '婚姻、亲密关系与配偶画像', en: 'Marriage, intimacy, the portrait of a partner' },
    body: {
      zh: '夫妻宫描绘配偶的性情与两人相处的模式——主星是“你会遇到什么样的人”,四化是“这段关系教你什么”。星刚则聚少离多亦能成,星柔则平淡处见真情。看此宫忌问“何时结婚”,宜问“我该如何与人亲近”。',
      en: 'The Spouse Palace sketches a partner\'s nature and the mode of the bond — the major stars say whom you are likely to meet; the transformations say what the relationship is here to teach. Hard stars, distance still bonds; soft stars, devotion hides in the plain. Ask not "when will I marry" but "how do I let someone close."',
    },
  },
  {
    slug: 'zinv', name: '子女宫', en: 'Children Palace',
    domain: { zh: '子女、学生、创作之物', en: 'Children, students, works of one\'s own making' },
    body: {
      zh: '子女宫看子嗣缘分与相处,亦主“你生养的一切”——学生、作品、项目皆是此宫之物。星吉则子息有靠、创作有成;逢煞则教养费力、成果多磨。此宫问你:你留给世界的东西,打算怎么带出来。',
      en: 'The Children Palace reads offspring and the raising of them — and everything you bring to birth: students, works, ventures. Favorable stars, children are a stay and creations succeed; harsh stars, rearing takes effort and fruit comes slow. Its question: what will you leave the world, and how will you deliver it?',
    },
  },
  {
    slug: 'caibo', name: '财帛宫', en: 'Wealth Palace',
    domain: { zh: '赚钱方式与理财之性', en: 'How money is made and kept' },
    body: {
      zh: '财帛宫不看“有没有钱”,看“钱从哪来、怎么过手”——主星定取财之道,四化定财务课题。武曲天府善守成,贪狼巨门凭口才,太阴主细水长流。财宫弱未必穷,可能是“过手即散”的性子;财宫强也未必富,还要看命局成不成格。',
      en: 'The Wealth Palace says not whether you have money but where it comes from and how it passes through your hands — major stars set the way of earning, transformations set the financial lesson. Wu Qu and Tian Fu keep and grow; Tan Lang and Ju Men earn by word; Tai Yin accrues quietly. A weak wealth palace is not poverty — it may be a nature that lets money pass; a strong one is not wealth either, until the whole chart agrees.',
    },
  },
  {
    slug: 'jie', name: '疾厄宫', en: 'Health Palace',
    domain: { zh: '体质、情绪与身心功课', en: 'Constitution, mood, the homework of body and mind' },
    body: {
      zh: '疾厄宫看体质倾向与情绪底色——哪一脏器系统是薄弱环节,哪种情绪最容易积压成病。星刚多主劳损,星柔多主情志。此宫的现代读法是“使用说明”:不是断病,是提醒你什么要省着用。',
      en: 'The Health Palace reads constitutional tendency and the undertone of feeling — which system runs thin, which emotion silts into illness. Hard stars read as strain, soft stars as mood. In modern use this palace is the owner\'s manual: not a diagnosis, a reminder of what to use sparingly.',
    },
  },
  {
    slug: 'qianyi', name: '迁移宫', en: 'Travel Palace',
    domain: { zh: '出外、变动、异乡之运', en: 'The outside world: movement, change, far fields' },
    body: {
      zh: '迁移宫看离开原地之后的际遇——外出发展、换城市、跨界的运气都在此。星吉则动中得利、他乡遇贵;星弱则宜守本乡、动多波折。此宫与命宫相对:一个是“你是谁”,一个是“外面的世界接不接受你是谁”。',
      en: 'The Travel Palace reads what meets you away from home — the fortune of relocation, new cities, crossing lines. Favorable stars, motion pays and help appears far off; weak stars, staying power beats wandering. It faces the Life Palace across the wheel: one says who you are, the other whether the world outside receives it.',
    },
  },
  {
    slug: 'jiaoyou', name: '交友宫', en: 'Friends Palace',
    domain: { zh: '朋友、部属、人我之界', en: 'Friends, followers, the bounds of self and other' },
    body: {
      zh: '交友宫(古称仆役)看你吸引什么样的人环绕身边——挚友、顾客、下属皆在此。星吉则贵人如云、所托得人;逢煞则识人不明、为友所累。此宫亦是修罗场:你如何用人,即暴露你如何信人。',
      en: 'The Friends Palace (the old "servants" seat) shows what company gathers around you — confidants, customers, those who report to you. Favorable stars, allies abound and trust is repaid; harsh stars, judgment of character falters and friends cost. It is also an arena: how you use people reveals how you trust them.',
    },
  },
  {
    slug: 'guanlu', name: '官禄宫', en: 'Career Palace',
    domain: { zh: '事业、职位、成就之场', en: 'Vocation, position, the arena of achievement' },
    body: {
      zh: '官禄宫(事业宫)看职业性质与成就方式——宜体制还是市场、宜专才还是管理、宜稳扎还是开拓,主星组合皆有其象。它与命宫、财帛宫构成“三方四正”的铁三角:一个人怎么做事、怎么做人、怎么吃饭,三宫合看才见全貌。',
      en: 'The Career Palace reads the nature of work and the mode of achievement — institution or market, specialist or steward, steady hand or pioneer; the star combination carries the image. With the Life and Wealth palaces it forms the iron triangle of the chart: how one works, who one is, how one eats — read the three together or not at all.',
    },
  },
  {
    slug: 'tianzhai', name: '田宅宫', en: 'Estate Palace',
    domain: { zh: '家宅、不动产、根基之地', en: 'Home, property, where one is rooted' },
    body: {
      zh: '田宅宫看家运与不动产——置业能力、居住品质、家族根基皆属此宫。太阴天府入田宅多主置产有道;逢破军则多搬迁翻修。现代亦可读作“你的地盘”:工作室、团队、根据地,凡能安放身心的结构皆田宅。',
      en: 'The Estate Palace reads the household and what is held in land — capacity to acquire, quality of dwelling, the family\'s roots. Tai Yin or Tian Fu here marks a hand for property; Po Jun marks moves and renovations. In modern use, read it as your turf: the studio, the team, the base — any structure that holds a life.',
    },
  },
  {
    slug: 'fude', name: '福德宫', en: 'Spirit Palace',
    domain: { zh: '心境、趣味、精神生活', en: 'The inner weather: taste, ease, the life of the mind' },
    body: {
      zh: '福德宫看心境与精神享受——兴趣、品味、能否安顿自己。它是全盘的“底色滤镜”:同一际遇,福德佳者品出甘,福德弱者只尝到苦。此宫也与寿元相关,古人视之为暗盘之最。修福德,即修“没人看见时的自己”。',
      en: 'The Spirit Palace reads the inner weather — interest, taste, whether one can settle oneself. It is the chart\'s tinted glass: the same fortune tastes sweet through a good Spirit Palace, bitter through a weak one. The ancients also read longevity here, calling it the hidden chart. To cultivate it is to cultivate who you are when no one looks.',
    },
  },
  {
    slug: 'fumu', name: '父母宫', en: 'Parents Palace',
    domain: { zh: '双亲、长辈、庇荫与文书', en: 'Parents, elders, shelter and paperwork' },
    body: {
      zh: '父母宫看与双亲的缘分及长辈贵人的助力,古亦称“相貌宫”,兼主文书与公家之缘。星吉则亲荫可恃、逢事有长辈提携;逢煞则早离亲荫、自闯天地。此宫也是你的“来处”——看懂来处,才好谈去处。',
      en: 'The Parents Palace reads the bond with parents and the lift of elders — the old "countenance" seat, also governing documents and official favor. Favorable stars, family shelter holds and seniors raise you up; harsh stars, you leave the shelter early and carve your own. This palace is where you come from — and the going can only be discussed once the coming is understood.',
    },
  },
];

/** 引擎宫名 → 词条(引擎输出含“交友宫/仆役宫”等异写,统一归一) */
const ALIASES: Record<string, string> = { 仆役宫: '交友宫', 事业宫: '官禄宫', 福德宫: '福德宫' };

export const PALACE_BY_NAME = new Map(PALACES.map((p) => [p.name, p]));
export const PALACE_BY_SLUG = new Map(PALACES.map((p) => [p.slug, p]));

export function palaceEntryByName(name: string): PalaceEntry | undefined {
  return PALACE_BY_NAME.get(ALIASES[name] ?? name);
}
