/** 宫名归一(客户端安全):引擎输出无“宫”后缀(父母/财帛…),“仆役”→“交友宫” */
export function canonPalaceName(name: string): string {
  if (name === '命宫') return '命宫';
  if (name === '仆役' || name === '仆役宫') return '交友宫';
  if (name === '事业' || name === '事业宫') return '官禄宫';
  if (name.endsWith('宫')) return name;
  return `${name}宫`;
}
