import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { MAIN_STARS } from '@/content/wiki/stars';
import { PALACES } from '@/content/wiki/palaces';

/** T12:sitemap = 静态页全量;/chart 参数空间不入(由分享与内链发现) */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL ?? 'https://armilla.example';
  const now = new Date();
  const routes: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    routes.push({ url: `${base}/${locale}`, lastModified: now, changeFrequency: 'weekly', priority: 1 });
    routes.push({ url: `${base}/${locale}/famous`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 });
    routes.push({ url: `${base}/${locale}/method`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 });
    for (const s of MAIN_STARS) {
      routes.push({ url: `${base}/${locale}/stars/${s.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 });
    }
    for (const p of PALACES) {
      routes.push({ url: `${base}/${locale}/palaces/${p.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 });
    }
  }
  return routes;
}
