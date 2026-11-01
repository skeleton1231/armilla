import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { MAIN_STARS, STAR_BY_SLUG } from '@/content/wiki/stars';
import { PALACE_BY_NAME } from '@/content/wiki/palaces';
import { COMBOS, COMBO_KEY } from '@/content/interpretations/combos';

export function generateStaticParams(): { slug: string }[] {
  return MAIN_STARS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const star = STAR_BY_SLUG.get(slug);
  if (!star) return {};
  return {
    title: locale === 'zh' ? `${star.name}星曜` : star.en,
    description: locale === 'zh' ? star.essence.zh : star.essence.en,
    alternates: { languages: { zh: `/zh/stars/${slug}`, en: `/en/stars/${slug}` } },
  };
}

export default async function StarPage(props: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<React.JSX.Element> {
  const { locale, slug } = await props.params;
  setRequestLocale(locale as Locale);
  const star = STAR_BY_SLUG.get(slug);
  if (!star) notFound();
  const t = await getTranslations('wiki');
  const zh = locale === 'zh';

  const palacesWithCombo = ['财帛宫', '迁移宫', '命宫', '夫妻宫', '官禄宫', '子女宫', '疾厄宫', '兄弟宫', '交友宫', '田宅宫', '福德宫', '父母宫'].filter((p) =>
    COMBOS.some((c) => COMBO_KEY(c.star, c.palace) === COMBO_KEY(star.name, p)),
  );

  return (
    <article className="mx-auto max-w-3xl py-12">
      <p className="text-xs tracking-label text-[var(--muted-foreground)]">{zh ? '十四主星' : 'MAJOR STAR'}</p>
      <h1 className="mt-3 text-3xl font-semibold text-[var(--gold)]">
        {star.name}
        <span className="ml-3 text-lg font-normal text-[var(--muted-foreground)]">{star.en}</span>
      </h1>
      <p className="mt-4 text-sm text-[var(--muted-foreground)]">{zh ? star.essence.zh : star.essence.en}</p>
      <div className="mt-8 rounded-[3px] border border-[var(--border)] bg-[var(--card)] p-8">
        <h2 className="text-sm tracking-label text-[var(--gold)]">{t('essence')}</h2>
        <p className="mt-3 text-base leading-9">{zh ? star.body.zh : star.body.en}</p>
      </div>

      {palacesWithCombo.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm tracking-label text-[var(--muted-foreground)]">{t('comboTitle', { star: star.name, palace: zh ? '专属宫位解读' : 'dedicated readings' })}</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {palacesWithCombo.map((p) => (
              <Link
                key={p}
                href={`/stars/${star.slug}/${PALACE_BY_NAME.get(p)?.slug ?? ''}`}
                className="rounded-[3px] border border-[var(--gold)] px-4 py-2 text-sm text-[var(--gold)] transition-colors duration-300 hover:bg-[var(--gold)] hover:text-[var(--primary-foreground)]"
              >
                {star.name} · {p}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 flex justify-between text-sm">
        <Link href="/#stars" className="text-[var(--muted-foreground)] hover:text-[var(--gold)]">← {t('backToStars')}</Link>
        <Link href="/" className="text-[var(--gold)] underline-offset-4 hover:underline">{t('castCta')} →</Link>
      </div>
    </article>
  );
}
