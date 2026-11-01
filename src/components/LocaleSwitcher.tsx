'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

/** 语言切换:保留当前路径与 query(命盘不丢);官方姿势 = router.replace(pathname, {locale}) */
export function LocaleSwitcher({ locale }: { locale: string }): React.JSX.Element {
  const t = useTranslations('nav');
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const other = locale === 'zh' ? 'en' : 'zh';

  const switchLocale = (): void => {
    const search = typeof window === 'undefined' ? '' : window.location.search;
    router.replace(`${pathname}${search}`, { locale: other });
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
