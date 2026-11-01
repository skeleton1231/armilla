/** 宫名归一(客户端安全):引擎输出无“宫”后缀(父母/财帛…),“仆役”→“交友宫” */
export function canonPalaceName(name: string): string {
  if (name === '命宫') return '命宫';
  if (name === '仆役' || name === '仆役宫') return '交友宫';
  if (name === '事业' || name === '事业宫') return '官禄宫';
  if (name.endsWith('宫')) return name;
  return `${name}宫`;
}

/** 地支双刻(en 站用拼音):索引对齐引擎 branch(0=子 … 11=亥) */
export const BRANCH_ZH = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export const BRANCH_PINYIN = ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'];
