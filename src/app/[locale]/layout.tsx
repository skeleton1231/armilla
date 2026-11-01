import type { Metadata } from 'next';
import { Noto_Serif_SC, Spectral } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import './globals.css';

const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-noto-serif-sc',
});

const spectral = Spectral({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-spectral',
});

export function generateStaticParams(): { locale: string }[] {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'brand' });
  return {
    metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
    title: {
      default: `${t('name')} · ${t('tagline')}`,
      template: `%s · ${t('name')}`,
    },
    description: t('slogan'),
    alternates: {
      languages: { zh: '/zh', en: '/en' },
    },
  };
}

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}): Promise<React.JSX.Element> {
  const { locale } = await props.params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const tNav = await getTranslations('nav');
  const tBrand = await getTranslations('brand');
  const tFooter = await getTranslations('footer');

  return (
    <html lang={locale} className={`${notoSerifSC.variable} ${spectral.variable}`}>
      <body className="min-h-screen antialiased">
        <NextIntlClientProvider>
          <header className="border-b border-[var(--border)]">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="flex items-center gap-3">
                {/* 浑仪环线稿 logo(T04) */}
                <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
                  <circle cx="15" cy="15" r="13" fill="none" stroke="var(--gold)" strokeWidth="1.1" />
                  <ellipse cx="15" cy="15" rx="13" ry="5" fill="none" stroke="var(--bronze)" strokeWidth="1" />
                  <ellipse cx="15" cy="15" rx="5" ry="13" fill="none" stroke="var(--bronze)" strokeWidth="1" />
                  <circle cx="15" cy="15" r="1.6" fill="var(--gold)" />
                </svg>
                <span className="text-base font-semibold tracking-[0.3em] text-[var(--foreground)]">
                  {tBrand('name')}
                </span>
              </Link>
              <nav className="flex items-center gap-5 text-sm text-[var(--muted-foreground)]">
                <Link href="/#palaces" className="transition-colors hover:text-[var(--gold)]">{tNav('palaces')}</Link>
                <Link href="/#stars" className="transition-colors hover:text-[var(--gold)]">{tNav('stars')}</Link>
                <Link href="/famous" className="transition-colors hover:text-[var(--gold)]">{tNav('famous')}</Link>
                <Link href="/method" className="transition-colors hover:text-[var(--gold)]">{tNav('method')}</Link>
                <LocaleSwitcher locale={locale} />
              </nav>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-6">{props.children}</main>

          <footer className="mt-24 border-t border-[var(--border)]">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 py-10 text-xs text-[var(--muted-foreground)]">
              <p className="tracking-label">{tFooter('slogan')}</p>
              <p className="opacity-70">{tFooter('license')}</p>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
