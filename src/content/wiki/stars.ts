/** 十四主星双语词条(T08/T05:26 核心词条之一部;语气循钦天监基准,禁祸福断言) */
export interface StarEntry {
  slug: string;
  name: string;
  en: string;
  /** 星性一句(定位) */
  essence: { zh: string; en: string };
  /** 展开 60–110 字 */
  body: { zh: string; en: string };
}

export const MAIN_STARS: StarEntry[] = [
  {
    slug: 'ziwei', name: '紫微', en: 'Zi Wei',
    essence: { zh: '帝座,北斗主星,主尊贵与主导', en: 'The Emperor star: sovereignty and command' },
    body: {
      zh: '紫微为十四主星之首,象帝王坐朝:主见强、格局意识重,天然倾向做决定而非跟随。庙旺则气度沉稳、能任事;落陷或无辅曜,则易孤高自许。看紫微,先看它的左右——有百官朝拱是明君,无辅是独夫,同一颗星境遇两判。',
      en: 'Zi Wei heads the fourteen major stars, the sovereign on the throne: strong opinions, a taste for structure, a natural inclination to decide rather than follow. Well-placed, it grants composure and capacity; poorly placed or unattended by minister stars, it turns self-important. Read Zi Wei by its company — with ministers in attendance an enlightened ruler, without them a solitary one.',
    },
  },
  {
    slug: 'tianji', name: '天机', en: 'Tian Ji',
    essence: { zh: '智多星,主谋略与机变', en: 'The Strategist: counsel and adaptability' },
    body: {
      zh: '天机主智慧与企划,反应快、善分析,是天生的幕僚与军师。其才在动脑不在动手,宜参谋、研究、教学、策划一路。庙旺则谋定后动、点子成金;落陷则心思过转、多虑善变。天机之要,在给思考找一个落地的出口。',
      en: 'Tian Ji governs intellect and planning: quick, analytical, a born advisor. Its gift is for thinking rather than doing — suited to counsel, research, teaching, and design. Well-placed, plans mature into gold; poorly placed, the mind over-rotates into worry. The task for Tian Ji is giving thought a place to land.',
    },
  },
  {
    slug: 'taiyang', name: '太阳', en: 'Tai Yang',
    essence: { zh: '日主,主光明、付出与父辈贵人', en: 'The Sun: illumination, giving, patronage' },
    body: {
      zh: '太阳主博爱与施予,像日光普照——热情、公开、照顾他人先于自己。庙旺(尤其昼生)则声名外显、劳而有功;落陷或夜生,则付出多回报少,宜收敛战线、光照一处。太阳之课,是学会为自己留一盏灯。',
      en: 'Tai Yang stands for benevolence and giving, sunlight that shines on all — warm, public, others before self. Well-placed (especially by day), repute shines and toil bears fruit; poorly placed or night-born, giving outruns return, and the light is best narrowed to one field. Its lesson: keep one lamp for yourself.',
    },
  },
  {
    slug: 'wuqu', name: '武曲', en: 'Wu Qu',
    essence: { zh: '财星,主决断与执行', en: 'The Treasurer: decisiveness and execution' },
    body: {
      zh: '武曲为财帛主星,性刚直、重实效,说到做到,是天生的执行者与理财手。庙旺则开拓有成、财权在握;落陷或逢煞,则过刚易折、只认数字不认人。武曲之利在快,之戒也在快——决断之前,留半步给人情。',
      en: 'Wu Qu rules wealth: upright, practical, true to its word — a born executor and money manager. Well-placed, it opens ground and holds the purse; poorly placed or met with harsh stars, steel turns brittle and people become numbers. Its edge is speed; its caution is also speed — leave half a step for the human account.',
    },
  },
  {
    slug: 'tiantong', name: '天同', en: 'Tian Tong',
    essence: { zh: '福星,主安逸与情绪', en: 'The Blessing: ease and feeling' },
    body: {
      zh: '天同为福德主星,性温和、重享受,懂得生活,也容易被生活软化。庙旺则福厚缘广、逢凶化吉;落陷则安于现状、缺乏狠劲。天同不是不能吃苦,而是苦要吃得心甘情愿——把舒适变成奖赏而非习惯,福才算数。',
      en: 'Tian Tong rules contentment: gentle, pleasure-aware, fluent in the art of living — and easily softened by it. Well-placed, blessings run deep and troubles dissolve; poorly placed, comfort blunts drive. Tian Tong can endure hardship, but only willingly — make ease a reward rather than a habit, and the blessing counts.',
    },
  },
  {
    slug: 'lianzhen', name: '廉贞', en: 'Lian Zhen',
    essence: { zh: '次桃花,主交际与规矩之辩', en: 'The Diplomat: charm versus principle' },
    body: {
      zh: '廉贞为政治之星,善交际、懂分寸,在人情场中如鱼得水;又带桃花之气,情感线复杂。庙旺则干练得体、处事有节;落陷或逢煞,则易在人情与原则间失守。廉贞的功课,是让圆滑服务于底线,而不是替代底线。',
      en: 'Lian Zhen is the politician star: socially fluent, deft with propriety, at home in webs of favor — and touched by romance, its emotional life intricate. Well-placed, it is able and measured; poorly placed, principle bends to popularity. Its homework: let polish serve the bottom line, never replace it.',
    },
  },
  {
    slug: 'tianfu', name: '天府', en: 'Tian Fu',
    essence: { zh: '库星,主保守与积累', en: 'The Treasury: conservation and accrual' },
    body: {
      zh: '天府为南斗令星、财库之主,性稳厚、重秩序,擅守成与积累。庙旺则库藏丰盈、稳步向上;落陷则保守过头,机会来了也不敢接。天府与武曲是一对:武曲冲锋赚钱,天府看管守成——有库无攻是守财,有攻有库才是格局。',
      en: 'Tian Fu, the southern command star and keeper of the treasury, is steady, orderly, adept at holding and compounding. Well-placed, the storehouse fills and the path rises by steps; poorly placed, caution overreaches and open doors go unanswered. Tian Fu pairs with Wu Qu: one earns on campaign, one keeps the vault — a vault without campaign is hoarding; both together make a structure.',
    },
  },
  {
    slug: 'taiyin', name: '太阴', en: 'Tai Yin',
    essence: { zh: '月主,主细腻与静财', en: 'The Moon: subtlety and quiet earnings' },
    body: {
      zh: '太阴主温柔与细腻,象月光——内敛、顾家、以柔蓄财。田宅财帛见太阴,多主不动产与细水长流之入。庙旺(尤其夜生)则心思澄澈、理财有道;落陷则多愁善感、暗地劳神。太阴之财在静,不在喧。',
      en: 'Tai Yin governs gentleness and fine grain, moonlight by nature — reserved, home-loving, gathering wealth softly. In the estate or wealth palaces it often marks property and income that accrues quietly. Well-placed (especially by night), the mind is clear and money well kept; poorly placed, sentiment runs deep and worry works unseen. Tai Yin wealth is made in stillness, not noise.',
    },
  },
  {
    slug: 'tanlang', name: '贪狼', en: 'Tan Lang',
    essence: { zh: '正桃花,主欲望与多才', en: 'The Desire: appetite and versatility' },
    body: {
      zh: '贪狼为欲望与才艺之星,好奇心重、社交力强,人生面向宽。庙旺则多才多艺、应酬得利;落陷或逢煞,则欲望脱缰、多学少成。贪狼是引擎不是方向——给它一个值得追的目标,桃花与才艺皆是燃料。',
      en: 'Tan Lang is the star of appetite and talent: curious, socially magnetic, wide in its reach. Well-placed, versatility pays and company brings gain; poorly placed, appetite takes the wheel and much is studied, little finished. Tan Lang is an engine, not a heading — give it a goal worth chasing, and romance and talent both become fuel.',
    },
  },
  {
    slug: 'jumen', name: '巨门', en: 'Ju Men',
    essence: { zh: '暗星,主口才与疑心之辩', en: 'The Gate: eloquence versus doubt' },
    body: {
      zh: '巨门主口舌与思辨,善于言辞、长于钻研,是以口得财之星——教学、传媒、法律、销售皆其领域。庙旺则言而有物、专业立身;落陷或逢煞,则口舌招尤、多疑暗生。巨门之口,既能开山,也能树敌:说是非与说是道的分寸,即其吉凶。',
      en: 'Ju Men rules speech and inquiry: articulate, investigative, a star that earns by the mouth — teaching, media, law, selling are its fields. Well-placed, words carry substance and expertise builds standing; poorly placed, talk invites trouble and doubt breeds in the dark. The Ju Men mouth can open mountains or make enemies: the line between gossip and discourse is precisely its fortune.',
    },
  },
  {
    slug: 'tianxiang', name: '天相', en: 'Tian Xiang',
    essence: { zh: '印星,主辅佐与公正', en: 'The Seal: service and fairness' },
    body: {
      zh: '天相为掌印之星,性端正、重公平,是天生的辅弼之才——宰相之位,佐上而抚下。庙旺则处事有度、众望所归;落陷则印重权轻,劳于协调。天相一生的命题:做别人的印章,还是刻自己的名字。',
      en: 'Tian Xiang holds the seal: upright, fairness-minded, a born deputy — the minister\'s seat, serving above while steadying below. Well-placed, it acts with measure and wins consensus; poorly placed, the seal is heavy but the authority light, worn out mediating. Its lifelong question: be another\'s stamp, or carve your own name.',
    },
  },
  {
    slug: 'tianliang', name: '天梁', en: 'Tian Liang',
    essence: { zh: '荫星,主清望与照拂', en: 'The Shelter: seniority and care' },
    body: {
      zh: '天梁为荫庇之星,象长辈与师者——清高、有原则、逢难有解。庙旺则清望服众、越老越吃香;落陷则说教气重、荫人反受其累。天梁之贵在“老”:资历、见识、人脉皆随岁月增值,急不得。',
      en: 'Tian Liang is the sheltering star, the elder and the teacher — principled, reserved, rescued in a pinch. Well-placed, its standing persuades and it grows more valued with age; poorly placed, it lectures and sheltering becomes burden. Tian Liang\'s treasure is seniority itself: experience, judgment, and connections all compound with the years — it cannot be rushed.',
    },
  },
  {
    slug: 'qisha', name: '七杀', en: 'Qi Sha',
    essence: { zh: '将星,主开创与肃杀', en: 'The General: initiative and severity' },
    body: {
      zh: '七杀为冲锋之将,性刚烈、行动力极强,人生宜攻不宜守。庙旺则开疆拓土、杀伐决断;落陷或逢煞,则冲动树敌、刚极必折。七杀的命是“先破后立”——它的顺境,几乎都从一场硬仗里打出来。',
      en: 'Qi Sha is the charging general: fierce, massively kinetic, built for offense rather than defense. Well-placed, it opens fronts and decides; poorly placed or harshly aspected, impulse makes enemies and steel snaps. The Qi Sha fate is break-then-build — its good stretches are nearly all fought out of a hard battle first.',
    },
  },
  {
    slug: 'pojun', name: '破军', en: 'Po Jun',
    essence: { zh: '破立之星,主变革与颠覆', en: 'The Breaker: change and upheaval' },
    body: {
      zh: '破军主破与立,一生多转折,旧局不破、新局不生。庙旺则敢为人先、破而后立大成;落陷则折腾反复、破而不立。破军之命不怕变,怕的是为变而变——每次掀桌之前,先想清楚要摆上什么新局。',
      en: 'Po Jun rules breaking and rebuilding: a life of turns, where no new order rises till the old one falls. Well-placed, it dares first and builds big after the break; poorly placed, it churns without settling. The Po Jun fate does not fear change — it fears change for its own sake: before flipping the table, know what layout comes next.',
    },
  },
];

export const STAR_BY_NAME = new Map(MAIN_STARS.map((s) => [s.name, s]));
export const STAR_BY_SLUG = new Map(MAIN_STARS.map((s) => [s.slug, s]));
