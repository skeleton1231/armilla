import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'method' });
  return {
    title: t('title'),
    alternates: { languages: { zh: '/zh/method', en: '/en/method' } },
  };
}

const SECTIONS = [
  { key: 'engine', anchor: 'engine' },
  { key: 'data', anchor: 'data' },
  { key: 'boundary', anchor: 'boundary' },
  { key: 'privacy', anchor: 'privacy' },
] as const;

export default async function MethodPage(props: {
  params: Promise<{ locale: string }>;
}): Promise<React.JSX.Element> {
  const { locale } = await props.params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations('method');
  const zh = locale === 'zh';

  return (
    <article className="mx-auto max-w-3xl py-12">
      <p className="text-xs tracking-label text-[var(--muted-foreground)]">{zh ? '器有刻度,文有出处' : 'EVERY INSTRUMENT HAS ITS SCALE'}</p>
      <h1 className="mt-3 text-3xl font-semibold text-[var(--gold)]">{t('title')}</h1>

      <div className="mt-10 space-y-6">
        {SECTIONS.map((s) => (
          <section key={s.key} id={s.anchor} className="rounded-[3px] border border-[var(--border)] bg-[var(--card)] p-8">
            <h2 className="text-sm tracking-label text-[var(--gold)]">{t(`${s.key}Title`)}</h2>
            <p className="mt-3 text-sm leading-8 text-[var(--muted-foreground)]">{t(`${s.key}Body`)}</p>
          </section>
        ))}
      </div>

      <section className="mt-8 rounded-[3px] border border-[var(--border)] p-6 text-xs leading-7 text-[var(--muted-foreground)]">
        <h2 className="tracking-label text-[var(--gold)]">{zh ? '开源与许可' : 'Open source & licenses'}</h2>
        <ul className="mt-3 space-y-1.5">
          <li>iztro · MIT — chart casting engine base</li>
          <li>lunar-javascript · MIT — lunar/solar calendar conversion</li>
          <li>Renhuai123/ziwei-doushu · MIT — vendored calibration layer &amp; pattern library (adapted)</li>
          <li>Renhuai123/ziwei-doushu datasets · CC BY 4.0 — thirteen-dimension reading texts (adapted, attributed)</li>
          <li>Noto Serif SC / Spectral / 霞鹜文楷 candidates · OFL — self-hosted typography</li>
        </ul>
      </section>
    </article>
  );
}
