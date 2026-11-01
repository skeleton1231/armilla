import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // 显式白名单:只处理根路径与两个语言前缀(带点静态路径如 /favicon.ico 绝不进 [locale])
  matcher: ['/', '/zh', '/zh/:path*', '/en', '/en/:path*'],
};
