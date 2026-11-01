import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // 同盘之日索引为运行时 fs 读取,需随独立部署分发
  outputFileTracingIncludes: {
    '/[locale]/chart': ['./data/same-structure.json'],
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
export default withNextIntl(nextConfig);
