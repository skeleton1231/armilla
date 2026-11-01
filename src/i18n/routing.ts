import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['zh', 'en'],
  // T25:海外优先(2026-11-02)——英文浏览器与根路径默认 en;中文浏览器仍自动路由 /zh
  defaultLocale: 'en',
});

export type Locale = (typeof routing.locales)[number];
