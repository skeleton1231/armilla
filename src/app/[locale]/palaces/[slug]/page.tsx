import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { PALACES, PALACE_BY_SLUG } from '@/content/wiki/palaces';

export function generateStaticParams(): { slug: string }[] {
  return PALACES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const p = PALACE_BY_SLUG.get(slug);
  if (!p) return {};
  return {
    title: locale === 'zh' ? p.name : p.en,
    description: locale === 'zh' ? p.domain.zh : p.domain.en,
  };
}

export default async function PalacePage(props: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<React.JSX.Element> {
  const { locale, slug } = await props.params;
  setRequestLocale(locale as Locale);
  const p = PALACE_BY_SLUG.get(slug);
  if (!p) notFound();
  const t = await getTranslations('wiki');
  const zh = locale === 'zh';

  return (
    <article className="mx-auto max-w-3xl py-12">
      <p className="text-xs tracking-label text-[var(--muted-foreground)]">{zh ? '十二宫' : 'TWELVE PALACES'}</p>
      <h1 className="mt-3 text-3xl font-semibold text-[var(--gold)]">
        {p.name}
        <span className="ml-3 text-lg font-normal text-[var(--muted-foreground)]">{p.en}</span>
      </h1>
      <p className="mt-4 text-sm text-[var(--muted-foreground)]">{zh ? p.domain.zh : p.domain.en}</p>
      <div className="mt-8 rounded-[3px] border border-[var(--border)] bg-[var(--card)] p-8">
        <h2 className="text-sm tracking-label text-[var(--gold)]">{t('domain')}</h2>
        <p className="mt-3 text-base leading-9">{zh ? p.body.zh : p.body.en}</p>
      </div>
      <div className="mt-10 flex justify-between text-sm">
        <Link href="/#palaces" className="text-[var(--muted-foreground)] hover:text-[var(--gold)]">← {t('backToPalaces')}</Link>
        <Link href="/" className="text-[var(--gold)] underline-offset-4 hover:underline">{t('castCta')} →</Link>
      </div>
    </article>
  );
}
