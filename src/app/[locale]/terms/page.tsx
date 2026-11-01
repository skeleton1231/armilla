import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'terms' });
  return {
    title: t('title'),
    alternates: { languages: { zh: '/zh/terms', en: '/en/terms' } },
  };
}

export default async function TermsPage(props: {
  params: Promise<{ locale: string }>;
}): Promise<React.JSX.Element> {
  const { locale } = await props.params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations('terms');
  const zh = locale === 'zh';

  const sections = ['service', 'payment', 'refund', 'disclaimer', 'license'] as const;

  return (
    <article className="mx-auto max-w-3xl py-12">
      <p className="text-xs tracking-label text-[var(--muted-foreground)]">{zh ? '条款' : 'TERMS'}</p>
      <h1 className="mt-3 text-3xl font-semibold text-[var(--gold)]">{t('title')}</h1>
      <div className="mt-10 space-y-6">
        {sections.map((s) => (
          <section key={s} className="rounded-[3px] border border-[var(--border)] bg-[var(--card)] p-8">
            <h2 className="text-sm tracking-label text-[var(--gold)]">{t(`${s}Title`)}</h2>
            <p className="mt-3 text-sm leading-8 text-[var(--muted-foreground)]">{t(`${s}Body`)}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
