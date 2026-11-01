import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { MAIN_STARS, STAR_BY_SLUG } from '@/content/wiki/stars';
import { PALACES, PALACE_BY_SLUG } from '@/content/wiki/palaces';
import { COMBOS, COMBO_MAP, COMBO_KEY } from '@/content/interpretations/combos';

/** 星×宫组合页(T05/T08:随 P0 内容就绪分批静态;当前仅已生产的专属条目) */
export function generateStaticParams(): { slug: string; palace: string }[] {
  return COMBOS.map((c) => ({
    slug: MAIN_STARS.find((s) => s.name === c.star)?.slug ?? '',
    palace: PALACES.find((p) => p.name === c.palace)?.slug ?? '',
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string; palace: string }>;
}): Promise<Metadata> {
  const { locale, slug, palace } = await props.params;
  const star = STAR_BY_SLUG.get(slug);
  const p = PALACE_BY_SLUG.get(palace);
  if (!star || !p) return {};
  return {
    title: locale === 'zh' ? `${star.name}入${p.name}` : `${star.en} in the ${p.en}`,
    description: locale === 'zh' ? star.essence.zh : star.essence.en,
  };
}

export default async function ComboPage(props: {
  params: Promise<{ locale: string; slug: string; palace: string }>;
}): Promise<React.JSX.Element> {
  const { locale, slug, palace } = await props.params;
  setRequestLocale(locale as Locale);
  const star = STAR_BY_SLUG.get(slug);
  const p = PALACE_BY_SLUG.get(palace);
  if (!star || !p) notFound();
  const combo = COMBO_MAP.get(COMBO_KEY(star.name, p.name));
  if (!combo) notFound();

  const t = await getTranslations('wiki');
  const zh = locale === 'zh';

  return (
    <article className="mx-auto max-w-3xl py-12">
      <p className="text-xs tracking-label text-[var(--muted-foreground)]">{zh ? '星 × 宫' : 'STAR × PALACE'}</p>
      <h1 className="mt-3 text-3xl font-semibold text-[var(--gold)]">{t('comboTitle', { star: star.name, palace: p.name })}</h1>

      <section className="mt-8 rounded-[3px] border border-[var(--border)] bg-[var(--card)] p-8">
        <h2 className="text-sm tracking-label text-[var(--muted-foreground)]">{zh ? '庙旺' : 'Well-placed'}</h2>
        <p className="mt-3 text-base leading-9">{zh ? combo.bright.zh : combo.bright.en}</p>
      </section>
      <section className="mt-4 rounded-[3px] border border-[var(--border)] bg-[var(--card)] p-8">
        <h2 className="text-sm tracking-label text-[var(--muted-foreground)]">{zh ? '落陷' : 'Poorly placed'}</h2>
        <p className="mt-3 text-base leading-9">{zh ? combo.dim.zh : combo.dim.en}</p>
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-2">
        {(['禄', '权', '科', '忌'] as const).map((mark) => (
          <div key={mark} className="rounded-[3px] border border-[color-mix(in_oklab,var(--cinnabar)_35%,var(--border))] p-4">
            <p className="text-sm text-[var(--cinnabar)]">化{mark}</p>
            <p className="mt-1 text-sm leading-7 text-[var(--muted-foreground)]">{zh ? combo.sihua[mark].zh : combo.sihua[mark].en}</p>
          </div>
        ))}
      </section>

      <p className="mt-4 text-xs text-[var(--muted-foreground)]/70">{combo.source}</p>

      <div className="mt-10 flex justify-between text-sm">
        <Link href={`/stars/${star.slug}`} className="text-[var(--muted-foreground)] hover:text-[var(--gold)]">← {star.name}</Link>
        <Link href="/" className="text-[var(--gold)] underline-offset-4 hover:underline">{t('castCta')} →</Link>
      </div>
    </article>
  );
}
