import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { FAMOUS_PERSONS } from '@/content/famous';
import { encodeChartParams } from '@/lib/engine/params';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'famous' });
  return { title: t('title'), description: t('body') };
}

export default async function FamousPage(props: {
  params: Promise<{ locale: string }>;
}): Promise<React.JSX.Element> {
  const { locale } = await props.params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations('famous');
  const tChart = await getTranslations('chart');
  const zh = locale === 'zh';

  return (
    <div className="py-12">
      <p className="text-xs tracking-label text-[var(--muted-foreground)]">{zh ? '名人命盘' : 'FAMOUS CHARTS'}</p>
      <h1 className="mt-3 text-3xl font-semibold text-[var(--gold)]">{t('title')}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--muted-foreground)]">{t('body')}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FAMOUS_PERSONS.map((person) => {
          const query = encodeChartParams({
            y: person.year, m: person.month, d: person.day,
            h: person.hour, g: person.gender === 'male' ? 'm' : 'f',
          });
          return (
            <div key={person.id} className="rounded-[3px] border border-[var(--border)] bg-[var(--card)] p-6">
              <p className="text-xs tracking-label text-[var(--muted-foreground)]">{person.category}</p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                {zh ? person.name : person.nameEn}
              </h2>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {zh ? person.description : person.descriptionEn} · {person.year}-{person.month}-{person.day}
              </p>
              <p className="mt-3 text-sm leading-7 text-[color-mix(in_oklab,var(--foreground)_85%,var(--muted-foreground))]">
                {zh ? person.notable : person.notableEn}
              </p>
              <Link
                href={`/chart?${query}`}
                className="mt-4 inline-block text-sm text-[var(--gold)] underline-offset-4 hover:underline"
              >
                {tChart('viewChart')} →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
