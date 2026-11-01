'use client';

import { usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

/**
 * 语言切换:保留当前路径与 query(命盘不丢)。
 * 硬导航(整页跳转)—— next-intl 软导航在 [locale] 切换时会把新旧盘面
 * 同时留在 DOM(dev-loop T29 E2E ④ 捕获),硬导航彻底规避。
 */
export function LocaleSwitcher({ locale }: { locale: string }): React.JSX.Element {
  const t = useTranslations('nav');
  const pathname = usePathname() ?? '/';
  const other = locale === 'zh' ? 'en' : 'zh';

  const switchLocale = (): void => {
    const search = typeof window === 'undefined' ? '' : window.location.search;
    window.location.href = `/${other}${pathname.startsWith('/') ? pathname : `/${pathname}`}${search}`;
  };

  return (
    <button
      type="button"
      onClick={switchLocale}
      className="cursor-pointer rounded-md border border-[var(--border)] px-3 py-1.5 text-xs tracking-label text-[var(--muted-foreground)] transition-colors duration-150 hover:border-[var(--gold)] hover:text-[var(--gold)]"
    >
      {t('switchLocale')}
    </button>
  );
}
