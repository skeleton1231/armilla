import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { MAIN_STARS, STAR_BY_SLUG } from '@/content/wiki/stars';
import { PALACES, PALACE_BY_SLUG } from '@/content/wiki/palaces';
import { COMBOS, COMBO_MAP, COMBO_KEY, EN_COMBO_MAP, type EnComboSource } from '@/content/interpretations/combos';

/** 星×宫组合页(T05/T08:随内容分批静态;en 树含 batch 条目) */
export function generateStaticParams(): { slug: string; palace: string }[] {
  const seen = new Set<string>();
  const out: { slug: string; palace: string }[] = [];
  const push = (star: string, palace: string): void => {
    const slug = MAIN_STARS.find((s) => s.name === star)?.slug;
    const pslug = PALACES.find((p) => p.name === palace)?.slug;
    if (!slug || !pslug) return;
    const key = `${slug}/${pslug}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ slug, palace: pslug });
  };
  for (const c of COMBOS) push(c.star, c.palace);
  for (const c of EN_COMBO_MAP.values()) push(c.star, c.palace);
  return out;
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
    alternates: {
      languages: { zh: `/zh/stars/${slug}/${palace}`, en: `/en/stars/${slug}/${palace}` },
    },
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
  const zh = locale === 'zh';
  // T27:en 查 batch 条目;zh 查金样(zh 正站解读走数据集,组合页仅百科)
  const enCombo = zh ? undefined : EN_COMBO_MAP.get(COMBO_KEY(star.name, p.name));
  const combo = COMBO_MAP.get(COMBO_KEY(star.name, p.name));
  if (!enCombo && !combo) notFound();

  const t = await getTranslations('wiki');

  const bright = enCombo ? enCombo.bright : combo!.bright.en;
  const dim = enCombo ? enCombo.dim : combo!.dim.en;
  const sihua = (mark: '禄' | '权' | '科' | '忌'): string =>
    enCombo ? enCombo.sihua[mark] : combo!.sihua[mark].en;

  return (
    <article className="mx-auto max-w-3xl py-12">
      <p className="text-xs tracking-label text-[var(--muted-foreground)]">{zh ? '星 × 宫' : 'STAR × PALACE'}</p>
      <h1 className="mt-3 text-3xl font-semibold text-[var(--gold)]">{t('comboTitle', { star: star.name, palace: p.name })}</h1>

      <section className="mt-8 rounded-[3px] border border-[var(--border)] bg-[var(--card)] p-8">
        <h2 className="text-sm tracking-label text-[var(--muted-foreground)]">{zh ? '庙旺' : 'Well-placed'}</h2>
        <p className="mt-3 text-base leading-9">{bright}</p>
      </section>
      <section className="mt-4 rounded-[3px] border border-[var(--border)] bg-[var(--card)] p-8">
        <h2 className="text-sm tracking-label text-[var(--muted-foreground)]">{zh ? '落陷' : 'Poorly placed'}</h2>
        <p className="mt-3 text-base leading-9">{dim}</p>
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-2">
        {(['禄', '权', '科', '忌'] as const).map((mark) => (
          <div key={mark} className="rounded-[3px] border border-[color-mix(in_oklab,var(--cinnabar)_35%,var(--border))] p-4">
            <p className="text-sm text-[var(--cinnabar)]">化{mark}</p>
            <p className="mt-1 text-sm leading-7 text-[var(--muted-foreground)]">{sihua(mark)}</p>
          </div>
        ))}
      </section>

      <p className="mt-4 text-xs text-[var(--muted-foreground)]/70">{combo?.source ?? (zh ? 'T27 批次条目(en)' : 'T27 batch entry')}</p>

      <div className="mt-10 flex justify-between text-sm">
        <Link href={`/stars/${star.slug}`} className="text-[var(--muted-foreground)] hover:text-[var(--gold)]">← {star.name}</Link>
        <Link href="/" className="text-[var(--gold)] underline-offset-4 hover:underline">{t('castCta')} →</Link>
      </div>
    </article>
  );
}
