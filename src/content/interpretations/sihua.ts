/** 生年四化通用钩(T08:四化修饰层) */
export interface SiHuaHook {
  mark: '禄' | '权' | '科' | '忌';
  zh: string;
  en: string;
}

export const SIHUA_HOOKS: Record<SiHuaHook['mark'], SiHuaHook> = {
  禄: {
    mark: '禄',
    zh: '化禄主顺遂与缘分:此处的能量来得自然,宜顺势经营,不必强取。',
    en: 'Lu (Abundance) marks ease and affinity: energy here arrives naturally — tend it, don\'t seize it.',
  },
  权: {
    mark: '权',
    zh: '化权主主导与扩张:此处的能量强而有力,宜立规矩、掌主动,防过刚。',
    en: 'Quan (Authority) marks command and expansion: the energy here is forceful — set the rules, hold the initiative, mind the rigidity.',
  },
  科: {
    mark: '科',
    zh: '化科主名声与文书:此处宜以专业立身,名先于利,贵人多由口碑而来。',
    en: 'Ke (Repute) marks name and documents: establish by expertise here; fame precedes profit, and patrons arrive by word of mouth.',
  },
  忌: {
    mark: '忌',
    zh: '化忌主课题与收敛:此处是你此生的功课所在——不是罚则,是提醒你把力气花对地方。',
    en: 'Ji (Impedance) marks the lesson and the narrowing: this is the homework of a lifetime — not a penalty, a prompt to spend effort where it counts.',
  },
};
