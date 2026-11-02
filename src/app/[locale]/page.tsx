import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { BirthForm } from '@/components/form/BirthForm';
import { MAIN_STARS } from '@/content/wiki/stars';
import { PALACES } from '@/content/wiki/palaces';

export default async function LandingPage(props: {
  params: Promise<{ locale: string }>;
}): Promise<React.JSX.Element> {
  const { locale } = await props.params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations('landing');
  const tBrand = await getTranslations('brand');
  const zh = locale === 'zh';

  return (
    <div className="py-10">
      {/* ———— 首屏:左叙事 右表单(T14)———— */}
      <section className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* 移动端表单优先(CTA 首屏可见),桌面叙事在左 */}
        <div className="order-2 pt-6 lg:order-1">
          <p className="text-xs tracking-label text-[var(--muted-foreground)]">{tBrand('tagline')}</p>
          <h1 className="mt-4 text-4xl leading-snug font-semibold md:text-5xl">
            {zh ? '璇玑' : 'Armilla'}
            <span className="mx-2 text-[var(--gold)]">·</span>
            <span className="text-[var(--muted-foreground)]">{zh ? '紫微斗数排盘' : 'Zi Wei Dou Shu Chart Casting'}</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-9 text-[var(--muted-foreground)]">{t('heroSub')}</p>
          <p className="mt-8 border-l-2 border-[var(--gold)] pl-4 text-sm tracking-label text-[var(--gold)]">
            {tBrand('slogan')}
          </p>
        </div>
        <div className="order-1 lg:order-2">
          <BirthForm locale={locale} />
        </div>
      </section>

      {/* ———— 是什么 / 不是什么 ———— */}
      <section className="mt-20 grid gap-6 md:grid-cols-2">
        <div className="rounded-[3px] border border-[var(--border)] bg-[var(--card)] p-8">
          <h2 className="text-sm tracking-label text-[var(--gold)]">{t('whatTitle')}</h2>
          <p className="mt-3 text-sm leading-8 text-[var(--muted-foreground)]">{t('whatBody')}</p>
        </div>
        <div className="rounded-[3px] border border-[var(--border)] bg-[var(--card)] p-8">
          <h2 className="text-sm tracking-label text-[var(--cinnabar-bright)]">{t('notTitle')}</h2>
          <p className="mt-3 text-sm leading-8 text-[var(--muted-foreground)]">{t('notBody')}</p>
        </div>
      </section>

      {/* ———— 十二宫 ———— */}
      <section id="palaces" className="mt-20 scroll-mt-24">
        <h2 className="text-sm tracking-label text-[var(--muted-foreground)]">{t('palacesTitle')}</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t('palacesBody')}</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {PALACES.map((p) => (
            <Link
              key={p.slug}
              href={`/palaces/${p.slug}`}
              className="group rounded-[3px] border border-[var(--border)] bg-[var(--card)] p-4 transition-colors duration-300 ease-qi hover:border-[var(--gold)]"
            >
              <p className="text-base text-[var(--foreground)] group-hover:text-[var(--gold)]">{p.name}</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{zh ? p.domain.zh : p.domain.en}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ———— 十四主星 ———— */}
      <section id="stars" className="mt-20 scroll-mt-24">
        <h2 className="text-sm tracking-label text-[var(--muted-foreground)]">{t('starsTitle')}</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t('starsBody')}</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {MAIN_STARS.map((s) => (
            <Link
              key={s.slug}
              href={`/stars/${s.slug}`}
              className="group rounded-[3px] border border-[var(--border)] bg-[var(--card)] p-4 transition-colors duration-300 ease-qi hover:border-[var(--gold)]"
            >
              <p className="text-base text-[var(--foreground)] group-hover:text-[var(--gold)]">{s.name}</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{zh ? s.essence.zh : s.essence.en}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ———— 方法与出处 ———— */}
      <section className="mt-20 rounded-[3px] border border-[var(--border)] bg-[var(--card)] p-8">
        <h2 className="text-sm tracking-label text-[var(--muted-foreground)]">{t('methodTitle')}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-8 text-[var(--muted-foreground)]">{t('methodBody')}</p>
        <Link href="/method" className="mt-4 inline-block text-sm text-[var(--gold)] underline-offset-4 hover:underline">
          {zh ? '阅读方法与出处 →' : 'Read method & sources →'}
        </Link>
      </section>
    </div>
  );
}
